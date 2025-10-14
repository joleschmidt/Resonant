/**
 * Auth Provider Component
 * Initializes authentication state
 */

'use client';

import { useAuth } from '@/hooks/auth/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize auth state
    useAuth();

    return <>{children}</>;
}

