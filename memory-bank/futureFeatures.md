# Future Features: Resonant

## Feature Backlog

### High Priority Features

#### 1. Passkey UI Implementation
**Status:** Backend Ready, UI Pending  
**Priority:** High  
**Impact:** User Experience, Security

**Description:**
Complete the frontend implementation for WebAuthn passkey authentication. Users should be able to register and login using biometric authentication (Face ID, Touch ID, Windows Hello).

**Technical Considerations:**
- Use WebAuthn API
- Integrate with Supabase Auth passkey support
- Fallback to other methods if passkey unavailable
- Clear error messages for unsupported devices

**Related Components:**
- `src/components/features/auth/LoginForm.tsx`
- `src/components/features/auth/SignupForm.tsx`
- `src/app/actions/auth.ts`

**Estimated Effort:** 2-3 days

---

#### 2. MFA UI Components
**Status:** Backend Ready, UI Pending  
**Priority:** High  
**Impact:** Security

**Description:**
Build UI components for TOTP MFA enrollment and verification. Required for sensitive actions like changing payout details or high-value transactions.

**Technical Considerations:**
- QR code generation for TOTP setup
- Verification flow for sensitive actions
- Clear instructions for users
- Backup codes generation

**Related Components:**
- `src/components/features/auth/` (new MFA components)
- `src/app/settings/page.tsx`
- `src/app/actions/auth.ts`

**Estimated Effort:** 2-3 days

---

#### 3. Admin Dashboard for Fraud Review
**Status:** Database Ready, UI Pending  
**Priority:** High  
**Impact:** Trust & Safety

**Description:**
Build admin interface to review high-risk listings flagged by fraud detection system. Admins should be able to approve, reject, or request more information.

**Technical Considerations:**
- Admin-only access control
- Review queue with filters
- Bulk actions
- Audit trail for admin actions
- Integration with fraud scoring system

**Related Components:**
- `src/app/admin/` (new admin routes)
- `src/components/features/admin/` (new admin components)
- `src/lib/security/fraudDetection.ts`

**Estimated Effort:** 4-5 days

---

#### 4. Push & Email Notifications
**Status:** Infrastructure Ready, Delivery Pending  
**Priority:** High  
**Impact:** User Engagement

**Description:**
Implement notification system for new messages, listing updates, transaction status changes, and important account events.

**Technical Considerations:**
- Service workers for push notifications
- Email templates (German)
- Notification preferences per user
- Rate limiting for notifications
- Unsubscribe handling

**Related Components:**
- `src/app/api/notifications/` (new API routes)
- `src/components/features/notifications/` (new components)
- Service worker implementation

**Estimated Effort:** 5-7 days

---

#### 5. Payment Integration (Stripe)
**Status:** Not Started  
**Priority:** High  
**Impact:** Business Model, Trust

**Description:**
Integrate Stripe for secure payments with escrow functionality. Hold funds until transaction is confirmed by both parties.

**Technical Considerations:**
- Stripe Connect for marketplace
- Escrow account setup
- Payment flow UI
- Dispute resolution
- Refund handling
- German payment methods (SEPA, etc.)

**Related Components:**
- `src/app/api/payments/` (new API routes)
- `src/components/features/transactions/PaymentModal.tsx`
- `src/lib/payments/` (new payment utilities)

**Estimated Effort:** 10-14 days

---

### Medium Priority Features

#### 6. Image Duplicate Detection
**Status:** Framework Ready, Implementation Pending  
**Priority:** Medium  
**Impact:** Fraud Prevention

**Description:**
Implement perceptual hashing to detect duplicate images across listings. Flag potential scams using stolen images.

**Technical Considerations:**
- Perceptual hashing algorithm (pHash, dHash)
- Image processing on upload
- Database storage of hashes
- Comparison on listing creation
- Performance optimization for large image sets

**Related Components:**
- `src/lib/security/fraudDetection.ts`
- `src/app/api/upload/listing-images/route.ts`
- Image processing utilities

**Estimated Effort:** 3-4 days

---

#### 7. Advanced Search with Full-Text
**Status:** Not Started  
**Priority:** Medium  
**Impact:** User Experience

