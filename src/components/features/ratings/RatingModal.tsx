'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface RatingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string;
    ratedUserId: string;
    ratedUsername: string;
    onSuccess?: () => void;
}

export function RatingModal({
    open,
    onOpenChange,
    transactionId,
    ratedUserId,
    ratedUsername,
    onSuccess,
}: RatingModalProps) {
    const [score, setScore] = useState(0);
    const [hoveredScore, setHoveredScore] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (score === 0) {
            alert('Bitte wähle eine Bewertung');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId,
                    ratedUserId,
                    score,
                    comment: comment.trim() || undefined,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json?.error || 'Fehler beim Erstellen der Bewertung');
                return;
            }

            alert('Bewertung erfolgreich abgegeben!');
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to submit rating:', error);
            alert('Fehler beim Erstellen der Bewertung');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bewerte {ratedUsername}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Bewertung</Label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setScore(value)}
                                    onMouseEnter={() => setHoveredScore(value)}
                                    onMouseLeave={() => setHoveredScore(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${value <= (hoveredScore || score)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {score > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                {score === 1 && 'Sehr schlecht'}
                                {score === 2 && 'Schlecht'}
                                {score === 3 && 'Okay'}
                                {score === 4 && 'Gut'}
                                {score === 5 && 'Ausgezeichnet'}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="rating-comment">Kommentar (optional)</Label>
                        <textarea
                            id="rating-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Teile deine Erfahrung..."
                            className="w-full mt-1 p-3 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                            maxLength={500}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {comment.length}/500 Zeichen
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={score === 0 || submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Wird gesendet...' : 'Bewertung abgeben'}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Abbrechen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

