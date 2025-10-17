import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRatingSchema } from '@/lib/validations/transactions';

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
        const validation = createRatingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error },
                { status: 400 }
            );
        }

        const { transactionId, ratedUserId, score, comment } = validation.data;

        // Get transaction and verify user is part of it
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (transactionError || !transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (transaction.status !== 'completed') {
            return NextResponse.json(
                { error: 'Can only rate completed transactions' },
                { status: 400 }
            );
        }

        // Verify ratedUserId is the other party
        if (
            ratedUserId !== transaction.buyer_id &&
            ratedUserId !== transaction.seller_id
        ) {
            return NextResponse.json({ error: 'Invalid rated user' }, { status: 400 });
        }

        if (ratedUserId === user.id) {
            return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
        }

        // Check if rating already exists
        const { data: existingRating } = await supabase
            .from('ratings')
            .select('id')
            .eq('transaction_id', transactionId)
            .eq('rater_id', user.id)
            .maybeSingle();

        if (existingRating) {
            return NextResponse.json({ error: 'Already rated this transaction' }, { status: 400 });
        }

        // Create rating
        const { data: rating, error: ratingError } = await supabase
            .from('ratings')
            .insert({
                transaction_id: transactionId,
                listing_id: transaction.listing_id,
                rater_id: user.id,
                rated_user_id: ratedUserId,
                score,
                comment: comment || null,
            })
            .select()
            .single();

        if (ratingError || !rating) {
            console.error('Rating creation error:', ratingError);
            return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
        }

        return NextResponse.json({ data: rating }, { status: 201 });
    } catch (error) {
        console.error('POST /api/ratings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
        }

        // Get ratings for a user
        const { data: ratings, error } = await supabase
            .from('ratings')
            .select(
                `
        id,
        score,
        comment,
        created_at,
        rater:rater_id (
          id,
          username,
          avatar_url
        )
      `
            )
            .eq('rated_user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Failed to fetch ratings:', error);
            return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
        }

        return NextResponse.json({ data: ratings || [] });
    } catch (error) {
        console.error('GET /api/ratings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

