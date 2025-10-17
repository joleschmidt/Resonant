import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

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
        // Atomic increment via RPC
        const { error: rpcError } = await (supabase as any).rpc('increment_listing_views', { p_listing_id: listingId });
        if (rpcError) {
            console.error('View increment error:', rpcError);
            return NextResponse.json({ error: 'failed' }, { status: 500 });
        }

        // Fetch updated count
        const { data: updated, error: fetchError } = await supabase
            .from('listings')
            .select('views')
            .eq('id', listingId)
            .single();
        if (fetchError) {
            return NextResponse.json({ ok: true });
        }

        const res = NextResponse.json({ ok: true, views: (updated as any).views ?? null });
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


