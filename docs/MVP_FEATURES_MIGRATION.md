# MVP Critical Features - Migration Guide

## Overview
This document outlines the new MVP features implemented and the required database migrations.

## What's New

### 1. Messaging System ✅
- **Direct messaging** between buyers and sellers
- **Conversation threads** with listing context
- **Real-time message updates** (5-second polling)
- **Unread message indicators**
- **Inbox page** at `/messages`

### 2. Follow System ✅
- **Follow/unfollow users** with optimistic UI updates
- **Follower/following counts** displayed on profiles
- **Public follow status** visible to all users

### 3. Transaction & Rating System ✅
- **"Sofort kaufen"** creates pending transactions
- **Transaction completion** triggers stat updates
- **Rating system** for completed transactions (1-5 stars + comment)
- **Automatic seller rating calculation** via database trigger

### 4. Real User Stats ✅
- **Seller rating** (auto-calculated from ratings)
- **Total sales** (incremented on completed transactions)
- **Total purchases** (incremented on completed transactions)
- **Follower count** (real-time from followers table)

## Database Migrations

### Required Migrations (Run in Order)

#### 1. Messaging System
```bash
# Run in Supabase SQL Editor:
supabase/migrations/005_messaging.sql
```

**Tables Created:**
- `conversations` - Message threads
- `conversation_participants` - Users in conversations
- `messages` - Individual messages

**Features:**
- RLS policies ensure users only see their own messages
- Trigger updates conversation timestamp on new messages

#### 2. Followers System
```bash
# Run in Supabase SQL Editor:
supabase/migrations/006_followers.sql
```

**Tables Created:**
- `followers` - Follow relationships

**Features:**
- Composite primary key prevents duplicate follows
- Helper functions for follower/following counts
- Self-follow constraint

#### 3. Stats, Ratings & Transactions
```bash
# Run in Supabase SQL Editor:
supabase/migrations/007_stats_and_ratings.sql
```

**Tables Created:**
- `transactions` - Purchase transactions
- `ratings` - User ratings

**Features:**
- Trigger auto-updates `profiles.seller_rating` on new rating
- Trigger increments `total_sales`/`total_purchases` on transaction completion
- Trigger marks listing as sold when transaction completes

## New API Endpoints

### Messaging
- `POST /api/messages` - Send message (creates conversation if needed)
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/[id]` - Get conversation messages

### Following
- `GET /api/profile/[username]/follow` - Get follow status + counts
- `POST /api/profile/[username]/follow` - Follow user
- `DELETE /api/profile/[username]/follow` - Unfollow user

### Transactions
- `POST /api/transactions/create` - Create transaction (buy now)
- `PATCH /api/transactions/[id]/complete` - Mark transaction completed

### Ratings
- `POST /api/ratings` - Submit rating for completed transaction
- `GET /api/ratings?userId=[id]` - Get user's received ratings

## UI Components Added

### Messaging
- `MessageModal` - Send message dialog (used in listing detail + profiles)
- `ConversationList` - Inbox view with unread indicators
- `MessageThread` - Chat interface with real-time updates

### Transactions
- `BuyNowModal` - Proper transaction creation flow
- `RatingModal` - Post-transaction rating form

### Profile Enhancements
- Follow button enabled in `UserProfileHeader`
- Real follower counts in `UserStatsStrip`
- Message button in profile header

## Breaking Changes

### UserStatsStrip Props
**Before:**
```tsx
<UserStatsStrip rating={5} sales={10} />
```

**After:**
```tsx
<UserStatsStrip 
  userId="uuid" 
  username="johndoe"
  rating={5} 
  sales={10} 
/>
```

### UserProfileHeader
Now requires `'use client'` directive - component is now client-side for follow functionality.

## Testing Checklist

### Messaging
- [ ] Send message from listing detail page
- [ ] Send message from user profile
- [ ] View conversations in inbox
- [ ] See unread message count
- [ ] Messages appear in conversation thread
- [ ] Messages auto-update (wait 5+ seconds)

### Following
- [ ] Follow user from profile
- [ ] Unfollow user from profile
- [ ] Follower count updates immediately
- [ ] Following count displayed correctly
- [ ] Cannot follow yourself

### Transactions
- [ ] Click "Sofort kaufen" on listing
- [ ] Transaction creates successfully
- [ ] Listing marked as sold after completion
- [ ] Stats increment for buyer and seller

### Ratings
- [ ] Submit rating after completed transaction
- [ ] Rating appears in user's rating list
- [ ] Seller rating auto-calculates
- [ ] Cannot rate same transaction twice
- [ ] Cannot rate yourself

## Next Steps (Post-MVP)

### Recommended Improvements
1. **WebSocket messaging** - Replace polling with real-time updates
2. **Payment integration** - Stripe/PayPal for actual payments
3. **Email notifications** - Notify on new messages/transactions
4. **Push notifications** - Mobile/desktop notifications
5. **Transaction disputes** - Dispute resolution flow
6. **Advanced search** - Filter users by rating, sales, etc.
7. **Reporting system** - Report inappropriate messages/users
8. **Profile completion modal** - Force username on first login
9. **Cover images** - Enable profile cover photos
10. **Message attachments** - Send images in messages

### Optional Enhancements
- Typing indicators in messages
- Message read receipts (already tracked, not displayed)
- Block/mute users
- Follow/unfollow notifications
- Transaction history page
- Rating breakdown (5-star distribution)
- Message search
- Archive conversations

## Deployment Notes

### Environment Variables
No new environment variables required. Uses existing Supabase config.

### Database Indexes
All necessary indexes are created by migrations. Performance is optimized for:
- Message thread loading
- Conversation list
- Follow status checks
- Rating calculations

### RLS Security
All tables use Row Level Security:
- Users can only see their own messages
- Anyone can view public follow data
- Transaction participants can view their transactions
- Ratings are public for transparency

## Troubleshooting

### Migrations Fail
- Ensure you run migrations in order (005 → 006 → 007)
- Check Supabase logs for specific errors
- Verify UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

### Follow Button Not Working
- Check browser console for API errors
- Verify user is authenticated
- Check RLS policies in Supabase dashboard

### Messages Not Appearing
- Messages poll every 5 seconds - wait briefly
- Check conversation_participants table for user membership
- Verify RLS policies allow access

### Stats Not Updating
- Check trigger functions in Supabase: `update_seller_rating()`, `update_transaction_stats()`
- Ensure transaction status changed to 'completed'
- Verify profile table has correct column types

## Support
For issues or questions, check:
- Supabase Dashboard Logs (Database > Logs)
- Browser console errors
- API response status codes

