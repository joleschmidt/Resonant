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

        // Use admin client to bypass RLS
        const adminClient = createAdminClient();

        // Get all conversations where the user is a participant
        const { data: userParticipations, error: partError } = await adminClient
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (partError) {
            console.error('Error fetching participations:', partError);
            return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
        }

        if (!userParticipations || userParticipations.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Get the conversation IDs where the user is a participant
        const conversationIds = userParticipations.map(p => p.conversation_id);

        // Get all the conversations with their listing info
        const { data: conversations, error: convError } = await adminClient
            .from('conversations')
            .select(`
                id, 
                listing_id,
                created_at,
                updated_at,
                listings (
                    id,
                    title,
                    images
                )
            `)
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (convError) {
            console.error('Error fetching conversations:', convError);
            return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
        }

        if (!conversations || conversations.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Get last message and participants for each conversation
        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conv) => {
                // Get last message using admin client
                const { data: lastMessage } = await adminClient
                    .from('messages')
                    .select('id, content, sender_id, created_at, read')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Get other participants (not current user)
                const { data: otherParticipants } = await adminClient
                    .from('conversation_participants')
                    .select(`
                        user_id,
                        profiles (
                            id,
                            username,
                            avatar_url
                        )
                    `)
                    .eq('conversation_id', conv.id)
                    .neq('user_id', user.id);

                // Count unread messages
                const { count: unreadCount } = await adminClient
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('read', false)
                    .neq('sender_id', user.id);

                return {
                    id: conv.id,
                    listing_id: conv.listing_id,
                    listing: conv.listings,
                    created_at: conv.created_at,
                    updated_at: conv.updated_at,
                    last_message: lastMessage,
                    participants: otherParticipants?.map((p) => p.profiles).filter(Boolean) || [],
                    unread_count: unreadCount || 0,
                };
            })
        );

        const validConversations = conversationsWithDetails.filter(Boolean);

        return NextResponse.json({ data: validConversations });
    } catch (error) {
        console.error('GET /api/conversations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}