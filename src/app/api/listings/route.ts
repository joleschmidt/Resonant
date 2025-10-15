import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listingFiltersSchema } from '@/lib/validations/listings';

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

        return NextResponse.json({
            data: listings || [],
            pagination: {
                page,
                limit,
                total_pages: totalPages,
                total_count: totalCount,
                has_next: hasNext,
                has_previous: hasPrevious
            }
        });

    } catch (error) {
        console.error('Listings API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
