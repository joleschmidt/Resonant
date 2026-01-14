# Product Context: Resonant

## Why This Project Exists

### Problem Statement

German musicians buying and selling used guitar equipment face significant challenges on generic classifieds platforms:

1. **High Fraud Risk:** Constant scams, fake listings, phishing attempts
2. **Poor Categorization:** Generic categories don't fit guitar-specific needs
3. **Lack of Trust Signals:** Hard to verify seller credibility
4. **No Domain Expertise:** Platforms don't understand guitar equipment specifics
5. **Language Barriers:** Many platforms not optimized for German users

### Solution

Resonant provides a specialized, trust-focused marketplace that:

- **Eliminates Generic Noise:** Only guitar equipment allowed
- **Builds Trust:** Multi-level verification, trust badges, fraud detection
- **Understands the Domain:** Guitar-specific fields, brands, conditions
- **Speaks German:** Native German UI, DSGVO compliant
- **Prevents Scams:** Automated fraud detection, message filtering, safety warnings

## How It Should Work

### User Journey: Selling

1. **Registration:** Sign up with passkey (or fallback methods)
2. **Verification:** Verify email, optionally phone/identity
3. **Create Listing:** Use guitar-specific form with:
   - Brand, model, type, condition
   - Price validation (flags suspicious prices)
   - Image upload with validation
   - Location-based visibility
4. **Trust Building:** Earn trust badges through verification and good behavior
5. **Communication:** Receive messages through platform (filtered for safety)
6. **Transaction:** Complete sale, leave rating

### User Journey: Buying

1. **Browse:** Category navigation (Thomann-style), filters, search
2. **Discover:** See trust badges, seller ratings, account age
3. **Evaluate:** View detailed listing with fraud warnings if applicable
4. **Contact:** Message seller through platform (no external contact info initially)
5. **Verify:** Check seller's trust profile, transaction history
6. **Transact:** Complete purchase, leave rating

### Key User Experience Principles

1. **Familiarity:** Match Kleinanzeigen UX patterns users already know
2. **Transparency:** Show trust signals prominently
3. **Safety First:** Warnings, filters, and fraud detection visible
4. **Mobile First:** Optimized for mobile browsing
5. **Speed:** Fast loading, efficient navigation

## Core Features

### Implemented ✅

- **Authentication:** Passkey-ready infrastructure, MFA support, fallback methods
- **Listings:** Guitar-specific fields, Thomann categories, image upload
- **Search & Filter:** Category navigation, advanced filters, location-based
- **Messaging:** Direct messages with safety filtering
- **Profiles:** Trust badges, ratings, verification status
- **Fraud Detection:** Comprehensive scoring, automatic flagging
- **Trust System:** Multi-dimensional trust scoring

### Planned 🚧

- **Passkey UI:** Frontend WebAuthn flows
- **MFA UI:** TOTP enrollment components
- **Notifications:** Push/email notifications
- **Payments:** Stripe integration, escrow
- **Advanced Search:** Full-text search
- **Map Integration:** Location-based browsing

## User Protection Mechanisms

1. **Price Validation:** Flags suspiciously low/high prices
2. **Contact Info Detection:** Blocks phone/email in descriptions
3. **Message Filtering:** Redacts contact info, blocks external links initially
4. **Fraud Scoring:** Automatic risk assessment for listings
5. **Trust Badges:** Visual indicators of seller credibility
6. **Account Age Tracking:** Shows how long seller has been active
7. **Transaction History:** Visible ratings and sales count
8. **Report System:** Easy reporting of suspicious activity

## Success Metrics

- **Trust:** Low fraud rate, high user satisfaction
- **Engagement:** Active listings, completed transactions
- **Safety:** Low scam reports, high trust scores
- **Quality:** High-quality listings, relevant search results
- **Community:** Repeat users, positive ratings
