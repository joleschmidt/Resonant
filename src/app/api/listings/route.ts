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

        // Parse and validate filters
        const filters = {
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined,
            price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined,
            price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined,
            condition: searchParams.get('condition')?.split(',').filter(Boolean),
            location_city: searchParams.get('location_city') || undefined,
            brand: searchParams.get('brand')?.split(',').filter(Boolean),
            guitar_type: searchParams.get('guitar_type')?.split(',').filter(Boolean),
            amp_type: searchParams.get('amp_type')?.split(',').filter(Boolean),
            effect_type: searchParams.get('effect_type')?.split(',').filter(Boolean),
            year_min: searchParams.get('year_min') ? parseInt(searchParams.get('year_min')!) : undefined,
            year_max: searchParams.get('year_max') ? parseInt(searchParams.get('year_max')!) : undefined,
            shipping_available: searchParams.get('shipping_available') === 'true' ? true : undefined,
            pickup_available: searchParams.get('pickup_available') === 'true' ? true : undefined,
        };

        // Validate filters
        const validatedFilters = listingFiltersSchema.parse(filters);

        // Build query
        let query = supabase
            .from('listings')
            .select(`
        *,
        profiles!seller_id (
          id,
          username,
          avatar_url,
          verification_status,
          seller_rating,
          location
        )
      `)
            .eq('status', 'active');

        // Apply filters
        if (validatedFilters.category) {
            query = query.eq('category', validatedFilters.category);
        }

        if (validatedFilters.search) {
            query = query.textSearch('search_vector', validatedFilters.search, {
                type: 'websearch',
                config: 'german'
            });
        }

        if (validatedFilters.price_min !== undefined) {
            query = query.gte('price', validatedFilters.price_min);
        }

        if (validatedFilters.price_max !== undefined) {
            query = query.lte('price', validatedFilters.price_max);
        }

        if (validatedFilters.condition && validatedFilters.condition.length > 0) {
            query = query.in('condition', validatedFilters.condition);
        }

        if (validatedFilters.location_city) {
            query = query.ilike('location_city', `%${validatedFilters.location_city}%`);
        }

        if (validatedFilters.shipping_available !== undefined) {
            query = query.eq('shipping_available', validatedFilters.shipping_available);
        }

        if (validatedFilters.pickup_available !== undefined) {
            query = query.eq('pickup_available', validatedFilters.pickup_available);
        }

        // Apply category-specific filters
        if (validatedFilters.category === 'guitars' && validatedFilters.guitar_type) {
            query = query.in('guitar_type', validatedFilters.guitar_type);
        }

        if (validatedFilters.category === 'amps' && validatedFilters.amp_type) {
            query = query.in('amp_type', validatedFilters.amp_type);
        }

        if (validatedFilters.category === 'effects' && validatedFilters.effect_type) {
            query = query.in('effect_type', validatedFilters.effect_type);
        }

        // Apply year filters
        if (validatedFilters.year_min !== undefined) {
            query = query.gte('year', validatedFilters.year_min);
        }

        if (validatedFilters.year_max !== undefined) {
            query = query.lte('year', validatedFilters.year_max);
        }

        // Apply brand filters
        if (validatedFilters.brand && validatedFilters.brand.length > 0) {
            query = query.in('brand', validatedFilters.brand);
        }

        // Get total count for pagination
        const { count } = await query.select('id', { count: 'exact', head: true });

        // Apply sorting
        const sortBy = searchParams.get('sort_by') || 'created_at';
        const sortOrder = searchParams.get('sort_order') || 'desc';

        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: listings, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch listings'
            }, { status: 500 });
        }

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
            error: 'Internal server error'
        }, { status: 500 });
    }
}
