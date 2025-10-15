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
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  console.log('🟢 Header - user:', user?.id ? `LOGGED IN (${user.email})` : 'NOT LOGGED IN', 'loading:', isLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">RESONANT</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/listings">
              <Button variant="ghost" size="sm">
                Anzeigen
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                Über uns
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/listings/create">
                  <Button size="sm">
                    Anzeige erstellen
                  </Button>
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
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profil</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex">
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

