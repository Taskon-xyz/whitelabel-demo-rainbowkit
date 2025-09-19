'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import EmailClient, { EmailClientRef } from './email-client';
import EmailModal from '../../components/EmailModal';
import { signMessage } from '../../utils';

export default function EmailPage() {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const emailClientRef = useRef<EmailClientRef>(null);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('demo_current_email');
    if (savedEmail) {
      setCurrentEmail(savedEmail);
    }
  }, []);


  // Demo login function
  const handleLogin = useCallback(async (email: string) => {
    setIsLoggingIn(true);
    try {
      // Ensure email and evm login are mutually exclusive - clear wallet address when logging in with email
      localStorage.removeItem('demo_wallet_address');
      
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
  const handleLogout = () => {
    setCurrentEmail('');
    localStorage.removeItem('demo_current_email');
    console.log('Demo logout successful');
  };

  // Signature generation function to pass to EmailClient, you should never sign message on client on production
  const generateSignature = useCallback(async (email: string) => {
    const clientId = process.env.NEXT_PUBLIC_TASKON_CLIENT_ID!;
    const { signature, timestamp } = await signMessage(clientId, 'Email', email);
    return { signature, timestamp };
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isLoggingIn) {
      setIsModalOpen(false);
    }
  };

  // Language switching function
  const changeLanguage = useCallback(async (language: string) => {
    setCurrentLanguage(language);
    if (emailClientRef.current) {
      try {
        await emailClientRef.current.setLanguage(language);
        console.log('Language switched successfully');
      } catch (error) {
        console.error('Failed to switch language:', error);
      }
    }
  }, []);

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
            Email Demo
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

        {/* Right - Login/Logout */}
        <div className="flex items-center gap-3 flex-1 justify-end">
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
          ref={emailClientRef}
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