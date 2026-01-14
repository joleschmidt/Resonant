/**
 * Header Component
 * Main navigation with auth status
 */

'use client';

import Link from 'next/link';
import { AuthButton } from '@/components/features/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { UserMenu } from '@/components/features/auth/UserMenu';
import { Menu, MessageSquare, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Header: React.FC = () => {
  // Hooks at top
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

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

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  console.log('🟢 Header - user:', user?.id ? `LOGGED IN (${user.email})` : 'NOT LOGGED IN', 'loading:', isLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      {/* Top bar - Kleinanzeigen style */}
      <div className="border-b border-border/50 bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-2xl font-bold text-primary">RESONANT</span>
          </Link>

          {/* Search Bar - Prominent Kleinanzeigen style */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Gitarren, Amps, Effekten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 w-full"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
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
      </div>

    </header>
  );
};

Header.displayName = 'Header';

export { Header };

