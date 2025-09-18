'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TaskOnEmbed, TaskCompletedData } from '@taskon/embed';

interface EmailClientProps {
  currentEmail: string;
  onSignature: (email: string) => Promise<{ signature: string; timestamp: number }>;
}

export default function EmailClient({ currentEmail, onSignature }: EmailClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  
  const [isEmbedInitialized, setIsEmbedInitialized] = useState(false);


  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new TaskOnEmbed({
      baseUrl: process.env.NEXT_PUBLIC_TASKON_BASE_URL!,
      containerElement: containerRef.current
    });

    const handleRouteChanged = (fullPath: string) => {
      console.log('TaskOn route changed:', fullPath);
      // You can synchronize and update the parent page's URL or state here
      // Example: window.history.replaceState(null, '', `/email${fullPath}`);
    };

    const handleTaskCompleted = (data: TaskCompletedData) => {
      console.log('TaskOn task completed:', data);
    };
    
    embed.on('routeChanged', handleRouteChanged);
    embed.on('taskCompleted', handleTaskCompleted);
    
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


  // TaskOn login function
  const loginToTaskOn = useCallback(async (email: string) => {
    if (!embedRef.current || !embedRef.current.initialized) {
      console.log('TaskOn embed is not ready yet');
      return;
    }

    try {
      // Check if account has valid authorization cache
      const isAuthorized = await embedRef.current.isAuthorized('Email', email);
      
      if (isAuthorized) {
        // Has valid auth cache, no signature needed
        await embedRef.current.login({
          type: 'Email',
          account: email,
        });
      } else {
        // No auth cache, get signature first then login
        const { signature, timestamp } = await onSignature(email);
        
        await embedRef.current.login({
          type: 'Email',
          account: email,
          signature,
          timestamp,
        });
      }
      
      console.log('TaskOn login successful');
    } catch (error) {
      console.error('TaskOn login failed:', error);
    }
  }, [onSignature]);

  // TaskOn logout function
  const logoutFromTaskOn = async () => {
    if (!embedRef.current || !embedRef.current.initialized) return;
    
    try {
      // Default behavior: keep auth cache for quick re-login
      await embedRef.current.logout();
      console.log('TaskOn logout successful');
    } catch (error) {
      console.warn('TaskOn logout failed (may not be logged in):', error);
    }
  };

  // Auto login/logout based on email changes
  useEffect(() => {
    if (!isEmbedInitialized || !embedRef.current) return;

    const handleEmailChange = async () => {
      if (currentEmail) {
        // Auto login when email is provided
        await loginToTaskOn(currentEmail);
      } else {
        // Auto logout when email is removed
        logoutFromTaskOn();
      }
    };

    handleEmailChange();
  }, [currentEmail, isEmbedInitialized, loginToTaskOn, logoutFromTaskOn]);


  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}