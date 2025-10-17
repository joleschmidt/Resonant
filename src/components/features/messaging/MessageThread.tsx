'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useUser } from '@/hooks/auth/useUser';
import type { Message } from '@/types';

interface MessageThreadProps {
    conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { userId } = useUser();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setMessages(json.data || []);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!content.trim()) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: content.trim(),
                }),
            });

            if (!res.ok) throw new Error('Failed to send');

            const json = await res.json();
            setMessages((prev) => [...prev, json.data]);
            setContent('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Fehler beim Senden der Nachricht');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg: any) => {
                    const isOwn = msg.sender_id === userId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <Avatar className="w-8 h-8 shrink-0">
                                <AvatarImage src={msg.profiles?.avatar_url} />
                                <AvatarFallback>
                                    {msg.profiles?.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Card className={`max-w-[70%] ${isOwn ? 'bg-primary text-primary-foreground' : ''}`}>
                                <CardContent className="p-3">
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Nachricht schreiben..."
                        className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        maxLength={2000}
                    />
                    <Button onClick={handleSend} disabled={!content.trim() || sending} size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

