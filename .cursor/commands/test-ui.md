# test-ui

---
name: Test UI/UX
description: Comprehensive UI and UX testing checklist for Resonant marketplace
---

# UI/UX Testing Checklist - Resonant Marketplace

## Testing Context
**Project:** Resonant - German Guitar Marketplace  
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui  
**Target:** German musicians buying/selling guitar equipment  
**Primary Focus:** Trust, security, mobile-first UX

---

## 1. Visual Design & Layout

### Header Navigation
- [ ] Logo/branding is visible and clickable
- [ ] Search bar is prominent and functional (desktop)
- [ ] Auth buttons display correctly (logged in vs logged out states)
- [ ] User menu dropdown works properly
- [ ] Mobile hamburger menu functions correctly
- [ ] Unread message badge displays accurate count
- [ ] Sticky positioning works (stays at top on scroll)

### Page Layout
- [ ] Container max-width is appropriate (not too wide on large screens)
- [ ] Consistent padding/margins throughout
- [ ] Grid layouts align properly (listings, cards, etc.)
- [ ] Sidebars (categories, filters) display correctly
- [ ] Content doesn't overflow or break layout

### Spacing & Typography
- [ ] Text is readable (minimum 16px for body text)
- [ ] Headings have proper hierarchy (h1 > h2 > h3)
- [ ] Line-height is comfortable (1.5-1.6 for body)
- [ ] Consistent spacing between elements
- [ ] German text displays correctly (Umlauts: ä, ö, ü, ß)
- [ ] Long text truncates properly with ellipsis

### Color & Visual Hierarchy
- [ ] Primary color is used consistently for CTAs
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Hover states have visible color changes
- [ ] Focus states are clearly visible (keyboard navigation)
- [ ] Icons are properly sized and aligned
- [ ] Badges display correctly (condition, category, verification)
- [ ] Images load and display properly (aspect ratios maintained)

---

## 2. Responsive Design

### Mobile (320px - 767px)
- [ ] Single column layout for listings/cards
- [ ] Bottom navigation tabs are visible and functional
- [ ] Header search is hidden or moved to mobile menu
- [ ] Sidebars convert to modals/drawers
- [ ] Touch targets are minimum 44x44px
- [ ] No horizontal scrolling (content fits viewport)
- [ ] Safe area insets respected (iOS notch/home indicator)
- [ ] Category pills scroll horizontally
- [ ] Filter button opens modal/dialog
- [ ] Image carousels work with touch gestures

### Tablet (768px - 1023px)
- [ ] 2-column grid for listings
- [ ] Sidebars may be collapsible
- [ ] Navigation adapts appropriately
- [ ] Touch targets remain accessible

### Desktop (1024px+)
- [ ] Multi-column layouts (3-4 columns for listings)
- [ ] Sidebars are always visible
- [ ] Hover states work properly
- [ ] Keyboard shortcuts function (if implemented)

---

## 3. Component Functionality

### Interactive Elements
- [ ] **Buttons:** All clickable, disabled states work, loading states show
- [ ] **Forms:** Inputs work, validation errors display, submission works
- [ ] **Dropdowns:** Open/close correctly, keyboard navigation works
- [ ] **Modals:** Open/close smoothly, focus trap works, Escape closes
- [ ] **Cards:** Clickable, hover effects work, favorite button toggles
- [ ] **Navigation:** Links work, active states highlighted, deep links work

### ListingCard Component
- [ ] Grid view displays correctly
- [ ] List view displays correctly
- [ ] Image carousel works (multiple images)
- [ ] Favorite button toggles
- [ ] Price formatting (EUR: €1.234,56)
- [ ] Condition badge displays in German
- [ ] Location displays
- [ ] Shipping badge shows when applicable
- [ ] Seller info displays correctly
- [ ] Date formatting ("Heute", "Gestern", "vor X Tagen")
- [ ] Hover effects work
- [ ] Card navigates to detail page

### Header Component
- [ ] Logo links to home
- [ ] Search bar works (desktop)
- [ ] Mobile menu opens/closes
- [ ] Auth button shows correct state
- [ ] User menu dropdown works
- [ ] Unread count badge displays
- [ ] Message icon links correctly
- [ ] "Anzeige erstellen" button works

### FilterSidebar Component
- [ ] Price range slider works
- [ ] Condition checkboxes work
- [ ] Location input works
- [ ] Filters apply correctly
- [ ] Clear filters button works
- [ ] Mobile filter dialog works

### CategorySidebar Component
- [ ] Categories display correctly
- [ ] Category selection works
- [ ] Active category is highlighted
- [ ] Subcategories expand/collapse
- [ ] Mobile category pills work

### BottomTabs Component (Mobile)
- [ ] All 5 tabs display
- [ ] Active tab is highlighted
- [ ] Icons are visible
- [ ] Labels are readable
- [ ] Tabs navigate correctly
- [ ] Safe area inset respected (iOS)

