import { useEffect } from 'react';
import { trackVisit } from '@taskon/embed';

export function useVisitTracker() {

  useEffect(() => {
    const currentEmail = localStorage.getItem('demo_current_email');
    const currentWalletAddress = localStorage.getItem('demo_wallet_address');
    
    if (currentEmail) {
      // for email
      trackVisit('Email', currentEmail, true);
    } 
    else if (currentWalletAddress) {
      // for evm
      trackVisit('WalletAddress', currentWalletAddress, true);
    }
    // Anonymous user
    else {
      trackVisit(undefined, undefined, true);
    }
  }, []);
}