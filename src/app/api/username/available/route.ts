import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { RESERVED_USERNAMES } from '@/utils/constants';

const schema = z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_-]+$/)
    .transform((v) => v.toLowerCase());

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('u') ?? '';

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json({ available: false, reason: 'invalid' }, { status: 200 });
    }
    const username = parsed.data;
    if (RESERVED_USERNAMES.includes(username)) {
        return NextResponse.json({ available: false, reason: 'reserved' }, { status: 200 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .limit(1);

    if (error) {
        return NextResponse.json({ available: false, reason: 'error' }, { status: 500 });
    }

    const taken = (data?.length ?? 0) > 0;
    return NextResponse.json({ available: !taken }, { status: 200 });
}


