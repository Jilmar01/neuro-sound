---
name: NeuroSound Therapeutic System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#73787b'
  outline-variant: '#c3c7cb'
  surface-tint: '#526069'
  primary: '#526069'
  on-primary: '#ffffff'
  primary-container: '#e3f2fd'
  on-primary-container: '#606f78'
  inverse-primary: '#bac9d3'
  secondary: '#516161'
  on-secondary: '#ffffff'
  secondary-container: '#d4e6e5'
  on-secondary-container: '#576867'
  tertiary: '#625f4d'
  on-tertiary: '#ffffff'
  tertiary-container: '#f7f0d9'
  on-tertiary-container: '#716d5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e5ef'
  primary-fixed-dim: '#bac9d3'
  on-primary-fixed: '#0f1d25'
  on-primary-fixed-variant: '#3b4951'
  secondary-fixed: '#d4e6e5'
  secondary-fixed-dim: '#b8cac9'
  on-secondary-fixed: '#0e1e1e'
  on-secondary-fixed-variant: '#3a4a49'
  tertiary-fixed: '#e9e2cc'
  tertiary-fixed-dim: '#ccc6b1'
  on-tertiary-fixed: '#1e1c0e'
  on-tertiary-fixed-variant: '#4a4737'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 64px
  gutter: 24px
  section-gap: 80px
---

## Brand & Style

The design system is rooted in **Extreme Minimalism** with a therapeutic focus, specifically engineered to reduce cognitive load for users seeking mental clarity through psychoacoustics. The aesthetic is "Airy Clinical"—combining the precision of a healthcare application with the softness of a wellness retreat.

The visual language prioritizes negative space to create a sense of mental "room to breathe." Every interface element must serve a functional purpose; if a decorative element does not contribute to the user's calm, it is removed. The emotional response should be one of immediate relief, safety, and guided focus.

## Colors

The palette utilizes a high-brightness, low-saturation approach to maintain a "high-air" feel. 

- **Neutral Base:** Uses `#F8FAFC` (Off-white) instead of pure white to reduce eye strain and screen glare.
- **Calming Accents:** Primary Blue (`#E3F2FD`) and Secondary Green (`#E0F2F1`) are used for background washes and large interactive surfaces to evoke serenity.
- **Energizing Accent:** Muted Amber (`#FFF8E1`) is reserved for focus-state elements or "Daytime" soundscapes to provide a gentle lift without agitation.
- **Accessibility:** Text must maintain a minimum 4.5:1 contrast ratio against these light backgrounds. Use Deep Charcoal (`#1E293B`) for primary content to ensure crisp legibility.

## Typography

This design system uses **Inter** for its exceptional legibility and neutral, modern character. The type scale is intentionally oversized to accommodate users who may be experiencing stress-induced vision narrowing or cognitive fatigue.

- **Headlines:** Use Medium weights (`500`) with tighter letter spacing to create a grounded, trustworthy anchor for the page.
- **Body Text:** Use a generous line height (`1.5x`+) to improve readability and maintain the "airy" feel.
- **Labels:** Use uppercase with slight letter spacing for small metadata, ensuring these elements are distinct from actionable body text.

## Layout & Spacing

The layout follows a **Fixed Grid** model with extreme interior margins. On desktop, content is constrained to a 1024px central column to prevent horizontal eye strain.

- **Rhythm:** Every measurement is a multiple of 8px. 
- **Whitespace:** Use "uncomfortably large" padding (e.g., 80px between sections) to reinforce the minimalist brand.
- **Mobile:** Margins should never drop below 24px to ensure the UI feels expansive even on small screens.

## Elevation & Depth

To maintain the therapeutic atmosphere, this design system avoids harsh dropshadows. Instead, it uses **Ambient Softness**:

- **Tonal Layering:** Depth is primarily communicated through subtle shifts in background color (e.g., a card using a slightly lighter or darker tint than the base canvas).
- **Ambient Shadows:** When elevation is required (e.g., for a "Play" button), use a very large blur radius (32px+) with extremely low opacity (4-8%).
- **Glassmorphism:** Use subtle backdrop blurs (20px) on navigation bars and overlays to maintain a sense of continuity with the content beneath, suggesting transparency and honesty.

## Shapes

The shape language is dominated by **large radii and organic forms**. 

- **Corners:** Use Level 3 (Pill-shaped/1rem+) for all containers, buttons, and input fields. Sharp corners are perceived as "aggressive" and are strictly prohibited.
- **Likert Scales:** Use perfect circles for scale points to evoke a sense of wholeness and cycles.
- **Icons:** Use rounded caps and joins for all iconography to match the curvature of the UI components.

## Components

### Buttons & Controls
Buttons are large, pill-shaped, and high-contrast. The "Primary Play" control should be the largest interactive element on any screen, utilizing a subtle pulse animation when active to guide the user's focus without sound.

### Likert Scales (Therapeutic Input)
Scales are horizontal tracks with large, circular touch targets. Use clinical but soft icons (e.g., a gentle sun for "High Energy," a soft moon for "Restful") placed at the poles of the scale. Active states should use the primary accent color with a soft outer glow.

### Input Fields
Inputs are "ghost-style"—defined by a very light stroke or a slight tonal shift rather than a heavy box. On focus, the stroke should transition to a soft blue glow.

### Audio Cards
Cards utilize a "glass" texture with a 1px soft-white border. They should contain minimal information: just the track title, duration, and a subtle waveform visualization.

### Lists
Lists are separated by whitespace and subtle tonal dividers rather than hard lines. Each list item should have a minimum height of 64px to ensure high-accessibility tap targets.