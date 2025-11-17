/**
 * Seed Dummy Data API
 * 
 * This endpoint populates the database with dummy data for development/demo purposes.
 * 
 * To disable: Set ENABLE_SEEDING=false in your .env file
 * To use: POST /api/seed?confirm=true
 * 
 * WARNING: This will create dummy data. Use with caution in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { 
  GUITAR_BRANDS, AMP_BRANDS, EFFECT_BRANDS,
  GUITAR_TYPES, AMP_TYPES, EFFECT_TYPES,
  CONDITIONS, LISTING_STATUS, ACCOUNT_TYPES, VERIFICATION_STATUS
} from '@/utils/constants';

// Check if seeding is enabled
const ENABLE_SEEDING = process.env.ENABLE_SEEDING !== 'false';

// Dummy user data
const DUMMY_USERS = [
  {
    username: 'guitarhero',
    full_name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    bio: 'Passionate guitarist and collector. Specializing in vintage electric guitars.',
    location: 'Berlin, Deutschland',
    account_type: 'verified' as const,
    verification_status: 'email_verified' as const,
    seller_rating: 4.8,
    buyer_rating: 4.5,
    total_sales: 12,
    total_purchases: 5,
  },
  {
    username: 'ampwizard',
    full_name: 'Sarah Schmidt',
    email: 'sarah.schmidt@example.com',
    bio: 'Tube amp enthusiast. Always looking for vintage Marshall and Fender amps.',
    location: 'Hamburg, Deutschland',
    account_type: 'premium' as const,
    verification_status: 'phone_verified' as const,
    seller_rating: 4.9,
    buyer_rating: 4.7,
    total_sales: 25,
    total_purchases: 8,
  },
  {
    username: 'pedalpro',
    full_name: 'Tom Weber',
    email: 'tom.weber@example.com',
    bio: 'Effects pedal collector and modder. Love experimenting with different sounds.',
    location: 'München, Deutschland',
    account_type: 'verified' as const,
    verification_status: 'email_verified' as const,
    seller_rating: 4.6,
    buyer_rating: 4.4,
    total_sales: 18,
    total_purchases: 10,
  },
  {
    username: 'vintagevibes',
    full_name: 'Lisa Müller',
    email: 'lisa.mueller@example.com',
    bio: 'Vintage guitar specialist. Focus on 60s and 70s instruments.',
    location: 'Köln, Deutschland',
    account_type: 'store' as const,
    verification_status: 'fully_verified' as const,
    seller_rating: 5.0,
    buyer_rating: 4.9,
    total_sales: 45,
    total_purchases: 12,
  },
  {
    username: 'rockstar',
    full_name: 'Jan Fischer',
    email: 'jan.fischer@example.com',
    bio: 'Professional musician and gear trader.',
    location: 'Stuttgart, Deutschland',
    account_type: 'verified' as const,
    verification_status: 'email_verified' as const,
    seller_rating: 4.7,
    buyer_rating: 4.6,
    total_sales: 8,
    total_purchases: 15,
  },
];

// Dummy guitar listings
const DUMMY_GUITARS = [
  {
    title: 'Fender Stratocaster 1995 - Sehr guter Zustand',
    description: 'Klassische Fender Stratocaster aus dem Jahr 1995. Der Gitarre wurde sehr gut gepflegt und zeigt nur minimale Gebrauchsspuren. Alle Originalteile vorhanden. Perfekt für Blues, Rock und Pop. Mit Original-Hardcase.',
    price: 1200,
    original_price: 1500,
    price_negotiable: true,
    condition: 'very_good' as const,
    condition_notes: 'Minimale Kratzer am Korpus, sonst perfekt',
    location_city: 'Berlin',
    location_state: 'Berlin',
    location_country: 'DE',
    location_postal_code: '10115',
    shipping_available: true,
    shipping_cost: 25,
    shipping_methods: ['standard', 'express'],
    pickup_available: true,
    case_included: true,
    accessories: ['Hardcase', 'Strap', 'Cable'],
    tags: ['fender', 'stratocaster', 'vintage', 'electric'],
    brand: 'Fender',
    model: 'Stratocaster',
    year: 1995,
    country_of_origin: 'USA',
    guitar_type: 'electric' as const,
    specifications: {
      body_type: 'Solid Body',
      body_material: 'Alder',
      neck_material: 'Maple',
      fretboard_material: 'Maple',
      number_of_frets: 21,
      scale_length: 25.5,
      pickup_configuration: 'SSS',
      electronics: '3 Single Coils',
    },
  },
  {
    title: 'Gibson Les Paul Standard 2010 - Mint Condition',
    description: 'Wunderschöne Gibson Les Paul Standard in Heritage Cherry Sunburst. Wie neu! Wurde nur im Studio verwendet. Alle Papiere und Hardcase vorhanden. Absolut makellos.',
    price: 2800,
    original_price: null,
    price_negotiable: false,
    condition: 'mint' as const,
    condition_notes: 'Wie neu, keine Gebrauchsspuren',
    location_city: 'Hamburg',
    location_state: 'Hamburg',
    location_country: 'DE',
    location_postal_code: '20095',
    shipping_available: true,
    shipping_cost: 35,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: true,
    accessories: ['Hardcase', 'Certificate', 'Strap'],
    tags: ['gibson', 'les paul', 'standard', 'mint'],
    brand: 'Gibson',
    model: 'Les Paul Standard',
    year: 2010,
    country_of_origin: 'USA',
    guitar_type: 'electric' as const,
    specifications: {
      body_type: 'Solid Body',
      body_material: 'Mahogany',
      neck_material: 'Mahogany',
      fretboard_material: 'Rosewood',
      number_of_frets: 22,
      scale_length: 24.75,
      pickup_configuration: 'HH',
      electronics: '2 Humbuckers',
    },
  },
  {
    title: 'Martin D-28 Acoustic Guitar 2015',
    description: 'Klassische Martin D-28 Dreadnought Gitarre. Perfekter Klang für Fingerpicking und Strumming. Sehr gut gepflegt, nur leichte Gebrauchsspuren. Mit Original-Hardcase.',
    price: 2200,
    original_price: 2800,
    price_negotiable: true,
    condition: 'excellent' as const,
    condition_notes: 'Sehr guter Zustand, nur minimale Gebrauchsspuren',
    location_city: 'München',
    location_state: 'Bayern',
    location_country: 'DE',
    location_postal_code: '80331',
    shipping_available: true,
    shipping_cost: 30,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: true,
    accessories: ['Hardcase', 'Humidifier'],
    tags: ['martin', 'acoustic', 'dreadnought', 'vintage'],
    brand: 'Martin',
    model: 'D-28',
    year: 2015,
    country_of_origin: 'USA',
    guitar_type: 'acoustic' as const,
    specifications: {
      body_type: 'Dreadnought',
      body_material: 'Spruce Top, Rosewood Back & Sides',
      neck_material: 'Mahogany',
      fretboard_material: 'Ebony',
      number_of_frets: 20,
      scale_length: 25.4,
    },
  },
  {
    title: 'Fender Telecaster 1965 Reissue - Excellent',
    description: 'Fender Telecaster 1965 Reissue in Vintage Blonde. Wunderschöner Vintage-Sound. Sehr guter Zustand, alle Originalteile. Perfekt für Country, Blues und Rock.',
    price: 1500,
    original_price: null,
    price_negotiable: true,
    condition: 'excellent' as const,
    condition_notes: 'Sehr guter Zustand',
    location_city: 'Köln',
    location_state: 'Nordrhein-Westfalen',
    location_country: 'DE',
    location_postal_code: '50667',
    shipping_available: true,
    shipping_cost: 25,
    shipping_methods: ['standard'],
    pickup_available: true,
    case_included: true,
    accessories: ['Hardcase', 'Strap'],
    tags: ['fender', 'telecaster', 'vintage', 'reissue'],
    brand: 'Fender',
    model: 'Telecaster',
    year: 2015,
    country_of_origin: 'USA',
    guitar_type: 'electric' as const,
    specifications: {
      body_type: 'Solid Body',
      body_material: 'Ash',
      neck_material: 'Maple',
      fretboard_material: 'Maple',
      number_of_frets: 21,
      scale_length: 25.5,
      pickup_configuration: 'SS',
      electronics: '2 Single Coils',
    },
  },
];

// Dummy amp listings
const DUMMY_AMPS = [
  {
    title: 'Marshall JCM800 2203 Head - Vintage',
    description: 'Klassischer Marshall JCM800 2203 Head aus den 80ern. Der heilige Gral für Rock und Metal. Funktioniert einwandfrei, alle Röhren wurden kürzlich getauscht. Mit Original-Footswitch.',
    price: 1800,
    original_price: null,
    price_negotiable: true,
    condition: 'very_good' as const,
    condition_notes: 'Gute Gebrauchsspuren, aber technisch perfekt',
    location_city: 'Hamburg',
    location_state: 'Hamburg',
    location_country: 'DE',
    location_postal_code: '20095',
    shipping_available: true,
    shipping_cost: 40,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: false,
    accessories: ['Footswitch', 'Cables'],
    tags: ['marshall', 'jcm800', 'tube', 'vintage'],
    brand: 'Marshall',
    model: 'JCM800',
    year: 1985,
    country_of_origin: 'UK',
    amp_type: 'head' as const,
    wattage: 100,
    speaker_config: null,
    channels: 2,
    effects_loop: true,
    reverb: false,
    headphone_out: false,
    specifications: {
      tubes: '4x EL34, 3x ECC83',
      power_amp: '100W',
      preamp: '2 Channel',
    },
  },
  {
    title: 'Fender Twin Reverb 1965 Reissue',
    description: 'Fender Twin Reverb Reissue in sehr gutem Zustand. Perfekter Clean-Sound für Jazz und Blues. Wurde nur im Studio verwendet. Mit Original-Footswitch.',
    price: 1200,
    original_price: 1500,
    price_negotiable: true,
    condition: 'excellent' as const,
    condition_notes: 'Sehr guter Zustand',
    location_city: 'Berlin',
    location_state: 'Berlin',
    location_country: 'DE',
    location_postal_code: '10115',
    shipping_available: true,
    shipping_cost: 35,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: false,
    accessories: ['Footswitch'],
    tags: ['fender', 'twin reverb', 'combo', 'clean'],
    brand: 'Fender',
    model: 'Twin Reverb',
    year: 2010,
    country_of_origin: 'USA',
    amp_type: 'combo' as const,
    wattage: 85,
    speaker_config: '2x12',
    channels: 2,
    effects_loop: true,
    reverb: true,
    headphone_out: false,
    specifications: {
      tubes: '4x 6L6GC, 5x 12AX7',
      speakers: '2x12" Jensen',
      reverb_type: 'Spring Reverb',
    },
  },
  {
    title: 'Orange Rockerverb 50 MKIII Head',
    description: 'Orange Rockerverb 50 MKIII Head. Moderner High-Gain Amp mit fantastischem Sound. Wie neu, wurde nur wenige Male verwendet. Mit Original-Footswitch und Box.',
    price: 1600,
    original_price: 2000,
    price_negotiable: true,
    condition: 'mint' as const,
    condition_notes: 'Wie neu',
    location_city: 'München',
    location_state: 'Bayern',
    location_country: 'DE',
    location_postal_code: '80331',
    shipping_available: true,
    shipping_cost: 35,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: false,
    accessories: ['Footswitch', 'Box'],
    tags: ['orange', 'rockerverb', 'modern', 'high-gain'],
    brand: 'Orange',
    model: 'Rockerverb 50',
    year: 2020,
    country_of_origin: 'UK',
    amp_type: 'head' as const,
    wattage: 50,
    speaker_config: null,
    channels: 2,
    effects_loop: true,
    reverb: true,
    headphone_out: true,
    specifications: {
      tubes: '4x EL34, 4x ECC83',
      power_amp: '50W',
      reverb_type: 'Spring Reverb',
    },
  },
];

// Dummy effect listings
const DUMMY_EFFECTS = [
  {
    title: 'Boss DD-7 Digital Delay - Sehr guter Zustand',
    description: 'Klassischer Boss DD-7 Digital Delay Pedal. Funktioniert einwandfrei, nur minimale Gebrauchsspuren. Mit Original-Box und Anleitung.',
    price: 120,
    original_price: 180,
    price_negotiable: false,
    condition: 'very_good' as const,
    condition_notes: 'Sehr guter Zustand',
    location_city: 'Berlin',
    location_state: 'Berlin',
    location_country: 'DE',
    location_postal_code: '10115',
    shipping_available: true,
    shipping_cost: 5,
    shipping_methods: ['standard'],
    pickup_available: true,
    case_included: false,
    accessories: ['Box', 'Manual'],
    tags: ['boss', 'delay', 'digital', 'pedal'],
    brand: 'Boss',
    model: 'DD-7',
    year: 2015,
    country_of_origin: 'Japan',
    effect_type: 'delay' as const,
    true_bypass: false,
    power_supply: '9V DC',
    stereo: false,
    midi: false,
    expression_pedal: true,
    specifications: {
      delay_time: 'Up to 6.4 seconds',
      modes: '7 delay modes',
    },
  },
  {
    title: 'Strymon BigSky Reverb - Mint Condition',
    description: 'Strymon BigSky Reverb Pedal in perfektem Zustand. Wie neu! Wurde nur im Studio verwendet. Mit Original-Box, Netzteil und Anleitung.',
    price: 450,
    original_price: 550,
    price_negotiable: true,
    condition: 'mint' as const,
    condition_notes: 'Wie neu',
    location_city: 'Hamburg',
    location_state: 'Hamburg',
    location_country: 'DE',
    location_postal_code: '20095',
    shipping_available: true,
    shipping_cost: 8,
    shipping_methods: ['standard', 'insured'],
    pickup_available: true,
    case_included: false,
    accessories: ['Box', 'Power Supply', 'Manual'],
    tags: ['strymon', 'reverb', 'stereo', 'premium'],
    brand: 'Strymon',
    model: 'BigSky',
    year: 2018,
    country_of_origin: 'USA',
    effect_type: 'reverb' as const,
    true_bypass: true,
    power_supply: '9V DC',
    stereo: true,
    midi: true,
    expression_pedal: true,
    specifications: {
      algorithms: '12 reverb algorithms',
      presets: '300 presets',
      midi_implementation: 'Full MIDI support',
    },
  },
  {
    title: 'Ibanez Tube Screamer TS808 Reissue',
    description: 'Ibanez Tube Screamer TS808 Reissue. Der klassische Overdrive-Sound. Sehr guter Zustand, funktioniert einwandfrei. Mit Original-Box.',
    price: 150,
    original_price: null,
    price_negotiable: false,
    condition: 'excellent' as const,
    condition_notes: 'Sehr guter Zustand',
    location_city: 'Köln',
    location_state: 'Nordrhein-Westfalen',
    location_country: 'DE',
    location_postal_code: '50667',
    shipping_available: true,
    shipping_cost: 5,
    shipping_methods: ['standard'],
    pickup_available: true,
    case_included: false,
    accessories: ['Box'],
    tags: ['ibanez', 'tube screamer', 'overdrive', 'classic'],
    brand: 'Ibanez',
    model: 'TS808',
    year: 2010,
    country_of_origin: 'Japan',
    effect_type: 'overdrive' as const,
    true_bypass: false,
    power_supply: '9V DC',
    stereo: false,
    midi: false,
    expression_pedal: false,
    specifications: {
      controls: 'Drive, Tone, Level',
    },
  },
  {
    title: 'TC Electronic Flashback 2 Delay',
    description: 'TC Electronic Flashback 2 Delay Pedal. Vielseitiges Delay mit vielen Moden. Sehr guter Zustand, funktioniert einwandfrei.',
    price: 140,
    original_price: 200,
    price_negotiable: true,
    condition: 'very_good' as const,
    condition_notes: 'Sehr guter Zustand',
    location_city: 'Stuttgart',
    location_state: 'Baden-Württemberg',
    location_country: 'DE',
    location_postal_code: '70173',
    shipping_available: true,
    shipping_cost: 5,
    shipping_methods: ['standard'],
    pickup_available: true,
    case_included: false,
    accessories: [],
    tags: ['tc electronic', 'delay', 'versatile'],
    brand: 'TC Electronic',
    model: 'Flashback 2',
    year: 2018,
    country_of_origin: 'Denmark',
    effect_type: 'delay' as const,
    true_bypass: true,
    power_supply: '9V DC',
    stereo: false,
    midi: false,
    expression_pedal: true,
    specifications: {
      delay_time: 'Up to 7 seconds',
      modes: '11 delay modes',
    },
  },
];

export async function POST(request: NextRequest) {
  // Check if seeding is enabled
  if (!ENABLE_SEEDING) {
    return NextResponse.json(
      { error: 'Seeding is disabled. Set ENABLE_SEEDING=true to enable.' },
      { status: 403 }
    );
  }

  // Require confirmation
  const { searchParams } = new URL(request.url);
  if (searchParams.get('confirm') !== 'true') {
    return NextResponse.json(
      { error: 'Please add ?confirm=true to the URL to confirm seeding.' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Check if dummy data already exists (check for dummy user emails)
    const { data: existingDummyProfiles } = await supabase
      .from('profiles')
      .select('id')
      .like('email', '%@example.com')
      .limit(1);

    if (existingDummyProfiles && existingDummyProfiles.length > 0) {
      return NextResponse.json(
        { 
          message: 'Dummy data already exists. To reseed, delete existing data first.',
          warning: 'This endpoint does not delete existing data.',
          hint: 'Use POST /api/seed/clear?confirm=true to clear dummy data first'
        },
        { status: 200 }
      );
    }

    // Create dummy users (auth.users first, then update profiles)
    const userIds: string[] = [];
    
    for (const userData of DUMMY_USERS) {
      try {
        // Create auth user first (admin client can do this)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: 'DummyPassword123!', // Dummy password - users can reset if needed
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            username: userData.username,
          },
        });

        if (authError) {
          console.error(`Error creating auth user ${userData.username}:`, authError);
          // Try to find existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users.find(u => u.email === userData.email);
          if (existingUser) {
            userIds.push(existingUser.id);
            // Update profile
            await supabase
              .from('profiles')
              .update({
                username: userData.username,
                full_name: userData.full_name,
                bio: userData.bio,
                location: userData.location,
                account_type: userData.account_type,
                verification_status: userData.verification_status,
                seller_rating: userData.seller_rating,
                buyer_rating: userData.buyer_rating,
                total_sales: userData.total_sales,
                total_purchases: userData.total_purchases,
              })
              .eq('id', existingUser.id);
          }
          continue;
        }

        if (authUser?.user) {
          userIds.push(authUser.user.id);
          
          // Update the auto-created profile with full details
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              username: userData.username,
              full_name: userData.full_name,
              bio: userData.bio,
              location: userData.location,
              account_type: userData.account_type,
              verification_status: userData.verification_status,
              seller_rating: userData.seller_rating,
              buyer_rating: userData.buyer_rating,
              total_sales: userData.total_sales,
              total_purchases: userData.total_purchases,
            })
            .eq('id', authUser.user.id);

          if (profileError) {
            console.error(`Error updating profile ${userData.username}:`, profileError);
          }
        }
      } catch (error) {
        console.error(`Error processing user ${userData.username}:`, error);
        continue;
      }
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create any users. Check if profiles already exist or if there are constraint violations.' },
        { status: 500 }
      );
    }

    // Create dummy listings
    const createdListings: string[] = [];

    // Create guitar listings
    for (let i = 0; i < DUMMY_GUITARS.length; i++) {
      const guitar = DUMMY_GUITARS[i];
      const sellerId = userIds[i % userIds.length];

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          category: 'guitars',
          title: guitar.title,
          description: guitar.description,
          price: guitar.price,
          original_price: guitar.original_price,
          price_negotiable: guitar.price_negotiable,
          condition: guitar.condition,
          condition_notes: guitar.condition_notes,
          status: 'active',
          location_city: guitar.location_city,
          location_state: guitar.location_state,
          location_country: guitar.location_country,
          location_postal_code: guitar.location_postal_code,
          shipping_available: guitar.shipping_available,
          shipping_cost: guitar.shipping_cost,
          shipping_methods: guitar.shipping_methods,
          pickup_available: guitar.pickup_available,
          images: [], // Empty for now - you can add image URLs later
          videos: [],
          case_included: guitar.case_included,
          accessories: guitar.accessories,
          tags: guitar.tags,
          views: Math.floor(Math.random() * 100) + 10,
          favorites_count: Math.floor(Math.random() * 20),
          inquiries_count: Math.floor(Math.random() * 10),
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (listingError) {
        console.error(`Error creating guitar listing:`, listingError);
        continue;
      }

      if (listing) {
        // Create guitar details
        const { error: detailError } = await supabase
          .from('guitars_detail')
          .insert({
            listing_id: listing.id,
            brand: guitar.brand,
            model: guitar.model,
            year: guitar.year,
            country_of_origin: guitar.country_of_origin,
            guitar_type: guitar.guitar_type,
            specifications: guitar.specifications,
          });

        if (detailError) {
          console.error(`Error creating guitar details:`, detailError);
        } else {
          createdListings.push(listing.id);
        }
      }
    }

    // Create amp listings
    for (let i = 0; i < DUMMY_AMPS.length; i++) {
      const amp = DUMMY_AMPS[i];
      const sellerId = userIds[(i + DUMMY_GUITARS.length) % userIds.length];

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          category: 'amps',
          title: amp.title,
          description: amp.description,
          price: amp.price,
          original_price: amp.original_price,
          price_negotiable: amp.price_negotiable,
          condition: amp.condition,
          condition_notes: amp.condition_notes,
          status: 'active',
          location_city: amp.location_city,
          location_state: amp.location_state,
          location_country: amp.location_country,
          location_postal_code: amp.location_postal_code,
          shipping_available: amp.shipping_available,
          shipping_cost: amp.shipping_cost,
          shipping_methods: amp.shipping_methods,
          pickup_available: amp.pickup_available,
          images: [],
          videos: [],
          case_included: amp.case_included,
          accessories: amp.accessories,
          tags: amp.tags,
          views: Math.floor(Math.random() * 100) + 10,
          favorites_count: Math.floor(Math.random() * 20),
          inquiries_count: Math.floor(Math.random() * 10),
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (listingError) {
        console.error(`Error creating amp listing:`, listingError);
        continue;
      }

      if (listing) {
        const { error: detailError } = await supabase
          .from('amps_detail')
          .insert({
            listing_id: listing.id,
            brand: amp.brand,
            model: amp.model,
            year: amp.year,
            country_of_origin: amp.country_of_origin,
            amp_type: amp.amp_type,
            wattage: amp.wattage,
            speaker_config: amp.speaker_config,
            channels: amp.channels,
            effects_loop: amp.effects_loop,
            reverb: amp.reverb,
            headphone_out: amp.headphone_out,
            specifications: amp.specifications,
          });

        if (detailError) {
          console.error(`Error creating amp details:`, detailError);
        } else {
          createdListings.push(listing.id);
        }
      }
    }

    // Create effect listings
    for (let i = 0; i < DUMMY_EFFECTS.length; i++) {
      const effect = DUMMY_EFFECTS[i];
      const sellerId = userIds[(i + DUMMY_GUITARS.length + DUMMY_AMPS.length) % userIds.length];

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          category: 'effects',
          title: effect.title,
          description: effect.description,
          price: effect.price,
          original_price: effect.original_price,
          price_negotiable: effect.price_negotiable,
          condition: effect.condition,
          condition_notes: effect.condition_notes,
          status: 'active',
          location_city: effect.location_city,
          location_state: effect.location_state,
          location_country: effect.location_country,
          location_postal_code: effect.location_postal_code,
          shipping_available: effect.shipping_available,
          shipping_cost: effect.shipping_cost,
          shipping_methods: effect.shipping_methods,
          pickup_available: effect.pickup_available,
          images: [],
          videos: [],
          case_included: effect.case_included,
          accessories: effect.accessories,
          tags: effect.tags,
          views: Math.floor(Math.random() * 100) + 10,
          favorites_count: Math.floor(Math.random() * 20),
          inquiries_count: Math.floor(Math.random() * 10),
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (listingError) {
        console.error(`Error creating effect listing:`, listingError);
        continue;
      }

      if (listing) {
        const { error: detailError } = await supabase
          .from('effects_detail')
          .insert({
            listing_id: listing.id,
            brand: effect.brand,
            model: effect.model,
            year: effect.year,
            country_of_origin: effect.country_of_origin,
            effect_type: effect.effect_type,
            true_bypass: effect.true_bypass,
            power_supply: effect.power_supply,
            stereo: effect.stereo,
            midi: effect.midi,
            expression_pedal: effect.expression_pedal,
            specifications: effect.specifications,
          });

        if (detailError) {
          console.error(`Error creating effect details:`, detailError);
        } else {
          createdListings.push(listing.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy data seeded successfully',
      stats: {
        users_created: userIds.length,
        listings_created: createdListings.length,
        guitars: DUMMY_GUITARS.length,
        amps: DUMMY_AMPS.length,
        effects: DUMMY_EFFECTS.length,
      },
      note: 'Dummy users created with password: DummyPassword123! (change in production)',
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data', details: error.message },
      { status: 500 }
    );
  }
}

