/**
 * useListing Hook
 * React Query hook for fetching a single listing with caching
 */

import { useQuery } from '@tanstack/react-query';

interface ListingDetails {
    id: string;
    seller_id: string;
    category: string;
    title: string;
    description: string;
    slug: string;
    price: number;
    original_price?: number;
    price_negotiable: boolean;
    condition: string;
    condition_notes?: string;
    location_city: string;
    location_state: string;
    location_postal_code: string;
    shipping_available: boolean;
    shipping_cost?: number;
    shipping_methods: string[];
    pickup_available: boolean;
    images: string[];
    videos: string[];
    case_included: boolean;
    accessories: string[];
    tags: string[];
    status: string;
    views: number;
    created_at: string;
    updated_at: string;
    profiles?: {
        id: string;
        username: string;
        avatar_url?: string;
        verification_status: string;
        seller_rating?: number;
        total_sales?: number;
        location?: string;
        created_at: string;
    };
    details?: any;
}

interface ListingResponse {
    data: ListingDetails;
}

export function useListing(id: string | undefined, options?: { incrementView?: boolean }) {
    return useQuery<ListingResponse>({
        queryKey: ['listings', id],
        queryFn: async () => {
            if (!id) throw new Error('Listing ID required');
            const headers: HeadersInit = {};
            if (options?.incrementView) {
                headers['x-increment-view'] = '1';
            }
            const res = await fetch(`/api/listings/${id}`, { headers });
            if (!res.ok) {
                if (res.status === 404) throw new Error('Listing not found');
                throw new Error('Failed to fetch listing');
            }
            return res.json();
        },
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes (individual listings change more frequently)
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

