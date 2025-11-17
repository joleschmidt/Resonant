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
        const status = searchParams.get('status'); // 'pending' | 'completed' | null (all)

        // Build query for transactions where user is buyer or seller
        let query = supabase
            .from('transactions')
            .select(`
                *,
                listings (
                    id,
                    title,
                    price,
                    images,
                    category,
                    status
                ),
                buyer:profiles!buyer_id (
                    id,
                    username,
                    avatar_url,
                    full_name
                ),
                seller:profiles!seller_id (
                    id,
                    username,
                    avatar_url,
                    full_name
                )
            `)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        // Filter by status if provided
        if (status && (status === 'pending' || status === 'completed')) {
            query = query.eq('status', status);
        }

        const { data: transactions, error } = await query;

        if (error) {
            console.error('Failed to fetch transactions:', error);
            return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
        }

        return NextResponse.json({ data: transactions || [] });
    } catch (error) {
        console.error('GET /api/transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

