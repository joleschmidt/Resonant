/**
 * User Stats Component
 * Display user statistics (sales, ratings, etc.)
 */

import { Star, Package, ShoppingBag } from 'lucide-react';
import type { Profile } from '@/types';

interface UserStatsProps {
  profile: Profile;
}

export function UserStats({ profile }: UserStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center rounded-lg border p-4">
        <Star className="mb-2 h-5 w-5 text-yellow-500" />
        <span className="text-2xl font-bold">{profile.seller_rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">Bewertung</span>
      </div>

      <div className="flex flex-col items-center rounded-lg border p-4">
        <Package className="mb-2 h-5 w-5 text-primary" />
        <span className="text-2xl font-bold">{profile.total_sales}</span>
        <span className="text-xs text-muted-foreground">Verkäufe</span>
      </div>

      <div className="flex flex-col items-center rounded-lg border p-4">
        <ShoppingBag className="mb-2 h-5 w-5 text-primary" />
        <span className="text-2xl font-bold">{profile.total_purchases}</span>
        <span className="text-xs text-muted-foreground">Käufe</span>
      </div>
    </div>
  );
}

