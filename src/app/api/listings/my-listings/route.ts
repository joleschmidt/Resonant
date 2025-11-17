import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'active' | 'sold' | 'draft' | null (all)
        const sellerId = searchParams.get('seller_id');

        // Ensure user can only fetch their own listings
        if (sellerId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Build query for user's listings
        let query = supabase
            .from('listings')
            .select('*')
            .eq('seller_id', user.id);

        // Filter by status if provided
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        query = query.order('created_at', { ascending: false });

        const { data: listings, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch listings',
                details: error.message
            }, { status: 500 });
        }

        // Fetch category-specific details
        const guitarsDetails = await supabase
            .from('guitars_detail')
            .select('*')
            .in('listing_id', (listings || []).filter(l => l.category === 'guitars').map(l => l.id));

        const ampsDetails = await supabase
            .from('amps_detail')
            .select('*')
            .in('listing_id', (listings || []).filter(l => l.category === 'amps').map(l => l.id));

        const effectsDetails = await supabase
            .from('effects_detail')
            .select('*')
            .in('listing_id', (listings || []).filter(l => l.category === 'effects').map(l => l.id));

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

        return NextResponse.json({ data: transformedListings });
    } catch (error) {
        console.error('GET /api/listings/my-listings error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

