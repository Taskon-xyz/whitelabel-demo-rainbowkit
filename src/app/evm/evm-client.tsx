'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { TaskOnEmbed, TaskCompletedData } from '@taskon/embed';
import { signMessage } from '../../utils';

const EVM_ROUTE_BASE_PATH = '/evm';

export default function EvmClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);

  const [isEvmLoggedIn, setIsEvmLoggedIn] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: walletClient } = useWalletClient();

  // Simplified logic: save address directly to localStorage
  useEffect(() => {
    if (address) {
      localStorage.setItem('demo_wallet_address', address);
    } else {
      localStorage.removeItem('demo_wallet_address');
    }
  }, [address]);


  useEffect(() => {
    const savedLoginState = localStorage.getItem('taskon_evm_login_state');
    // Only restore login state if wallet is still connected
    if (savedLoginState === 'true' && isConnected) {
      setIsEvmLoggedIn(true);
    } else if (savedLoginState === 'true' && !isConnected) {
      // Clean up stale login state if wallet is disconnected
      localStorage.removeItem('taskon_evm_login_state');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Initializing TaskOn embed...');
    
    const embed = new TaskOnEmbed({
      baseUrl: process.env.NEXT_PUBLIC_TASKON_BASE_URL!,
      containerElement: containerRef.current,
      language: 'en', // Use default language for initialization
      isDev: true,
      tabsInclude: ["home", "quests", "leaderboard", "incentives", "benefit", "wheelOfFortune", "events", "milestone"]
    });

    const buildParentPathFromIframeRoute = (fullPath: string) => {
      // Build parent URL path from iframe route using path segments only.
      // This keeps the parent URL shareable without relying on query parameters.
      const normalizedRoute = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
      const iframeUrl = new URL(normalizedRoute, window.location.origin);
      const normalizedPath = `${EVM_ROUTE_BASE_PATH}${iframeUrl.pathname}`.replace(/\/{2,}/g, '/');
      return `${normalizedPath}${iframeUrl.search}${iframeUrl.hash}`;
    };

    const resolveIframeRouteFromLocation = () => {
      // Extract iframe route from parent path so we can restore deep links.
      if (typeof window === 'undefined') {
        return '/';
      }

      const { pathname, search, hash } = window.location;
      if (!pathname.startsWith(EVM_ROUTE_BASE_PATH)) {
        return '/';
      }

      const trimmedPath = pathname.slice(EVM_ROUTE_BASE_PATH.length);
      if (!trimmedPath || trimmedPath === '/') {
        return '/';
      }

      return `${trimmedPath}${search}${hash}`;
    };

    const handlePopState = () => {
      // Sync iframe route when the user navigates browser history.
      if (!embed.initialized) {
        return;
      }

      const nextRoute = resolveIframeRouteFromLocation();
      embed.setRoute(nextRoute).catch((error) => {
        console.error('Failed to sync iframe route from browser history:', error);
      });
    };

    const handleLoginRequired = () => {
      console.log('TaskOn loginRequired event triggered');
      openConnectModal?.();
    };
    
    const handleRouteChanged = (fullPath: string) => {
      console.log('TaskOn route changed:', fullPath);
      // Sync iframe route to the parent URL path so it can be shared and restored.
      // Integrators should map the path based on their own routing/hosting setup.
      const nextPath = buildParentPathFromIframeRoute(fullPath);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentPath === nextPath) {
        return;
      }
      window.history.replaceState(null, '', nextPath);
    };

    const handleTaskCompleted = (data: TaskCompletedData) => {
      console.log('TaskOn task completed:', data);
    };

    embed.on('loginRequired', handleLoginRequired);
    embed.on('routeChanged', handleRouteChanged);
    embed.on('taskCompleted', handleTaskCompleted);

    // Initialize the embed
    embed.init().then(async () => {
      console.log('TaskOn embed initialized successfully');
      embedRef.current = embed;
      setIsEmbedInitialized(true);

      // Restore iframe route from the parent URL so deep links open correctly.
      const initialRoute = resolveIframeRouteFromLocation();
      try {
        await embed.setRoute(initialRoute);
      } catch (error) {
        console.error('Failed to restore iframe route from URL:', error);
      }

      window.addEventListener('popstate', handlePopState);
    }).catch((error) => {
      console.error('TaskOn embed initialization failed:', error);
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      console.log('Cleaning up TaskOn embed...');
      embed.destroy();
      embedRef.current = null;
      setIsEmbedInitialized(false);
    };
  }, [openConnectModal]); // Only initialize once

  const loginWithWallet = useCallback(async () => {
    if (!embedRef.current || !isConnected || !address || !walletClient) {
      return;
    }

    if (!embedRef.current.initialized) {
      console.log('TaskOn embed is not initialized yet, waiting...');
      return;
    }

    try {
      console.log('Logging in with EVM wallet:', address);
      
      // Check if account has valid authorization cache
      const isAuthorized = await embedRef.current.isAuthorized('WalletAddress', address);
      
      if (isAuthorized) {
        // Has valid auth cache, no signature needed
        await embedRef.current.login({
          type: 'WalletAddress',
          account: address,
          provider: walletClient,
        });
      } else {
        // No auth cache, get signature first then login
        const clientId = process.env.NEXT_PUBLIC_TASKON_CLIENT_ID!;
        const { signature, timestamp } = await signMessage(clientId, 'evm', address);
          
        await embedRef.current.login({
          type: 'WalletAddress',
          account: address,
          signature: signature,
          timestamp: timestamp,
          provider: walletClient,
        });
      }
      
      // Ensure email and evm login are mutually exclusive - clear email state when logging in with evm
      localStorage.removeItem('demo_current_email');
      
      setIsEvmLoggedIn(true);
      localStorage.setItem('taskon_evm_login_state', 'true');
      console.log('EVM login successful');
    } catch (error) {
      console.error('EVM login failed:', error);
      // Don't update login state on failure
    }
  }, [isConnected, address, walletClient]);

  const logout = () => {
    if (!embedRef.current) return;
    
    // Logout from TaskOn first (keep auth cache by default), then disconnect wallet
    embedRef.current.logout({ clearAuth: true }); // Default: { clearAuth: false }
    setIsEvmLoggedIn(false);
    localStorage.removeItem('taskon_evm_login_state');
    disconnect();
  };

  // Handle automatic logout when wallet disconnects externally (e.g., from wallet extension)
  useEffect(() => {
    if (!isConnected && isEvmLoggedIn) {
      console.log('Wallet disconnected externally, logging out from TaskOn');
      setIsEvmLoggedIn(false);
      localStorage.removeItem('taskon_evm_login_state');
      if (embedRef.current) {
        embedRef.current.logout({ clearAuth: true }); // Keep auth cache for potential reconnection
      }
    }
  }, [isConnected, isEvmLoggedIn]);

  // Auto-login when wallet connects and embed is ready
  useEffect(() => {
    // Only auto-login when all conditions are met AND wallet is actually connected
    if (isConnected && isEmbedInitialized && !isEvmLoggedIn && address && walletClient) {
      console.log('Auto-login triggered: wallet connected and embed ready');
      loginWithWallet();
    }
  }, [isConnected, isEmbedInitialized, isEvmLoggedIn, address, walletClient, loginWithWallet]);

  // Language switching function
  const changeLanguage = useCallback(async (language: string) => {
    setCurrentLanguage(language);

    if (!embedRef.current || !isEmbedInitialized) {
      console.log('Embed not ready, language will be applied when available');
      return;
    }

    try {
      console.log('Switching language to:', language);
      await embedRef.current.setLanguage(language);
      console.log('Language switched successfully');
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  }, [isEmbedInitialized]);

  // Apply saved language when embed becomes ready
  useEffect(() => {
    if (isEmbedInitialized && embedRef.current && currentLanguage !== 'en') {
      changeLanguage(currentLanguage);
    }
  }, [isEmbedInitialized, currentLanguage, changeLanguage]);

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/45 backdrop-blur-xl border-b border-white/10 flex items-center px-5 z-[1001]">
        {/* Left - Branding */}
        <div className="flex items-center gap-4 flex-1">
          <h1 className="m-0 text-xl text-white font-bold tracking-wide">
            EVM Wallet Demo
          </h1>
        </div>

        {/* Center - Language Selector */}
        <div className="flex items-center justify-center flex-1">
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-black/50 backdrop-blur-md border border-white/20 rounded-md px-3 py-2 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 cursor-pointer hover:bg-black/70 transition-all duration-200"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right - Wallet Connection */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-400 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-md border bg-gray-500/90 hover:bg-gray-500 text-white border-gray-500 cursor-pointer hover:-translate-y-0.5"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </header>

      {/* TaskOn Embed Container */}
      <main className="absolute inset-0 bg-gray-50">
        <div ref={containerRef} className="w-full h-full" />
      </main>
    </div>
  );
}