**Description:**
Implement PostgreSQL full-text search for better listing discovery. Support searching in titles, descriptions, and guitar-specific fields.

**Technical Considerations:**
- PostgreSQL tsvector/tsquery
- Search index creation
- Ranking algorithm
- Autocomplete suggestions
- Search history

**Related Components:**
- `src/app/api/search/` (new API routes)
- `src/components/features/listings/SearchBar.tsx`
- Database search functions

**Estimated Effort:** 4-5 days

---

#### 8. Map Integration & Location Browsing
**Status:** Not Started  
**Priority:** Medium  
**Impact:** User Experience

**Description:**
Add map view for listings with radius search. Users can browse listings on a map and filter by distance.

**Technical Considerations:**
- Map library (Leaflet or Mapbox)
- Geocoding for addresses
- Radius search queries
- Privacy considerations (approximate locations)
- Performance for large datasets

**Related Components:**
- `src/components/features/listings/MapView.tsx`
- `src/app/listings/map/page.tsx`
- Location utilities

**Estimated Effort:** 5-6 days

---

#### 9. Analytics Dashboard
**Status:** Not Started  
**Priority:** Medium  
**Impact:** Business Intelligence

**Description:**
Build analytics dashboard showing fraud statistics, trust metrics, listing trends, and platform health.

**Technical Considerations:**
- Data aggregation queries
- Chart library (recharts or similar)
- Real-time updates
- Admin-only access
- Privacy-compliant analytics

**Related Components:**
- `src/app/admin/analytics/page.tsx`
- `src/components/features/admin/AnalyticsDashboard.tsx`
- Analytics utilities

**Estimated Effort:** 5-7 days

---

#### 10. Saved Searches & Alerts
**Status:** Not Started  
**Priority:** Medium  
**Impact:** User Engagement

**Description:**
Allow users to save search criteria and receive notifications when new matching listings are posted.

**Technical Considerations:**
- Saved search storage
- Background job for matching
- Notification delivery
- Search result caching
- User preferences

**Related Components:**
- `src/app/api/saved-searches/` (new API routes)
- `src/components/features/listings/SavedSearches.tsx`
- Background job system

**Estimated Effort:** 4-5 days

---

### Low Priority Features

#### 11. Listing Card Redesign
**Status:** Not Started  
**Priority:** Low  
**Impact:** UI/UX

**Description:**
Redesign listing cards to be more compact and match Kleinanzeigen's style more closely.

**Estimated Effort:** 2-3 days

---

#### 12. User Onboarding
**Status:** Not Started  
**Priority:** Low  
**Impact:** User Experience

**Description:**
Create guided tour for new users explaining key features and trust signals.

**Estimated Effort:** 2-3 days

---

#### 13. Help Center & FAQ
**Status:** Not Started  
**Priority:** Low  
**Impact:** User Support

**Description:**
Build help center with FAQ, guides, and support documentation in German.

**Estimated Effort:** 3-4 days

---

#### 14. Social Features
**Status:** Not Started  
**Priority:** Low  
**Impact:** Community Building

**Description:**
Add ability to follow users, share listings, and build a community around gear.

**Estimated Effort:** 5-7 days

---

#### 15. Data Export (DSGVO)
**Status:** Not Started  
**Priority:** Low  
**Impact:** Compliance

**Description:**
Allow users to export all their data in a DSGVO-compliant format.

**Estimated Effort:** 2-3 days

---

## Feature Status Legend

- **Not Started:** Feature not yet implemented
- **Backend Ready:** Database/API ready, UI pending
- **UI Pending:** Backend complete, frontend needed
- **In Progress:** Currently being worked on
- **Testing:** Implementation complete, testing phase
- **Completed:** Feature fully implemented and deployed

## Prioritization Criteria

1. **Security Impact:** Features that improve trust and safety
2. **User Experience:** Features that significantly improve UX
3. **Business Value:** Features that drive revenue or engagement
4. **Technical Debt:** Features that complete existing infrastructure
5. **Community:** Features that build community and retention

## Implementation Notes

- Always check existing infrastructure before building new features
- Many features have partial implementations (backend ready, UI pending)
- Prioritize completing existing infrastructure over new features
- Consider user feedback when prioritizing
- Security features should always be high priority
