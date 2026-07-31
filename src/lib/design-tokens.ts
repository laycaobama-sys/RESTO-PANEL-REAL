/**
 * RestoPanel Design System v5.0 — Tokens
 * Single source of truth for all design tokens.
 * Used by: CSS vars → Tailwind → Components → Figma
 */

export const tokens = {
  colors: {
    // Backgrounds
    bg: {
      base: "#0A0F0E",       // navy/graphite casi negro
      surface: "#111817",    // paneles
      elevated: "#1A2422",   // cards elevadas
      hover: "#1E2A28",      // hover states
    },
    // Brand
    emerald: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",  // primary
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    // Action
    yellow: { 500: "#F59E0B", 400: "#FBBF24" },
    blue: { 500: "#3B82F6", 400: "#60A5FA" },
    red: { 500: "#EF4444", 400: "#F87171" },
    violet: { 500: "#8B5CF6", 400: "#A78BFA" },
    // Semantic
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },

  // Operational states
  states: {
    table: {
      free: "#10B981",       // verde - disponible
      reserved: "#F59E0B",   // amarillo - reservada
      occupied: "#EF4444",   // rojo - ocupada
      billed: "#8B5CF6",     // violeta - cuenta pedida
      cleaning: "#3B82F6",   // azul - limpieza
      blocked: "#6B7280",    // gris - bloqueada
    },
    order: {
      sent: "#3B82F6",
      preparing: "#F59E0B",
      ready: "#10B981",
      served: "#059669",
      voided: "#EF4444",
    },
    payment: {
      pending: "#F59E0B",
      paid: "#10B981",
      failed: "#EF4444",
      refunded: "#8B5CF6",
      disputed: "#F87171",
    },
    employee: {
      active: "#10B981",
      break: "#F59E0B",
      off: "#6B7280",
      sick: "#EF4444",
      vacation: "#3B82F6",
    },
    plan: {
      starter: "#6B7280",
      professional: "#10B981",
      enterprise: "#8B5CF6",
    },
    integration: {
      connected: "#10B981",
      error: "#EF4444",
      pending: "#F59E0B",
      disabled: "#6B7280",
    },
  },

  typography: {
    fontFamily: {
      sans: "var(--font-inter)",
      mono: "var(--font-jetbrains)",
      display: "var(--font-fraunces)",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    base: 4, // px
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
  },

  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.4)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.4)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
    glow: "0 0 20px rgb(16 185 129 / 0.3)",
    glowYellow: "0 0 20px rgb(245 158 11 / 0.3)",
    glowViolet: "0 0 20px rgb(139 92 246 / 0.3)",
  },

  borders: {
    width: { thin: "1px", medium: "2px", thick: "4px" },
    color: "rgb(255 255 255 / 0.08)",
    colorHover: "rgb(255 255 255 / 0.15)",
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    toast: 60,
    tooltip: 70,
  },

  motion: {
    duration: {
      fast: "120ms",
      normal: "220ms",
      slow: "320ms",
      slower: "600ms",
    },
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
} as const;

export type Tokens = typeof tokens;
