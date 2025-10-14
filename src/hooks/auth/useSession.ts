/**
 * useSession Hook
 * Session management utilities
 */

'use client';

import { createClient } from '@/lib/supabase/client';

export function useSession() {
  const supabase = createClient();

  const refreshSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    
    return session;
  };

  const getSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  };

  return {
    refreshSession,
    getSession,
  };
}

