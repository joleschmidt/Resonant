import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ user: null, profile: null }, { status: 200 });
    }

    // Fetch profile from database
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ user, profile: null }, { status: 200 });
    }

    // Get follower/following counts
    const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

    const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

    // Enrich profile with follow stats
    const enrichedProfile = {
        ...profile,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
    };

    return NextResponse.json({ user, profile: enrichedProfile }, { status: 200 });
}


