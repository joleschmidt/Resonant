/**
 * Providers Component
 * Wrap app with React Query and other providers
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './AuthProvider';
import { SessionHydrator } from './SessionHydrator';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes default
                        gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
                        refetchOnWindowFocus: false,
                        refetchOnMount: false, // Don't refetch on mount if data exists in cache
                        refetchOnReconnect: true,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SessionHydrator />
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}

