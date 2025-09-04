"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { TaskOnEmbed, LoginType } from '@taskon/embed';
import { signMessage } from '../utils';

const EvmDemo: NextPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new TaskOnEmbed({
      clientId: 'dG9rZW4tdGVzdC1yYW5kb20tc3RyaW5nMTIzNDU2Nzg5',
      // baseUrl: 'http://localhost:5173',
      baseUrl: 'https://whitelabel.wode.tech',
      containerElement: containerRef.current,
      width: '100%',
      height: '100%'
    });

    embed.on('loginRequired', () => {
      openConnectModal?.();
    });

    // Initialize the embed
    embed.init().then(() => {
      embedRef.current = embed;
      setIsEmbedInitialized(true);
    });

    return () => {
      embed.destroy();
      embedRef.current = null;
      setIsEmbedInitialized(false);
    };
  }, [openConnectModal]);

  // Login with connected wallet
  const loginWithWallet = useCallback(async () => {
    if (!embedRef.current || !isConnected || !address || !walletClient) {
      return;
    }

    // Check if embed is initialized before attempting login
    if (!embedRef.current.initialized) {
      console.log('TaskOn embed is not initialized yet, waiting...');
      return;
    }

    const TEST_CLIENT_ID = 'dG9rZW4tdGVzdC1yYW5kb20tc3RyaW5nMTIzNDU2Nzg5';
    const { signature, timestamp } = await signMessage(TEST_CLIENT_ID, 'evm', address);
      
    await embedRef.current.login({
      type: 'evm',
      account: address,
      signature: signature,
      timestamp: timestamp,
      provider: walletClient,
    });
  }, [isConnected, address, walletClient]);

  const logout = useCallback(() => {
    if (!embedRef.current) return;
    disconnect();
    embedRef.current.logout();
  }, [disconnect]);

  // Auto-login when wallet is connected and embed is initialized
  useEffect(() => {
    if (isConnected && address && isEmbedInitialized && walletClient) {
      loginWithWallet();
    }
  }, [isConnected, address, isEmbedInitialized, walletClient, loginWithWallet]);

  return (
    <>
      <Head>
        <title>EVM Wallet Demo - TaskOn Embed</title>
        <meta
          content="EVM wallet login demo with TaskOn Embed SDK"
          name="description"
        />
      </Head>

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
    </>
  );
};

export default EvmDemo;