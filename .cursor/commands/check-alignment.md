# check-alignment

---
name: Check Schema Alignment (Thomann/Kleinanzeigen)
description: Verify data structure and business logic align with Thomann category system and Kleinanzeigen marketplace schema
---

# Schema Alignment Check - Reference Platforms

## ⚠️ CRITICAL NAMING RULE
**DO NOT use "Kleinanzeigen" or "Thomann" in code:**
- ❌ File names: `thomann-categories.ts`, `listings-thomann.ts`
- ❌ Function names: `getThomannCategory()`, `validateKleinanzeigenListing()`
- ❌ Variable names: `thomannTree`, `kleinanzeigenStyle`
- ❌ Object names: `THOMANN_CATEGORY_TREE`, `KLEINANZEIGEN_CONFIG`
- ❌ Component names: `ThomannSidebar`, `KleinanzeigenCard`

**DO use as reference only:**
- ✅ Comments: `// Based on thomann.de category structure`
- ✅ Documentation: `// Inspired by Kleinanzeigen marketplace design`
- ✅ Internal notes: `// Reference: Thomann 3-level hierarchy`

**Correct naming examples:**
- ✅ `category-tree.ts` (not `thomann-categories.ts`)
- ✅ `getCategoryTree()` (not `getThomannCategoryTree()`)
- ✅ `CATEGORY_TREE` (not `THOMANN_CATEGORY_TREE`)
- ✅ `marketplace-style` (not `kleinanzeigen-style`)

---

## Alignment Goals
**Reference Platform 1:** 3-level category hierarchy, professional product organization, brand tiers  
**Reference Platform 2:** Simple marketplace structure, location-based, functional listings

---

## 1. Category System Alignment

### Category Structure (3-Level Hierarchy)
- [ ] **Parent Categories**
  - [ ] `instruments` (Instrumente) exists
  - [ ] `amplifiers` (Verstärker) exists
  - [ ] `effects_accessories` (Effekte & Zubehör) exists
  - [ ] No other parent categories (only these 3)

- [ ] **Category Level (Level 2)**
  - [ ] Instruments categories match reference structure:
    - [ ] `e_gitarren` (E-Gitarren)
    - [ ] `konzertgitarren` (Konzertgitarren)
    - [ ] `westerngitarren` (Westerngitarren)
    - [ ] `e_baesse` (E-Bässe)
    - [ ] `akustikbaesse` (Akustische Bässe)
    - [ ] `ukulelen` (Ukulelen)
    - [ ] `bluegrass` (Bluegrass Instrumente)
    - [ ] `travelgitarren` (Travelgitarren)
    - [ ] `sonstige_saiteninstrumente` (Sonstige Saiteninstrumente)
  - [ ] Amplifier categories match reference structure:
    - [ ] `e_gitarren_verstaerker` (E-Gitarren-Verstärker)
    - [ ] `bassverstaerker` (Bassverstärker)
    - [ ] `akustikgitarren_verstaerker` (Akustikgitarren-Verstärker)
  - [ ] Effects & Accessories categories match reference structure:
    - [ ] `gitarren_bass_effekte` (Gitarren- und Bass-Effekte)
    - [ ] `pickups_tonabnehmer` (Pickups und Tonabnehmer)
    - [ ] `saiten` (Saiten)
    - [ ] `ersatzteile` (Ersatzteile)
    - [ ] `zubehoer` (Zubehör)
    - [ ] `drahtlossysteme` (Drahtlossysteme)

- [ ] **Subcategory Level (Level 3)**
  - [ ] E-Gitarren subcategories match reference (e.g., `st_modelle`, `t_modelle`, `single_cut`, `hollowbody`, etc.)
  - [ ] Westerngitarren subcategories match reference (e.g., `dreadnought`, `grand_auditorium`, `jumbo`, etc.)
  - [ ] All major categories have proper subcategories
  - [ ] Subcategories are properly linked to parent categories

- [ ] **Category Tree Implementation**
  - [ ] Category tree constant is complete (reference: professional music retailer)
  - [ ] Category IDs match reference structure
  - [ ] German labels (`nameDE`) are correct
  - [ ] Parent-child relationships are correct
  - [ ] Helper functions work (`getCategoryName`, `getSubcategories`, `getCategoriesByParent`)

