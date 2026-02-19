// tokens.ts
// Design tokens for Hooma CRM.
// Keep this file purely declarative: no runtime logic, no imports.

export const tokens = {
  colors: {
    base: {
      cream50: "#F5EFE6",
      cream75: "#F5EEE2",
      sand100: "#F0E8DC",
      sand150: "#EDE4D8",
      sand200: "#DDD4C4",
      sand300: "#E5DACB",
      brown900: "#2E211C",
      brown800: "#3E2F2A",
      brown500: "#7A655A",
      brown350: "#A8998C",
      brown300: "#B5A396",
      blue500: "#7FA6C9",
      blue550: "#6A94B8",
      coral500: "#C97B63",
      coral550: "#B86E58",
      green600: "#4A7A4A",
      green650: "#5A8A6A",
      red600: "#A04040",
      blue600: "#4A7EA8",
    },
    semantic: {
      bg: "#F5EFE6",
      panel: "#F5EEE2",
      panelWarm: "#F5EEE4",
      surface: "#EDE4D8",
      surfaceMuted: "#F0E8DC",
      surfaceHover: "#DDD4C4",
      border: "#E5DACB",
      borderSubtle: "rgba(229, 218, 203, 0.60)",
      divider: "#DDD4C4",
      text: "#3E2F2A",
      textStrong: "#2E211C",
      textMuted: "#7A655A",
      textSubtle: "#A8998C",
      placeholder: "#B5A396",
      primary: "#7FA6C9",
      primaryHover: "#6A94B8",
      primaryTint: "rgba(127, 166, 201, 0.15)",
      accent: "#C97B63",
      accentHover: "#B86E58",
      accentTint: "#FAEAE4",
      navActiveBg: "#DFE1E0",
      navActiveFg: "#3E2F2A",
      navHoverBg: "rgba(228, 217, 204, 0.40)",
      success: "#4A7A4A",
      successBg: "#E8EFE7",
      successAccent: "#A8BBA3",
      successAccentHover: "#96A990",
      successStrong: "#5A8A6A",
      error: "#A04040",
      errorBg: "#F0D8D3",
      errorHover: "#E8CCCC",
      errorBorder: "rgba(196, 96, 90, 0.60)",
      info: "#4A7EA8",
      infoBg: "#E4EEF6",
      infoHover: "#D4E4F0",
      warning: "#A8998C",
      warningBg: "#F5EFE6",
    },
    component: {
      input: {
        bg: "#F0E8DC",
        bgFocus: "#EDE4D8",
        border: "#E5DACB",
        borderFocus: "rgba(127, 166, 201, 0.55)",
        text: "#3E2F2A",
        placeholder: "#B5A396",
      },
      card: {
        bg: "#F5EEE2",
        bgAuth: "#F5EEE4",
        border: "rgba(229, 218, 203, 0.60)",
      },
      badge: {
        todayBg: "#E8EFE7",
        todayFg: "#5A8A6A",
      },
    },
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 24,
    "2xl": 28,
    full: 9999,
  },
  shadow: {
    soft: "0 8px 30px rgba(0, 0, 0, 0.06)",
    card: "0 4px 24px rgba(62, 47, 42, 0.06)",
    cardElevated: "0 12px 40px rgba(90, 60, 30, 0.08)",
    sm: "0 2px 12px rgba(62, 47, 42, 0.07)",
    md: "0 4px 20px rgba(62, 47, 42, 0.09)",
    lg: "0 4px 24px rgba(62, 47, 42, 0.08)",
    inner: "inset 0 1px 3px rgba(62, 47, 42, 0.06)",
    primary: "0 2px 8px rgba(127, 166, 201, 0.25)",
    primaryHover: "0 4px 16px rgba(127, 166, 201, 0.35)",
    primaryLg: "0 2px 12px rgba(127, 166, 201, 0.30)",
    primaryLgHover: "0 4px 20px rgba(127, 166, 201, 0.40)",
    authCard: "0 8px 40px rgba(46, 33, 28, 0.12), 0 2px 10px rgba(46, 33, 28, 0.06)",
    topbar: "0 2px 16px rgba(62, 47, 42, 0.06)",
    sidebar: "0 12px 40px rgba(90, 60, 30, 0.08)",
  },
  typography: {
    fontFamily: {
      sans: "var(--font-sf-pro-rounded), ui-rounded, system-ui, -apple-system, sans-serif",
    },
    fontSize: { xs: 12, sm: 13, md: 14, lg: 16, xl: 20, "2xl": 28, "3xl": 36 },
    lineHeight: { tight: 1.15, snug: 1.25, normal: 1.45 },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    letterSpacing: { label: 0.12 },
  },
  spacing: {
    pagePadding: 24, cardPadding: 20,
    gapSm: 8, gapMd: 12, gapLg: 16, gapXl: 24,
  },
  motion: {
    duration: { fast: "120ms", normal: "180ms", slow: "260ms" },
    easing: {
      standard: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
      emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1.0)",
    },
  },
  zIndex: { base: 0, sticky: 10, dropdown: 50, modal: 100, toast: 200 },
} as const;

export type Tokens = typeof tokens;
export type TokenColor =
  | keyof typeof tokens.colors.base
  | keyof typeof tokens.colors.semantic;

export const t = tokens;
