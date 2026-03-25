# DESIGN.md — Wolfstone Digital Design System

Updated by /design-consultation on 2026-03-25.

## Brand Identity

- **Positioning:** "Operators, not theorists" — AI visibility consultancy built by people who run their own finance brand
- **Tone:** Confident, direct, premium. No hedge words. Short sentences. Results-oriented.
- **Target:** Enterprise marketing leaders in regulated industries (financial services, legal, ecommerce)

## Design Direction

- **Aesthetic:** Light-first, clean, professional with liquid glass containers
- **Surface strategy:** Light cream/stone backgrounds as primary. Navy demoted to footer and optional accent strips only.
- **Container treatment:** Frosted glass (backdrop-blur) with tinted backgrounds, top-edge highlights, and inner shine gradients — visible on both light and dark surfaces
- **Background animation:** Citation flow network — a living knowledge graph visualization that tells the brand story (content → AI discovery → citations)

## Color System

### Brand Colors
| Token | HSL | Use |
|-------|-----|-----|
| `--wd-navy` | 220 50% 6% | Footer background, dark accent sections |
| `--wd-navy-mid` | 220 48% 9% | Secondary dark surface |
| `--wd-midnight` | 222 40% 14% | Card backgrounds in dark mode |
| `--wd-blue` | 210 70% 36% | Primary action color (buttons, links) |
| `--wd-cyan` | 190 100% 45% | Primary accent — used across both themes |
| `--wd-cyan-bright` | 190 100% 61% | Hover accent, gradient endpoint |
| `--wd-gold` | 38 70% 50% | Premium/highlight accent (footer divider, special elements) |

### Light Palette (primary surfaces)
| Token | HSL | Use |
|-------|-----|-----|
| `--wd-cream` | 220 20% 97% | Primary page background |
| `--wd-stone` | 220 16% 93% | Secondary/alternating section background |
| `--wd-warm-grey` | 220 12% 85% | Borders, dividers |
| `--wd-navy-text` | 220 50% 12% | Primary text on light backgrounds |

### Light Theme Glass Tokens
| Token | Value | Use |
|-------|-------|-----|
| `--bg-card` | `rgba(225, 232, 240, 0.35)` | Glass container fill — cool blue-grey tint |
| `--bg-card-hover` | `rgba(225, 232, 240, 0.50)` | Glass hover state |
| `--border-glass` | `rgba(255, 255, 255, 0.65)` | Glass border |
| `--border-glass-strong` | `rgba(255, 255, 255, 0.85)` | Glass border on hover |
| `--glass-shadow` | `inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 24px rgba(0,0,0,0.05)` | Glass shadow with top-edge highlight |

### Dark Theme Glass Tokens
| Token | Value | Use |
|-------|-------|-----|
| `--bg-card` | `rgba(255, 255, 255, 0.04)` | Glass container fill |
| `--bg-card-hover` | `rgba(255, 255, 255, 0.08)` | Glass hover state |
| `--border-glass` | `rgba(255, 255, 255, 0.08)` | Glass border |
| `--border-glass-strong` | `rgba(255, 255, 255, 0.12)` | Glass border on hover |
| `--glass-shadow` | `0 4px 24px rgba(0,0,0,0.3)` | Glass shadow |

### Status Colors
| Status | Color | Use |
|--------|-------|-----|
| Strong/Cited | `emerald-400` | Score >= 70, "cited" status |
| Moderate/Recommended | `amber-400` | Score 40-69, "recommended/mentioned" |
| Weak | `orange-400` | Score < 40, "weak" |
| Not Found/Absent | `red-400` | Score 0, "absent/not found" |

### Score Color Function
```
>= 70 → emerald-400
>= 40 → amber-400
< 40  → red-400
```

## Typography

Font: **DM Sans** (400, 700, 900) — Google Fonts
Fallbacks: 'Helvetica Neue', Arial, sans-serif

