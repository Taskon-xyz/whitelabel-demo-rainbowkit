import { useEffect } from 'react';
import { trackVisit } from '@taskon/embed';

export function useVisitTracker() {
  useEffect(() => {
    // Pull the last known email identity from localStorage so analytics can
    // attribute the visit even when the page is refreshed directly.
    // The demo now supports Email flow only.
    const currentEmail = localStorage.getItem('demo_current_email');
    
    if (currentEmail) {
      // Email login flow: send the email identity to TaskOn analytics.
      trackVisit('Email', currentEmail, true);
    } else {
      // No identity stored: record an anonymous visit to keep metrics consistent.
      trackVisit(undefined, undefined, true);
    }
  }, []);
}
