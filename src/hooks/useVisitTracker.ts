import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackVisit } from '@taskon/embed';

export function useVisitTracker() {

  useEffect(() => {
    const currentEmail = localStorage.getItem('demo_current_email');
    const currentWalletAddress = localStorage.getItem('demo_wallet_address');
    
    if (currentEmail) {
      // for email
      trackVisit('Email', currentEmail);
    } 
    else if (currentWalletAddress) {
      // for evm
      trackVisit('WalletAddress', currentWalletAddress);
    }
    // Anonymous user
    else {
      trackVisit();
    }
  }, []);
}