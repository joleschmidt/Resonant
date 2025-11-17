/**
 * My Listings Page
 * Display user's own listings with status filters
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { Loader2, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ListingWithDetails } from '@/types/listings';
import { useUser } from '@/hooks/auth/useUser';

export default function MyListingsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [listings, setListings] = useState<ListingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('seller_id', user.id);
                if (statusFilter !== 'all') {
                    params.append('status', statusFilter);
                }
                const res = await fetch(`/api/listings/my-listings?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch listings');
                const json = await res.json();
                setListings(json.data || []);
            } catch (error) {
                console.error('Failed to fetch my listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [statusFilter, user?.id]);

    if (!user) {
        return (
            <div className="container py-8">
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Bitte melde dich an, um deine Anzeigen zu sehen.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Meine Anzeigen</h1>
                        <p className="mt-2 text-muted-foreground">
                            Verwalte deine Anzeigen und ihren Status
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/listings/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Neue Anzeige
                        </Link>
                    </Button>
                </div>

                {/* Status Filter */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList>
                        <TabsTrigger value="all">Alle</TabsTrigger>
                        <TabsTrigger value="active">Aktiv</TabsTrigger>
                        <TabsTrigger value="sold">Verkauft</TabsTrigger>
                        <TabsTrigger value="draft">Entwürfe</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                viewMode="grid"
                                showSeller={false}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">
                                {statusFilter === 'all'
                                    ? 'Keine Anzeigen gefunden'
                                    : `Keine ${statusFilter === 'active' ? 'aktiven' : statusFilter === 'sold' ? 'verkauften' : 'Entwürfe'} Anzeigen`}
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                {statusFilter === 'all' || statusFilter === 'active'
                                    ? 'Erstelle deine erste Anzeige, um zu beginnen.'
                                    : 'Du hast noch keine Anzeigen in dieser Kategorie.'}
                            </p>
                            {(statusFilter === 'all' || statusFilter === 'active') && (
                                <Button asChild className="mt-4">
                                    <Link href="/listings/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Neue Anzeige erstellen
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

