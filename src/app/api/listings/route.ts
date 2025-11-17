import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listingFiltersSchema } from '@/lib/validations/listings';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = (page - 1) * limit;

        // Parse and apply filters
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const priceMin = searchParams.get('price_min');
        const priceMax = searchParams.get('price_max');
        const condition = searchParams.get('condition');
        const locationCity = searchParams.get('location_city');

        // Build query with filters
        let query = supabase
            .from('listings')
            .select('*')
            .eq('status', 'active');

        // Apply filters
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (priceMin) {
            query = query.gte('price', parseFloat(priceMin));
        }

        if (priceMax) {
            query = query.lte('price', parseFloat(priceMax));
        }

        if (condition) {
            const conditions = condition.split(',').filter(Boolean);
            if (conditions.length > 0) {
                query = query.in('condition', conditions);
            }
        }

        if (locationCity) {
            query = query.ilike('location_city', `%${locationCity}%`);
        }

        // Apply sorting and pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: listings, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch listings',
                details: error.message
            }, { status: 500 });
        }

        // Batch fetch category-specific details (optimize N+1 queries)
        const listingIds = (listings || []).map((l: any) => l.id);
        const guitarsIds = (listings || []).filter((l: any) => l.category === 'guitars').map((l: any) => l.id);
        const ampsIds = (listings || []).filter((l: any) => l.category === 'amps').map((l: any) => l.id);
        const effectsIds = (listings || []).filter((l: any) => l.category === 'effects').map((l: any) => l.id);

        const [guitarsDetails, ampsDetails, effectsDetails] = await Promise.all([
            guitarsIds.length > 0
                ? supabase.from('guitars_detail').select('*').in('listing_id', guitarsIds)
                : Promise.resolve({ data: [] }),
            ampsIds.length > 0
                ? supabase.from('amps_detail').select('*').in('listing_id', ampsIds)
                : Promise.resolve({ data: [] }),
            effectsIds.length > 0
                ? supabase.from('effects_detail').select('*').in('listing_id', effectsIds)
                : Promise.resolve({ data: [] }),
        ]);

        // Create lookup maps
        const guitarsMap = new Map((guitarsDetails.data || []).map((g: any) => [g.listing_id, g]));
        const ampsMap = new Map((ampsDetails.data || []).map((a: any) => [a.listing_id, a]));
        const effectsMap = new Map((effectsDetails.data || []).map((e: any) => [e.listing_id, e]));

        // Transform listings with details
        const transformedListings = (listings || []).map((listing: any) => {
            if (listing.category === 'guitars') {
                return { ...listing, guitar_details: guitarsMap.get(listing.id) || null };
            } else if (listing.category === 'amps') {
                return { ...listing, amp_details: ampsMap.get(listing.id) || null };
            } else if (listing.category === 'effects') {
                return { ...listing, effect_details: effectsMap.get(listing.id) || null };
            }
            return listing;
        });

        // Get total count with same filters
        let countQuery = supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active');

        // Apply same filters to count
        if (category && category !== 'all') {
            countQuery = countQuery.eq('category', category);
        }
        if (search) {
            countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (priceMin) {
            countQuery = countQuery.gte('price', parseFloat(priceMin));
        }
        if (priceMax) {
            countQuery = countQuery.lte('price', parseFloat(priceMax));
        }
        if (condition) {
            const conditions = condition.split(',').filter(Boolean);
            if (conditions.length > 0) {
                countQuery = countQuery.in('condition', conditions);
            }
        }
        if (locationCity) {
            countQuery = countQuery.ilike('location_city', `%${locationCity}%`);
        }

        const { count } = await countQuery;

        // Calculate pagination info
        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        const response = NextResponse.json({
            data: transformedListings,
            pagination: {
                page,
                limit,
                total_pages: totalPages,
                total_count: totalCount,
                has_next: hasNext,
                has_previous: hasPrevious
            }
        });

        // Add caching headers
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

        return response;

    } catch (error) {
        console.error('Listings API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
