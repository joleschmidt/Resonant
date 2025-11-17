import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

        // If not authenticated, return popular users with active listings
        if (!user) {
            // Get users with active listings, ordered by follower count
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    username,
                    display_name,
                    avatar_url,
                    verification_status,
                    account_type,
                    created_at
                `)
                .not('username', 'is', null)
                .limit(limit);

            if (error) {
                console.error('Database error:', error);
                return NextResponse.json({
                    error: 'Failed to fetch suggested users',
                    details: error.message
                }, { status: 500 });
            }

            // Enrich with stats
            const enriched = await Promise.all(
                (profiles || []).map(async (profile) => {
                    // Get follower count
                    const { count: followersCount } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profile.id);

                    // Get active listings count
                    const { count: listingsCount } = await supabase
                        .from('listings')
                        .select('*', { count: 'exact', head: true })
                        .eq('seller_id', profile.id)
                        .eq('status', 'active');

                    return {
                        ...profile,
                        display_name: profile.full_name, // Map full_name to display_name for component compatibility
                        followers_count: followersCount || 0,
                        listings_count: listingsCount || 0,
                    };
                })
            );

            // Sort by followers + listings count
            enriched.sort((a, b) => {
                const scoreA = (a.followers_count || 0) + (a.listings_count || 0) * 2;
                const scoreB = (b.followers_count || 0) + (b.listings_count || 0) * 2;
                return scoreB - scoreA;
            });

            return NextResponse.json({
                data: enriched.slice(0, limit)
            });
        }

        // For authenticated users, exclude already followed users
        // Get users that the current user is following
        const { data: following } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);

        const followingIds = following?.map(f => f.following_id) || [];
        followingIds.push(user.id); // Also exclude self

        // Get users with active listings, excluding already followed and self
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                full_name,
                avatar_url,
                verification_status,
                account_type,
                created_at
            `)
            .not('username', 'is', null)
            .limit(limit * 3); // Get more to filter and sort

        // Filter out already followed users and self in JavaScript
        const filteredProfiles = (profiles || []).filter(
            (profile) => !followingIds.includes(profile.id)
        );

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({
                error: 'Failed to fetch suggested users',
                details: error.message
            }, { status: 500 });
        }

        // Enrich with stats
        const enriched = await Promise.all(
            filteredProfiles.map(async (profile) => {
                // Get follower count
                const { count: followersCount } = await supabase
                    .from('followers')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', profile.id);

                // Get active listings count
                const { count: listingsCount } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('seller_id', profile.id)
                    .eq('status', 'active');

                return {
                    ...profile,
                    followers_count: followersCount || 0,
                    listings_count: listingsCount || 0,
                };
            })
        );

        // Sort by followers + listings count (popular sellers)
        enriched.sort((a, b) => {
            const scoreA = (a.followers_count || 0) + (a.listings_count || 0) * 2;
            const scoreB = (b.followers_count || 0) + (b.listings_count || 0) * 2;
            return scoreB - scoreA;
        });

        return NextResponse.json({
            data: enriched.slice(0, limit)
        });

    } catch (error) {
        console.error('Suggested users API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

