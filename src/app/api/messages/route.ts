import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendMessageSchema } from '@/lib/validations/messaging';
import { sanitizeText } from '@/lib/security/sanitize';
import { checkRateLimit, authenticatedRatelimit, getRateLimitIdentifier } from '@/lib/ratelimit';
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

        // Rate limiting
        const identifier = getRateLimitIdentifier(request, user.id);
        const rateLimitResult = await checkRateLimit(authenticatedRatelimit, identifier, 200, 60000);
        
        if (!rateLimitResult.success) {
            await logRateLimitExceeded(request, user.id, '/api/messages');
            return NextResponse.json(
                { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = sendMessageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed. Please check your input.' },
                { status: 400 }
            );
        }

        const { conversationId, recipientId, listingId, content: rawContent } = validation.data;
        
        // Sanitize message content
        const content = sanitizeText(rawContent);

        let finalConversationId = conversationId;

        // Use regular client for read operations
        // Validate listingId if provided
        if (listingId) {
            const { data: existingListing, error: listingCheckError } = await supabase
                .from('listings')
                .select('id')
                .eq('id', listingId)
                .eq('status', 'active') // Only allow active listings
                .single();

            if (listingCheckError || !existingListing) {
                console.error('Invalid or inactive listingId provided:', listingCheckError);
                return NextResponse.json(
                    { error: 'Invalid or inactive listing provided' },
                    { status: 400 }
                );
            }
        }

        // If no conversationId, create a new conversation
        if (!finalConversationId) {
            if (!recipientId) {
                return NextResponse.json(
                    { error: 'Either conversationId or recipientId must be provided' },
                    { status: 400 }
                );
            }

            // Verify recipient exists
            const { data: recipientProfile, error: recipientError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', recipientId)
                .single();

            if (recipientError || !recipientProfile) {
                console.error('Recipient not found:', recipientError);
                return NextResponse.json(
                    { error: 'Recipient user not found' },
                    { status: 400 }
                );
            }

            // Check if conversation already exists between these users for this listing
            const { data: existingConversation } = await supabase
                .from('conversations')
                .select('id')
                .eq('listing_id', listingId || null)
                .filter(
                    'id',
                    'in',
                    supabase
                        .from('conversation_participants')
                        .select('conversation_id')
                        .eq('user_id', user.id)
                        .filter(
                            'conversation_id',
                            'in',
                            supabase
                                .from('conversation_participants')
                                .select('conversation_id')
                                .eq('user_id', recipientId)
                        )
                )
                .maybeSingle();

            if (existingConversation) {
                finalConversationId = existingConversation.id;
            } else {
                // Create new conversation using admin client to bypass RLS
                try {
                    // We need to use the admin client to bypass RLS
                    const adminClient = createAdminClient();

                    console.log('Attempting to create new conversation for listing:', listingId || 'no listing');
                    const { data: newConversation, error: convError } = await adminClient
                        .from('conversations')
                        .insert({ listing_id: listingId || null })
                        .select()
                        .single();

                    if (convError || !newConversation) {
                        console.error('Failed to create conversation (DB error):', convError);
                        return NextResponse.json(
                            { error: 'Failed to create conversation' },
                            { status: 500 }
                        );
                    }

                    finalConversationId = newConversation.id;

                    // Add both participants using admin client
                    console.log('Attempting to add participants for conversation:', finalConversationId, 'users:', user.id, recipientId);
                    const { error: participantsError } = await adminClient
                        .from('conversation_participants')
                        .insert([
                            { conversation_id: finalConversationId, user_id: user.id },
                            { conversation_id: finalConversationId, user_id: recipientId },
                        ]);

                    if (participantsError) {
                        console.error('Failed to add participants (DB error):', participantsError);
                        return NextResponse.json(
                            { error: 'Failed to add participants' },
                            { status: 500 }
                        );
                    }
                } catch (error) {
                    console.error('Error with admin client operations:', error);
                    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
                }
            }
        }

        // Insert message using admin client to bypass RLS
        const adminClient = createAdminClient();
        const { data: message, error: messageError } = await adminClient
            .from('messages')
            .insert({
                conversation_id: finalConversationId,
                sender_id: user.id,
                content,
            })
            .select()
            .single();

        if (messageError || !message) {
            console.error('Failed to send message:', messageError);
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
        }

        return NextResponse.json({ data: message }, { status: 201 });
    } catch (error) {
        console.error('POST /api/messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}