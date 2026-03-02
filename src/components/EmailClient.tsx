import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { BindConflictData, TaskCompletedData, TaskOnEmbed } from '@taskon/embed';

interface EmailClientProps {
  currentEmail: string;
  onSignature: (email: string) => Promise<{ signature: string; timestamp: number }>;
  onRequireDemoLogin: () => void;
}

export interface EmailClientRef {
  setLanguage: (language: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

type PendingAction = { type: 'login'; email: string } | { type: 'logout' } | null;

const EmailClient = forwardRef<EmailClientRef, EmailClientProps>(
  ({ currentEmail, onSignature, onRequireDemoLogin }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const embedRef = useRef<TaskOnEmbed | null>(null);
    const currentEmailRef = useRef(currentEmail);
    const onRequireDemoLoginRef = useRef(onRequireDemoLogin);
    const loginToTaskOnRef = useRef<(email: string) => Promise<void>>(async () => {});
    const logoutFromTaskOnRef = useRef<() => Promise<void>>(async () => {});
    const pendingActionRef = useRef<PendingAction>(null);

    currentEmailRef.current = currentEmail;
    onRequireDemoLoginRef.current = onRequireDemoLogin;

    const loginToTaskOn = useCallback(
      async (email: string) => {
        if (!embedRef.current || !embedRef.current.initialized) {
          pendingActionRef.current = { type: 'login', email };
          console.log('[TaskOn][Email] Login deferred: embed is not ready yet', { email });
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

    const logoutFromTaskOn = useCallback(async () => {
      if (!embedRef.current || !embedRef.current.initialized) {
        pendingActionRef.current = { type: 'logout' };
        console.log('[TaskOn][Email] Logout deferred: embed is not ready yet');
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

    loginToTaskOnRef.current = loginToTaskOn;
    logoutFromTaskOnRef.current = logoutFromTaskOn;

    const flushPendingAction = useCallback(async () => {
      const pendingAction = pendingActionRef.current;
      if (!pendingAction) {
        return;
      }

      pendingActionRef.current = null;
      if (pendingAction.type === 'login') {
        await loginToTaskOnRef.current(pendingAction.email);
        return;
      }

      await logoutFromTaskOnRef.current();
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;

      const rawBaseUrl = import.meta.env.VITE_TASKON_BASE_URL as string;

      console.log('[TaskOn][Email] Embed initialization started', {
        rawBaseUrl,
      });

      const embed = new TaskOnEmbed({
        baseUrl: rawBaseUrl,
        containerElement: containerRef.current,
        language: 'en',
      });

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

      embed
        .init()
        .then(async () => {
          embedRef.current = embed;
          console.log('[TaskOn][Email] Embed initialized');
          await flushPendingAction();
        })
        .catch((error) => {
          console.error('[TaskOn][Email] Embed initialization failed:', error);
        });

      return () => {
        console.log('[TaskOn][Email] Embed destroyed');
        embed.destroy();
        embedRef.current = null;
      };
    }, [flushPendingAction]);

    const setLanguage = useCallback(
      async (newLanguage: string) => {
        if (!embedRef.current || !embedRef.current.initialized) {
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
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        login: loginToTaskOn,
        logout: logoutFromTaskOn,
        setLanguage,
      }),
      [loginToTaskOn, logoutFromTaskOn, setLanguage]
    );

    return <div ref={containerRef} className="w-full h-full" />;
  }
);

EmailClient.displayName = 'EmailClient';

export default EmailClient;
