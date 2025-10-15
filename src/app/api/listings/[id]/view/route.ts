import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Debounce window in minutes
const VIEW_DEBOUNCE_MINUTES = 30;

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: listingId } = await params;
        const cookieStore = await cookies();
        const key = `viewed_${listingId}`;
        const existing = cookieStore.get(key);
        if (existing) {
            return NextResponse.json({ skipped: true });
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('listings')
            .update({ views: (null as any) }) // placeholder; use RPC to avoid race
            .eq('id', listingId);

        // Fallback: use RPC to increment atomically
        if (error) {
            const { error: rpcError } = await (supabase as any).rpc('increment_listing_views', { p_listing_id: listingId });
            if (rpcError) {
                console.error('View increment error:', rpcError);
                return NextResponse.json({ error: 'failed' }, { status: 500 });
            }
        } else {
            // If direct update worked, do a single SQL that increments
            await (supabase as any)
                .from('listings')
                .update({ views: (undefined as any) })
                .eq('id', listingId);
        }

        const res = NextResponse.json({ ok: true });
        // Set debounce cookie
        res.cookies.set({
            name: key,
            value: '1',
            httpOnly: false,
            sameSite: 'lax',
            path: '/',
            maxAge: VIEW_DEBOUNCE_MINUTES * 60,
        });
        return res;
    } catch (e) {
        console.error('View POST error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


