"use client";

import { create } from "zustand";

export type View = "landing" | "app";
export type Section =
  | "dashboard"
  | "reservas"
  | "crm"
  | "marketing"
  | "automatizaciones"
  | "reviews"
  | "analytics"
  | "integraciones"
  | "billing"
  | "equipo"
  | "configuracion"
  | "superadmin";

interface NavState {
  view: View;
  section: Section;
  org: string;
  location: string;
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
  setView: (v) => set({ view: v }),
  go: (s) => set({ view: "app", section: s }),
  setOrg: (o) => set({ org: o }),
  setLocation: (l) => set({ location: l }),
}));
