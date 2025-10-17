'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Truck } from 'lucide-react';
import { useUser } from '@/hooks/auth/useUser';

interface BuyNowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listing: {
        id: string;
        title: string;
        price: number;
        original_price?: number | null;
        location_city: string;
        shipping_available: boolean;
        pickup_available: boolean;
        shipping_methods?: string[];
    };
}

export function BuyNowModal({ open, onOpenChange, listing }: BuyNowModalProps) {
    const [processing, setProcessing] = useState(false);
    const { isAuthenticated } = useUser();

    const handleBuy = async () => {
        if (!isAuthenticated) {
            alert('Bitte melde dich an, um einen Kauf zu tätigen');
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch('/api/transactions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing.id,
                    amount: listing.price,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json?.error || 'Fehler beim Erstellen der Transaktion');
                return;
            }

            alert(
                'Transaktion erstellt! Der Verkäufer wurde benachrichtigt. Du wirst zur Zahlungsseite weitergeleitet.'
            );
            onOpenChange(false);
            // TODO: Redirect to transaction/payment page
            // router.push(`/transactions/${json.data.id}`);
        } catch (error) {
            console.error('Failed to create transaction:', error);
            alert('Fehler beim Erstellen der Transaktion');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sofort kaufen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-2">{listing.title}</p>
                        <p className="text-2xl font-bold text-green-600">
                            {listing.price.toLocaleString('de-DE')} €
                        </p>
                        {listing.original_price && (
                            <p className="text-sm text-muted-foreground line-through">
                                Ursprünglich: {listing.original_price.toLocaleString('de-DE')} €
                            </p>
                        )}
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Kaufoptionen:</h4>
                        <ul className="space-y-1 text-sm">
                            {listing.shipping_available && (
                                <li className="flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Versand möglich
                                </li>
                            )}
                            {listing.pickup_available && (
                                <li className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Abholung möglich in {listing.location_city}
                                </li>
                            )}
                            {Array.isArray(listing.shipping_methods) &&
                                listing.shipping_methods.length > 0 && (
                                    <li className="text-muted-foreground">
                                        Versandarten: {listing.shipping_methods.join(', ')}
                                    </li>
                                )}
                        </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
                        <p className="font-medium text-amber-900 mb-1">Wichtig:</p>
                        <p className="text-amber-800">
                            Nach dem Kauf erhältst du weitere Informationen zur Zahlung und zum Versand.
                            Die Transaktion ist verbindlich.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleBuy}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {processing ? 'Wird verarbeitet...' : 'Jetzt kaufen'}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Abbrechen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

