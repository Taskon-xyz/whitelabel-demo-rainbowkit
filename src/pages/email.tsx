"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TaskOnEmbed, LoginType } from '@taskon/embed';
import { signMessage } from '../utils';

const EmailDemo: NextPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);
  const FIXED_EMAIL = 'user@example.com';

  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new TaskOnEmbed({
      clientId: 'dG9rZW4tdGVzdC1yYW5kb20tc3RyaW5nMTIzNDU2Nzg5',
      baseUrl: 'https://whitelabel.wode.tech/',
      // baseUrl: 'http://localhost:5173',
      containerElement: containerRef.current,
      width: '100%',
      height: '100%'
    });

    embed.init().then(() => {
      embedRef.current = embed;
      setIsEmbedInitialized(true);
    });

    

    return () => {
      embed.destroy();
      embedRef.current = null;
      setIsEmbedInitialized(false);
    };
  }, []);

  // Email login
  const loginWithEmail = useCallback(async () => {
    if (!embedRef.current) {
      return;
    }

    // Check if embed is initialized before attempting login
    if (!embedRef.current.initialized) {
      console.log('TaskOn embed is not initialized yet, please wait...');
      return;
    }

    const TEST_CLIENT_ID = 'dG9rZW4tdGVzdC1yYW5kb20tc3RyaW5nMTIzNDU2Nzg5';
    const { signature, timestamp } = await signMessage(TEST_CLIENT_ID, 'email', FIXED_EMAIL);
    console.log('signature', signature);
      
    await embedRef.current.login({
      type: 'email',
      account: FIXED_EMAIL,
      signature: signature,
      timestamp: timestamp,
    });
    
    setIsEmailLogin(true);
  }, [FIXED_EMAIL]);

  const logout = useCallback(() => {
    if (!embedRef.current) return;
    
    embedRef.current.logout();
    setIsEmailLogin(false);
  }, []);

  return (
    <>
      <Head>
        <title>Email Demo - TaskOn Embed</title>
        <meta
          content="Email login demo with TaskOn Embed SDK"
          name="description"
        />
      </Head>

      <div className="fixed inset-0 z-[1000]">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/45 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 z-[1001]">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <h1 className="m-0 text-xl text-white font-bold tracking-wide">
              Email Demo
            </h1>
          </div>

          {/* Login/Logout */}
          <div className="flex items-center gap-3">
            {isEmailLogin ? (
              <div className="flex items-center gap-2">
                <div className="text-sm text-green-400 font-mono">
                  {FIXED_EMAIL}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-md border bg-gray-500/90 hover:bg-gray-500 text-white border-gray-500 cursor-pointer hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithEmail}
                disabled={!isEmbedInitialized}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-md border ${
                  isEmbedInitialized 
                    ? "bg-blue-500/90 hover:bg-blue-500 text-white border-blue-500 cursor-pointer hover:-translate-y-0.5" 
                    : "bg-gray-500/50 text-gray-400 border-gray-500 cursor-not-allowed"
                }`}
              >
                {isEmbedInitialized ? "Login with Email" : "Initializing..."}
              </button>
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

export default EmailDemo;