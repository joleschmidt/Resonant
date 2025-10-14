/**
 * useUser Hook
 * Convenient hook to get current user data
 */

'use client';

import { useAuth } from './useAuth';

export function useUser() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    // Helper getters
    userId: user?.id,
    email: user?.email,
    username: profile?.username,
    accountType: profile?.account_type,
    verificationStatus: profile?.verification_status,
    isVerified: profile?.verification_status !== 'unverified',
    isAdmin: profile?.account_type === 'admin',
    canCreateListings:
      profile?.account_type === 'verified' ||
      profile?.account_type === 'premium' ||
      profile?.account_type === 'store' ||
      profile?.account_type === 'admin',
  };
}

