import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await params;

        // Get target user's ID
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (!targetProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (targetProfile.id === user.id) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Idempotent insert
        const { error: insertError } = await supabase
            .from('followers')
            .upsert(
                { follower_id: user.id, following_id: targetProfile.id },
                { onConflict: 'follower_id,following_id' }
            );

        if (insertError) {
            console.error('Follow error:', insertError);
            return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
        }

        // Get updated counts
        const { count: followersCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', targetProfile.id);

        const { count: followingCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id);

        return NextResponse.json({
            is_following: true,
            followers_count: followersCount || 0,
            following_count: followingCount || 0,
        });
    } catch (error) {
        console.error('POST /api/profile/[username]/follow error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await params;

        // Get target user's ID
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (!targetProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { error: deleteError } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetProfile.id);

        if (deleteError) {
            console.error('Unfollow error:', deleteError);
            return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
        }

        // Get updated counts
        const { count: followersCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', targetProfile.id);

        const { count: followingCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id);

        return NextResponse.json({
            is_following: false,
            followers_count: followersCount || 0,
            following_count: followingCount || 0,
        });
    } catch (error) {
        console.error('DELETE /api/profile/[username]/follow error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { username } = await params;

        // Get target user's ID
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (!targetProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let isFollowing = false;
        if (user) {
            const { data: followRecord } = await supabase
                .from('followers')
                .select('follower_id')
                .eq('follower_id', user.id)
                .eq('following_id', targetProfile.id)
                .maybeSingle();

            isFollowing = !!followRecord;
        }

        // Get counts
        const { count: followersCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', targetProfile.id);

        const { count: followingCount } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', targetProfile.id);

        return NextResponse.json({
            is_following: isFollowing,
            followers_count: followersCount || 0,
            following_count: followingCount || 0,
        });
    } catch (error) {
        console.error('GET /api/profile/[username]/follow error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

