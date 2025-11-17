import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createListingSchema } from '@/lib/validations/listings';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createListingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error },
                { status: 400 }
            );
        }

        const validatedData = validation.data;

        // Generate slug
        const slug = validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        // Create draft listing
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .insert({
                seller_id: user.id,
                category: validatedData.category,
                title: validatedData.title,
                description: validatedData.description,
                slug,
                price: validatedData.price,
                original_price: validatedData.original_price,
                price_negotiable: validatedData.price_negotiable,
                condition: validatedData.condition,
                condition_notes: validatedData.condition_notes,
                location_city: validatedData.location_city,
                location_state: validatedData.location_state,
                location_postal_code: validatedData.location_postal_code,
                shipping_available: validatedData.shipping_available,
                shipping_cost: validatedData.shipping_cost,
                shipping_methods: validatedData.shipping_methods,
                pickup_available: validatedData.pickup_available,
                images: validatedData.images || [],
                videos: validatedData.videos || [],
                case_included: validatedData.case_included,
                accessories: validatedData.accessories || [],
                tags: validatedData.tags || [],
                status: 'draft' // Always save as draft
            })
            .select('id')
            .single();

        if (listingError) {
            console.error('Draft creation error:', listingError);
            return NextResponse.json({
                error: 'Failed to save draft',
                details: listingError.message
            }, { status: 500 });
        }

        // Create category-specific details if provided
        if (validatedData.category === 'guitars' && validatedData.brand) {
            await supabase.from('guitars_detail').insert({
                listing_id: listing.id,
                brand: validatedData.brand,
                model: validatedData.model,
                series: validatedData.series,
                year: validatedData.year,
                country_of_origin: validatedData.country_of_origin,
                guitar_type: validatedData.guitar_type,
                specifications: validatedData.specifications || {}
            });
        } else if (validatedData.category === 'amps' && validatedData.brand) {
            await supabase.from('amps_detail').insert({
                listing_id: listing.id,
                brand: validatedData.brand,
                model: validatedData.model,
                series: validatedData.series,
                year: validatedData.year,
                country_of_origin: validatedData.country_of_origin,
                amp_type: validatedData.amp_type,
                wattage: validatedData.wattage,
                speaker_config: validatedData.speaker_config,
                channels: validatedData.channels,
                effects_loop: validatedData.effects_loop,
                reverb: validatedData.reverb,
                headphone_out: validatedData.headphone_out,
                specifications: validatedData.specifications || {}
            });
        } else if (validatedData.category === 'effects' && validatedData.brand) {
            await supabase.from('effects_detail').insert({
                listing_id: listing.id,
                brand: validatedData.brand,
                model: validatedData.model,
                series: validatedData.series,
                year: validatedData.year,
                country_of_origin: validatedData.country_of_origin,
                effect_type: validatedData.effect_type,
                specifications: validatedData.specifications || {}
            });
        }

        return NextResponse.json({ data: listing }, { status: 201 });
    } catch (error) {
        console.error('POST /api/listings/draft error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

