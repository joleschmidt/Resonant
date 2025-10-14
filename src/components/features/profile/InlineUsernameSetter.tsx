'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type AvailabilityState =
    | { state: 'idle' }
    | { state: 'validating' }
    | { state: 'available' }
    | { state: 'taken' }
    | { state: 'invalid' }
    | { state: 'reserved' };

const usernamePattern = /^[a-z0-9_-]{3,20}$/;

export function InlineUsernameSetter() {
    const [username, setUsername] = useState('');
    const [availability, setAvailability] = useState<AvailabilityState>({ state: 'idle' });
    const [submitting, setSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<null | 'success' | 'error'>(null);
    const [submitMessage, setSubmitMessage] = useState<string>('');

    useEffect(() => {
        if (username.length === 0) {
            setAvailability({ state: 'idle' });
            return;
        }
        const lowered = username.toLowerCase();
        if (!usernamePattern.test(lowered)) {
            setAvailability({ state: 'invalid' });
            return;
        }
        setAvailability({ state: 'validating' });
        const t = setTimeout(async () => {
            try {
                const r = await fetch(`/api/username/available?u=${encodeURIComponent(lowered)}`);
                const j = await r.json();
                if (j.available) setAvailability({ state: 'available' });
                else if (j.reason === 'reserved') setAvailability({ state: 'reserved' });
                else setAvailability({ state: 'taken' });
            } catch {
                setAvailability({ state: 'taken' });
            }
        }, 300);
        return () => clearTimeout(t);
    }, [username]);

    const canSubmit = useMemo(() => availability.state === 'available' && !submitting, [availability, submitting]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setSubmitState(null);
        setSubmitMessage('');
        try {
            const r = await fetch('/api/profile/username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.toLowerCase() }),
            });
            if (r.ok) {
                setSubmitState('success');
                setSubmitMessage('Benutzername gespeichert. Seite lädt neu …');
                // Give a short moment to show feedback, then reload to reflect finalized profile state
                setTimeout(() => window.location.reload(), 600);
            } else {
                const j = await r.json().catch(() => ({} as any));
                if (r.status === 409 || j?.error === 'username_taken') {
                    setAvailability({ state: 'taken' });
                    setSubmitState('error');
                    setSubmitMessage('Dieser Benutzername ist bereits vergeben.');
                } else if (r.status === 422) {
                    setAvailability({ state: 'invalid' });
                    setSubmitState('error');
                    setSubmitMessage('Ungültiger Benutzername.');
                } else if (r.status === 400 && j?.error === 'username_immutable') {
                    setSubmitState('error');
                    setSubmitMessage('Benutzername kann nicht mehr geändert werden.');
                } else if (r.status === 401) {
                    setSubmitState('error');
                    setSubmitMessage('Bitte neu anmelden.');
                } else {
                    setSubmitState('error');
                    setSubmitMessage('Speichern fehlgeschlagen. Bitte versuche es erneut.');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Label htmlFor="username">Benutzername</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="username"
                    name="username"
                    placeholder="z. B. strat_player"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                />
                {availability.state === 'validating' && <Loader2 className="h-5 w-5 animate-spin" />}
                {availability.state === 'available' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {(availability.state === 'taken' || availability.state === 'invalid' || availability.state === 'reserved') && (
                    <XCircle className="h-5 w-5 text-red-600" />
                )}
            </div>
            <p className="text-sm text-muted-foreground">
                Nur Kleinbuchstaben, Zahlen, _ und -; 3–20 Zeichen. Einmal festgelegt, nicht änderbar.
            </p>
            {availability.state === 'taken' && (
                <p className="text-sm text-red-600">Dieser Benutzername ist bereits vergeben.</p>
            )}
            {availability.state === 'invalid' && (
                <p className="text-sm text-red-600">Ungültiges Format.</p>
            )}
            {availability.state === 'reserved' && (
                <p className="text-sm text-red-600">Dieser Name ist reserviert.</p>
            )}
            {submitMessage && (
                <p className={
                    submitState === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'
                } aria-live="polite">{submitMessage}</p>
            )}
            <div>
                <Button type="submit" disabled={!canSubmit}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {submitState === 'success' ? 'Gespeichert' : 'Speichern'}
                </Button>
            </div>
        </form>
    );
}


