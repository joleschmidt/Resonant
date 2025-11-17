/**
 * useTrendingListings Hook
 * React Query hook for fetching trending listings with caching
 */

import { useQuery } from '@tanstack/react-query';
import type { ListingWithDetails } from '@/types/listings';

interface TrendingListingsResponse {
    data: ListingWithDetails[];
}

interface TrendingListingsParams {
    category?: string;
    limit?: number;
}

export function useTrendingListings(params: TrendingListingsParams = {}) {
    return useQuery<TrendingListingsResponse>({
        queryKey: ['listings', 'trending', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.category) searchParams.append('category', params.category);
            if (params.limit) searchParams.append('limit', params.limit.toString());

            const res = await fetch(`/api/listings/trending?${searchParams.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch trending listings');
            return res.json();
        },
        staleTime: 15 * 60 * 1000, // 15 minutes (trending changes slower)
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnMount: false, // Use cached data when navigating back
    });
}

