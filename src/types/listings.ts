/**
 * Listing Types for Multi-Category System
 * Supports Guitars, Amps, and Effects
 */

import type {
    ListingCategory,
    GuitarType,
    AmpType,
    EffectType,
    Condition,
    ListingStatus
} from '@/utils/constants';

// Base listing interface (common fields)
export interface BaseListing {
    id: string;
    seller_id: string;
    category: ListingCategory;

    // Basic Information
    title: string;
    description: string;
    slug: string | null;

    // Pricing
    price: number;
    original_price: number | null;
    price_negotiable: boolean;

    // Condition & Status
    condition: Condition;
    condition_notes: string | null;
    status: ListingStatus;

    // Location
    location_city: string;
    location_state: string | null;
    location_country: string;
    location_postal_code: string | null;

    // Shipping
    shipping_available: boolean;
    shipping_cost: number | null;
    shipping_methods: string[];
    pickup_available: boolean;

    // Media
    images: string[];
    videos: string[];

    // Additional Info
    case_included: boolean;
    accessories: string[];
    tags: string[];

    // Metrics
    views: number;
    favorites_count: number;
    inquiries_count: number;

    // Timestamps
    created_at: string;
    updated_at: string;
    published_at: string | null;
    sold_at: string | null;
    expires_at: string | null;
}

// Guitar-specific details
export interface GuitarDetails {
    listing_id: string;
    brand: string;
    model: string | null;
    series: string | null;
    year: number | null;
    country_of_origin: string | null;
    guitar_type: GuitarType;
    specifications: GuitarSpecifications;
    created_at: string;
    updated_at: string;
}

// Guitar specifications (flexible JSONB)
export interface GuitarSpecifications {
    body_type?: string;
    body_material?: string;
    neck_material?: string;
    fretboard_material?: string;
    number_of_frets?: number;
    scale_length?: number;
    pickup_configuration?: string;
    electronics?: string;
    hardware?: string;
    finish?: string;
    bridge_type?: string;
    tuners?: string;
    nut_material?: string;
    inlays?: string;
    binding?: string;
    [key: string]: any; // Allow additional specs
}

// Amp-specific details
export interface AmpDetails {
    listing_id: string;
    brand: string;
    model: string | null;
    series: string | null;
    year: number | null;
    country_of_origin: string | null;
    amp_type: AmpType;
    wattage: number | null;
    speaker_config: string | null;
    channels: number;
    effects_loop: boolean;
    reverb: boolean;
    headphone_out: boolean;
    specifications: AmpSpecifications;
    created_at: string;
    updated_at: string;
}

// Amp specifications (flexible JSONB)
export interface AmpSpecifications {
    tubes?: string;
    speakers?: string;
    controls?: string;
    inputs?: string;
    outputs?: string;
    effects_loop_type?: string;
    reverb_type?: string;
    power_amp?: string;
    preamp?: string;
    [key: string]: any; // Allow additional specs
}

// Effect-specific details
export interface EffectDetails {
    listing_id: string;
    brand: string;
    model: string | null;
    series: string | null;
    year: number | null;
    country_of_origin: string | null;
    effect_type: EffectType;
    true_bypass: boolean;
    power_supply: string | null;
    stereo: boolean;
    midi: boolean;
    expression_pedal: boolean;
    specifications: EffectSpecifications;
    created_at: string;
    updated_at: string;
}

// Effect specifications (flexible JSONB)
export interface EffectSpecifications {
    algorithms?: string;
    controls?: string;
    presets?: string;
    midi_implementation?: string;
    power_consumption?: string;
    dimensions?: string;
    [key: string]: any; // Allow additional specs
}

// Complete listing interfaces with details
export interface GuitarListing extends BaseListing {
    category: 'guitars';
    guitar_details: GuitarDetails;
}

export interface AmpListing extends BaseListing {
    category: 'amps';
    amp_details: AmpDetails;
}

export interface EffectListing extends BaseListing {
    category: 'effects';
    effect_details: EffectDetails;
}

// Union type for all listing types
export type ListingWithDetails = GuitarListing | AmpListing | EffectListing;

