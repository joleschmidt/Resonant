import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validations/profile';

export async function POST(req: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const json = await req.json().catch(() => ({}));
    const parsed = profileUpdateSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'invalid', issues: parsed.error.flatten() }, { status: 422 });
    }

    // Username changes are not handled here
    const { username: _omit, ...update } = parsed.data;

    const { error } = await supabase
        .from('profiles')
        .update(update as any)
        .eq('id', user.id);

    if (error) {
        return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}


