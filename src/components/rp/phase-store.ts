"use client";

import { create } from "zustand";

export type Phase = "fase0" | "fase1";

interface PhaseState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  toggle: () => void;
}

export const usePhase = create<PhaseState>((set, get) => ({
  phase: "fase1",
  setPhase: (p) => set({ phase: p }),
  toggle: () => set({ phase: get().phase === "fase0" ? "fase1" : "fase0" }),
}));
