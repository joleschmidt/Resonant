/**
 * Auth Button Component
 * Header CTA for authentication
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { useUser } from '@/hooks/auth/useUser';
import { UserMenu } from './UserMenu';

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />;
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setDefaultTab('login');
            setIsModalOpen(true);
          }}
        >
          Anmelden
        </Button>
        <Button
          onClick={() => {
            setDefaultTab('signup');
            setIsModalOpen(true);
          }}
        >
          Registrieren
        </Button>
      </div>

      <AuthModal open={isModalOpen} onOpenChange={setIsModalOpen} defaultTab={defaultTab} />
    </>
  );
}