| Class | Size | Weight | Leading | Tracking | Use |
|-------|------|--------|---------|----------|-----|
| `text-display` | clamp(2.5rem, 5vw, 4.5rem) | 900 | 1.05 | -0.03em | Page hero titles |
| `text-h1` | clamp(2rem, 3.5vw, 2.5rem) | 900 | 1.1 | -0.02em | Section headings |
| `text-h2` | clamp(1.5rem, 2.5vw, 1.75rem) | 700 | 1.2 | -0.01em | Card titles, sub-sections |
| `text-h3` | 1.25rem | 700 | 1.3 | — | Card headings, labels |
| `text-body-lg` | 1.125rem | 400 | 1.7 | — | Hero body text, intros |
| `text-body` | 1rem (base) | 400 | 1.7 | — | Default body copy |
| `text-body-sm` | 0.875rem | 400 | 1.6 | — | Descriptions, secondary text |
| `text-caption` | 0.75rem | 400 | 1.5 | 0.03em | Fine print, timestamps |
| `text-overline` | 0.6875rem | 700 | 1.4 | 0.1em | Section labels (uppercase) |

## Component Patterns

### Glass Containers (Liquid Glass)
The signature visual element. All containers use frosted glass treatment.

**Base glass:**
- `backdrop-filter: blur(20px)` with tinted semi-transparent background
- `border-top: 1px solid rgba(255,255,255,0.8)` — top-edge highlight simulates light catching glass
- Inner shine: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)` pseudo-element
- `border-radius: 16px` (cards) or `20px` (section wrappers)
- Hover: lift with `translateY(-2px)`, stronger border and shadow

**Light mode specifics:**
- Background tinted cool blue-grey (`rgba(225, 232, 240, 0.35)`) — NOT pure white
- Prominent top-edge highlight and inner shine gradient to create visible glass depth
- Inset top shadow for edge definition

**Dark mode specifics:**
- Background very low white opacity (`rgba(255,255,255,0.04)`)
- Subtle top-edge highlight and inner shine (lower opacity)
- Glass naturally visible due to contrast with dark background

**Glow variant (`glass-glow`):**
- Adds `radial-gradient(ellipse at top left, rgba(0,184,217,0.06), transparent 70%)` for ambient cyan corner highlight
- Used on interactive cards (services, stats)

### Buttons
- **Primary:** `bg-accent text-white rounded-[12px] text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3.5`
- **Secondary:** Glass background with glass border, hover transitions to accent border
- **Ghost:** Transparent, accent text, no border
- Active: `active:scale-[0.97]`

### Inputs
- Glass treatment: tinted background, backdrop-blur, glass border
- Top-edge highlight matching glass containers
- Focus: accent border + subtle ring (`0 0 0 3px rgba(0,184,217,0.1)`)

### Section Rhythm (Light-First)
1. `bg-cream` — primary page background (hero, main content)
2. `bg-stone` — alternating sections for visual rhythm
3. Glass containers within sections for content grouping
4. `bg-navy` — footer only (dark anchor at page bottom)

### Section Labels
Every section starts with: `text-overline text-primary mb-4 block` label above the heading.

### Links (inline)
Arrow pattern: `text-primary text-[13px] font-bold tracking-[0.05em] uppercase` + ArrowRight icon with `group-hover:gap-2.5 transition-all`

## Layout

- Container: max-width 1200px, centered
- Section padding: `py-16 md:py-36` (generous), `py-12 md:py-14` (compact strip)
- Header height: `h-20 md:h-24`, fixed, z-50
- Content offset: `pt-20` on all page `<main>` elements

## Animation: Citation Flow Network

Replaces the eclipse ring shader. A full-page canvas animation visualizing how AI models discover and cite content.

### Node Types
| Type | Role | Visual | Behavior |
|------|------|--------|----------|
| Source | Content/authority pieces | Medium cyan nodes with glow | Cluster left/center, emit discovery ripples periodically |
| AI Platform | ChatGPT, Gemini, etc. | Larger nodes with halo rings, labeled | Spread right side, 5 fixed platforms |
| Relay | Knowledge connections | Small subtle navy dots | Scattered throughout, bridge source→AI |

### Visual Effects
- **Citation pulses:** Bright cyan particles with glowing trails travel source→AI along curved edges
- **Discovery ripples:** Expanding ring animation when a source node gets "discovered"
- **Curved edges:** Quadratic curves between connected nodes (not straight lines)
- **Breathing:** All nodes gently pulse via sine wave

### Intensity: Present
- Clearly visible but not dominant
- Medium node count, moderate citation pulses, visible clusters
- Light mode: boosted opacity so glass containers have content to blur through
- Dark mode: standard opacity, cyan glow more prominent

### Light Mode Colors
- Nodes: `rgba(0, 155, 180, 0.25-0.35)` — teal, visible against cream
- Edges: `rgba(25, 45, 70, 0.08-0.13)` — navy, subtle
- Pulses: `rgba(0, 184, 217, 0.5-0.8)` — bright cyan
- Labels: `rgba(0, 140, 160, 0.45)`

### Dark Mode Colors
- Nodes: `rgba(0, 210, 245, 0.25-0.4)` — bright cyan
- Edges: `rgba(140, 170, 200, 0.08-0.12)` — light blue-grey
- Pulses: `rgba(0, 230, 255, 0.5-0.8)` — electric cyan
- Labels: `rgba(0, 210, 245, 0.5)`

### Performance
- Throttled to ~30fps for full-page, ~60fps for contained
- Node count scales with viewport area, capped at sensible maximums
- Canvas renders at device pixel ratio

## Other Animations

- `ScrollReveal`: fade-in-up on scroll, staggered with `delay` prop
- `CitationTicker`: simulated real-time AI citations (unique to Wolfstone)
- `ken-burns`: subtle zoom/pan on background images (16s, infinite)
- `logo-scroll`: horizontal logo carousel (45s, linear, pauses on hover)
- `brand-pulse`: pulsing text-shadow on "[Your Brand]" highlights (2.4s)

## Feature Design Specs

### Competitor Input
- Pattern: **Inline toggle expand** below website field
- Default: hidden, "+ Compare with competitors" link
- Expanded: 1-3 competitor brand name fields, stacked on mobile
- Max competitors: 3

### Competitor Results: Competitive Scoreboard
- Pattern: **Ranked leaderboard** (#1, #2, #3, #4) with user's brand highlighted
- Radar chart overlay above showing each brand's AI profile shape
- Mobile: stack rank badges + brand cards vertically, radar below

### Loading State: Animated Scan Sequence
- Progressive platform-by-platform animation
- "Scanning ChatGPT..." → "Scanning Gemini..." with platform icons lighting up
- Results fill in progressively as each platform completes

### Trend Teaser
- Pattern: **Blurred real-data chart** with frosted glass overlay
- Text: "Track how your AI visibility changes over time"
- CTA: "Start tracking for free" → Portal signup
- Uses simulated upward trend line behind blur

### Shareable Reports
- URL format: `/report/{hash}` (clean, professional)
- Read-only version of results page
- Wolfstone branding prominent in header/footer
- CTA: "Run your own audit" for new visitors
- PDF: matches web layout, branded header

### Interaction States
See the full state table in the plan-design-review session notes.

## Accessibility Baseline

- Focus styles: `:focus-visible` ring on all interactive elements
- Score indicators: icons + text alongside color (colorblind safe)
- Touch targets: minimum 44x44px on all buttons
- Form labels: use `htmlFor` attribute (already done)
- Charts: `aria-label` with text summary of data
- Images: meaningful `alt` text on all `<img>` tags

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-25 | Initial design system | Created by /plan-design-review |
| 2026-03-25 | Light-first redesign | Team feedback: preferred light surfaces over dark-first design |
| 2026-03-25 | Citation flow network | Replace eclipse ring with animation that communicates AI visibility value prop |
| 2026-03-25 | Glass container light treatment | Added tinted glass, top-edge highlights, inner shine to make glass visible on light backgrounds |