### Legacy Category Migration
- [ ] **Deprecation Check**
  - [ ] Legacy `listing_category` enum (`guitars`, `amps`, `effects`) is marked as deprecated
  - [ ] New listings use 3-level system
  - [ ] Migration path exists for old listings
  - [ ] Database schema supports both (during migration)

---

## 2. Database Schema Alignment

### Listing Table Structure
- [ ] **Core Fields (Marketplace Style)**
  - [ ] `title` (10-100 chars) - matches reference marketplace
  - [ ] `description` (50-2000 chars) - matches reference marketplace
  - [ ] `price` (50-50000 EUR) - matches reference marketplace range
  - [ ] `price_negotiable` (boolean) - "VB" (Verhandlungsbasis) feature
  - [ ] `condition` (enum: mint, excellent, very_good, good, fair, poor, for_parts)
  - [ ] `status` (draft, active, pending, sold, expired, removed, reported)

- [ ] **Location Fields (Marketplace Style)**
  - [ ] `location_city` (required) - matches reference marketplace
  - [ ] `location_postal_code` (5 digits, German PLZ format)
  - [ ] `location_state` (optional, Bundesland)
  - [ ] `location_country` (default: 'DE')
  - [ ] Location-based search/filtering works

- [ ] **Shipping (Marketplace Style)**
  - [ ] `shipping_available` (boolean)
  - [ ] `shipping_cost` (0-500 EUR)
  - [ ] `pickup_available` (boolean) - "Abholung" feature
  - [ ] `shipping_methods` (array)

- [ ] **Media (Both Reference Platforms)**
  - [ ] `images` (array, 1-10 images)
  - [ ] `videos` (array, 0-3 videos)
  - [ ] Image URLs are valid

- [ ] **Category Fields (3-Level System)**
  - [ ] `parent_category` (instruments, amplifiers, effects_accessories)
  - [ ] `category` (level 2 category ID)
  - [ ] `subcategory` (level 3 category ID, optional)
  - [ ] Category validation matches reference structure

### Detail Tables (Product Organization Style)
- [ ] **Guitars Detail Table**
  - [ ] `brand` (required) - matches brand system
  - [ ] `model` (required)
  - [ ] `series` (optional)
  - [ ] `year` (1900-2030)
  - [ ] `guitar_type` (enum matches reference types)
  - [ ] `specifications` (JSONB for flexible specs)
  - [ ] Common specs: body_type, body_material, neck_material, pickup_configuration

- [ ] **Amps Detail Table**
  - [ ] `brand` (required)
  - [ ] `model` (required)
  - [ ] `amp_type` (enum: tube, solid_state, hybrid, modeling, combo, head, cabinet)
  - [ ] `specifications` (JSONB: wattage, channels, effects, etc.)

- [ ] **Effects Detail Table**
  - [ ] `brand` (required)
  - [ ] `model` (required)
  - [ ] `effect_type` (enum matches reference effect types)
  - [ ] `specifications` (JSONB: bypass, power, etc.)

---

## 3. Brand System Alignment

### Brand Tiers
- [ ] **Guitar Brands**
  - [ ] Tier 1: Fender, Gibson, Martin, Taylor
  - [ ] Tier 2: Ibanez, ESP, Yamaha, PRS
  - [ ] Tier 3: Epiphone, Squier, Jackson, Schecter
  - [ ] Brand validation uses tier system
  - [ ] Price validation considers brand tier

- [ ] **Amp Brands**
  - [ ] Tier 1: Marshall, Fender, Vox, Orange, Mesa Boogie
  - [ ] Tier 2: Peavey, Laney, Blackstar, Boss, Roland
  - [ ] Tier 3: Line 6, Hughes & Kettner, Engl, Diezel, Bogner

- [ ] **Effect Brands**
  - [ ] Tier 1: Boss, TC Electronic, Strymon, Eventide, Line 6
  - [ ] Tier 2: Electro-Harmonix, MXR, Dunlop, DigiTech, Zoom
  - [ ] Tier 3: Behringer, Donner, Joyo, Mooer, Hotone

- [ ] **Brand Validation**
  - [ ] Brand is required for all listings
  - [ ] Brand matches category (guitar brands for guitars, etc.)
  - [ ] Brand validation prevents invalid brands
  - [ ] Price validation considers brand tier (Tier 1 + low price = warning)

---

## 4. Pricing & Condition Alignment

