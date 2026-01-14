# Active Context: Resonant

## Current Work Focus

**Last Major Update:** 2025-11-17  
**Status:** Post-refactor, core features complete

### Recent Changes (2025-11-17)

Completed comprehensive system refactor implementing:

1. **Thomann Category System:** 3-level hierarchy with 200+ subcategories
2. **Kleinanzeigen UI/UX:** Green color scheme (#00A650), prominent search
3. **Fraud Detection:** Comprehensive scoring engine with risk levels
4. **Message Filtering:** Safety filters for contact info and links
5. **Trust Badge System:** Multi-dimensional trust scoring
6. **Database Migrations:** Passkey/MFA, categories, fraud detection support

### Current State

**What's Working:**
- Complete category system (Thomann-inspired)
- Fraud detection engine (scoring, flagging, recommendations)
- Trust badge calculation and display
- Message safety filtering
- Database schema with all security features
- Kleinanzeigen-style UI with green branding

**What's Next:**
- Frontend passkey implementation
- MFA UI components
- Enhanced admin dashboard for fraud review
- Image duplicate detection (perceptual hashing)
- Real-time notifications

## Active Decisions & Considerations

### Technical Decisions

1. **Category System:** Using Thomann's 3-level hierarchy for familiarity
2. **Color Scheme:** Kleinanzeigen green (#00A650) for brand recognition
3. **Fraud Detection:** Server-side scoring with client-side warnings
4. **Trust System:** Multi-factor scoring (verification, history, behavior)
5. **Message Safety:** Progressive disclosure (redact first, reveal after trust)

### Business Decisions

1. **Domain Restriction:** Strict enforcement of guitar-only equipment
2. **Trust First:** Verification required for selling, optional for browsing
3. **German Market:** All UI in German, DSGVO compliance mandatory
4. **Free Tier:** Basic accounts can browse, verified accounts can sell

### Open Questions

1. **Payment Integration:** When to add Stripe/escrow? (Phase 4)
2. **Premium Features:** What should premium accounts get?
3. **Store Accounts:** Requirements for professional sellers?
4. **Notifications:** Push vs email priority?
5. **Image Storage:** Current ImageKit setup sufficient?

## Next Steps (Immediate)

1. **Testing:** Comprehensive testing of fraud detection and trust system
2. **Passkey UI:** Implement WebAuthn registration/login flows
3. **MFA UI:** Build TOTP enrollment and verification components
4. **Admin Tools:** Dashboard for reviewing high-risk listings
5. **Documentation:** Update API docs, add user guides

## Active Files to Monitor

- `src/lib/security/fraudDetection.ts` - Fraud scoring logic
- `src/lib/utils/trustScore.ts` - Trust calculation
- `src/components/features/profile/TrustBadges.tsx` - Trust display
- `src/utils/thomann-categories.ts` - Category definitions
- `supabase/migrations/011_fraud_detection.sql` - Fraud schema

## Known Issues

- Passkey frontend not yet implemented (backend ready)
- MFA UI components missing (backend tracking ready)
- Image duplicate detection not implemented (framework ready)
- Admin review queue UI not built (database ready)

## Development Priorities

1. **High:** Passkey and MFA UI implementation
2. **High:** Admin dashboard for fraud review
3. **Medium:** Image duplicate detection
4. **Medium:** Real-time notifications
5. **Low:** Analytics dashboard
6. **Low:** Advanced search enhancements
