import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        const { count } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listingId);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        let isFavorite = false;
        if (user) {
            const { data: favoriteRow } = await supabase
                .from('favorites')
                .select('user_id')
                .eq('listing_id', listingId)
                .eq('user_id', user.id)
                .maybeSingle();
            isFavorite = !!favoriteRow;
        }

        return NextResponse.json({ is_favorite: isFavorite, favorites_count: count ?? 0 });
    } catch (error) {
        console.error('GET favorite status error:', error);
        return NextResponse.json({ is_favorite: false, favorites_count: 0 });
    }
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure listing exists and is active
        const { data: listing } = await supabase
            .from('listings')
            .select('id')
            .eq('id', listingId)
            .eq('status', 'active')
            .single();

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Idempotent insert
        const { error: upsertError } = await supabase
            .from('favorites')
            .upsert({ user_id: user.id, listing_id: listingId } as any, { onConflict: 'user_id,listing_id' });

        if (upsertError) {
            console.error('Favorite upsert error:', upsertError);
            return NextResponse.json({ error: 'Failed to favorite' }, { status: 500 });
        }

        // Return updated count
        const { count } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listingId);

        return NextResponse.json({ is_favorite: true, favorites_count: count ?? 0 });
    } catch (error) {
        console.error('POST favorite error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error: delError } = await supabase
            .from('favorites')
            .delete()
            .eq('listing_id', listingId)
            .eq('user_id', user.id);

        if (delError) {
            console.error('Favorite delete error:', delError);
            return NextResponse.json({ error: 'Failed to unfavorite' }, { status: 500 });
        }

        const { count } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listingId);

        return NextResponse.json({ is_favorite: false, favorites_count: count ?? 0 });
    } catch (error) {
        console.error('DELETE favorite error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


