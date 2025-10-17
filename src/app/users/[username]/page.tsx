import { notFound } from 'next/navigation';
import { getUserByUsername } from '@/lib/supabase/server';
import { UserProfileHeader } from '@/components/features/profile/UserProfileHeader';
import { UserStatsStrip } from '@/components/features/profile/UserStatsStrip';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const { user, error } = await getUserByUsername(username);
    if (error || !user) return notFound();

    // Fetch user's active listings (public via RLS)
    const supabase = await createClient();
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="space-y-0">
                    <UserProfileHeader user={user as any} isSelf={false} />
                    <UserStatsStrip
                        userId={user.id}
                        username={user.username}
                        rating={user.seller_rating}
                        sales={user.total_sales}
                        purchases={user.total_purchases}
                    />
                </div>
                {Array.isArray(listings) && listings.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Anzeigen von {user.username}</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {listings.map((l: any) => (
                                <ListingCard key={l.id} listing={l} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


