import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { RESERVED_USERNAMES } from '@/utils/constants';

const usernameSchema = z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_-]+$/)
    .transform((v) => v.toLowerCase())
    .refine((v) => !RESERVED_USERNAMES.includes(v), 'reserved');

export async function POST(req: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = usernameSchema.safeParse(body?.username);
    if (!parsed.success) {
        return NextResponse.json({ error: 'invalid_username' }, { status: 422 });
    }
    const username = parsed.data;

    // Check immutability: if finalized, block
    const { data: existing, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, username, username_finalized')
        .eq('id', user.id)
        .single();
    if (fetchErr) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    if (existing?.username_finalized) {
        return NextResponse.json({ error: 'username_immutable' }, { status: 400 });
    }

    // Try to update username
    const { error: updateErr } = await supabase
        .from('profiles')
        .update({ username, username_finalized: true })
        .eq('id', user.id);

    if (updateErr) {
        // unique constraint violation => 409
        const msg = String(updateErr.message || '').toLowerCase();
        if (msg.includes('duplicate') || msg.includes('unique')) {
            return NextResponse.json({ error: 'username_taken' }, { status: 409 });
        }
        return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}


