/**
 * Profile Validation Schemas
 * Based on json-schemas/user-profile specifications
 */

import { z } from 'zod';
import { GUITAR_TYPES } from '@/utils/constants';

// Profile Update Schema
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
    .max(30, 'Benutzername darf maximal 30 Zeichen lang sein')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Benutzername darf nur Buchstaben, Zahlen, _ und - enthalten'
    )
    .optional(),
  full_name: z
    .string()
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .nullable()
    .optional(),
  bio: z.string().max(500, 'Bio darf maximal 500 Zeichen lang sein').nullable().optional(),
  location: z
    .string()
    .max(100, 'Standort darf maximal 100 Zeichen lang sein')
    .nullable()
    .optional(),
  avatar_url: z.string().url('Ungültige URL').nullable().optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// User Preferences Schema
export const userPreferencesSchema = z.object({
  preferred_brands: z.array(z.string()).optional(),
  preferred_types: z
    .array(
      z.enum([
        GUITAR_TYPES.ELECTRIC,
        GUITAR_TYPES.ACOUSTIC,
        GUITAR_TYPES.CLASSICAL,
        GUITAR_TYPES.BASS,
      ])
    )
    .optional(),
  price_range: z
    .object({
      min: z.number().min(0, 'Mindestpreis muss >= 0 sein'),
      max: z.number().min(0, 'Höchstpreis muss >= 0 sein'),
    })
    .refine((data) => data.min <= data.max, {
      message: 'Mindestpreis muss kleiner oder gleich Höchstpreis sein',
    })
    .optional(),
  search_radius: z
    .number()
    .min(1, 'Suchradius muss mindestens 1 km sein')
    .max(500, 'Suchradius darf maximal 500 km sein')
    .optional(),
});

export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;

// Settings Update Schema
export const settingsUpdateSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein').optional(),
  preferences: userPreferencesSchema.optional(),
});

export type SettingsUpdateData = z.infer<typeof settingsUpdateSchema>;

