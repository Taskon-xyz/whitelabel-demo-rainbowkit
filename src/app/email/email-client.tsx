'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TaskOnEmbed, trackVisit } from '@taskon/embed';
import { signMessage } from '../../utils';
import EmailModal from '../../components/EmailModal';

export default function EmailClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Track page visit on component mount (for conversion analytics)
  useEffect(() => {
    // Only call if you need TaskOn conversion rate analysis
    trackVisit('Email', currentEmail || undefined);
  }, []); // Only run once on mount

  useEffect(() => {
    const savedLoginState = localStorage.getItem('taskon_email_login_state');
    const savedEmail = localStorage.getItem('taskon_current_email');
    
    if (savedLoginState === 'true') {
      setIsEmailLogin(true);
    }
    if (savedEmail) {
      setCurrentEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new TaskOnEmbed({
      baseUrl: process.env.NEXT_PUBLIC_TASKON_BASE_URL!,
      containerElement: containerRef.current,
      oauthToolUrl: 'https://stage.generalauthservice.com'
    });

    const handleRouteChanged = (fullPath: string) => {
      console.log('TaskOn route changed:', fullPath);
      // You can synchronize and update the parent page's URL or state here
      // Example: window.history.replaceState(null, '', `/email${fullPath}`);
    };
    
    embed.on('routeChanged', handleRouteChanged);
    
    console.log('embed', embed);
    embed.init().then(() => {
      embedRef.current = embed;
      console.log('embedRef.current', embedRef.current);
      setIsEmbedInitialized(true);
    });

    return () => {
      embed.destroy();
      embedRef.current = null;
      setIsEmbedInitialized(false);
    };
  }, []);


  const loginWithEmail = useCallback(async (email: string) => {
    if (!embedRef.current) {
      console.error('Embed not initialized');
      return;
    }

    if (!embedRef.current.initialized) {
      console.log('TaskOn embed is not initialized yet, please wait...');
      return;
    }

    setIsLoggingIn(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_TASKON_CLIENT_ID!;
      const { signature, timestamp } = await signMessage(clientId, 'Email', email);
      console.log('Logging in with email:', email);
      
      await embedRef.current.login({
        type: 'Email',
        account: email,
        signature: signature,
        timestamp: timestamp,
      });
      
      setCurrentEmail(email);
      setIsEmailLogin(true);
      setIsModalOpen(false);
      localStorage.setItem('taskon_current_email', email);
      localStorage.setItem('taskon_email_login_state', 'true');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (!embedRef.current) return;
    
    embedRef.current.logout();
    setIsEmailLogin(false);
    setCurrentEmail('');
    localStorage.removeItem('taskon_email_login_state');
    localStorage.removeItem('taskon_current_email');
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isLoggingIn) {
      setIsModalOpen(false);
    }
  }, [isLoggingIn]);

  return (
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
                {currentEmail}
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
              onClick={handleOpenModal}
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

      {/* Email Input Modal */}
      <EmailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={loginWithEmail}
        isLoading={isLoggingIn}
      />
    </div>
  );
}