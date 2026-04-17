# Hooma — Motion & Animation Guide

This project ships a small, CSS-first motion system. No runtime animation library
(no Framer Motion, no GSAP) — everything is CSS keyframes, transitions, and
scroll-driven animations. That keeps the bundle lean and matches the app's
"quiet, professional" tone.

---

## Principles

1. **Quiet, not performative.** Motion should reinforce hierarchy and
   feedback, never demand attention.
2. **Animate only `transform` and `opacity`.** These run on the compositor at
   60fps. Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`,
   or anything that triggers layout.
3. **Respect motion preferences.** Everything decorative must be neutralised
   inside `@media (prefers-reduced-motion: reduce)`.
4. **Short and soft.** 180–520ms, spring-leaning ease. No bounces, no parallax
   scroll-jacking, no auto-playing hero video.
5. **Purpose over polish.** If a motion doesn't clarify state, hierarchy, or
   affordance, cut it.

---

## Duration & easing tokens

Defined in `src/app/page.tsx` inside `LANDING_CSS` (scoped under `.hooma-v2`):

```
--anim-dur-quick: 180ms;   /* hover, focus, button press                 */
--anim-dur-base:  320ms;   /* most entrance animations                   */
--anim-dur-slow:  520ms;   /* hero copy, large-surface reveals           */
--anim-ease:      cubic-bezier(0.22, 0.61, 0.36, 1);   /* standard ease  */
--anim-ease-out:  cubic-bezier(0.16, 1, 0.3, 1);       /* soft overshoot */
```

Use the slow/out curve for entrances, the standard curve for hover states.

---

## Techniques used (by priority)

### 1. CSS keyframes + stagger (universal)
Entrance on page load. Apply `animation-delay` in 60–80ms increments to give
sibling elements a sense of order.

```css
.hero h1        { animation: fade-rise 520ms var(--anim-ease-out) both; animation-delay: 60ms; }
.hero .lede     { animation: fade-rise 520ms var(--anim-ease-out) both; animation-delay: 140ms; }
.hero-actions   { animation: fade-rise 520ms var(--anim-ease-out) both; animation-delay: 220ms; }
```

### 2. Scroll-driven animations (Chrome 115+, Safari 26+)
Modern replacement for `IntersectionObserver` reveal patterns. No JS.

```css
@supports (animation-timeline: view()) {
  .pain-card,
  .benefit,
  .proof-card {
    animation: fade-rise 520ms var(--anim-ease-out) both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }
}
```

The `@supports` guard makes older browsers render the content in its final state
(no "missing" reveal).

### 3. Ambient loops (used sparingly)
- `.product-shot` — gentle float (6s, translateY ±4px)
- `.eyebrow .dot` — soft pulse (2.4s, opacity only)

Loops must be **slow** (≥ 2s) and **small** (≤ 4px or 0.3 opacity). Anything
faster/bigger reads as frantic.

### 4. Micro-interactions
- Buttons: `translateY(-1px)` on hover, `translateY(1px)` on `:active`
- Cards: `translateY(-2px)` + border darken on hover (already in place for
  `.pain-card`)
- Links: `transition: color var(--anim-dur-quick) var(--anim-ease);`

---

## Reduced-motion handling

Single global override at the bottom of the animation layer:

```css
@media (prefers-reduced-motion: reduce) {
  .hooma-v2 *,
  .hooma-v2 *::before,
  .hooma-v2 *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Do / Don't

**Do**
- Stagger (60–80ms between siblings).
- Fade + 8–16px translateY for entrances.
- Use `will-change: transform` only where animation actually runs.
- Cap loop opacity/translation (subtle over showy).

**Don't**
- Animate colour/background on scroll (reads expensive, rarely useful).
- Use `animation: ... infinite` on more than 2 elements per viewport.
- Parallax the hero content.
- Use bounce/elastic easing on anything above 14px type.
- Trigger animations on click for non-interactive feedback.

---

## Where motion lives

- **Global layer**: `src/styles/globals.css`, section 8 ("MOTION SYSTEM"). Tokens,
  keyframes, opt-in utility classes, scroll-driven rules, and the
  reduced-motion override. Used across `/app/*`, `/auth/*`, and legal pages.
- **Landing-specific motion**: scoped inside the `LANDING_CSS` template literal
  in `src/app/page.tsx`, under a `/* === MOTION === */` banner. Calendar mock
  floats, hero stagger, pet-card slide-in live there.

Keep them separate: the landing has its own namespace (`.hooma-v2`) and shouldn't
leak hero animations into the app shell.

---

## Project-wide utility classes

Defined in `globals.css`. Opt-in via `className`, no JS needed.

### Entrance (run on mount)
| Class               | Animation                          | When to use                     |
| ------------------- | ---------------------------------- | ------------------------------- |
| `.anim-fade-in`     | opacity 0 → 1 (320ms)              | Subtle reveal, full containers  |
| `.anim-rise`        | opacity + translateY(12px) (520ms) | Default entrance for panels     |
| `.anim-fade-down`   | opacity + translateY(-8px) (320ms) | Dropdowns, top bars             |
| `.anim-slide-right` | opacity + translateX(20px) (520ms) | Side drawers, trailing cards    |
| `.anim-slide-left`  | opacity + translateX(-20px)        | Sidebars, leading cards         |
| `.anim-scale-in`    | opacity + scale(0.96) (320ms)      | Auth cards, dialogs, popovers   |
| `.anim-page`        | Fade-rise (320ms), route wrapper   | Apply to page content wrapper   |

### Stagger
Apply `.stagger-children` to a parent and one of the `.anim-*` classes to each
child. Children 1–12 get a 60ms incremental delay.

```tsx
<ul className="stagger-children">
  {items.map((it) => (
    <li key={it.id} className="anim-rise">…</li>
  ))}
</ul>
```

### Scroll-driven reveal
Use `.reveal-on-scroll` on a block and it will fade-rise as it enters the
viewport (Chrome 115+, Safari 26+). Older browsers see the final state.

```tsx
<section className="reveal-on-scroll">…</section>
```

### Global interactive transitions
`a`, `button`, `[role="button"]`, form controls, and `summary` get a 180ms
transition on `color`, `background-color`, `border-color`, `box-shadow`, and
`opacity` by default. No transform — components that want a hover lift must
opt in (e.g. the proof cards on the landing).

---

## Where it's wired

- `src/app/app/layout.tsx` — the main content wrapper uses `key={pathname}` +
  `.anim-page` so **every dashboard route** fades-rises on navigation.
- `src/components/legal-shell.tsx` — article is `.anim-page`; the legal copy
  inside is `.reveal-on-scroll`.
- `src/app/auth/login/page.tsx` + `register/page.tsx` — auth cards use
  `.anim-scale-in` for a gentle dialog-style appearance.
- `src/app/page.tsx` — landing has its own rich motion layer (see above).

---

## Adding motion to a new page or component

1. Is it a route page? Add `.anim-page` to the outermost container.
2. Is it a grid/list? Wrap with `.stagger-children` and apply `.anim-rise` to
   each item.
3. Is it revealed on scroll? Add `.reveal-on-scroll`.
4. Is it a dialog/popover/auth card? Use `.anim-scale-in`.
5. Need something custom? Add a new `@keyframes hooma-*` + `.anim-*` class in
   `globals.css` section 8. Stay under 520ms and use `var(--anim-ease-out)`.

Don't reach for Framer Motion — we're CSS-first by design.
