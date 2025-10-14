/**
 * Authentication Validation Schemas
 * Based on Supabase Auth and RESONANT requirements
 */

import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
    username: z
      .string()
      .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
      .max(30, 'Benutzername darf maximal 30 Zeichen lang sein')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Benutzername darf nur Buchstaben, Zahlen, _ und - enthalten'
      ),
    password: z
      .string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Du musst den AGB zustimmen',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
});

export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;

// Password Reset Schema
export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export type PasswordResetData = z.infer<typeof passwordResetSchema>;

// Update Password Schema (for logged-in users)
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort erforderlich'),
    newPassword: z
      .string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Neues Passwort muss sich vom aktuellen unterscheiden',
    path: ['newPassword'],
  });

export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

