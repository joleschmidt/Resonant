# Resonant Development Notes

## Auth Strategy (v2.0)

### Primary Login: Passkeys (WebAuthn)
- Device-bound authentication via Supabase Auth
- No passwords required
- Backed by platform authenticators (Face ID, Touch ID, Windows Hello, etc.)

### MFA: Supabase TOTP
- Required for sensitive actions:
  - Changing payout details
  - High-value transactions (>€1000)
  - Security settings changes
- Optional at login based on user risk score

### Fallback Methods
1. **SMS OTP** – for devices without passkey support
2. **Email Magic Link** – for users without SMS access

### Implementation Priority
1. Set up Supabase Auth with WebAuthn support
2. Implement passkey enrollment flow
3. Add TOTP MFA for sensitive actions
4. Build fallback flows (SMS, magic link)
5. Add risk-based MFA prompts

---

## Anti-Scam Features

### Red Flags to Detect
- Price unrealistically low for brand/condition
- New account with high-value listings
- Duplicate images from other listings
- Contact info in description
- Requests for off-platform payment
- Location changes frequently

### UI Warnings
- "⚠️ Zahle niemals per Vorkasse an unbekannte Personen"
- "Preis ungewöhnlich niedrig – sei vorsichtig!"
- Auto-redact phone numbers until mutual agreement
- Block external links in first 3 messages

---

## Next Steps
- [ ] Implement passkey registration flow
- [ ] Add TOTP setup for existing users
- [ ] Build fraud detection heuristics
- [ ] Create anti-scam UI warnings
- [ ] Add reporting flows for suspicious activity