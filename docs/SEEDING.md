# Seeding Dummy Data

This document explains how to populate the database with dummy data for development and demo purposes.

## Overview

The seeding endpoint creates:
- **5 dummy users** with profiles (various account types and verification statuses)
- **4 guitar listings** (Fender, Gibson, Martin, etc.)
- **3 amp listings** (Marshall, Fender, Orange)
- **4 effect pedal listings** (Boss, Strymon, Ibanez, TC Electronic)

## Usage

### Enable Seeding

By default, seeding is **enabled**. To disable it, set in your `.env.local`:

```env
ENABLE_SEEDING=false
```

### Run Seeding

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Call the seed endpoint with confirmation:
   ```bash
   curl -X POST http://localhost:3000/api/seed?confirm=true
   ```

   Or visit in your browser:
   ```
   http://localhost:3000/api/seed?confirm=true
   ```

   **Note:** The `?confirm=true` parameter is required for safety.

### What Gets Created

#### Users
- `guitarhero` - Max Mustermann (Berlin, verified)
- `ampwizard` - Sarah Schmidt (Hamburg, premium)
- `pedalpro` - Tom Weber (München, verified)
- `vintagevibes` - Lisa Müller (Köln, store)
- `rockstar` - Jan Fischer (Stuttgart, verified)

All users are created with:
- Email: `{username}@example.com` (e.g., `guitarhero@example.com`)
- Password: `DummyPassword123!`
- Email confirmed: Yes (can login immediately)

#### Listings

**Guitars:**
- Fender Stratocaster 1995
- Gibson Les Paul Standard 2010
- Martin D-28 Acoustic 2015
- Fender Telecaster 1965 Reissue

**Amps:**
- Marshall JCM800 2203 Head
- Fender Twin Reverb 1965 Reissue
- Orange Rockerverb 50 MKIII Head

**Effects:**
- Boss DD-7 Digital Delay
- Strymon BigSky Reverb
- Ibanez Tube Screamer TS808
- TC Electronic Flashback 2 Delay

## Safety Features

1. **Confirmation Required:** Must include `?confirm=true` parameter
2. **Duplicate Check:** Won't create data if listings already exist
3. **Environment Check:** Can be disabled via `ENABLE_SEEDING=false`
4. **Error Handling:** Continues creating other items if one fails

## Removing Dummy Data

To remove dummy data:

1. **Via Supabase Dashboard:**
   - Go to Table Editor
   - Delete listings, then profiles
   - Or use SQL Editor to delete in bulk

2. **Via SQL:**
   ```sql
   -- Delete all listings (cascades to detail tables)
   DELETE FROM public.listings;
   
   -- Delete dummy user profiles (replace with actual user IDs)
   DELETE FROM public.profiles WHERE email LIKE '%@example.com';
   
   -- Delete auth users (via Supabase Dashboard > Authentication > Users)
   ```

## Production Warning

⚠️ **Never run seeding in production!**

- Set `ENABLE_SEEDING=false` in production
- The endpoint will return 403 if disabled
- Dummy users have weak passwords
- Creates test data that shouldn't be in production

## Troubleshooting

### "Seeding is disabled"
- Check your `.env.local` file
- Make sure `ENABLE_SEEDING` is not set to `false`

### "Dummy data already exists"
- The endpoint detected existing listings
- Delete existing data first, or modify the check in the code

### "Failed to create any users"
- Check Supabase connection
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check if usernames/emails already exist
- Review server logs for detailed errors

### Auth users not created
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has admin permissions
- Check Supabase Dashboard > Authentication > Users for errors

