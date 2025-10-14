/**
 * Header Component
 * Main navigation with auth status
 */

'use client';

import Link from 'next/link';
import { AuthButton } from '@/components/features/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6" />
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
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

