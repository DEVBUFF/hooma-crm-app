// tokens.ts
// Design tokens for Hooma CRM — aligned to hooma-design-notes.md (v2.0)
// Fonts: Geist / Geist Mono. Keep this file purely declarative.
//
// Palette rules (from the notes):
//   brand-500 #6B72C9 — decorative, focus, large headings
//   brand-600 #5A61B8 — CTA bg (WCAG AA 4.5:1 on white)
//   brand-700 #4950A3 — CTA hover, text on brand-50
//   brand-50  #EEF0FA — subtle tint
//   mint-100 / mint-50 — surgical accent only
//   ink scale — cool-grey neutrals (Vercel-clean)

export const tokens = {
  colors: {
    // -------- Base (raw palette) --------
    base: {
      // Neutrals (canonical)
      white: "#FFFFFF",
      ink50:  "#F9FAFB",
      ink100: "#F3F4F6",
      ink200: "#E5E7EB",
      ink300: "#D1D5DB",
      ink400: "#9CA3AF",
      ink500: "#6B7280",
      ink700: "#374151",
      ink800: "#1A1A2E",
      ink900: "#0A0A1A",

      // Brand (canonical)
      brand50:  "#EEF0FA",
      brand500: "#6B72C9",
      brand600: "#5A61B8",
      brand700: "#4950A3",

      // Mint (accent — use surgically)
      mint50:  "#ECFEF0",
      mint100: "#DAFCE0",

      // ── Legacy aliases (non-breaking for existing imports) ──
      // Stone/warm names kept but repointed to the new ink scale.
      cream50:  "#FFFFFF",
      cream75:  "#FFFFFF",
      sand100:  "#FFFFFF",
      sand150:  "#EEF0FA", // brand-50
      sand200:  "#E5E7EB", // ink-200
      sand300:  "#F3F4F6", // ink-100

      brown900: "#0A0A1A", // ink-900
      brown800: "#1A1A2E", // ink-800
      brown500: "#374151", // ink-700 (more readable for body)
      brown350: "#6B7280", // ink-500
      brown300: "#D1D5DB", // ink-300

      periwinkle500: "#6B72C9", // brand-500
      periwinkle700: "#5A61B8", // brand-600
      periwinkle900: "#4950A3", // brand-700

      coral500: "#ff6b3d",
      coral550: "#e85d30",

      green600: "#2E8B57",
      green700: "#2E7D4A",
      green650: "#267349",

      red600: "#D4483B",
      blue600: "#2563EB",
    },

    // -------- Semantic (app meaning) --------
    semantic: {
      bg:           "#FFFFFF",
      panel:        "#FFFFFF",
      panelWarm:    "#FFFFFF",

      surface:      "#FFFFFF",
      surfaceMuted: "#F9FAFB",
      surfaceHover: "#EEF0FA",

      border:       "#E5E7EB",
      borderLight:  "#F3F4F6",
      borderSubtle: "#F3F4F6",
      divider:      "#F3F4F6",

      text:           "#0A0A1A",
      textStrong:     "#0A0A1A",
      textMuted:      "#374151",
      textSubtle:     "#6B7280",
      placeholder:    "#9CA3AF",
      textOnPrimary:  "#FFFFFF",

      // Brand actions — brand-600 for CTAs, brand-700 for hover/text-on-light
      primary:       "#5A61B8",
      primaryHover:  "#4950A3",
      primaryText:   "#4950A3",
      primaryTint:   "rgba(107, 114, 201, 0.08)",

      accent:        "#5A61B8",
      accentLight:   "#ECFEF0", // mint-50 — surgical
      accentText:    "#2E7D4A",
      accentHover:   "#4950A3",
      accentTint:    "rgba(107, 114, 201, 0.06)",

      // Navigation
      navActiveBg:   "#EEF0FA",
      navActiveFg:   "#0A0A1A",
      navHoverBg:    "rgba(10, 10, 26, 0.04)",

      // Feedback
      success:             "#2E8B57",
      successBg:           "#ECFEF0",
      successAccent:       "#2E7D4A",
      successAccentHover:  "#267349",
      successStrong:       "#267349",

      error:        "#D4483B",
      errorBg:      "#FEF2F2",
      errorHover:   "rgba(212, 72, 59, 0.12)",
      errorBorder:  "rgba(212, 72, 59, 0.30)",

      info:         "#2563EB",
      infoBg:       "#EFF6FF",
      infoHover:    "rgba(37, 99, 235, 0.12)",

      warning:      "#E6960A",
      warningBg:    "#FFFBEB",
    },

    // -------- Component-level --------
    component: {
      input: {
        bg:           "#FFFFFF",
        bgFocus:      "#FFFFFF",
        border:       "#E5E7EB",
        borderFocus:  "#6B72C9",
        text:         "#0A0A1A",
        placeholder:  "#9CA3AF",
      },
      card: {
        bg:      "#FFFFFF",
        bgAuth:  "#FFFFFF",
        border:  "#E5E7EB",
      },
      badge: {
        defaultBg:  "#F3F4F6",
        defaultFg:  "#374151",
        successBg:  "#ECFEF0",
        successFg:  "#2E7D4A",
        errorBg:    "#FEF2F2",
        errorFg:    "#D4483B",
        warningBg:  "#FFFBEB",
        warningFg:  "#E6960A",
        infoBg:     "#EEF0FA",
        infoFg:     "#4950A3",
        todayBg:    "rgba(107, 114, 201, 0.10)",
        todayFg:    "#4950A3",
      },
    },
  },

  // Radius scale — spec: 6 · 8 · 12 · 16 · 20
  radius: {
    sm:    6,    // buttons, inputs, small chips
    md:    8,    // default controls, pills
    lg:    12,   // cards
    xl:    16,   // larger panels, hero mock
    "2xl": 20,   // dark slabs, final CTA
    full:  9999, // avatars
  },

  shadow: {
    // Spec shadows — subtle, never depth-signalling
    xs: "0 1px 2px rgba(10, 10, 26, 0.04)",
    sm: "0 1px 3px rgba(10, 10, 26, 0.06), 0 1px 2px rgba(10, 10, 26, 0.04)",
    md: "0 4px 12px rgba(10, 10, 26, 0.06), 0 2px 4px rgba(10, 10, 26, 0.04)",
    lg: "0 12px 32px rgba(10, 10, 26, 0.08), 0 4px 8px rgba(10, 10, 26, 0.04)",

    // Extended component shadows
    soft:         "0 1px 2px rgba(10, 10, 26, 0.04)",
    card:         "0 0 0 1px rgba(10, 10, 26, 0.04)",
    cardElevated: "0 12px 32px rgba(10, 10, 26, 0.08), 0 4px 8px rgba(10, 10, 26, 0.04)",
    inner:        "inset 0 1px 2px rgba(10, 10, 26, 0.04)",

    primary:       "0 1px 4px rgba(107, 114, 201, 0.20)",
    primaryHover:  "0 2px 8px rgba(107, 114, 201, 0.30)",
    primaryLg:     "0 2px 8px rgba(107, 114, 201, 0.25)",
    primaryLgHover:"0 4px 16px rgba(107, 114, 201, 0.30)",

    focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #6B72C9",

    authCard: "0 12px 32px rgba(10, 10, 26, 0.08), 0 4px 8px rgba(10, 10, 26, 0.04)",

    topbar:  "0 1px 0 rgba(10, 10, 26, 0.06)",
    sidebar: "4px 0 24px rgba(10, 10, 26, 0.08)",
  },

  typography: {
    fontFamily: {
      sans:    "'Geist', system-ui, sans-serif",
      display: "'Geist', system-ui, sans-serif",
      mono:    "'Geist Mono', monospace",
    },
    // Spec scale (px): 13 · 14 · 16 · 17 · 20 · 24 · 32 · 40 · 56 · 72
    fontSize: {
      xs:   13,
      sm:   14,
      md:   16,
      lg:   17,
      xl:   20,
      "2xl": 24,
      "3xl": 32,
      "4xl": 40,
      "5xl": 56,
      "6xl": 72,
    },
    lineHeight: {
      tight:   1.05,
      snug:    1.25,
      normal:  1.5,
      relaxed: 1.65,
    },
    fontWeight: {
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
    letterSpacing: {
      h1:    "-0.035em",
      h2:    "-0.025em",
      h3:    "-0.01em",
      label: "0.02em",
    },
  },

  // Spacing scale — spec: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128
  spacing: {
    unit:        4,
    pagePadding: 20,
    cardPadding: 24,
    gapSm:  8,
    gapMd:  12,
    gapLg:  16,
    gapXl:  24,
    s1:  4,  s2:  8,  s3: 12, s4: 16,
    s5: 20,  s6: 24,  s8: 32, s10: 40,
    s12: 48, s16: 64, s20: 80, s24: 96, s32: 128,
    touchTarget: 44,
    container: 1160,
    headerHeight: 64,
  },

  motion: {
    duration: {
      fast:   "60ms",   // button press (translateY 1px)
      normal: "150ms",  // color / border / bg transitions (spec default)
      slow:   "300ms",
    },
    easing: {
      standard:   "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      emphasized: "cubic-bezier(0.22, 1.0, 0.36, 1.0)",
    },
  },

  zIndex: {
    base:     0,
    sticky:   10,
    dropdown: 50,
    modal:    100,
    toast:    200,
  },
} as const

export type Tokens = typeof tokens
export type TokenColor =
  | keyof typeof tokens.colors.base
  | keyof typeof tokens.colors.semantic

// Tiny alias for convenience in components
export const t = tokens
