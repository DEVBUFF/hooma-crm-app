// tokens.ts
// Design tokens for Hooma CRM — Brand Guide v1.0
// Fonts: Geist / Geist Mono (Google Fonts). Keep this file purely declarative.

export const tokens = {
  colors: {
    // -------- Base (raw palette — brand guide) --------
    base: {
      cream50: "#FFFFFF",
      cream75: "#F8F7F4",
      sand100: "#F8F7F4",
      sand150: "#EEF0FB",
      sand200: "#E5E2DC",
      sand300: "#F0EDE8",

      brown900: "#1A1A1A",
      brown800: "#1A1A1A",
      brown500: "#6B6B6B",
      brown350: "#9B9B9B",
      brown300: "#c7c7cc",

      periwinkle500: "#7B8CDE",
      periwinkle700: "#5563B8",
      periwinkle900: "#3B4494",

      coral500: "#ff6b3d",
      coral550: "#e85d30",

      green600: "#2E8B57",
      green700: "#2E7D4A",
      green650: "#267349",

      red600: "#D4483B",
      blue600: "#2563EB",
    },

    // -------- Semantic (app meaning — brand guide) --------
    semantic: {
      bg: "#F8F7F4",
      panel: "#FFFFFF",
      panelWarm: "#FFFFFF",

      surface: "#F8F7F4",
      surfaceMuted: "#F8F7F4",
      surfaceHover: "#EEF0FB",

      border: "#E5E2DC",
      borderLight: "#F0EDE8",
      borderSubtle: "#F0EDE8",
      divider: "#F0EDE8",

      text: "#1A1A1A",
      textStrong: "#1A1A1A",
      textMuted: "#6B6B6B",
      textSubtle: "#9B9B9B",
      placeholder: "#9B9B9B",
      textOnPrimary: "#ffffff",

      // Brand actions
      primary: "#7B8CDE",
      primaryHover: "#5563B8",
      primaryText: "#3B4494",
      primaryTint: "rgba(123, 140, 222, 0.08)",

      accent: "#7B8CDE",
      accentLight: "#E8F5E9",
      accentText: "#2E7D4A",
      accentHover: "#5563B8",
      accentTint: "rgba(123, 140, 222, 0.06)",

      // Navigation
      navActiveBg: "#EEF0FB",
      navActiveFg: "#1A1A1A",
      navHoverBg: "rgba(0, 0, 0, 0.04)",

      // Feedback
      success: "#2E8B57",
      successBg: "#E8F5E9",
      successAccent: "#2E7D4A",
      successAccentHover: "#267349",
      successStrong: "#267349",

      error: "#D4483B",
      errorBg: "#FEF2F2",
      errorHover: "rgba(212, 72, 59, 0.12)",
      errorBorder: "rgba(212, 72, 59, 0.30)",

      info: "#2563EB",
      infoBg: "#EFF6FF",
      infoHover: "rgba(37, 99, 235, 0.12)",

      warning: "#E6960A",
      warningBg: "#FFFBEB",
    },

    // -------- Component-level --------
    component: {
      input: {
        bg: "#FFFFFF",
        bgFocus: "#FFFFFF",
        border: "#E5E2DC",
        borderFocus: "#7B8CDE",
        text: "#1A1A1A",
        placeholder: "#9B9B9B",
      },
      card: {
        bg: "#FFFFFF",
        bgAuth: "#FFFFFF",
        border: "#F0EDE8",
      },
      badge: {
        defaultBg: "#F0EDE8",
        defaultFg: "#6B6B6B",
        successBg: "#E8F5E9",
        successFg: "#2E7D4A",
        errorBg: "#FEF2F2",
        errorFg: "#D4483B",
        warningBg: "#FFFBEB",
        warningFg: "#E6960A",
        infoBg: "#EEF0FB",
        infoFg: "#3B4494",
        todayBg: "rgba(37, 99, 235, 0.06)",
        todayFg: "#2563EB",
      },
    },
  },

  radius: {
    sm: 6,       // buttons, inputs
    md: 10,      // badges, tags, pills
    lg: 14,      // cards, modals, panels
    full: 9999,  // avatars, circular indicators
  },

  shadow: {
    // Brand guide canonical shadows
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 2px 8px rgba(0, 0, 0, 0.08)",

    // Extended component shadows
    soft: "0 1px 3px rgba(0, 0, 0, 0.04)",
    card: "0 0 0 1px rgba(0, 0, 0, 0.04)",
    cardElevated: "0 4px 24px rgba(0, 0, 0, 0.12)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.10)",
    inner: "inset 0 1px 2px rgba(0, 0, 0, 0.04)",

    primary: "0 1px 4px rgba(123, 140, 222, 0.20)",
    primaryHover: "0 2px 8px rgba(123, 140, 222, 0.30)",
    primaryLg: "0 2px 8px rgba(123, 140, 222, 0.20)",
    primaryLgHover: "0 4px 16px rgba(123, 140, 222, 0.25)",

    focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #7B8CDE",

    authCard:
      "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",

    topbar: "0 1px 0 rgba(0, 0, 0, 0.06)",
    sidebar: "0 0 24px rgba(0, 0, 0, 0.08)",
  },

  typography: {
    fontFamily: {
      sans: "'Geist', system-ui, sans-serif",
      display: "'Geist', system-ui, sans-serif",
      mono: "'Geist Mono', monospace",
    },
    fontSize: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      "2xl": 24,
      "3xl": 30,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.25,
      normal: 1.4,
      relaxed: 1.6,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      h1: "-0.5px",
      h2: "-0.3px",
      label: "0.02em",
    },
  },

  spacing: {
    unit: 4,
    pagePadding: 20,
    cardPadding: 20,
    gapSm: 8,
    gapMd: 12,
    gapLg: 16,
    gapXl: 24,
    touchTarget: 44,
  },

  motion: {
    duration: {
      fast: "120ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      standard: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      emphasized: "cubic-bezier(0.22, 1.0, 0.36, 1.0)",
    },
  },

  zIndex: {
    base: 0,
    sticky: 10,
    dropdown: 50,
    modal: 100,
    toast: 200,
  },
} as const

export type Tokens = typeof tokens
export type TokenColor =
  | keyof typeof tokens.colors.base
  | keyof typeof tokens.colors.semantic

// Optional: tiny aliases for convenience in components
export const t = tokens
