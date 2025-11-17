/**
 * useListings Hook
 * React Query hook for fetching listings with caching
 */

import { useQuery } from '@tanstack/react-query';
import type { ListingWithDetails } from '@/types/listings';

interface ListingsResponse {
    data: ListingWithDetails[];
    pagination: {
        page: number;
        limit: number;
        total_pages: number;
        total_count: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

interface ListingsParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    price_min?: number;
    price_max?: number;
    condition?: string[];
    location_city?: string;
}

export function useListings(params: ListingsParams = {}) {
    // Normalize params for stable query key (only include defined values)
    const normalizedParams: Record<string, any> = {};
    if (params.page !== undefined) normalizedParams.page = params.page;
    if (params.limit !== undefined) normalizedParams.limit = params.limit;
    if (params.category) normalizedParams.category = params.category;
    if (params.search) normalizedParams.search = params.search;
    if (params.price_min !== undefined) normalizedParams.price_min = params.price_min;
    if (params.price_max !== undefined) normalizedParams.price_max = params.price_max;
    if (params.condition && params.condition.length > 0) {
        normalizedParams.condition = [...params.condition].sort().join(','); // Sort for stable key
    }
    if (params.location_city) normalizedParams.location_city = params.location_city;
    
    return useQuery<ListingsResponse>({
        queryKey: ['listings', normalizedParams],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());
            if (params.category) searchParams.append('category', params.category);
            if (params.search) searchParams.append('search', params.search);
            if (params.price_min) searchParams.append('price_min', params.price_min.toString());
            if (params.price_max) searchParams.append('price_max', params.price_max.toString());
            if (params.condition) searchParams.append('condition', params.condition.join(','));
            if (params.location_city) searchParams.append('location_city', params.location_city);

            const res = await fetch(`/api/listings?${searchParams.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch listings');
            return res.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
        refetchOnMount: false, // Use cached data when navigating back
    });
}

