/**
 * Clear Seed Data
 * POST /api/seed/clear?confirm=true - Delete all dummy data
 * 
 * WARNING: This deletes ALL listings and dummy user profiles!
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('confirm') !== 'true') {
      return NextResponse.json(
        { error: 'Please add ?confirm=true to confirm deletion.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get all dummy user emails (ending with @example.com)
    const { data: dummyProfiles } = await supabase
      .from('profiles')
      .select('id, email')
      .like('email', '%@example.com');

    const dummyUserIds = dummyProfiles?.map(p => p.id) || [];

    // Delete listings from dummy users (cascades to detail tables)
    if (dummyUserIds.length > 0) {
      const { error: listingsError } = await supabase
        .from('listings')
        .delete()
        .in('seller_id', dummyUserIds);

      if (listingsError) {
        console.error('Error deleting listings:', listingsError);
      }
    }

    // Delete dummy profiles
    if (dummyUserIds.length > 0) {
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', dummyUserIds);

      if (profilesError) {
        console.error('Error deleting profiles:', profilesError);
      }

      // Delete auth users
      for (const userId of dummyUserIds) {
        await supabase.auth.admin.deleteUser(userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy data cleared',
      deleted: {
        profiles: dummyUserIds.length,
        listings: 'all listings from dummy users',
      },
    });
  } catch (error: any) {
    console.error('Clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear data', details: error.message },
      { status: 500 }
    );
  }
}

