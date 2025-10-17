import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ data: [], count: 0 }, { status: 200 });
        }

        // Fetch listings the user has favorited
        const { data, error } = await supabase
            .from('favorites')
            .select('listing:listings(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Favorites list error:', error);
            return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
        }

        const listings = (data || []).map((row: any) => row.listing).filter(Boolean);

        return NextResponse.json({ data: listings, count: listings.length });
    } catch (e) {
        console.error('Favorites GET error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


