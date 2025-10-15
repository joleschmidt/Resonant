import { create } from 'zustand';
import type { ListingWithDetails } from '@/types/listings';

type Filters = {
    category?: string;
    search?: string;
    price_min?: number;
    price_max?: number;
    condition?: string[];
    location_city?: string;
};

interface ListingsState {
    allListings: ListingWithDetails[];
    isLoading: boolean;
    error: string | null;
    setListings: (data: ListingWithDetails[]) => void;
    fetchOnce: (initialFilters?: Filters) => Promise<void>;
}

export const useListingsStore = create<ListingsState>((set, get) => ({
    allListings: [],
    isLoading: false,
    error: null,
    setListings: (data) => set({ allListings: data }),
    fetchOnce: async () => {
        if (get().allListings.length > 0) return; // already cached
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', '500'); // fetch a generous page to support client-side filtering
            const res = await fetch(`/api/listings?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch listings');
            const json = await res.json();
            set({ allListings: json.data || [] });
        } catch (e: any) {
            set({ error: e?.message || 'Unknown error' });
        } finally {
            set({ isLoading: false });
        }
    },
}));

export function applyClientFilters(listings: ListingWithDetails[], filters: Filters): ListingWithDetails[] {
    let result = listings;
    if (filters.category) {
        result = result.filter((l) => l.category === filters.category);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((l) =>
            l.title.toLowerCase().includes(q) ||
            (l.description || '').toLowerCase().includes(q)
        );
    }
    if (filters.price_min != null) result = result.filter((l) => (l.price ?? 0) >= filters.price_min!);
    if (filters.price_max != null) result = result.filter((l) => (l.price ?? 0) <= filters.price_max!);
    if (filters.condition && filters.condition.length > 0) {
        result = result.filter((l) => filters.condition!.includes(l.condition));
    }
    if (filters.location_city) {
        const city = filters.location_city.toLowerCase();
        result = result.filter((l) => (l.location_city || '').toLowerCase().includes(city));
    }
    return result;
}


