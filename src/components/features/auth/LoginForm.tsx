/**
 * Login Form Component
 * Email/Password authentication
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSendMagicLink = async () => {
    if (!magicLinkEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden des Magic Links');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse. Überprüfe dein Postfach.');
          return;
        }
        if (msg.includes('invalid login credentials')) {
          setError('E-Mail oder Passwort ist falsch');
          return;
        }
        setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        return;
      }

      // Success: navigate immediately without reload
      onSuccess?.();
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Anmelden</h2>
        <p className="text-sm text-muted-foreground">
          Melde dich bei deinem RESONANT Konto an
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {magicLinkSent ? (
        <div className="space-y-4">
          <div className="rounded-md bg-green-500/15 p-4 text-sm text-green-600 dark:text-green-400">
            <p className="font-semibold mb-1">Magic Link wurde gesendet!</p>
            <p>Überprüfe dein Postfach ({magicLinkEmail}) und klicke auf den Link zum Anmelden.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setMagicLinkSent(false);
              setMagicLinkEmail('');
            }}
          >
            Andere E-Mail verwenden
          </Button>
        </div>
      ) : usePasswordLogin ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Anmelden
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Gib deine E-Mail-Adresse ein. Wir senden dir einen Magic Link zum Anmelden.
            </p>
          </div>
          <Input
            type="email"
            placeholder="deine@email.de"
            value={magicLinkEmail}
            onChange={(e) => setMagicLinkEmail(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && magicLinkEmail && !isLoading) {
                e.preventDefault();
                handleSendMagicLink();
              }
            }}
          />
          <Button
            type="button"
            className="w-full"
            disabled={isLoading || !magicLinkEmail}
            onClick={handleSendMagicLink}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Magic Link senden
          </Button>
        </div>
      )}

      {showPasswordReset ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Passwort zurücksetzen</h3>
            <p className="text-sm text-muted-foreground">
              Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.
            </p>
          </div>
          {resetSent ? (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              E-Mail wurde gesendet! Bitte überprüfe dein Postfach.
            </div>
          ) : (
            <>
              <Input
                type="email"
                placeholder="deine@email.de"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetEmail('');
                    setResetSent(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={resetLoading || !resetEmail}
                  onClick={async () => {
                    if (!resetEmail) return;
                    setResetLoading(true);
                    try {
                      const supabase = createClient();
                      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                        redirectTo: `${window.location.origin}/auth/reset-password`,
                      });
                      if (error) throw error;
                      setResetSent(true);
                    } catch (err: any) {
                      setError(err.message || 'Fehler beim Senden der E-Mail');
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                >
                  {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Senden
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-center text-sm">
          {usePasswordLogin && (
            <div>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setShowPasswordReset(true)}
              >
                Passwort vergessen?
              </button>
            </div>
          )}
          <div>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setUsePasswordLogin(!usePasswordLogin);
                setError(null);
              }}
            >
              {usePasswordLogin ? 'Mit Magic Link anmelden' : 'Mit Passwort anmelden'}
            </button>
          </div>

          {onSwitchToSignup && (
            <div>
              <span className="text-muted-foreground">Noch kein Konto? </span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={onSwitchToSignup}
              >
                Jetzt registrieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

