# test-design

---
name: Test Design (Kleinanzeigen/Thomann Style)
description: Verify design follows clean, simple Kleinanzeigen/Thomann aesthetic using plain shadcn components
---

# Design Testing Checklist - Kleinanzeigen/Thomann Style

## Design Philosophy
**Target Aesthetic:** Clean combination of Kleinanzeigen (functional simplicity) + Thomann (professional clarity)  
**Component Usage:** Plain shadcn/ui components without fancy customizations  
**Core Principles:** Clean, Simple, Robust

---

## 1. Visual Simplicity

### Color Palette
- [ ] **Minimal Color Usage**
  - Primary color used sparingly (CTAs, links only)
  - Mostly neutral grays, blacks and whites (Kleinanzeigen style)
  - No rainbow of colors - stick to 2-3 colors max
  - Background is clean white/light gray (black in dark mode)
  - Text is dark gray/black, not pure black

- [ ] **No Over-Styling**
  - No custom gradients (unless absolutely necessary)
  - No fancy shadows (use subtle shadcn defaults only)
  - No custom color schemes beyond shadcn defaults
  - No neon or bright accent colors
  - No decorative backgrounds or patterns

### Typography
- [ ] **Clean, Readable Text**
  - System fonts or simple sans-serif (Inter, system-ui)
  - No decorative fonts or script fonts
  - Consistent font sizes (no wild variations)
  - Proper line-height (1.5-1.6 for body text)
  - Headings are clear but not oversized
  - Text color is readable (not too light gray)

- [ ] **Text Hierarchy**
  - Clear distinction between headings (h1, h2, h3)
  - Body text is comfortable to read (16px minimum)
  - No excessive font weights (normal, medium, bold max)
  - Consistent text colors throughout

---

## 2. Component Usage (Plain shadcn)

### Buttons
- [ ] **Standard shadcn Button Variants**
  - Using default, outline, ghost, secondary variants only
  - No custom button styles or rounded corners beyond shadcn defaults
  - No fancy hover effects (use shadcn defaults)
  - Button sizes are standard (sm, default, lg)
  - No custom button colors or gradients

- [ ] **Button Placement**
  - Primary actions are clear and prominent
  - Secondary actions are less prominent
  - Buttons are not over-decorated
  - Consistent button styling across pages

### Cards
- [ ] **Simple Card Design**
  - Using shadcn Card component as-is
  - No custom card borders or shadows
  - No fancy card hover effects (subtle shadow only)
  - Cards are clean rectangles (standard border-radius)
  - No decorative card backgrounds

- [ ] **Card Content**
  - Content is well-organized and scannable
  - No unnecessary decorative elements
  - Images are clean and properly sized
  - Text is readable and properly spaced

### Forms & Inputs
- [ ] **Standard Input Design**
  - Using shadcn Input component as-is
  - No custom input styling or borders
  - Inputs are clean and functional
  - Labels are clear and properly positioned
  - No fancy focus effects (use shadcn defaults)

- [ ] **Form Layout**
  - Forms are simple and straightforward
  - No unnecessary decorative elements
  - Clear field grouping and spacing
  - Submit buttons are standard shadcn buttons

### Navigation
- [ ] **Simple Navigation**
  - Header is clean and functional (Kleinanzeigen style)
  - No fancy navigation animations
  - Clear active states (simple underline or background)
  - Mobile menu is simple dropdown/drawer
  - Bottom tabs are clean and minimal (mobile)

- [ ] **Navigation Elements**
  - Links are clearly identifiable
  - No decorative navigation elements
  - Search bar is prominent but not over-styled
  - Icons are simple and functional

---

## 3. Layout & Spacing

### Layout Structure
- [ ] **Clean Layout**
  - Content is well-organized in clear sections
  - No cluttered layouts
  - Proper use of white space (Thomann style)
  - Grid layouts are clean and aligned
  - No overlapping elements or visual chaos

- [ ] **Container & Spacing**
  - Consistent container max-widths
  - Proper padding/margins (not too tight, not too loose)
  - Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
  - No excessive spacing or cramped layouts

### Grid & Lists
- [ ] **Listings Grid**
  - Clean grid layout (like Thomann product grid)
  - Cards are evenly spaced
  - No fancy grid animations
  - Responsive breakpoints work cleanly
  - Grid/list view toggle is simple

- [ ] **Content Lists**
  - Lists are clean and scannable
  - Proper spacing between items
  - No decorative list markers (unless necessary)
  - Clear visual separation between items

---

## 4. Kleinanzeigen-Specific Elements

### Functional Design
- [ ] **Kleinanzeigen Aesthetic**
  - Simple, no-nonsense design
  - Focus on functionality over decoration
  - Clean search bar (prominent, simple)
  - Simple category navigation
  - Clear pricing display
  - Functional filters (not over-designed)

- [ ] **Content-First**
  - Content is the hero, not design elements
  - Images are clear and properly displayed
  - Text is readable and well-structured
  - No decorative elements competing for attention

### Trust Elements
- [ ] **Simple Trust Indicators**
  - Verification badges are simple and clear
  - No fancy badge designs
  - Ratings are displayed simply (stars + number)
  - Trust signals are functional, not decorative

---

## 5. Thomann-Specific Elements

### Professional Clarity
- [ ] **Thomann Aesthetic**
  - Professional, clean design
  - Good use of white space
  - Clear product/information hierarchy
  - Simple, effective filters
  - Clean typography

