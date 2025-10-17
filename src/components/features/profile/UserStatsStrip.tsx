/**
 * UserStatsStrip
 * Horizontal KPIs for profile
 */

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
        { icon: Users, label: 'Follower', value: followers || 0 },
    ];

    return (
        <Card className="overflow-hidden rounded-b-xl rounded-t-none border-t-0">
            <div className="grid grid-cols-3">
                {items.map((it, idx) => (
                    <div
                        key={it.label}
                        className={cn(
                            'flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2.5',
                            idx >= 1 && 'border-t sm:border-t-0 sm:border-l'
                        )}
                    >
                        <it.icon className="h-3.5 w-3.5 text-muted-foreground sm:h-5 sm:w-5" />
                        <div className="text-center">
                            <div className="text-[13px] sm:text-base font-semibold leading-tight">{it.value}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">{it.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

