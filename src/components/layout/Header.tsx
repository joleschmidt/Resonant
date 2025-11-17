/**
 * Header Component
 * Main navigation with auth status
 */

'use client';

import Link from 'next/link';
import { AuthButton } from '@/components/features/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { UserMenu } from '@/components/features/auth/UserMenu';
import { Menu, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const pathname = usePathname();

  async function fetchUnread() {
    try {
      if (!user) {
        setUnreadCount(0);
        return;
      }
      const res = await fetch('/api/conversations/unread-count', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      setUnreadCount(json.data || 0);
    } catch (_) {
      // ignore
    }
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) await fetchUnread();
    })();

    // Poll occasionally for simplicity; can be replaced with realtime later
    const id = setInterval(fetchUnread, 30_000);

    const onFocus = () => fetchUnread();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    // Immediate reaction to conversation actions
    const onUnreadRefresh = () => fetchUnread();
    const onUnreadDecrement = (e: Event) => {
      const delta = (e as CustomEvent<number>).detail ?? 1;
      setUnreadCount((c) => Math.max(0, c - delta));
    };
    window.addEventListener('unread-refresh', onUnreadRefresh as EventListener);
    window.addEventListener('unread-decrement', onUnreadDecrement as EventListener);

    return () => {
      isMounted = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('unread-refresh', onUnreadRefresh as EventListener);
      window.removeEventListener('unread-decrement', onUnreadDecrement as EventListener);
    };
  }, [user?.id]);

  // Refetch whenever the route changes (e.g., opening a conversation marks as read)
  useEffect(() => {
    fetchUnread();
  }, [pathname]);

  console.log('🟢 Header - user:', user?.id ? `LOGGED IN (${user.email})` : 'NOT LOGGED IN', 'loading:', isLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RESONANT</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/listings">
              <Button variant="ghost" size="sm" className="font-medium">
                Anzeigen
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="font-medium">
                Über uns
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/listings/create">
                  <Button size="sm" className="font-medium">
                    Anzeige erstellen
                  </Button>
                </Link>
                <Link href="/messages" className="relative">
                  <Button variant="ghost" size="icon" aria-label="Nachrichten">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none w-5 h-5 shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <UserMenu />
              </div>
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Menü öffnen">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/listings">Anzeigen</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/about">Über uns</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/listings/create">Anzeige erstellen</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">Nachrichten{unreadCount > 0 ? ` (${Math.min(unreadCount, 9)}${unreadCount > 9 ? '+' : ''})` : ''}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/listings">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Anzeigen durchsuchen
                  </Button>
                </Link>
                <AuthButton />
              </div>
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Menü öffnen">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/listings">Anzeigen</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/about">Über uns</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login">Anmelden</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signup">Registrieren</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

