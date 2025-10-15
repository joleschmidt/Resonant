/**
 * User Menu Component
 * Dropdown menu for authenticated users
 */

'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Heart, Package } from 'lucide-react';

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const reset = useAuthStore((s) => s.reset);
  const router = useRouter();

  // Fallbacks wenn Profil (noch) nicht geladen ist
  const displayName = profile?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || (user as any)?.user_metadata?.avatar_url || undefined;
  const initials = (profile?.username || user?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 rounded-full">
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <p className="block">{displayName}</p>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 pt-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/listings/create" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Anzeige erstellen</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/listings/my-listings" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Meine Anzeigen</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/favorites" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Favoriten</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Einstellungen</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onClick={async () => {
            // optimistic UI update
            reset();
            // client signout to trigger listeners
            const supabase = createClient();
            await supabase.auth.signOut({ scope: 'global' });
            // clear server cookies and revoke refresh token on server
            try {
              await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
            } catch { }
            // navigate and ensure revalidation
            router.replace('/');
            router.refresh();
            // final safeguard in case of caching/state race
            setTimeout(() => {
              try { window.location.reload(); } catch { }
            }, 50);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

