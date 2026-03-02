import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BindConflictData, TaskCompletedData, TaskOnEmbed } from '@taskon/embed';

interface EmailClientProps {
  currentEmail: string;
  onSignature: (email: string) => Promise<{ signature: string; timestamp: number }>;
  onRequireDemoLogin: () => void;
}

export interface EmailClientRef {
  setLanguage: (language: string) => Promise<void>;
}

const EMBED_HANDSHAKE_TIMEOUT_MS = 10000;

const EmailClient = forwardRef<EmailClientRef, EmailClientProps>(
  ({ currentEmail, onSignature, onRequireDemoLogin }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const embedRef = useRef<TaskOnEmbed | null>(null);
    const currentEmailRef = useRef(currentEmail);
    const onRequireDemoLoginRef = useRef(onRequireDemoLogin);
    const loginToTaskOnRef = useRef<(email: string) => Promise<void>>(async () => {});

    const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);

    // Keep refs synced so one-time event listeners can read latest state.
    useEffect(() => {
      currentEmailRef.current = currentEmail;
    }, [currentEmail]);

    useEffect(() => {
      onRequireDemoLoginRef.current = onRequireDemoLogin;
    }, [onRequireDemoLogin]);

    const loginToTaskOn = useCallback(
      async (email: string) => {
        if (!embedRef.current || !embedRef.current.initialized) {
          console.log('[TaskOn][Email] Login skipped: embed is not ready yet');
          return;
        }

        try {
          console.log('[TaskOn][Email] Login started with fresh signature:', email);
          // Always re-sign before SDK login so the host app fully controls
          // authentication freshness and login timing.
          const { signature, timestamp } = await onSignature(email);

          await embedRef.current.login({
            type: 'Email',
            account: email,
            signature,
            timestamp,
          });

          console.log('[TaskOn][Email] Login successful:', email);
        } catch (error) {
          console.error('[TaskOn][Email] Login failed:', error);
        }
      },
      [onSignature]
    );

    useEffect(() => {
      loginToTaskOnRef.current = loginToTaskOn;
    }, [loginToTaskOn]);

    const logoutFromTaskOn = useCallback(async () => {
      // Keep a stable callback so effects do not re-run on every render.
      if (!embedRef.current || !embedRef.current.initialized) {
        console.log('[TaskOn][Email] Logout skipped: embed is not ready yet');
        return;
      }

      try {
        console.log('[TaskOn][Email] Logout started');
        await embedRef.current.logout({ clearAuth: true });
        console.log('[TaskOn][Email] Logout successful');
      } catch (error) {
        console.warn('[TaskOn][Email] Logout failed (may not be logged in):', error);
      }
    }, []);

    // Sync host demo session to TaskOn session.
    // This runs whenever host session changes and after embed initialization.
    const syncSessionToTaskOn = useCallback(async () => {
      const latestEmail = currentEmailRef.current.trim();

      if (!isEmbedInitialized || !embedRef.current || !embedRef.current.initialized) {
        console.log('[TaskOn][Email] Session sync deferred: embed is not initialized yet', {
          hasHostSession: Boolean(latestEmail),
        });
        return;
      }

      if (latestEmail) {
        console.log('[TaskOn][Email] Host session detected, syncing login now:', latestEmail);
        await loginToTaskOn(latestEmail);
        return;
      }

      console.log('[TaskOn][Email] No host session, syncing logout now');
      await logoutFromTaskOn();
    }, [isEmbedInitialized, loginToTaskOn, logoutFromTaskOn]);

    useEffect(() => {
      if (!containerRef.current) return;

      const rawBaseUrl = import.meta.env.VITE_TASKON_BASE_URL as string;
      // IMPORTANT:
      // The currently used npm package (@taskon/embed@1.2.1) compares Penpal
      // allowed origins with `baseUrl` directly in runtime. If baseUrl has a
      // trailing slash (e.g. https://xx.com/), handshake can hang forever
      // because postMessage event.origin is `https://xx.com` (without slash).
      // To keep demo stable, normalize to origin explicitly here.
      const normalizedBaseUrl = (() => {
        try {
          return new URL(rawBaseUrl).origin;
        } catch {
          return rawBaseUrl.replace(/\/+$/, '');
        }
      })();

      console.log('[TaskOn][Email] Embed initialization started', {
        rawBaseUrl,
        normalizedBaseUrl,
        handshakeTimeoutMs: EMBED_HANDSHAKE_TIMEOUT_MS,
      });

      const embed = new TaskOnEmbed({
        baseUrl: normalizedBaseUrl,
        containerElement: containerRef.current,
        language: 'en',
        handshakeTimeoutMs: EMBED_HANDSHAKE_TIMEOUT_MS,
      });

      const initWatchdog = window.setTimeout(() => {
        console.warn('[TaskOn][Email] Embed initialization still pending after timeout window', {
          timeoutMs: EMBED_HANDSHAKE_TIMEOUT_MS,
          hint: 'Potential penpal handshake issue (origin mismatch or blocked iframe communication)',
        });
      }, EMBED_HANDSHAKE_TIMEOUT_MS + 1000);

      const handleRouteChanged = (fullPath: string) => {
        console.log('TaskOn route changed:', fullPath);
      };

      const handleTaskCompleted = (data: TaskCompletedData) => {
        console.log('TaskOn task completed:', data);
      };

      const handleBindConflict = (data: BindConflictData) => {
        console.log('TaskOn bind conflict:', data);
      };

      const handleLoginRequired = () => {
        console.log('[TaskOn][Email] loginRequired event received');
        const latestEmail = currentEmailRef.current.trim();

        // Rule 1: If host demo is already logged in, immediately re-sign and login SDK.
        if (latestEmail) {
          console.log('[TaskOn][Email] Host session exists, re-login TaskOn immediately:', latestEmail);
          void loginToTaskOnRef.current(latestEmail);
          return;
        }

        // Rule 2: If host demo is not logged in, trigger host login flow first.
        console.log('[TaskOn][Email] Host session missing, requesting demo login flow');
        onRequireDemoLoginRef.current();
      };

      embed.on('routeChanged', handleRouteChanged);
      embed.on('taskCompleted', handleTaskCompleted);
      embed.on('bindConflict', handleBindConflict);
      embed.on('loginRequired', handleLoginRequired);

      embed.init().then(() => {
        embedRef.current = embed;
        setIsEmbedInitialized(true);
        console.log('[TaskOn][Email] Embed initialized');
      }).catch((error) => {
        console.error('[TaskOn][Email] Embed initialization failed:', error);
      }).finally(() => {
        window.clearTimeout(initWatchdog);
      });

      return () => {
        window.clearTimeout(initWatchdog);
        console.log('[TaskOn][Email] Embed destroyed');
        embed.destroy();
        embedRef.current = null;
        setIsEmbedInitialized(false);
      };
    }, []);

    const setLanguage = useCallback(
      async (newLanguage: string) => {
        if (!embedRef.current || !isEmbedInitialized) {
          console.log('Embed not ready, language will be applied when available');
          return;
        }

        try {
          await embedRef.current.setLanguage(newLanguage);
          console.log('Language changed to:', newLanguage);
        } catch (error) {
          console.error('Failed to change language:', error);
        }
      },
      [isEmbedInitialized]
    );

    useEffect(() => {
      console.log('[TaskOn][Email] Host session changed, attempting session sync:', {
        hasHostSession: Boolean(currentEmail),
        currentEmail,
      });
      void syncSessionToTaskOn();
    }, [currentEmail, syncSessionToTaskOn]);

    useEffect(() => {
      if (!isEmbedInitialized) return;
      console.log('[TaskOn][Email] Embed became ready, attempting immediate session sync');
      void syncSessionToTaskOn();
    }, [isEmbedInitialized, syncSessionToTaskOn]);

    useImperativeHandle(
      ref,
      () => ({
        setLanguage,
      }),
      [setLanguage]
    );

    return <div ref={containerRef} className="w-full h-full" />;
  }
);

EmailClient.displayName = 'EmailClient';

export default EmailClient;
