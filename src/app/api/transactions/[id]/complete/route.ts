import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: transactionId } = await params;

        // Get transaction and verify user is buyer or seller
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (transaction.status === 'completed') {
            return NextResponse.json({ error: 'Transaction already completed' }, { status: 400 });
        }

        // Update transaction to completed
        const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', transactionId)
            .select()
            .single();

        if (updateError || !updatedTransaction) {
            console.error('Transaction update error:', updateError);
            return NextResponse.json({ error: 'Failed to complete transaction' }, { status: 500 });
        }

        return NextResponse.json({ data: updatedTransaction });
    } catch (error) {
        console.error('PATCH /api/transactions/[id]/complete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

