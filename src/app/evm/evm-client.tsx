'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { TaskOnEmbed, AuthType, trackVisit, TaskCompletedData } from '@taskon/embed';
import { signMessage } from '../../utils';

export default function EvmClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);
  
  const [isEvmLoggedIn, setIsEvmLoggedIn] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: walletClient } = useWalletClient();

  // Track page visit when address is available
  useEffect(() => {
    // Only call if you need TaskOn conversion rate analysis
    if (address) {
      trackVisit('WalletAddress', address);
    } else {
      // For anonymous users when no wallet connected
      trackVisit();
    }
  }, [address]); // Re-run when address changes

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
      oauthToolUrl: 'https://stage.generalauthservice.com'
    });

    const handleLoginRequired = () => {
      console.log('TaskOn loginRequired event triggered');
      openConnectModal?.();
    };
    
    const handleRouteChanged = (fullPath: string) => {
      console.log('TaskOn route changed:', fullPath);
      // You can synchronize and update the parent page's URL or state here
      // Example: window.history.replaceState(null, '', `/evm${fullPath}`);
    };

    const handleTaskCompleted = (data: TaskCompletedData) => {
      console.log('TaskOn task completed:', data);
    };

    embed.on('loginRequired', handleLoginRequired);
    embed.on('routeChanged', handleRouteChanged);
    embed.on('taskCompleted', handleTaskCompleted);

    // Initialize the embed
    embed.init().then(() => {
      console.log('TaskOn embed initialized successfully');
      embedRef.current = embed;
      setIsEmbedInitialized(true);
    }).catch((error) => {
      console.error('TaskOn embed initialization failed:', error);
    });

    return () => {
      console.log('Cleaning up TaskOn embed...');
      embed.destroy();
      embedRef.current = null;
      setIsEmbedInitialized(false);
    };
  }, []); // Only initialize once

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
      
      setIsEvmLoggedIn(true);
      localStorage.setItem('taskon_evm_login_state', 'true');
      console.log('EVM login successful');
    } catch (error) {
      console.error('EVM login failed:', error);
      // Don't update login state on failure
    }
  }, [isConnected, address, walletClient]);

  const logout = useCallback(() => {
    if (!embedRef.current) return;
    
    // Logout from TaskOn first (keep auth cache by default), then disconnect wallet
    embedRef.current.logout(); // Default: { clearAuth: false }
    setIsEvmLoggedIn(false);
    localStorage.removeItem('taskon_evm_login_state');
    disconnect();
  }, [disconnect]);

  // Handle automatic logout when wallet disconnects externally (e.g., from wallet extension)
  useEffect(() => {
    if (!isConnected && isEvmLoggedIn) {
      console.log('Wallet disconnected externally, logging out from TaskOn');
      setIsEvmLoggedIn(false);
      localStorage.removeItem('taskon_evm_login_state');
      if (embedRef.current) {
        embedRef.current.logout(); // Keep auth cache for potential reconnection
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
  }, [isConnected, isEmbedInitialized, address, walletClient]);

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/45 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 z-[1001]">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-xl text-white font-bold tracking-wide">
            EVM Wallet Demo
          </h1>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
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