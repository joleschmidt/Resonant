/**
 * Server Actions for Authentication
 * Based on cursor-rules security patterns
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { LoginFormData, SignupFormData, PasswordResetRequestData } from '@/lib/validations/auth';

export async function signUp(data: SignupFormData) {
  const supabase = await createClient();

  // Check if username is already taken
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', data.username)
    .single();

  if (existingProfile) {
    return {
      error: 'Dieser Benutzername ist bereits vergeben',
    };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError) {
    return {
      error: authError.message,
    };
  }

  // Note: Profile is automatically created by handle_new_user trigger
  // The username will be set from the auth metadata
  // TODO: Update profile with custom username after email verification

  return {
    success: true,
    message: 'Registrierung erfolgreich! Bitte überprüfe deine E-Mail.',
  };
}

export async function signIn(data: LoginFormData) {
  const supabase = await createClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // Treat as success if a session exists regardless of error shape
  if (signInData?.session) {
    redirect('/profile');
  }

  if (error) {
    const message = (error.message || '').toLowerCase();
    if (message.includes('email not confirmed')) {
      return { error: 'Bitte bestätige zuerst deine E-Mail-Adresse. Überprüfe dein Postfach.' };
    }
    if (message.includes('invalid login credentials')) {
      return { error: 'E-Mail oder Passwort ist falsch' };
    }
    return { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' };
  }

  return { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function requestPasswordReset(data: PasswordResetRequestData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Passwort-Reset E-Mail wurde versendet. Bitte überprüfe dein Postfach.',
  };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Passwort wurde erfolgreich aktualisiert',
  };
}

export async function verifyEmail(token: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'E-Mail wurde erfolgreich verifiziert',
  };
}

