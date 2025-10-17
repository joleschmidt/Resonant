'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
                            placeholder="Schreibe deine Nachricht..."
                            className="w-full mt-1 p-3 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                            maxLength={2000}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {content.length}/2000 Zeichen
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSend}
                            disabled={!content.trim() || sending}
                            className="flex-1"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {sending ? 'Wird gesendet...' : 'Senden'}
                        </Button>
                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                            Abbrechen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

