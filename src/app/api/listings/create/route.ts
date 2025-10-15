import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createListingSchema } from '@/lib/validations/listings';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user can create listings
        const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();

        // Temporarily allow all authenticated users to create listings
        // TODO: Re-enable verification requirement later
        // if (!profile || !['verified', 'premium', 'store', 'admin'].includes(profile.account_type)) {
        //     return NextResponse.json({
        //         error: 'Account verification required to create listings'
        //     }, { status: 403 });
        // }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = createListingSchema.parse(body);

        // Generate slug from title
        const slug = validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        // Create base listing
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
                images: validatedData.images,
                videos: validatedData.videos || [],
                case_included: validatedData.case_included,
                accessories: validatedData.accessories || [],
                tags: validatedData.tags || [],
                status: 'draft'
            })
            .select('id')
            .single();

        if (listingError) {
            console.error('Listing creation error:', listingError);
            return NextResponse.json({
                error: 'Failed to create listing'
            }, { status: 500 });
        }

        // Create category-specific details
        let detailError = null;

        if (validatedData.category === 'guitars') {
            const { error } = await supabase
                .from('guitars_detail')
                .insert({
                    listing_id: listing.id,
                    brand: validatedData.brand,
                    model: validatedData.model,
                    series: validatedData.series,
                    year: validatedData.year,
                    country_of_origin: validatedData.country_of_origin,
                    guitar_type: validatedData.guitar_type,
                    specifications: validatedData.specifications || {}
                });

            detailError = error;
        } else if (validatedData.category === 'amps') {
            const { error } = await supabase
                .from('amps_detail')
                .insert({
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

            detailError = error;
        } else if (validatedData.category === 'effects') {
            const { error } = await supabase
                .from('effects_detail')
                .insert({
                    listing_id: listing.id,
                    brand: validatedData.brand,
                    model: validatedData.model,
                    series: validatedData.series,
                    year: validatedData.year,
                    country_of_origin: validatedData.country_of_origin,
                    effect_type: validatedData.effect_type,
                    true_bypass: validatedData.true_bypass,
                    power_supply: validatedData.power_supply,
                    stereo: validatedData.stereo,
                    midi: validatedData.midi,
                    expression_pedal: validatedData.expression_pedal,
                    specifications: validatedData.specifications || {}
                });

            detailError = error;
        }

        if (detailError) {
            console.error('Detail creation error:', detailError);

            // Clean up the listing if detail creation failed
            await supabase
                .from('listings')
                .delete()
                .eq('id', listing.id);

            return NextResponse.json({
                error: 'Failed to create listing details'
            }, { status: 500 });
        }

        return NextResponse.json({
            id: listing.id,
            message: 'Listing created successfully'
        });

    } catch (error) {
        console.error('Create listing error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 422 });
        }

        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