---

## 4. State Management

### Loading States
- [ ] Spinners appear during data fetching
- [ ] Skeleton loaders show for content areas
- [ ] Loading text is in German ("Lade Anzeigen...")
- [ ] No layout shift when content loads

### Error States
- [ ] Error messages are user-friendly and in German
- [ ] Error boundaries catch and display errors gracefully
- [ ] Network errors show retry options
- [ ] 404 pages are styled and helpful
- [ ] Form validation errors are clear and actionable

### Empty States
- [ ] "Keine Anzeigen gefunden" displays when no results
- [ ] Empty states have helpful CTAs
- [ ] Empty states are visually appealing

### Success States
- [ ] Success messages/toasts appear after actions
- [ ] Form submissions show confirmation
- [ ] Favorites update immediately (optimistic UI)

---

## 5. Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus indicators are visible (outline or ring)
- [ ] Escape key closes modals/dropdowns
- [ ] Enter/Space activates buttons

### Screen Reader Support
- [ ] All icons have aria-labels
- [ ] Buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Landmarks are properly marked (header, nav, main, footer)
- [ ] Images have alt text

### Visual Accessibility
- [ ] Color is not the only indicator (icons, text also used)
- [ ] Text contrast meets WCAG AA standards
- [ ] Focus states are clearly visible
- [ ] Images have alt text
- [ ] Decorative images have empty alt=""

---

## 6. Trust & Safety UI Elements

### Verification Badges
- [ ] Email verification badge displays correctly
- [ ] Phone verification badge displays correctly
- [ ] Identity verification badge displays correctly
- [ ] Badge tooltips explain verification level
- [ ] Badges are visible on profiles and listings

### Seller Information
- [ ] Seller rating displays correctly (stars, number)
- [ ] Review count is accurate
- [ ] Account age is shown (if implemented)
- [ ] Transaction count displays
- [ ] MFA indicator shows (if applicable)

### Scam Prevention
- [ ] Warning messages display for suspicious listings
- [ ] Report buttons are easily accessible
- [ ] Price warnings show for suspicious prices
- [ ] External link warnings appear (if applicable)

---

## 7. Performance & UX

### Performance
- [ ] Initial page load is fast (< 3s)
- [ ] Images lazy load correctly
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth scrolling (60fps)
- [ ] Animations are smooth (not janky)

### User Experience
- [ ] Navigation is intuitive
- [ ] Search is easy to find and use
- [ ] Filtering works as expected
- [ ] Results update when filters change
- [ ] Pagination works (if implemented)

### German Localization
- [ ] All user-facing text is in German
- [ ] Dates formatted in German format (DD.MM.YYYY)
- [ ] Currency formatted correctly (€1.234,56)
- [ ] Number formatting uses German conventions
- [ ] "Heute", "Gestern", "vor X Tagen" work correctly

---

## 8. Cross-Browser Testing

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Browser-Specific
- [ ] CSS Grid/Flexbox work correctly
- [ ] Custom properties (CSS variables) work
- [ ] Backdrop blur works (Safari support)
- [ ] Safe area insets work (iOS)

---

## 9. Edge Cases & Error Scenarios

### Data Edge Cases
- [ ] Very long titles truncate properly
- [ ] Missing images show placeholder
- [ ] Missing seller info handled gracefully
- [ ] Zero price displays correctly (if allowed)
- [ ] Very high prices format correctly
- [ ] Empty arrays show empty states
- [ ] Null/undefined values don't break UI

### User Edge Cases
- [ ] Unauthenticated users see appropriate UI
- [ ] Users with no listings see empty state
- [ ] Users with no messages see empty state
- [ ] Users with no favorites see empty state
- [ ] New users (no verification) see appropriate UI

### Network Edge Cases
- [ ] Slow network shows loading states
- [ ] Offline shows appropriate message
- [ ] Failed requests show error messages
- [ ] Timeout errors handled gracefully

---

## Quick Testing Workflows

### Smoke Test (5 minutes)
1. Page loads without errors
2. Header navigation works
3. Search functionality works
4. At least one listing displays
5. Mobile view doesn't break layout

### Full Test (30-60 minutes)
- Complete all sections above
- Test on mobile device (not just browser dev tools)
- Test with keyboard only (no mouse)
- Test with screen reader (VoiceOver/TalkBack)
- Test in multiple browsers

### Regression Test (Before Release)
- All critical user flows work
- No new visual bugs introduced
- Performance hasn't degraded
- Accessibility standards maintained

---

## Reporting Format

When reporting issues, include:
1. **Component/Page:** Which component or page has the issue
2. **Browser/Device:** Chrome Mobile iOS, Safari Desktop, etc.
3. **Steps to Reproduce:** Clear steps to see the issue
4. **Expected Behavior:** What should happen
5. **Actual Behavior:** What actually happens
6. **Screenshots:** Visual evidence (if applicable)
7. **Severity:** Critical, High, Medium, Low