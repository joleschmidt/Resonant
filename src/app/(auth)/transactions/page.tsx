/**
 * Transactions Page
 * Display user's transaction history with status filters
 */

'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionCard } from '@/components/features/transactions/TransactionCard';
import { Loader2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/auth/useUser';

interface Listing {
    id: string;
    title: string;
    price: number;
    images?: string[] | null;
    category?: string;
    status?: string;
}

interface User {
    id: string;
    username: string;
    avatar_url?: string | null;
    full_name?: string | null;
}

interface TransactionWithDetails {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    amount: number;
    status: 'pending' | 'completed';
    created_at: string;
    completed_at: string | null;
    listing: Listing;
    buyer: User;
    seller: User;
}

export default function TransactionsPage() {
    const { user } = useUser();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.id) return;

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (statusFilter !== 'all') {
                    params.append('status', statusFilter);
                }
                const res = await fetch(`/api/transactions?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch transactions');
                const json = await res.json();
                setTransactions(json.data || []);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [statusFilter, user?.id]);

    const handleComplete = async (transactionId: string) => {
        try {
            const res = await fetch(`/api/transactions/${transactionId}/complete`, {
                method: 'PATCH',
            });
            if (!res.ok) throw new Error('Failed to complete transaction');
            
            // Refresh transactions
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            const refreshRes = await fetch(`/api/transactions?${params.toString()}`);
            if (refreshRes.ok) {
                const json = await refreshRes.json();
                setTransactions(json.data || []);
            }
        } catch (error) {
            console.error('Failed to complete transaction:', error);
            alert('Fehler beim Abschließen der Transaktion');
        }
    };

    if (!user) {
        return (
            <div className="container py-8">
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Bitte melde dich an, um deine Transaktionen zu sehen.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Meine Transaktionen</h1>
                    <p className="mt-2 text-muted-foreground">
                        Verwalte deine Käufe und Verkäufe
                    </p>
                </div>

                {/* Status Filter */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList>
                        <TabsTrigger value="all">Alle</TabsTrigger>
                        <TabsTrigger value="pending">Ausstehend</TabsTrigger>
                        <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Transactions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <TransactionCard
                                key={transaction.id}
                                transaction={transaction}
                                currentUserId={user.id}
                                onComplete={handleComplete}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Keine Transaktionen gefunden
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                {statusFilter === 'all'
                                    ? 'Du hast noch keine Transaktionen.'
                                    : `Du hast keine ${statusFilter === 'pending' ? 'ausstehenden' : 'abgeschlossenen'} Transaktionen.`}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