### Pricing Rules (Reference Platforms)
- [ ] **Price Range**
  - [ ] Minimum: 50 EUR (matches reference marketplace minimum)
  - [ ] Maximum: 50,000 EUR (reasonable max)
  - [ ] Suspicious low: < 100 EUR (flag for review)
  - [ ] Suspicious high: > 20,000 EUR (flag for review)
  - [ ] Currency: EUR only (German market)

- [ ] **Price Features (Marketplace Style)**
  - [ ] `price_negotiable` flag (VB - Verhandlungsbasis)
  - [ ] `original_price` for comparison
  - [ ] Price formatting: German format (€1.234,56)

- [ ] **Price Validation**
  - [ ] Price validation considers brand tier
  - [ ] Suspicious prices flagged for review
  - [ ] Price must be multiple of 0.01 (cent precision)

### Condition System (Reference Platforms)
- [ ] **Condition Hierarchy**
  - [ ] `mint` - Neuwertig (like new)
  - [ ] `excellent` - Sehr gut (minimal wear)
  - [ ] `very_good` - Gut (light wear)
  - [ ] `good` - Befriedigend (moderate wear)
  - [ ] `fair` - Ausreichend (significant wear)
  - [ ] `poor` - Mangelhaft (major issues)
  - [ ] `for_parts` - Ersatzteile (parts only)
  - [ ] Condition labels are in German
  - [ ] Condition validation matches this hierarchy

---

## 5. Location & Shipping (Marketplace Style)

### Location System
- [ ] **German Location Format**
  - [ ] City is required (matches reference marketplace)
  - [ ] Postal code is 5 digits (German PLZ format)
  - [ ] State/Bundesland is optional
  - [ ] Country defaults to 'DE'
  - [ ] Location search works by city/postal code

- [ ] **Location Features**
  - [ ] Distance-based search (radius in km)
  - [ ] Location filtering in search
  - [ ] Location displayed on listings
  - [ ] Map integration (if implemented)

### Shipping Options (Marketplace Style)
- [ ] **Shipping Features**
  - [ ] `shipping_available` flag
  - [ ] `shipping_cost` (0-500 EUR)
  - [ ] `pickup_available` flag (Abholung)
  - [ ] Shipping methods array
  - [ ] Both options can be true (ship OR pickup)

---

## 6. Search & Filter Alignment

### Search Features (Reference Platforms)
- [ ] **Search Functionality**
  - [ ] Full-text search on title, description
  - [ ] Search by brand, model
  - [ ] Search by category/subcategory
  - [ ] Search results sorted by relevance
  - [ ] German text search works (Umlauts)

### Filter System (3-Level Category Style)
- [ ] **Category Filters**
  - [ ] Filter by parent category
  - [ ] Filter by category (level 2)
  - [ ] Filter by subcategory (level 3)
  - [ ] Category sidebar matches reference structure

- [ ] **Other Filters (Reference Platforms)**
  - [ ] Price range (min/max)
  - [ ] Condition (multiple selection)
  - [ ] Location (city, postal code, radius)
  - [ ] Brand (multiple selection)
  - [ ] Year range (min/max)
  - [ ] Shipping available
  - [ ] Pickup available

- [ ] **Sort Options**
  - [ ] Newest first
  - [ ] Price ascending/descending
  - [ ] Distance (if location provided)
  - [ ] Relevance (search results)

---

## 7. Validation Schema Alignment

### Zod Validation (3-Level Categories)
- [ ] **Base Listing Schema**
  - [ ] Uses `parent_category` enum (3 values)
  - [ ] `category` is string (validated against category tree)
  - [ ] `subcategory` is optional string
  - [ ] Brand validation uses brand tiers
  - [ ] Price validation includes suspicious detection

- [ ] **Category Validation**
  - [ ] Category must exist in category tree
  - [ ] Subcategory must belong to parent category
  - [ ] Parent category must match category's parent
  - [ ] Validation errors are in German

- [ ] **Filter Schema**
  - [ ] Supports parent_category, category, subcategory
  - [ ] Price min/max validation
  - [ ] Location filters (city, postal code, radius)
  - [ ] Condition array validation
  - [ ] Brand array validation

---

## 8. UI Component Alignment

### Category Navigation (3-Level Style)
- [ ] **Category Sidebar**
  - [ ] Shows 3-level hierarchy
  - [ ] Parent categories at top level
  - [ ] Categories expand to show subcategories
  - [ ] Active category is highlighted
  - [ ] Matches reference category navigation structure

