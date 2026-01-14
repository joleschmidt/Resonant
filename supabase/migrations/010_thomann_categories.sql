-- Migration: Thomann Category System
-- Implements 3-level hierarchy: Parent → Category → Subcategory
-- Based on thomann.de category structure

-- ============================================================================
-- 1. CREATE PARENT CATEGORY ENUM
-- ============================================================================

CREATE TYPE parent_category AS ENUM (
  'instruments',
  'amplifiers',
  'effects_accessories'
);

-- ============================================================================
-- 2. CREATE CATEGORY ENUM (Main Categories)
-- ============================================================================

CREATE TYPE category_type AS ENUM (
  -- Instruments
  'e_gitarren',
  'konzertgitarren',
  'westerngitarren',
  'e_baesse',
  'akustikbaesse',
  'ukulelen',
  'bluegrass',
  'travelgitarren',
  'sonstige_saiteninstrumente',
  -- Amplifiers
  'e_gitarren_verstaerker',
  'bassverstaerker',
  'akustikgitarren_verstaerker',
  -- Effects & Accessories
  'gitarren_bass_effekte',
  'pickups_tonabnehmer',
  'saiten',
  'ersatzteile',
  'zubehoer',
  'drahtlossysteme'
);

-- ============================================================================
-- 3. CREATE SUBCATEGORY ENUM (All Subcategories)
-- ============================================================================

CREATE TYPE subcategory_type AS ENUM (
  -- E-Gitarren subcategories
  'gitarrensets',
  'st_modelle',
  't_modelle',
  'single_cut',
  'double_cut',
  'hollowbody',
  'heavy_gitarren',
  'linkshaender_e_gitarren',
  'premium_instrumente',
  'jazz_modelle',
  'sieben_saiter',
  'acht_saiter',
  'fanfret',
  'headless',
  'zwoelf_saiter',
  'baritone_modelle',
  'shortscale',
  'midi_digital_modeling',
  'mit_akustik_tonabnehmer',
  'sonstige_bauarten',
  'signature_e_gitarren',
  
  -- Konzertgitarren subcategories
  'konzertgitarrensets',
  'konzertgitarre_4_4',
  'konzertgitarre_7_8',
  'konzertgitarre_3_4',
  'konzertgitarre_1_2',
  'konzertgitarre_1_4',
  'konzertgitarre_1_8',
  'flamenco_gitarren',
  'linkshaender_konzertgitarren',
  'premium_konzertgitarren',
  'konzertgitarren_mit_tonabnehmer',
  
  -- Westerngitarren subcategories
  'westerngitarrensets',
  'dreadnought',
  'grand_auditorium',
  'jumbo',
  'parlor_folk',
  'resonator_gitarren',
  'zwoelf_saiter_western',
  'linkshaender_westerngitarren',
  'premium_westerngitarren',
  'elektro_akustik_gitarren',
  'mini_westerngitarren',
  
  -- E-Bässe subcategories
  'basssets',
  'vier_saiter_baesse',
  'fuenf_saiter_baesse',
  'sechs_saiter_baesse',
  'fretless_baesse',
  'shortscale_baesse',
  'linkshaender_baesse',
  'premium_baesse',
  'signature_baesse',
  'multi_scale_baesse',
  'headless_baesse',
  
  -- Akustikbässe subcategories
  'akustikbass_mit_tonabnehmer',
  'akustikbass_ohne_tonabnehmer',
  'halbakustik_bass',
  
  -- Ukulelen subcategories
  'sopran_ukulele',
  'konzert_ukulele',
  'tenor_ukulele',
  'bariton_ukulele',
  'bass_ukulele',
  'banjo_ukulele',
  'elektro_ukulele',
  
  -- Bluegrass subcategories
  'banjos',
  'mandolinen',
  'dobros',
  'irish_bouzouki',
  
  -- Travelgitarren subcategories
  'travel_e_gitarren',
  'travel_akustikgitarren',
  'travel_konzertgitarren',
  
  -- Sonstige Saiteninstrumente
  'lauten',
  'sitar',
  'gamben',
  'harfen',
  'sonstige',
  
  -- E-Gitarren-Verstärker subcategories
  'combo_verstaerker',
  'topteil_verstaerker',
  'gitarrenboxen',
  'roehrenverstaerker',
  'transistorverstaerker',
  'modeling_verstaerker',
  'mini_verstaerker',
  'preamp_pedal',
  
  -- Bassverstärker subcategories
  'bass_combo',
  'bass_topteil',
  'bass_boxen',
  'bass_preamp',
  'bass_modeling',
  
  -- Akustikgitarren-Verstärker subcategories
  'akustik_combo',
  'akustik_preamp',
  'singer_songwriter_amp',
  
  -- Effekte subcategories
  'multieffekte',
  'verzerrer',
  'overdrive',
  'distortion',
  'fuzz',
  'boost',
  'delay',
  'reverb',
  'chorus',
  'flanger',
  'phaser',
  'tremolo',
  'vibrato',
  'wah_wah',
  'filter',
  'kompressor',
  'eq',
  'looper',
  'pitch_shifter',
  'harmonizer',
  'oktaver',
  'volume_pedal',
  'noise_gate',
  'pedalboards',
  'netzteil_effekte',
  
  -- Pickups subcategories
  'e_gitarren_pickups',
  'bass_pickups',
  'akustik_tonabnehmer',
  'piezo_tonabnehmer',
  
  -- Saiten subcategories
  'e_gitarren_saiten',
  'westerngitarren_saiten',
  'konzertgitarren_saiten',
  'bass_saiten',
  'ukulele_saiten',
  'banjo_saiten',
  'mandoline_saiten',
  
  -- Ersatzteile subcategories
  'mechaniken',
  'bruecken',
  'saetteln',
  'potis_schalter_knoepfe',
  'korpusse_bodys',
  'haelse_necks',
  'elektronik',
  'hardware',
  
  -- Zubehör subcategories
  'koffer_gigbags',
  'gurte_straps',
  'plektren',
  'kapodaster',
  'stimmgeraete',
  'saitenwickler',
  'gitarrenstaender',
  'pflegemittel',
  'kabel',
  'slides',
  'daempfer',
  
  -- Drahtlossysteme subcategories
  'digital_drahtlossysteme',
  'analog_drahtlossysteme',
  'mini_drahtlossysteme'
);

