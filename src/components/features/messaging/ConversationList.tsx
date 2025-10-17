'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Conversation } from '@/types';

export function ConversationList() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/conversations');
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setConversations(json.data || []);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-1/3" />
                                    <div className="h-3 bg-muted rounded w-2/3" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Keine Nachrichten</h3>
                    <p className="text-muted-foreground">
                        Deine Unterhaltungen werden hier angezeigt
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {conversations.map((conv: any) => {
                const otherUser = conv.participants?.[0];
                const lastMsg = conv.last_message;

                return (
                    <Link key={conv.id} href={`/messages/${conv.id}`}>
                        <Card className="hover:border-primary transition-colors cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={otherUser?.avatar_url} />
                                        <AvatarFallback>
                                            {otherUser?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{otherUser?.username}</h3>
                                            {conv.unread_count > 0 && (
                                                <Badge variant="default" className="shrink-0">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        {conv.listing && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Re: {conv.listing.title}
                                            </p>
                                        )}
                                        {lastMsg && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                {lastMsg.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}