- [ ] **Product Display**
  - Listings are displayed clearly
  - Images are prominent but not overwhelming
  - Information is well-organized
  - Pricing is clear and readable
  - No unnecessary decorative elements

### Category Navigation
- [ ] **Simple Category System**
  - Categories are clearly organized
  - Simple category navigation (like Thomann sidebar)
  - No fancy category animations
  - Clear active states
  - Mobile category navigation is simple

---

## 6. No Over-Styling Checks

### Animations & Effects
- [ ] **Minimal Animations**
  - No excessive animations or transitions
  - Simple hover effects only (shadcn defaults)
  - No fancy page transitions
  - No decorative loading animations (simple spinner)
  - No parallax or scroll effects

- [ ] **No Decorative Elements**
  - No unnecessary icons or graphics
  - No decorative borders or dividers
  - No background patterns or textures
  - No fancy shadows or glows
  - No decorative gradients

### Custom Styling
- [ ] **Using shadcn as-is**
  - Components use shadcn defaults
  - No excessive className overrides
  - No custom CSS that changes shadcn appearance significantly
  - Custom styling only for layout/spacing, not component appearance
  - No inline styles for decorative purposes

- [ ] **Tailwind Usage**
  - Using standard Tailwind utilities
  - No custom Tailwind config for fancy effects
  - Consistent spacing scale
  - Standard color palette (shadcn defaults)

---

## 7. Robustness & Consistency

### Design Consistency
- [ ] **Consistent Design Language**
  - Same components used consistently
  - Same spacing scale throughout
  - Same typography scale throughout
  - Same color usage throughout
  - No one-off custom designs

- [ ] **Component Reusability**
  - Components are reusable, not one-off custom designs
  - Same button styles used everywhere
  - Same card styles used everywhere
  - Same input styles used everywhere

### Robust Layouts
- [ ] **Layout Stability**
  - No layout shifts on load
  - Content doesn't break on different screen sizes
  - Images don't break layouts
  - Long text doesn't break layouts
  - Empty states don't break layouts

- [ ] **Error Handling**
  - Error states are simple and clear
  - No fancy error animations
  - Error messages are readable
  - Error UI uses standard shadcn components

---

## 8. Mobile Design

### Mobile Simplicity
- [ ] **Clean Mobile Layout**
  - Simple, functional mobile navigation
  - Bottom tabs are clean and minimal
  - No fancy mobile animations
  - Touch targets are appropriately sized (44x44px)
  - Content is readable on mobile

- [ ] **Mobile-Specific Elements**
  - Mobile menu is simple dropdown/drawer
  - Filters open in simple modal
  - Category navigation is simple horizontal scroll
  - No fancy mobile gestures or animations

---

## 9. Specific Component Checks

### Header
- [ ] Clean, simple header (Kleinanzeigen style)
- [ ] Prominent search bar (not over-styled)
- [ ] Simple navigation
- [ ] Clean auth buttons
- [ ] No decorative elements

### Listing Cards
- [ ] Clean card design (Thomann product card style)
- [ ] Simple image display
- [ ] Clear pricing
- [ ] Simple badges (condition, etc.)
- [ ] No fancy hover effects
- [ ] Clean seller information display

### Filters
- [ ] Simple filter sidebar (Thomann style)
- [ ] Clean filter controls
- [ ] No fancy filter animations
- [ ] Clear filter labels
- [ ] Simple price range slider

### Forms
- [ ] Clean form layout
- [ ] Standard shadcn inputs
- [ ] Clear labels and validation
- [ ] Simple submit buttons
- [ ] No decorative form elements

---

## 10. Anti-Patterns to Avoid

### Design Anti-Patterns
- [ ] **No Fancy Effects**
  - No glassmorphism or frosted glass effects
  - No neon glows or bright colors
  - No excessive shadows or depth effects
  - No decorative gradients
  - No fancy animations

- [ ] **No Over-Customization**
  - No custom button designs beyond shadcn variants
  - No custom card designs beyond shadcn defaults
  - No custom input designs beyond shadcn defaults
  - No one-off custom components that should use shadcn

- [ ] **No Decorative Elements**
  - No unnecessary icons
  - No decorative borders
  - No background patterns
  - No decorative dividers
  - No unnecessary visual flourishes

---

## Quick Design Validation

### 5-Second Test
Look at any page and ask:
1. Is it clean and simple? (Yes/No)
2. Does it look functional, not decorative? (Yes/No)
3. Could this be on Kleinanzeigen or Thomann? (Yes/No)
4. Are shadcn components used as-is? (Yes/No)
5. Is there any unnecessary styling? (Yes/No)

### Comparison Test
Compare your design to:
- **Kleinanzeigen:** Is it as simple and functional?
- **Thomann:** Is it as clean and professional?
- If more complex than either, simplify it.

---

## Design Principles Summary

✅ **DO:**
- Use shadcn components as-is
- Keep designs simple and functional
- Use consistent spacing and typography
- Focus on content and usability
- Use minimal colors (grays + primary)
- Keep layouts clean and organized

❌ **DON'T:**
- Add fancy custom styling to shadcn components
- Use decorative elements or animations
- Create one-off custom designs
- Use excessive colors or gradients
- Add unnecessary visual flourishes
- Over-complicate layouts

---

## Reporting Design Issues

When reporting design issues, specify:
1. **Component/Page:** Which component or page
2. **Issue Type:** Over-styled, inconsistent, decorative element, etc.
3. **Current State:** What it looks like now
4. **Expected State:** What it should look like (simple, clean)
5. **Fix Suggestion:** How to simplify (use shadcn default, remove decoration, etc.)