- [ ] **Category Display**
  - [ ] Category names are in German
  - [ ] Category breadcrumbs show hierarchy
  - [ ] Category pills/filters use German names

### Listing Display (Marketplace Style)
- [ ] **Listing Cards**
  - [ ] Show title, price, location (marketplace style)
  - [ ] Show condition badge
  - [ ] Show shipping/pickup availability
  - [ ] Show seller info
  - [ ] Price formatting: German format (€1.234,56)

- [ ] **Listing Detail**
  - [ ] All core fields displayed
  - [ ] Location prominently displayed
  - [ ] Shipping/pickup options clear
  - [ ] Category breadcrumb shows hierarchy
  - [ ] Brand and model prominently displayed

---

## 9. Data Consistency Checks

### Category Consistency
- [ ] **Category Usage**
  - [ ] All listings have valid parent_category
  - [ ] All listings have valid category (exists in category tree)
  - [ ] Subcategory (if provided) belongs to category
  - [ ] No orphaned categories
  - [ ] No listings with legacy categories (unless migrating)

### Brand Consistency
- [ ] **Brand Usage**
  - [ ] Brand matches category (guitar brands for guitars)
  - [ ] Brand is in appropriate tier list
  - [ ] Brand validation prevents invalid brands
  - [ ] Brand names are consistent (no typos)

### Location Consistency
- [ ] **Location Data**
  - [ ] All listings have location_city
  - [ ] Postal codes are valid German format (5 digits)
  - [ ] Country is 'DE' (or valid if international)
  - [ ] Location data is searchable

---

## 10. Migration & Compatibility

### Legacy Support
- [ ] **Migration Path**
  - [ ] Legacy `listing_category` enum still works (during migration)
  - [ ] Migration script exists to convert old categories
  - [ ] New listings use 3-level system
  - [ ] Old listings can be migrated

### Backward Compatibility
- [ ] **API Compatibility**
  - [ ] API accepts both old and new category formats
  - [ ] API returns consistent category structure
  - [ ] Frontend handles both formats (during migration)
  - [ ] No breaking changes for existing listings

---

## 11. Business Logic Alignment

### Marketplace Features
- [ ] **Core Marketplace Features**
  - [ ] Price negotiable (VB) flag
  - [ ] Location-based search
  - [ ] Pickup available option
  - [ ] Simple listing structure
  - [ ] User-to-user messaging
  - [ ] Favorites/watchlist

### Product Organization Features
- [ ] **Product Organization**
  - [ ] 3-level category hierarchy
  - [ ] Brand tier system
  - [ ] Detailed specifications (JSONB)
  - [ ] Professional product display
  - [ ] Category-based navigation

---

## Quick Alignment Checklist

### Category System Alignment
- [ ] Category system matches reference structure
- [ ] 3-level hierarchy (Parent → Category → Subcategory)
- [ ] Brand tiers are implemented
- [ ] Category tree is complete
- [ ] German labels are correct

### Marketplace Alignment
- [ ] Simple listing structure
- [ ] Location-based (city, postal code)
- [ ] Price negotiable (VB) feature
- [ ] Shipping/pickup options
- [ ] Functional, no-nonsense approach

### Combined Alignment
- [ ] 3-level categories + marketplace simplicity
- [ ] Professional organization + functional marketplace
- [ ] Detailed specs + simple listing flow
- [ ] Brand system + location-based search

---

## Code Naming Violations to Fix

### Files to Rename
- [ ] `thomann-categories.ts` → `category-tree.ts` or `categories.ts`
- [ ] `listings-thomann.ts` → `listings-validation.ts` or `listings-schema.ts`

### Constants to Rename
- [ ] `THOMANN_CATEGORY_TREE` → `CATEGORY_TREE`
- [ ] Any other constants with platform names

### Functions to Rename
- [ ] Any functions with platform names in them
- [ ] Update all references after renaming

### Comments (OK to Keep)
- [ ] Comments can reference platforms for context
- [ ] Documentation can mention reference platforms
- [ ] Internal notes can reference platforms

---

## Reporting Schema Issues

When reporting schema misalignment:
1. **Category:** Which category system (3-level/Marketplace/Both)
2. **Field/Structure:** Which field or structure is misaligned
3. **Expected:** What it should be (reference: professional music retailer or marketplace)
4. **Actual:** What it currently is
5. **Impact:** What breaks or doesn't work correctly
6. **Fix:** How to align it properly
7. **Naming:** Check if any code uses platform names (should be removed)