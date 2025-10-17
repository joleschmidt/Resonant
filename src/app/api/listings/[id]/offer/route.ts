import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;
        const body = await request.json().catch(() => ({}));
        const amountRaw = body?.amount;
        const message: string | undefined = body?.message;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Load listing and basic validation
        const { data: listing } = await supabase
            .from('listings')
            .select('id, seller_id, price, status')
            .eq('id', listingId)
            .single();

        if (!listing || (listing as any).status !== 'active') {
            return NextResponse.json({ error: 'Listing not available' }, { status: 404 });
        }

        if ((listing as any).seller_id === user.id) {
            return NextResponse.json({ error: 'Cannot offer on your own listing' }, { status: 400 });
        }

        const amount = Number(amountRaw);
        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 422 });
        }
        if (amount >= (listing as any).price) {
            return NextResponse.json({ error: 'Offer must be below asking price' }, { status: 422 });
        }

        // Insert offer
        const { data: offer, error: insertError } = await supabase
            .from('offers')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                amount,
                message: message || null,
                status: 'pending',
            } as any)
            .select('id, status')
            .single();

        if (insertError) {
            console.error('Offer insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
        }

        return NextResponse.json({ offer_id: (offer as any).id, status: (offer as any).status });
    } catch (error) {
        console.error('POST offer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


