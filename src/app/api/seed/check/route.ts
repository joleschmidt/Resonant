/**
 * Check Seed Data Status
 * GET /api/seed/check - Check what dummy data exists
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Check listings
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, category, status, seller_id')
      .order('created_at', { ascending: false });

    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, account_type')
      .order('created_at', { ascending: false });

    // Check detail tables
    const { data: guitars, error: guitarsError } = await supabase
      .from('guitars_detail')
      .select('listing_id, brand, model');

    const { data: amps, error: ampsError } = await supabase
      .from('amps_detail')
      .select('listing_id, brand, model');

    const { data: effects, error: effectsError } = await supabase
      .from('effects_detail')
      .select('listing_id, brand, model');

    return NextResponse.json({
      listings: {
        count: listings?.length || 0,
        active: listings?.filter(l => l.status === 'active').length || 0,
        data: listings || [],
        error: listingsError?.message,
      },
      profiles: {
        count: profiles?.length || 0,
        data: profiles || [],
        error: profilesError?.message,
      },
      details: {
        guitars: guitars?.length || 0,
        amps: amps?.length || 0,
        effects: effects?.length || 0,
        errors: {
          guitars: guitarsError?.message,
          amps: ampsError?.message,
          effects: effectsError?.message,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check seed data', details: error.message },
      { status: 500 }
    );
  }
}

