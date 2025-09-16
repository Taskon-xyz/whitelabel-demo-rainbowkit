'use client'

import type { Metadata } from 'next';
import { useState, useEffect, useCallback } from 'react';
import EmailClient from './email-client';
import EmailModal from '../../components/EmailModal';
import { signMessage } from '../../utils';
import { trackVisit } from '@taskon/embed';

export default function EmailPage() {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('demo_current_email');
    if (savedEmail) {
      setCurrentEmail(savedEmail);
    }
  }, []);

  // Track page visit when email is available
  useEffect(() => {
    // Only call if you need TaskOn conversion rate analysis
    if (currentEmail) {
      trackVisit('Email', currentEmail);
    } else {
      // For anonymous users
      trackVisit();
    }
  }, [currentEmail]); // Re-run when email changes

  // Demo login function
  const handleLogin = useCallback(async (email: string) => {
    setIsLoggingIn(true);
    try {
      // Simulate demo login logic here
      setCurrentEmail(email);
      setIsModalOpen(false);
      localStorage.setItem('demo_current_email', email);
      console.log('Demo login successful:', email);
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('Demo login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // Demo logout function
  const handleLogout = useCallback(() => {
    setCurrentEmail('');
    localStorage.removeItem('demo_current_email');
    console.log('Demo logout successful');
  }, []);

  // Signature generation function to pass to EmailClient, you should never sign message on client on production
  const generateSignature = useCallback(async (email: string) => {
    const clientId = process.env.NEXT_PUBLIC_TASKON_CLIENT_ID!;
    const { signature, timestamp } = await signMessage(clientId, 'Email', email);
    return { signature, timestamp };
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
          {currentEmail ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-400 font-mono">
                {currentEmail}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-md border bg-gray-500/90 hover:bg-gray-500 text-white border-gray-500 cursor-pointer hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-md border bg-blue-500/90 hover:bg-blue-500 text-white border-blue-500 cursor-pointer hover:-translate-y-0.5"
            >
              Login with Email
            </button>
          )}
        </div>
      </header>

      {/* Demo login status indicator */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {currentEmail && (
          <div className="text-xs text-green-400 font-mono bg-black/50 px-2 py-1 rounded">
            Demo: {currentEmail}
          </div>
        )}
      </div>

      {/* TaskOn Email Client */}
      <main className="absolute inset-0 bg-gray-50">
        <EmailClient 
          currentEmail={currentEmail}
          onSignature={generateSignature}
        />
      </main>

      {/* Demo Email Modal */}
      <EmailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleLogin}
        isLoading={isLoggingIn}
      />
    </div>
  );
}