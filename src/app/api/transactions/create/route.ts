import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTransactionSchema } from '@/lib/validations/transactions';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createTransactionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error },
                { status: 400 }
            );
        }

        const { listingId, amount } = validation.data;

        // Get listing and verify it's active
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('id, seller_id, price, status')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.status !== 'active') {
            return NextResponse.json({ error: 'Listing is not available' }, { status: 400 });
        }

        if (listing.seller_id === user.id) {
            return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 });
        }

        // Create transaction
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: listing.seller_id,
                amount,
                status: 'pending',
            })
            .select()
            .single();

        if (transactionError || !transaction) {
            console.error('Transaction creation error:', transactionError);
            return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
        }

        return NextResponse.json({ data: transaction }, { status: 201 });
    } catch (error) {
        console.error('POST /api/transactions/create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

