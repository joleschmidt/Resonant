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

        // Simple query first - just get listings without profile join
        const { data: listings, error } = await supabase
            .from('listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch listings',
                details: error.message
            }, { status: 500 });
        }

        // Get total count
        const { count } = await supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active');

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
