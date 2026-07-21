"use client";

import { create } from "zustand";

export type Phase = "fase0" | "fase1" | "fase2" | "fase4";

interface PhaseState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  toggle: () => void;
}

export const usePhase = create<PhaseState>((set, get) => ({
  phase: "fase4",
  setPhase: (p) => set({ phase: p }),
  toggle: () =>
    set({
      phase:
        get().phase === "fase0"
          ? "fase1"
          : get().phase === "fase1"
          ? "fase2"
          : get().phase === "fase2"
          ? "fase4"
          : "fase0",
    }),
}));
