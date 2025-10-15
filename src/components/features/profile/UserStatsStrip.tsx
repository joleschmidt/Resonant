/**
 * UserStatsStrip
 * Horizontal KPIs for profile
 */

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, PackageCheck, ShoppingBag, Users } from 'lucide-react';

type Stats = {
    rating?: number | null;
    sales?: number | null;
    purchases?: number | null;
    followers?: number | null;
    following?: number | null;
};

export function UserStatsStrip({ rating = 0, sales = 0, purchases = 0, followers = 0, following = 0 }: Stats) {
    const items = [
        { icon: Star, label: 'Bewertung', value: (rating || 0).toFixed(1) },
        { icon: PackageCheck, label: 'Verkäufe', value: sales || 0 },
        { icon: ShoppingBag, label: 'Käufe', value: purchases || 0 },
        { icon: Users, label: 'Follower', value: followers || 0 },
        { icon: Users, label: 'Folgt', value: following || 0 },
    ];

    return (
        <Card className="flex divide-x overflow-hidden">
            {items.map((it, idx) => (
                <div key={it.label} className="flex flex-1 items-center gap-3 p-4">
                    <it.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <div className="text-xl font-semibold leading-none">{it.value}</div>
                        <div className="text-xs text-muted-foreground">{it.label}</div>
                    </div>
                    {idx < items.length - 1 && <Separator className="ml-auto h-8" orientation="vertical" />}
                </div>
            ))}
        </Card>
    );
}


