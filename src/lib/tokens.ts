// tokens.ts
// Design tokens for Hooma CRM — Apple-inspired flat palette.
// Keep this file purely declarative: no runtime logic, no imports.

export const tokens = {
  colors: {
    // -------- Base (raw palette) --------
    base: {
      cream50: "#ffffff",
      cream75: "#f5f5f7",
      sand100: "#f5f5f7",
      sand150: "#e8e8ed",
      sand200: "#d2d2d7",
      sand300: "#e8e8ed",

      brown900: "#1d1d1f",
      brown800: "#1d1d1f",
      brown500: "#86868b",
      brown350: "#aeaeb2",
      brown300: "#c7c7cc",

      blue500: "#0071e3",
      blue550: "#0077ed",

      coral500: "#ff6b3d",
      coral550: "#e85d30",

      green600: "#34c759",
      green650: "#30b350",

      red600: "#ff3b30",
      blue600: "#007aff",
    },

    // -------- Semantic (app meaning) --------
    semantic: {
      bg: "#f5f5f7",
      panel: "#ffffff",
      panelWarm: "#ffffff",

      surface: "#f5f5f7",
      surfaceMuted: "#f5f5f7",
      surfaceHover: "#e8e8ed",

      border: "#d2d2d7",
      borderSubtle: "#e8e8ed",
      divider: "#e8e8ed",

      text: "#1d1d1f",
      textStrong: "#1d1d1f",
      textMuted: "#86868b",
      textSubtle: "#aeaeb2",
      placeholder: "#c7c7cc",

      // Brand actions
      primary: "#0071e3",
      primaryHover: "#0077ed",
      primaryTint: "rgba(0, 113, 227, 0.08)",

      accent: "#0071e3",
      accentHover: "#0077ed",
      accentTint: "rgba(0, 113, 227, 0.06)",

      // Navigation
      navActiveBg: "#e8e8ed",
      navActiveFg: "#1d1d1f",
      navHoverBg: "rgba(0, 0, 0, 0.04)",

      // Feedback
      success: "#34c759",
      successBg: "rgba(52, 199, 89, 0.08)",
      successAccent: "#30b350",
      successAccentHover: "#28a745",
      successStrong: "#30b350",

      error: "#ff3b30",
      errorBg: "rgba(255, 59, 48, 0.08)",
      errorHover: "rgba(255, 59, 48, 0.12)",
      errorBorder: "rgba(255, 59, 48, 0.30)",

      info: "#007aff",
      infoBg: "rgba(0, 122, 255, 0.08)",
      infoHover: "rgba(0, 122, 255, 0.12)",

      warning: "#ff9500",
      warningBg: "rgba(255, 149, 0, 0.08)",
    },

    // -------- Component-level (optional conveniences) --------
    component: {
      input: {
        bg: "#ffffff",
        bgFocus: "#ffffff",
        border: "#d2d2d7",
        borderFocus: "#0071e3",
        text: "#1d1d1f",
        placeholder: "#c7c7cc",
      },
      card: {
        bg: "#ffffff",
        bgAuth: "#ffffff",
        border: "#e8e8ed",
      },
      badge: {
        todayBg: "rgba(0, 122, 255, 0.06)",
        todayFg: "#007aff",
      },
    },
  },

  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
    "2xl": 12,
    full: 9999,
  },

  shadow: {
    // Minimal Apple-style shadows — mostly hairline borders do the work.
    soft: "0 1px 3px rgba(0, 0, 0, 0.04)",

    card: "0 0 0 1px rgba(0, 0, 0, 0.04)",
    cardElevated: "0 4px 24px rgba(0, 0, 0, 0.12)",

    sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
    md: "0 2px 8px rgba(0, 0, 0, 0.06)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.10)",

    inner: "inset 0 1px 2px rgba(0, 0, 0, 0.04)",

    primary: "0 1px 4px rgba(0, 113, 227, 0.20)",
    primaryHover: "0 2px 8px rgba(0, 113, 227, 0.30)",
    primaryLg: "0 2px 8px rgba(0, 113, 227, 0.20)",
    primaryLgHover: "0 4px 16px rgba(0, 113, 227, 0.25)",

    authCard:
      "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",

    topbar: "0 1px 0 rgba(0, 0, 0, 0.06)",
    sidebar: "0 0 24px rgba(0, 0, 0, 0.08)",
  },

  typography: {
    fontFamily: {
      sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
    },
    fontSize: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 17,
      xl: 21,
      "2xl": 28,
      "3xl": 36,
    },
    lineHeight: {
      tight: 1.15,
      snug: 1.25,
      normal: 1.47,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      label: 0.02,
    },
  },

  spacing: {
    pagePadding: 20,
    cardPadding: 20,
    gapSm: 8,
    gapMd: 12,
    gapLg: 16,
    gapXl: 24,
  },

  motion: {
    duration: {
      fast: "100ms",
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
