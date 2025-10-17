# Testing Guide - MVP Features

## Quick Start

### Prerequisites
1. Database migrations 005, 006, 007 must be applied
2. At least 2 test accounts created
3. At least 1 active listing created

## Test Scenarios

### 1. Messaging System

#### Test: Send Message from Listing
1. Browse to any listing detail page
2. Click "Nachricht senden" button
3. Type a message (e.g., "Ist die Gitarre noch verfügbar?")
4. Click "Senden"
5. ✅ Success message appears
6. Navigate to `/messages`
7. ✅ Conversation appears in inbox

#### Test: Reply to Message
1. Go to `/messages`
2. Click on a conversation
3. Type a reply in the thread
4. Press Enter or click Send button
5. ✅ Message appears immediately in thread
6. Wait 5+ seconds
7. ✅ Other user's messages appear (if any)

#### Test: Message from Profile
1. Visit any user's profile (`/users/[username]`)
2. Click "Nachricht" button
3. Type and send message
4. ✅ Conversation created or existing one used

### 2. Follow System

#### Test: Follow User
1. Visit any user's profile (not yourself)
2. Click "Folgen" button
3. ✅ Button changes to "Folge ich"
4. ✅ Follower count increments immediately
5. Refresh page
6. ✅ Follow status persists

#### Test: Unfollow User
1. On a profile you're following
2. Click "Folge ich" button
3. ✅ Button changes to "Folgen"
4. ✅ Follower count decrements

#### Test: Cannot Follow Self
1. Visit your own profile
2. ✅ No follow button appears

#### Test: Follower Counts
1. Have User A follow User B
2. Check User B's profile
3. ✅ Shows "1 Follower"
4. Check User A's profile
5. ✅ Stats show "0 Follower, 1 Following" (not visible in strip, but in API)

### 3. Transaction System

#### Test: Create Transaction
1. Browse to any listing
2. Click "Sofort kaufen" button (mobile or desktop)
3. Review transaction details in modal
4. Click "Jetzt kaufen"
5. ✅ Success alert appears
6. ✅ Transaction created with status "pending"

#### Test: Complete Transaction (Manual via Supabase)
Since there's no UI for completion yet:
1. Go to Supabase Dashboard → Table Editor → transactions
2. Find your transaction
3. Change `status` to "completed"
4. Set `completed_at` to current timestamp
5. Save
6. Check seller's profile
7. ✅ `total_sales` incremented by 1
8. Check buyer's profile (you)
9. ✅ `total_purchases` incremented by 1
10. Check listing
11. ✅ Status changed to "sold"

### 4. Rating System

#### Test: Submit Rating
First, create and complete a transaction (see above), then:
1. Use API or create UI trigger (modal not auto-shown yet)
2. Call `POST /api/ratings` with:
```json
{
  "transactionId": "your-transaction-uuid",
  "ratedUserId": "seller-uuid",
  "score": 5,
  "comment": "Excellent seller!"
}
```
3. ✅ Rating created
4. Check seller's profile
5. ✅ `seller_rating` updated to average of all ratings

#### Test: Cannot Rate Twice
1. Try to submit another rating for the same transaction
2. ✅ API returns error "Already rated this transaction"

### 5. Stats Display

#### Test: Profile Stats
1. Visit any user's profile
2. ✅ Seller rating displayed (0.0 if no ratings)
3. ✅ Total sales count shown
4. ✅ Follower count shown
5. Follow/unfollow the user
6. ✅ Count updates in real-time

#### Test: Own Profile Stats
1. Go to `/profile`
2. ✅ Your stats displayed
3. ✅ Includes follower/following counts
4. Complete a transaction as seller
5. Refresh page
6. ✅ Sales count incremented

## API Testing (via curl or Postman)

### Get Conversations
```bash
curl http://localhost:3000/api/conversations \
  -H "Cookie: your-session-cookie"
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "recipient-uuid",
    "listingId": "listing-uuid",
    "content": "Hello!"
  }'
```

### Follow User
```bash
curl -X POST http://localhost:3000/api/profile/testuser/follow \
  -H "Cookie: your-session-cookie"
```

### Get Follow Status
```bash
curl http://localhost:3000/api/profile/testuser/follow \
  -H "Cookie: your-session-cookie"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions/create \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "listing-uuid",
    "amount": 1200.00
  }'
```

### Submit Rating
```bash
curl -X POST http://localhost:3000/api/ratings \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "transaction-uuid",
    "ratedUserId": "seller-uuid",
    "score": 5,
    "comment": "Great!"
  }'
```

## Database Verification

### Check Messages
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

### Check Conversations
```sql
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

### Check Followers
```sql
SELECT 
  p.username,
  (SELECT COUNT(*) FROM followers WHERE following_id = p.id) as followers,
  (SELECT COUNT(*) FROM followers WHERE follower_id = p.id) as following
FROM profiles p
ORDER BY followers DESC;
```

### Check Transactions
```sql
SELECT 
  t.*,
  seller.username as seller,
  buyer.username as buyer,
  l.title as listing
FROM transactions t
JOIN profiles seller ON t.seller_id = seller.id
JOIN profiles buyer ON t.buyer_id = buyer.id
JOIN listings l ON t.listing_id = l.id
ORDER BY t.created_at DESC;
```

### Check Ratings
```sql
SELECT 
  r.score,
  r.comment,
  rater.username as from_user,
  rated.username as for_user,
  r.created_at
FROM ratings r
JOIN profiles rater ON r.rater_id = rater.id
JOIN profiles rated ON r.rated_user_id = rated.id
ORDER BY r.created_at DESC;
```

### Verify Stats Triggers
```sql
-- After completing a transaction, verify:
SELECT 
  username,
  seller_rating,
  total_sales,
  total_purchases
FROM profiles
WHERE username IN ('seller-username', 'buyer-username');
```

## Common Issues

### Messages not appearing
- Check RLS policies in Supabase
- Verify conversation_participants has both users
- Wait 5 seconds for polling to update

### Follow button not working
- Check browser console for errors
- Verify user is authenticated
- Check network tab for API response

### Stats not updating
- Verify triggers exist in Supabase Functions
- Check transaction status is "completed"
- Refresh the page

### Transaction fails
- Verify listing is "active" status
- Check you're not buying your own listing
- Verify listing exists

## Success Criteria

✅ All tests pass
✅ No console errors
✅ RLS policies enforced (403 on unauthorized access)
✅ Stats update correctly via triggers
✅ UI is responsive and intuitive
✅ Data persists across page refreshes

## Performance Benchmarks

- Message list should load < 500ms
- Follow/unfollow should respond < 200ms
- Transaction creation < 300ms
- Stats should display immediately from cache

## Next Steps After Testing

1. Gather user feedback on UX
2. Monitor error logs in production
3. Optimize queries if slow
4. Add indexes if needed
5. Consider WebSocket for messaging

