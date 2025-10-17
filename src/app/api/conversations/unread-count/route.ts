import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // Find all conversations the user participates in
        const { data: participations, error: partError } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (partError) {
            console.error('unread-count: participations error', partError);
            return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
        }

        if (!participations || participations.length === 0) {
            return NextResponse.json({ data: 0 });
        }

        const conversationIds = participations.map((p) => p.conversation_id);

        // Count unread messages not sent by the current user
        const { count, error: countError } = await admin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .eq('read', false)
            .neq('sender_id', user.id);

        if (countError) {
            console.error('unread-count: count error', countError);
            return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
        }

        return NextResponse.json({ data: count || 0 });
    } catch (error) {
        console.error('GET /api/conversations/unread-count error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
