'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/auth/useUser';
import { MessageCircle, Send } from 'lucide-react';

interface MessageModalProps {
    recipientId: string;
    recipientUsername: string;
    listingId?: string;
    listingTitle?: string;
    trigger?: React.ReactNode;
}

export function MessageModal({
    recipientId,
    recipientUsername,
    listingId,
    listingTitle,
    trigger,
}: MessageModalProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const { isAuthenticated } = useUser();

    const handleSend = async () => {
        if (!content.trim() || !isAuthenticated) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId,
                    listingId: listingId || undefined,
                    content: content.trim(),
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json?.error || 'Fehler beim Senden der Nachricht');
                return;
            }

            alert('Nachricht gesendet!');
            setContent('');
            setOpen(false);
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Fehler beim Senden der Nachricht');
        } finally {
            setSending(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Button
                onClick={() => alert('Bitte melde dich an, um Nachrichten zu senden')}
                className="flex-1"
            >
                <MessageCircle className="w-4 h-4 mr-2" />
                Nachricht senden
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Nachricht senden
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nachricht an {recipientUsername}</DialogTitle>
                    <DialogDescription>
                        {listingTitle 
                            ? `Sende eine Nachricht bezüglich "${listingTitle}"`
                            : 'Sende eine Nachricht an diesen Nutzer'
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {listingTitle && (
                        <div className="text-sm text-muted-foreground">
                            Bezüglich: <span className="font-medium">{listingTitle}</span>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="message-content">Nachricht</Label>
                        <textarea
                            id="message-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    if (content.trim() && !sending) {
                                        handleSend();
                                    }
                                }
                            }}
                            placeholder="Schreibe deine Nachricht..."
                            className="w-full mt-1 p-3 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            maxLength={2000}
                            autoFocus
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {content.length}/2000 Zeichen {content.trim().length > 0 && content.trim().length < 3 && (
                                <span className="text-amber-600">(Mindestens 3 Zeichen empfohlen)</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSend}
                            disabled={!content.trim() || sending}
                            className="flex-1"
                            type="button"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {sending ? 'Wird gesendet...' : 'Senden'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setContent('');
                                setOpen(false);
                            }} 
                            className="flex-1"
                            type="button"
                        >
                            Abbrechen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

