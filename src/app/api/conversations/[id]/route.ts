import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(
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

        const { id: conversationId } = await params;

        // Use admin client for DB operations to bypass RLS
        const adminClient = createAdminClient();

        // Verify user is part of this conversation
        const { data: participation, error: partError } = await adminClient
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .single();

        if (partError || !participation) {
            console.error('User not part of conversation:', partError);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get messages with sender info
        const { data: messages, error } = await adminClient
            .from('messages')
            .select(
                `
        id,
        conversation_id,
        sender_id,
        content,
        read,
        created_at,
        profiles:sender_id (
          id,
          username,
          avatar_url
        )
      `
            )
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Failed to fetch messages:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        // Mark messages as read
        await adminClient
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id)
            .eq('read', false);

        return NextResponse.json({ data: messages || [] });
    } catch (error) {
        console.error('GET /api/conversations/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}