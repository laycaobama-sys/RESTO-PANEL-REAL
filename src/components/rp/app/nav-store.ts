"use client";

import { create } from "zustand";

export type View = "landing" | "app";
export type Section =
  | "dashboard"
  | "executive"
  | "reservas"
  | "tpv"
  | "pda"
  | "kds"
  | "carta-qr"
  | "delivery"
  | "inventario"
  | "personal"
  | "menu-engineering"
  | "baseline"
  | "onboarding"
  | "onboarding-guided"
  | "hardware"
  | "staff-advanced"
  | "autopilot"
  | "channels"
  | "preinstalled-automations"
  | "mobile-pda"
  | "crm"
  | "marketing"
  | "automatizaciones"
  | "flow-builder"
  | "copilot-contextual"
  | "growth-analytics"
  | "growth-reputation"
  | "roi-calculator"
  | "landing-dynamic"
  | "campaigns"
  | "promotions"
  | "reviews"
  | "analytics"
  | "integraciones"
  | "billing"
  | "entitlements"
  | "saas-metrics"
  | "health-score"
  | "upgrade-engine"
  | "nav-manifest"
  | "equipo"
  | "configuracion"
  | "superadmin"
  | "super-admin-v2"
  | "multi-local"
  | "app-store"
  | "signup-funnel"
  | "access-gate"
  | "entitlements-engine"
  | "billing-portal"
  | "ai-center"
  | "ai-knowledge"
  | "ai-menu";

export type AuthMode = "login" | "signup" | "forgot";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  role: string;
  org: string;
}

interface NavState {
  view: View;
  section: Section;
  org: string;
  location: string;
  // Auth
  authOpen: boolean;
  authMode: AuthMode;
  user: AuthUser | null;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setAuthMode: (m: AuthMode) => void;
  login: (user: AuthUser) => void;
  logout: () => void;
  // Nav
  setView: (v: View) => void;
  go: (s: Section) => void;
  setOrg: (o: string) => void;
  setLocation: (l: string) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "landing",
  section: "dashboard",
  org: "Ramses Group",
  location: "Ramses Madrid",
  authOpen: false,
  authMode: "login",
  user: null,
  openAuth: (mode = "login") => set({ authOpen: true, authMode: mode }),
  closeAuth: () => set({ authOpen: false }),
  setAuthMode: (m) => set({ authMode: m }),
  login: (user) => set({ user, authOpen: false, view: "app", section: "dashboard" }),
  logout: () => set({ user: null, view: "landing", authOpen: false }),
  setView: (v) => set({ view: v }),
  go: (s) => set({ view: "app", section: s }),
  setOrg: (o) => set({ org: o }),
  setLocation: (l) => set({ location: l }),
}));
