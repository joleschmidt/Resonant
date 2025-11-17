import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTransactionSchema } from '@/lib/validations/transactions';
import { checkRateLimit, sensitiveRatelimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { logRateLimitExceeded } from '@/lib/security/auditLog';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting for sensitive transaction operations
        const identifier = getRateLimitIdentifier(request, user.id);
        const rateLimitResult = await checkRateLimit(sensitiveRatelimit, identifier, 20, 60000);
        
        if (!rateLimitResult.success) {
            await logRateLimitExceeded(request, user.id, '/api/transactions/create');
            return NextResponse.json(
                { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = createTransactionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed. Please check your input.' },
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

        // SECURITY: Validate transaction amount matches listing price exactly
        // This prevents price manipulation attacks
        if (Math.abs(amount - listing.price) > 0.01) {
            return NextResponse.json(
                { error: 'Transaction amount must match listing price' },
                { status: 400 }
            );
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

