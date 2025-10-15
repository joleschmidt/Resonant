import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateListingSchema } from '@/lib/validations/listings';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        // Get listing first
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .eq('status', 'active')
            .single();

        if (listingError || !listing) {
            return NextResponse.json({
                error: 'Listing not found'
            }, { status: 404 });
        }

        // Get seller profile separately
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, verification_status, seller_rating, total_sales, location, created_at')
            .eq('id', (listing as any).seller_id)
            .single();

        // Optional: increment views when client explicitly requests it
        const shouldIncrement = request.headers.get('x-increment-view') === '1';
        if (shouldIncrement) {
            await (supabase as any).rpc('increment_listing_views', { p_listing_id: listingId });
            // reflect increment locally
            (listing as any).views = ((listing as any).views || 0) + 1;
        }

        // Get category-specific details
        let details = null;
        let detailsError = null;

        if ((listing as any).category === 'guitars') {
            const { data, error } = await supabase
                .from('guitars_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            details = data as any;
            detailsError = error;

            // Merge specifications into details for frontend
            const dataAny: any = data;
            if (dataAny && dataAny.specifications) {
                details = {
                    ...dataAny,
                    ...dataAny.specifications
                };
            }
        } else if ((listing as any).category === 'amps') {
            const { data, error } = await supabase
                .from('amps_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            details = data as any;
            detailsError = error;

            // Merge specifications into details for frontend
            const dataAny: any = data;
            if (dataAny && dataAny.specifications) {
                details = {
                    ...dataAny,
                    ...dataAny.specifications
                };
            }
        } else if ((listing as any).category === 'effects') {
            const { data, error } = await supabase
                .from('effects_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            details = data as any;
            detailsError = error;

            // Merge specifications into details for frontend
            const dataAny: any = data;
            if (dataAny && dataAny.specifications) {
                details = {
                    ...dataAny,
                    ...dataAny.specifications
                };
            }
        }

        if (detailsError) {
            console.error('Details fetch error:', detailsError);
            return NextResponse.json({
                error: 'Failed to fetch listing details'
            }, { status: 500 });
        }

        // Note: View counting moved to POST /api/listings/[id]/view to avoid double increments

        return NextResponse.json({
            data: {
                ...(listing as any),
                views: ((listing as any).views ?? 0),
                profiles: profile,
                details
            }
        });

    } catch (error) {
        console.error('Get listing error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns the listing
        const { data: listing } = await supabase
            .from('listings')
            .select('seller_id, category')
            .eq('id', listingId)
            .single();

        if (!listing || (listing as any).seller_id !== user.id) {
            return NextResponse.json({
                error: 'Forbidden'
            }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();

        // We support updating category-specific "details" here. Any extra fields
        // that don't exist as columns are stored inside the JSONB specifications field.
        const detailsInput = (body && body.details) || {};
        const baseInput = (body && body.base) || {};
        const imagesInput = Array.isArray(body?.images) ? body.images as string[] : undefined;

        // Helper to only set fields that are explicitly provided (avoid overwriting with null)
        const assignIfDefined = (target: any, sourceKey: string, destKey?: string) => {
            if (Object.prototype.hasOwnProperty.call(detailsInput, sourceKey)) {
                target[destKey || sourceKey] = detailsInput[sourceKey];
            }
        };

        // Category-specific shape (merge with existing row to respect NOT NULL constraints)
        let upsertResult: any = null;
        let upsertError: any = null;
        let payload: any = null;

        if ((listing as any).category === 'guitars') {
            // Load existing
            const { data: existing } = await supabase
                .from('guitars_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            payload = { listing_id: listingId };
            // Only assign fields provided
            assignIfDefined(payload, 'brand');
            assignIfDefined(payload, 'model');
            assignIfDefined(payload, 'series');
            assignIfDefined(payload, 'year');
            assignIfDefined(payload, 'country_of_origin');
            assignIfDefined(payload, 'guitar_type');

            // Merge specifications JSON
            const existingSpecs = (existing && (existing as any).specifications) || {};
            const newSpecs: any = { ...existingSpecs };
            ['body_wood', 'neck_wood', 'fretboard_wood', 'pickups', 'electronics', 'hardware', 'finish', 'custom_fields']
                .forEach((k) => {
                    if (Object.prototype.hasOwnProperty.call(detailsInput, k)) {
                        newSpecs[k] = detailsInput[k];
                    }
                });
            payload.specifications = newSpecs;

            // If creating a new row, ensure required fields exist
            if (!existing) {
                if (!payload.brand || !payload.guitar_type) {
                    return NextResponse.json({ error: 'Validation failed', details: 'brand and guitar_type are required' }, { status: 422 });
                }
            }

            const { data, error } = await supabase
                .from('guitars_detail')
                .upsert(payload as any, { onConflict: 'listing_id' })
                .select('*')
                .single();

            upsertResult = data;
            upsertError = error;
        } else if ((listing as any).category === 'amps') {
            const { data: existing } = await supabase
                .from('amps_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            payload = { listing_id: listingId };
            assignIfDefined(payload, 'brand');
            assignIfDefined(payload, 'model');
            assignIfDefined(payload, 'series');
            assignIfDefined(payload, 'year');
            assignIfDefined(payload, 'country_of_origin');
            assignIfDefined(payload, 'amp_type');

            const existingSpecs = (existing && (existing as any).specifications) || {};
            payload.specifications = { ...existingSpecs, ...(detailsInput.specifications || {}) };

            if (!existing) {
                if (!payload.brand || !payload.amp_type) {
                    return NextResponse.json({ error: 'Validation failed', details: 'brand and amp_type are required' }, { status: 422 });
                }
            }

            const { data, error } = await supabase
                .from('amps_detail')
                .upsert(payload as any, { onConflict: 'listing_id' })
                .select('*')
                .single();

            upsertResult = data;
            upsertError = error;
        } else if ((listing as any).category === 'effects') {
            const { data: existing } = await supabase
                .from('effects_detail')
                .select('*')
                .eq('listing_id', listingId)
                .single();

            payload = { listing_id: listingId };
            assignIfDefined(payload, 'brand');
            assignIfDefined(payload, 'model');
            assignIfDefined(payload, 'series');
            assignIfDefined(payload, 'year');
            assignIfDefined(payload, 'country_of_origin');
            assignIfDefined(payload, 'effect_type');

            const existingSpecs = (existing && (existing as any).specifications) || {};
            payload.specifications = { ...existingSpecs, ...(detailsInput.specifications || {}) };

            if (!existing) {
                if (!payload.brand || !payload.effect_type) {
                    return NextResponse.json({ error: 'Validation failed', details: 'brand and effect_type are required' }, { status: 422 });
                }
            }

            const { data, error } = await supabase
                .from('effects_detail')
                .upsert(payload as any, { onConflict: 'listing_id' })
                .select('*')
                .single();

            upsertResult = data;
            upsertError = error;
        }

        if (upsertError) {
            console.error('Details upsert error:', upsertError);
            console.error('Payload that failed:', JSON.stringify(payload, null, 2));
            return NextResponse.json({
                error: 'Failed to save details',
                details: upsertError.message,
                debug: {
                    category: (listing as any).category,
                    payload: payload
                }
            }, { status: 500 });
        }

        // Optionally update base listing fields if provided
        if (baseInput && Object.keys(baseInput).length > 0) {
            const allowedKeys = [
                'title', 'description', 'price', 'original_price', 'price_negotiable',
                'condition', 'condition_notes',
                'location_city', 'location_state', 'location_postal_code',
                'shipping_available', 'shipping_cost', 'shipping_methods',
                'pickup_available', 'status', 'tags', 'case_included', 'accessories', 'videos'
            ];
            const baseUpdate: Record<string, any> = {};
            for (const key of allowedKeys) {
                if (Object.prototype.hasOwnProperty.call(baseInput, key)) {
                    baseUpdate[key] = (baseInput as any)[key];
                }
            }

            if (Object.keys(baseUpdate).length > 0) {
                const { error: baseUpdateError } = await (supabase as any)
                    .from('listings')
                    .update(baseUpdate)
                    .eq('id', listingId);

                if (baseUpdateError) {
                    console.error('Base update error:', baseUpdateError);
                    return NextResponse.json({
                        error: 'Failed to update listing fields',
                        details: baseUpdateError.message
                    }, { status: 500 });
                }
            }
        }

        // Optionally update listing images if provided
        if (imagesInput) {
            const { error: imagesUpdateError } = await (supabase as any)
                .from('listings')
                .update({ images: imagesInput })
                .eq('id', listingId);

            if (imagesUpdateError) {
                console.error('Images update error:', imagesUpdateError);
                return NextResponse.json({
                    error: 'Failed to update images',
                    details: imagesUpdateError.message
                }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Listing updated successfully', details: upsertResult });

    } catch (error) {
        console.error('Update listing error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 422 });
        }

        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: listingId } = await params;

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns the listing
        const { data: listing } = await supabase
            .from('listings')
            .select('seller_id')
            .eq('id', listingId)
            .single();

        if (!listing || (listing as any).seller_id !== user.id) {
            return NextResponse.json({
                error: 'Forbidden'
            }, { status: 403 });
        }

        // Delete listing (cascade will handle detail tables)
        const { error: deleteError } = await supabase
            .from('listings')
            .delete()
            .eq('id', listingId);

        if (deleteError) {
            console.error('Listing deletion error:', deleteError);
            return NextResponse.json({
                error: 'Failed to delete listing'
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Listing deleted successfully'
        });

    } catch (error) {
        console.error('Delete listing error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
