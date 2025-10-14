/**
 * Auth Button Component
 * Header CTA for authentication
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/hooks/auth/useUser';
import { UserMenu } from './UserMenu';

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, isLoading } = useUser();

  // Während Loading lieber sofort die Standard-Buttons zeigen,
  // statt eines grauen Platzhalters (bessere UX und vermeidet Hänger)
  // While loading, show login/register so there is always an action available
  // The modal will work regardless of auth init timing
  if (isLoading) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="flex items-center gap-2">
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => {
                setDefaultTab('login');
                setIsModalOpen(true);
              }}
            >
              Anmelden
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setDefaultTab('signup');
                setIsModalOpen(true);
              }}
            >
              Registrieren
            </Button>
          </DialogTrigger>
        </div>

        <AuthModal open={isModalOpen} onOpenChange={setIsModalOpen} defaultTab={defaultTab} />
      </Dialog>
    );
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <div className="flex items-center gap-2">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            onClick={() => {
              setDefaultTab('login');
              setIsModalOpen(true);
            }}
          >
            Anmelden
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setDefaultTab('signup');
              setIsModalOpen(true);
            }}
          >
            Registrieren
          </Button>
        </DialogTrigger>
      </div>

      <AuthModal open={isModalOpen} onOpenChange={setIsModalOpen} defaultTab={defaultTab} />
    </Dialog>
  );
}