-- ============================================================================
-- 4. ADD NEW COLUMNS TO LISTINGS TABLE
-- ============================================================================

ALTER TABLE public.listings
  ADD COLUMN parent_category parent_category,
  ADD COLUMN category_new category_type,
  ADD COLUMN subcategory subcategory_type;

-- ============================================================================
-- 5. MIGRATE EXISTING DATA
-- Map old 'category' field to new Thomann structure
-- ============================================================================

-- Map 'guitars' → 'e_gitarren' (default)
UPDATE public.listings
SET 
  parent_category = 'instruments',
  category_new = 'e_gitarren'
WHERE category = 'guitars';

-- Map 'amps' → 'e_gitarren_verstaerker' (default)
UPDATE public.listings
SET 
  parent_category = 'amplifiers',
  category_new = 'e_gitarren_verstaerker'
WHERE category = 'amps';

-- Map 'effects' → 'gitarren_bass_effekte' (default)
UPDATE public.listings
SET 
  parent_category = 'effects_accessories',
  category_new = 'gitarren_bass_effekte'
WHERE category = 'effects';

-- ============================================================================
-- 6. RENAME OLD CATEGORY COLUMN & MAKE NEW ONES REQUIRED
-- ============================================================================

-- Rename old category column for backup
ALTER TABLE public.listings
  RENAME COLUMN category TO category_legacy;

-- Rename new column to 'category'
ALTER TABLE public.listings
  RENAME COLUMN category_new TO category;

-- Make new category columns NOT NULL now that data is migrated
ALTER TABLE public.listings
  ALTER COLUMN parent_category SET NOT NULL,
  ALTER COLUMN category SET NOT NULL;

-- Subcategory is optional (some listings might not have subcategory)

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_listings_parent_category ON public.listings(parent_category);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_subcategory ON public.listings(subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX idx_listings_category_subcategory ON public.listings(category, subcategory);

-- ============================================================================
-- 8. UPDATE RLS POLICIES (if needed)
-- No changes needed - existing RLS policies will work with new columns
-- ============================================================================

-- ============================================================================
-- 9. CREATE HELPER FUNCTION TO GET CATEGORY HIERARCHY
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_path(
  p_parent parent_category,
  p_category category_type,
  p_subcategory subcategory_type DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_subcategory IS NOT NULL THEN
    RETURN p_parent::text || ' > ' || p_category::text || ' > ' || p_subcategory::text;
  ELSE
    RETURN p_parent::text || ' > ' || p_category::text;
  END IF;
END;
$$;

-- ============================================================================
-- MIGRATION COMPLETE
-- Old 'category_legacy' column kept for rollback purposes
-- Can be dropped after verification
-- ============================================================================

COMMENT ON COLUMN public.listings.category_legacy IS 'Legacy category field - kept for rollback. Can be dropped after migration verification.';
COMMENT ON COLUMN public.listings.parent_category IS 'Thomann parent category (instruments, amplifiers, effects_accessories)';
COMMENT ON COLUMN public.listings.category IS 'Thomann main category (e.g., e_gitarren, westerngitarren)';
COMMENT ON COLUMN public.listings.subcategory IS 'Thomann subcategory (e.g., st_modelle, dreadnought) - optional';
