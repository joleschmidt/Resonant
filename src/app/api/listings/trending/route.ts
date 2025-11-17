import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 120; // Revalidate every 2 minutes (trending changes slower)

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        
        // Calculate date 7 days ago for recent activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        // Build query for trending listings
        // Trending = high views/favorites + recent activity (last 7 days)
        let query = supabase
            .from('listings')
            .select('*')
            .eq('status', 'active')
            .gte('created_at', sevenDaysAgoISO); // Only listings from last 7 days

        // Apply category filter if provided
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        // Order by views and recency (we'll calculate favorites_count separately)
        const { data: listings, error } = await query
            .order('views', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit * 2); // Get more to calculate favorites and sort

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch trending listings',
                details: error.message
            }, { status: 500 });
        }

        // Batch fetch favorites_count for all listings (optimize N+1)
        const listingIds = (listings || []).map((l: any) => l.id);
        const { data: favoritesData } = await supabase
            .from('favorites')
            .select('listing_id')
            .in('listing_id', listingIds);

        // Count favorites per listing
        const favoritesCountMap = new Map<string, number>();
        (favoritesData || []).forEach((f: any) => {
            favoritesCountMap.set(f.listing_id, (favoritesCountMap.get(f.listing_id) || 0) + 1);
        });

        const listingsWithFavorites = (listings || []).map((listing: any) => ({
            ...listing,
            favorites_count: favoritesCountMap.get(listing.id) || 0,
        }));

        // Sort by trending score: (views * 0.5 + favorites_count * 2)
        listingsWithFavorites.sort((a, b) => {
            const scoreA = (a.views || 0) * 0.5 + (a.favorites_count || 0) * 2;
            const scoreB = (b.views || 0) * 0.5 + (b.favorites_count || 0) * 2;
            return scoreB - scoreA;
        });

        // Batch fetch category-specific details for sorted listings (optimize N+1)
        const sortedListings = listingsWithFavorites.slice(0, limit);
        const sortedIds = sortedListings.map((l: any) => l.id);
        const sortedGuitarsIds = sortedListings.filter((l: any) => l.category === 'guitars').map((l: any) => l.id);
        const sortedAmpsIds = sortedListings.filter((l: any) => l.category === 'amps').map((l: any) => l.id);
        const sortedEffectsIds = sortedListings.filter((l: any) => l.category === 'effects').map((l: any) => l.id);

        const [sortedGuitarsDetails, sortedAmpsDetails, sortedEffectsDetails] = await Promise.all([
            sortedGuitarsIds.length > 0
                ? supabase.from('guitars_detail').select('*').in('listing_id', sortedGuitarsIds)
                : Promise.resolve({ data: [] }),
            sortedAmpsIds.length > 0
                ? supabase.from('amps_detail').select('*').in('listing_id', sortedAmpsIds)
                : Promise.resolve({ data: [] }),
            sortedEffectsIds.length > 0
                ? supabase.from('effects_detail').select('*').in('listing_id', sortedEffectsIds)
                : Promise.resolve({ data: [] }),
        ]);

        const sortedGuitarsMap = new Map((sortedGuitarsDetails.data || []).map((g: any) => [g.listing_id, g]));
        const sortedAmpsMap = new Map((sortedAmpsDetails.data || []).map((a: any) => [a.listing_id, a]));
        const sortedEffectsMap = new Map((sortedEffectsDetails.data || []).map((e: any) => [e.listing_id, e]));

        const sortedListingsWithDetails = sortedListings.map((listing: any) => {
            if (listing.category === 'guitars') {
                return { ...listing, guitar_details: sortedGuitarsMap.get(listing.id) || null };
            } else if (listing.category === 'amps') {
                return { ...listing, amp_details: sortedAmpsMap.get(listing.id) || null };
            } else if (listing.category === 'effects') {
                return { ...listing, effect_details: sortedEffectsMap.get(listing.id) || null };
            }
            return listing;
        });

        // If we don't have enough recent listings, fill with overall trending
        if (sortedListingsWithDetails.length < limit) {
            const remaining = limit - sortedListingsWithDetails.length;
            const excludeIds = sortedListingsWithDetails.map(l => l.id);

            const { data: fallbackListings } = await supabase
                .from('listings')
                .select('*')
                .eq('status', 'active')
                .order('views', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(remaining * 3); // Get more to filter and calculate favorites

            // Batch fetch favorites_count for fallback listings
            const fallbackIds = (fallbackListings || []).map((l: any) => l.id);
            const { data: fallbackFavoritesData } = await supabase
                .from('favorites')
                .select('listing_id')
                .in('listing_id', fallbackIds);

            const fallbackFavoritesMap = new Map<string, number>();
            (fallbackFavoritesData || []).forEach((f: any) => {
                fallbackFavoritesMap.set(f.listing_id, (fallbackFavoritesMap.get(f.listing_id) || 0) + 1);
            });

            const fallbackWithFavorites = (fallbackListings || []).map((listing: any) => ({
                ...listing,
                favorites_count: fallbackFavoritesMap.get(listing.id) || 0,
            }));

            // Filter by category and exclude already fetched listings
            let filtered = fallbackWithFavorites.filter((listing) => {
                if (category && category !== 'all' && listing.category !== category) {
                    return false;
                }
                return !excludeIds.includes(listing.id);
            });

            // Sort by trending score
            filtered.sort((a, b) => {
                const scoreA = (a.views || 0) * 0.5 + (a.favorites_count || 0) * 2;
                const scoreB = (b.views || 0) * 0.5 + (b.favorites_count || 0) * 2;
                return scoreB - scoreA;
            });

            // Batch fetch details for fallback listings
            const fallbackFiltered = filtered.slice(0, remaining);
            const fallbackFilteredIds = fallbackFiltered.map((l: any) => l.id);
            const fallbackGuitarsIds = fallbackFiltered.filter((l: any) => l.category === 'guitars').map((l: any) => l.id);
            const fallbackAmpsIds = fallbackFiltered.filter((l: any) => l.category === 'amps').map((l: any) => l.id);
            const fallbackEffectsIds = fallbackFiltered.filter((l: any) => l.category === 'effects').map((l: any) => l.id);

            const [fallbackGuitarsDetails, fallbackAmpsDetails, fallbackEffectsDetails] = await Promise.all([
                fallbackGuitarsIds.length > 0
                    ? supabase.from('guitars_detail').select('*').in('listing_id', fallbackGuitarsIds)
                    : Promise.resolve({ data: [] }),
                fallbackAmpsIds.length > 0
                    ? supabase.from('amps_detail').select('*').in('listing_id', fallbackAmpsIds)
                    : Promise.resolve({ data: [] }),
                fallbackEffectsIds.length > 0
                    ? supabase.from('effects_detail').select('*').in('listing_id', fallbackEffectsIds)
                    : Promise.resolve({ data: [] }),
            ]);

            const fallbackGuitarsMap = new Map((fallbackGuitarsDetails.data || []).map((g: any) => [g.listing_id, g]));
            const fallbackAmpsMap = new Map((fallbackAmpsDetails.data || []).map((a: any) => [a.listing_id, a]));
            const fallbackEffectsMap = new Map((fallbackEffectsDetails.data || []).map((e: any) => [e.listing_id, e]));

            const fallbackWithDetails = fallbackFiltered.map((listing: any) => {
                if (listing.category === 'guitars') {
                    return { ...listing, guitar_details: fallbackGuitarsMap.get(listing.id) || null };
                } else if (listing.category === 'amps') {
                    return { ...listing, amp_details: fallbackAmpsMap.get(listing.id) || null };
                } else if (listing.category === 'effects') {
                    return { ...listing, effect_details: fallbackEffectsMap.get(listing.id) || null };
                }
                return listing;
            });

            const response = NextResponse.json({
                data: [...sortedListingsWithDetails, ...fallbackWithDetails]
            });
            response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
            return response;
        }

        const response = NextResponse.json({
            data: sortedListingsWithDetails
        });
        response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
        return response;

    } catch (error) {
        console.error('Trending listings API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