// Create listing request types
export interface CreateGuitarListingRequest {
    // Base fields
    title: string;
    description: string;
    price: number;
    original_price?: number;
    price_negotiable?: boolean;
    condition: Condition;
    condition_notes?: string;
    location_city: string;
    location_state?: string;
    location_postal_code?: string;
    shipping_available?: boolean;
    shipping_cost?: number;
    shipping_methods?: string[];
    pickup_available?: boolean;
    images: string[];
    videos?: string[];
    case_included?: boolean;
    accessories?: string[];
    tags?: string[];

    // Guitar-specific fields
    brand: string;
    model?: string;
    series?: string;
    year?: number;
    country_of_origin?: string;
    guitar_type: GuitarType;
    specifications?: GuitarSpecifications;
}

export interface CreateAmpListingRequest {
    // Base fields (same as guitar)
    title: string;
    description: string;
    price: number;
    original_price?: number;
    price_negotiable?: boolean;
    condition: Condition;
    condition_notes?: string;
    location_city: string;
    location_state?: string;
    location_postal_code?: string;
    shipping_available?: boolean;
    shipping_cost?: number;
    shipping_methods?: string[];
    pickup_available?: boolean;
    images: string[];
    videos?: string[];
    case_included?: boolean;
    accessories?: string[];
    tags?: string[];

    // Amp-specific fields
    brand: string;
    model?: string;
    series?: string;
    year?: number;
    country_of_origin?: string;
    amp_type: AmpType;
    wattage?: number;
    speaker_config?: string;
    channels?: number;
    effects_loop?: boolean;
    reverb?: boolean;
    headphone_out?: boolean;
    specifications?: AmpSpecifications;
}

export interface CreateEffectListingRequest {
    // Base fields (same as guitar)
    title: string;
    description: string;
    price: number;
    original_price?: number;
    price_negotiable?: boolean;
    condition: Condition;
    condition_notes?: string;
    location_city: string;
    location_state?: string;
    location_postal_code?: string;
    shipping_available?: boolean;
    shipping_cost?: number;
    shipping_methods?: string[];
    pickup_available?: boolean;
    images: string[];
    videos?: string[];
    case_included?: boolean;
    accessories?: string[];
    tags?: string[];

    // Effect-specific fields
    brand: string;
    model?: string;
    series?: string;
    year?: number;
    country_of_origin?: string;
    effect_type: EffectType;
    true_bypass?: boolean;
    power_supply?: string;
    stereo?: boolean;
    midi?: boolean;
    expression_pedal?: boolean;
    specifications?: EffectSpecifications;
}

// Union type for create requests
export type CreateListingRequest = CreateGuitarListingRequest | CreateAmpListingRequest | CreateEffectListingRequest;

// Update listing request (partial)
export interface UpdateListingRequest {
    title?: string;
    description?: string;
    price?: number;
    original_price?: number;
    price_negotiable?: boolean;
    condition?: Condition;
    condition_notes?: string;
    status?: ListingStatus;
    location_city?: string;
    location_state?: string;
    location_postal_code?: string;
    shipping_available?: boolean;
    shipping_cost?: number;
    shipping_methods?: string[];
    pickup_available?: boolean;
    images?: string[];
    videos?: string[];
    case_included?: boolean;
    accessories?: string[];
    tags?: string[];
}

// Search and filter types
export interface ListingFilters {
    category?: ListingCategory;
    search?: string;
    price_min?: number;
    price_max?: number;
    condition?: Condition[];
    location_city?: string;
    brand?: string[];
    guitar_type?: GuitarType[];
    amp_type?: AmpType[];
    effect_type?: EffectType[];
    year_min?: number;
    year_max?: number;
    shipping_available?: boolean;
    pickup_available?: boolean;
}

export interface ListingSort {
    field: 'created_at' | 'price' | 'title' | 'views';
    direction: 'asc' | 'desc';
}

// API response types
export interface ListingsResponse {
    data: ListingWithDetails[];
    pagination: {
        page: number;
        limit: number;
        total_pages: number;
        total_count: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface ListingResponse {
    data: ListingWithDetails;
}

// Image upload types
export interface ImageUploadResponse {
    url: string;
    filename: string;
    size: number;
    mime_type: string;
}

export interface ImageUploadRequest {
    file: File;
    listing_id?: string;
    compress?: boolean;
    max_width?: number;
    max_height?: number;
    quality?: number;
}
