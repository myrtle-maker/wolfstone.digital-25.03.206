# TODOS.md — Wolfstone Digital

## Design TODOs

### TODO: Comprehensive Empty States
- **Priority:** P2
- **Effort:** M (human) → S (CC+gstack)
- **What:** Design and implement warm, actionable empty states for 5 key screens: audit results (no brand entered), portal projects (new user), saved prompts (empty), competitor comparison (no competitors added), and trend chart (no history).
- **Why:** First-time users hit empty states before anything else — this is literally their first impression of each feature. "No items found" is not a design.
- **Context:** DESIGN.md defines card patterns and typography but has no empty state pattern. Each empty state needs: an illustration or icon, a human message, and a primary action button.
- **Depends on:** DESIGN.md (done)
- **Source:** /plan-design-review 2026-03-25

### TODO: Section Transition Design
- **Priority:** P3
- **Effort:** S (human) → S (CC+gstack)
- **What:** Design intentional visual transitions between dark and light sections — gradient dividers, angled clips, or subtle wave SVGs instead of hard background-color cuts.
- **Why:** Hard color cuts between `--wd-navy` and `--wd-cream` feel jarring and generic. Intentional transitions signal design quality and build trust.
- **Context:** DESIGN.md defines section rhythm (navy → midnight → cream → stone) but doesn't specify transition treatment between dark/light boundaries.
- **Depends on:** Nothing
- **Source:** /plan-design-review 2026-03-25

### TODO: PDF Report Layout Design
- **Priority:** P2
- **Effort:** M (human) → S (CC+gstack)
- **What:** Design a branded PDF layout for audit reports — header with Wolfstone logo, score summary, per-platform breakdown, and footer CTA ("Run your own audit at wolfstone.digital").
- **Why:** PDF reports are shared with enterprise stakeholders who judge the product by its print quality. A poorly designed PDF undermines the "premium consultancy" positioning.
- **Context:** CEO review accepted shareable reports. Web layout decided (`/report/{hash}`). PDF layout still undefined. Browser-based PDF generation (html2pdf or similar) has layout constraints — design within those limits.
- **Depends on:** Shareable reports implementation
- **Source:** /plan-design-review 2026-03-25

### TODO: Motion Design System
- **Priority:** P3
- **Effort:** S (human) → S (CC+gstack)
- **What:** Define a motion design system: easing function tokens (ease-out for entrances, ease-in-out for state changes), duration scale (150ms micro, 300ms standard, 500ms emphasis), and interaction feedback patterns (button press scale, hover lift timing, focus ring transition).
- **Why:** Inconsistent animation timing feels unpolished. A motion system makes every interaction feel cohesive.
- **Context:** DESIGN.md lists 5 animations (ScrollReveal, CitationTicker, ken-burns, logo-scroll, brand-pulse) but has no timing/easing system. Just documentation + a few CSS custom properties.
- **Depends on:** DESIGN.md (done)
- **Source:** /plan-design-review 2026-03-25

## Engineering TODOs (from /plan-ceo-review)

### TODO: Structured Logging
- **Priority:** P2
- **Effort:** M (human) → S (CC+gstack)
- **What:** Add structured JSON logging to all Edge Functions with request IDs, timing, and error context.
- **Why:** Currently impossible to debug production issues — logs are unstructured console.log output.
- **Context:** 8 Edge Functions with no structured logging. Need request ID propagation, timing, error serialization.
- **Depends on:** Nothing
- **Source:** /plan-ceo-review 2026-03-25

### TODO: API Cost Tracking
- **Priority:** P2
- **Effort:** M (human) → S (CC+gstack)
- **What:** Track LLM API costs per audit (token counts, model used, cost estimate) in a Supabase table.
- **Why:** No visibility into per-audit costs. Cannot price the service correctly without understanding unit economics.
- **Context:** llm-checker calls multiple AI platforms per audit. Need to capture token usage from each response and store alongside the audit result.
- **Depends on:** Structured logging (helpful but not blocking)
- **Source:** /plan-ceo-review 2026-03-25

### TODO: Mobile QA Pass
- **Priority:** P2
- **Effort:** M (human) → S (CC+gstack)
- **What:** Comprehensive mobile QA across all pages — touch targets, overflow, navigation, form usability on small screens.
- **Why:** Enterprise marketing leaders often preview tools on mobile. Broken mobile experience kills credibility.
- **Context:** Responsive specs now defined in DESIGN.md but not yet verified against live site. Need testing on 375px, 390px, 414px viewports minimum.
- **Depends on:** DESIGN.md responsive specs (done)
- **Source:** /plan-ceo-review 2026-03-25
