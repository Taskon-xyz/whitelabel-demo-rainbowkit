import { useEffect } from 'react';
import { trackVisit } from '@taskon/embed';

export function useVisitTracker() {
  useEffect(() => {
    // Pull the last known identity from localStorage so analytics can
    // attribute the visit even when the page is refreshed directly.
    const currentEmail = localStorage.getItem('demo_current_email');
    const currentWalletAddress = localStorage.getItem('demo_wallet_address');
    
    if (currentEmail) {
      // Email login flow: send the email identity to TaskOn analytics.
      trackVisit('Email', currentEmail, true);
    } 
    else if (currentWalletAddress) {
      // EVM login flow: send the wallet address identity to TaskOn analytics.
      trackVisit('WalletAddress', currentWalletAddress, true);
    }
    // Anonymous user
    else {
      // No identity stored: record an anonymous visit to keep metrics consistent.
      trackVisit(undefined, undefined, true);
    }
  }, []);
}
