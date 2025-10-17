'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/favorites', { cache: 'no-store' });
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error || 'Fehler beim Laden');
                setListings(json.data || []);
            } catch (e: any) {
                setError(e?.message || 'Unbekannter Fehler');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 bg-muted rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => router.refresh()}>Erneut versuchen</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Favoriten</h1>
            </div>
            {listings.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    Du hast noch keine Anzeigen gemerkt.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((l) => (
                        <ListingCard key={l.id} listing={l} />
                    ))}
                </div>
            )}
        </div>
    );
}


