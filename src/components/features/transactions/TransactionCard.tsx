/**
 * TransactionCard
 * Displays a transaction with listing details and status
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, CheckCircle2, Clock, Euro, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { TransactionStatus } from '@/types/database';

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
    status: TransactionStatus;
    created_at: string;
    completed_at: string | null;
    listing: Listing;
    buyer: User;
    seller: User;
}

interface TransactionCardProps {
    transaction: TransactionWithDetails;
    currentUserId: string;
    onComplete?: (transactionId: string) => void;
}

export function TransactionCard({ transaction, currentUserId, onComplete }: TransactionCardProps) {
    const isBuyer = transaction.buyer_id === currentUserId;
    const otherParty = isBuyer ? transaction.seller : transaction.buyer;
    const role = isBuyer ? 'Käufer' : 'Verkäufer';
    const canComplete = !isBuyer && transaction.status === 'pending';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const listingImage = transaction.listing.images?.[0] || null;

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Listing Image */}
                    <Link href={`/listings/${transaction.listing_id}`} className="flex-shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                            {listingImage ? (
                                <Image
                                    src={listingImage}
                                    alt={transaction.listing.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Transaction Details */}
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <Link
                                    href={`/listings/${transaction.listing_id}`}
                                    className="font-semibold hover:underline"
                                >
                                    {transaction.listing.title}
                                </Link>
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Mit {otherParty.username}</span>
                                    <span>•</span>
                                    <span>{formatDate(transaction.created_at)}</span>
                                </div>
                            </div>
                            <Badge
                                variant={
                                    transaction.status === 'completed'
                                        ? 'default'
                                        : 'secondary'
                                }
                                className="flex items-center gap-1"
                            >
                                {transaction.status === 'completed' ? (
                                    <>
                                        <CheckCircle2 className="h-3 w-3" />
                                        Abgeschlossen
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-3 w-3" />
                                        Ausstehend
                                    </>
                                )}
                            </Badge>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-lg font-bold">
                                <Euro className="h-4 w-4" />
                                {transaction.amount.toLocaleString('de-DE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>
                            <div className="flex gap-2">
                                {canComplete && (
                                    <Button
                                        size="sm"
                                        onClick={() => onComplete?.(transaction.id)}
                                    >
                                        Abschließen
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/listings/${transaction.listing_id}`}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Completed Date */}
                        {transaction.completed_at && (
                            <div className="text-xs text-muted-foreground">
                                Abgeschlossen am {formatDate(transaction.completed_at)}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


