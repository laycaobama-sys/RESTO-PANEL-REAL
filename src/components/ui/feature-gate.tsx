"use client";

/**
 * <Gate> — Feature gate (spec D.5, layer 3).
 *
 * Wraps UI components and only renders them if the current org has the
 * entitlement. If access is denied, renders nothing (default) or a subtle
 * upsell prompt card (when `showUpsell` is set).
 *
 * Usage:
 *   <Gate feature="health-score">
 *     <HealthScoreView />
 *   </Gate>
 *
 *   <Gate feature="yield-pricing" showUpsell>
 *     <YieldPricingPanel />
 *   </Gate>
 *
 * The entitlements store is a Zustand mock of the License Engine resolution.
 * Default plan: professional. Switch with `useEntitlementStore.getState().setPlan("enterprise")`.
 */

import * as React from "react";
import { create } from "zustand";
import { Lock, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  can,
  limitOf,
  denyReason,
  minPlanFor,
  PLAN_DISPLAY,
  PLAN_FEATURES,
  type FeatureKey,
  type PlanId,
} from "@/lib/feature-flags";

/* ========================================================= */
/*  Types                                                    */
/* ========================================================= */

export interface UsageRecord {
  used: number;
  limit: number; // -1 = unlimited, 0 = blocked
  unit?: string;
}

export type EntitlementSet = Record<FeatureKey, UsageRecord>;

export interface EntitlementsState {
  plan: PlanId;
  /** Optional usage overrides (simulating real usage counters). */
  usage: Partial<Record<FeatureKey, { used: number; unit?: string }>>;
  /** Switch the active plan (demo). */
  setPlan: (plan: PlanId) => void;
  /** Set/update the usage counter for a feature. */
  setUsage: (feature: FeatureKey, used: number, unit?: string) => void;
  /** Reset all usage counters. */
  resetUsage: () => void;
}

/* ========================================================= */
/*  Zustand store (mock License Engine)                      */
/* ========================================================= */

/**
 * Default usage counters — simulate realistic usage on the Professional plan.
 * These map to the quota-style features where the limit matters for the
 * `reason` field returned by `useFeature`.
 */
const DEFAULT_USAGE: Partial<Record<FeatureKey, { used: number; unit?: string }>> = {
  "campanas-email": { used: 320, unit: "envíos/mes" },
  "crm-perfiles": { used: 1247, unit: "clientes" },
  triggers: { used: 18, unit: "ejecuciones/mes" },
  kds: { used: 3, unit: "pantallas" },
  pda: { used: 2, unit: "dispositivos" },
  "multi-local": { used: 2, unit: "locales" },
};

export const useEntitlementStore = create<EntitlementsState>((set) => ({
  plan: "professional",
  usage: DEFAULT_USAGE,
  setPlan: (plan) => set({ plan }),
  setUsage: (feature, used, unit) =>
    set((state) => ({
      usage: { ...state.usage, [feature]: { used, unit } },
    })),
  resetUsage: () => set({ usage: DEFAULT_USAGE }),
}));

/* ========================================================= */
/*  Hooks                                                    */
/* ========================================================= */

export interface FeatureAccess {
  allowed: boolean;
  limit: number | null;
  reason: string | null;
}

/**
 * useFeature(featureKey) — returns { allowed, limit, reason } for the
 * current org (plan + usage).
 *
 * - `allowed` true if the plan grants access AND usage is within limits.
 * - `limit` is the numeric limit (null if true/unlimited, 0 if blocked).
 * - `reason` explains WHY it's denied (null when allowed).
 */
export function useFeature(feature: FeatureKey): FeatureAccess {
  const plan = useEntitlementStore((s) => s.plan);
  const usage = useEntitlementStore((s) => s.usage);

  const planValue = PLAN_FEATURES[plan][feature];
  const allowedByPlan = can(plan, feature);
  const numericLimit = limitOf(plan, feature);

  // Quota check: only when there's a numeric limit > 0 and a usage record.
  let withinQuota = true;
  let usedInfo: { used: number; limit: number; unit?: string } | undefined;
  const usageRecord = usage[feature];
  if (
    typeof planValue === "number" &&
    planValue > 0 &&
    usageRecord
  ) {
    usedInfo = { used: usageRecord.used, limit: planValue, unit: usageRecord.unit };
    withinQuota = usageRecord.used < planValue;
  }

  const allowed = allowedByPlan && withinQuota;
  const limit =
    typeof planValue === "boolean"
      ? planValue
        ? null // unlimited
        : 0 // blocked
      : numericLimit; // numeric (incl. -1 unlimited, 0 blocked)

  const reason = allowed ? null : denyReason(plan, feature, usedInfo);

  return { allowed, limit, reason };
}

/**
 * useEntitlements() — returns the full EntitlementSet for the current org.
 * Useful for dashboards that need to render many gates at once without
 * calling useFeature repeatedly.
 */
export function useEntitlements(): EntitlementSet {
  const plan = useEntitlementStore((s) => s.plan);
  const usage = useEntitlementStore((s) => s.usage);

  return React.useMemo(() => {
    const result = {} as EntitlementSet;
    const allFeatures = Object.keys(PLAN_FEATURES[plan]) as FeatureKey[];
    for (const key of allFeatures) {
      const v = PLAN_FEATURES[plan][key];
      let limit: number;
      if (v === true) limit = -1;
      else if (v === false) limit = 0;
      else limit = v;
      const usageRecord = usage[key];
      const used = usageRecord?.used ?? 0;
      result[key] = { used, limit, unit: usageRecord?.unit };
    }
    return result;
  }, [plan, usage]);
}

/* ========================================================= */
/*  <Gate> component                                         */
/* ========================================================= */

export interface GateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /**
   * When true and access is denied, render a subtle upsell prompt card
   * instead of nothing.
   */
  showUpsell?: boolean;
  /**
   * Optional fallback rendered when access is denied (overrides the
   * default nothing / upsell card).
   */
  fallback?: React.ReactNode;
  /**
   * Optional className on the upsell card wrapper.
   */
  className?: string;
  /**
   * Optional label for the feature shown in the upsell prompt.
   * Defaults to the catalog label.
   */
  featureLabel?: string;
}

export function Gate({
  feature,
  children,
  showUpsell = false,
  fallback,
  className,
  featureLabel,
}: GateProps) {
  const { allowed, reason } = useFeature(feature);
  const { toast } = useToast();

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpsell) {
    return null;
  }

  return (
    <GateUpsell
      feature={feature}
      featureLabel={featureLabel}
      reason={reason}
      className={className}
      onUpgrade={() => {
        toast({
          title: "Solicitar upgrade",
          description: `Te contactaremos para activar "${featureLabel ?? feature}" en tu cuenta.`,
        });
      }}
    />
  );
}

/* ========================================================= */
/*  Upsell card                                              */
/* ========================================================= */

interface GateUpsellProps {
  feature: FeatureKey;
  featureLabel?: string;
  reason: string | null;
  className?: string;
  onUpgrade: () => void;
}

export function GateUpsell({
  feature,
  featureLabel,
  reason,
  className,
  onUpgrade,
}: GateUpsellProps) {
  const minPlan = minPlanFor(feature);
  const minName = minPlan ? PLAN_DISPLAY[minPlan].name : "superior";
  const label = featureLabel ?? feature;

  return (
    <div
      className={cn(
        "rp-gate-upsell rp-glass rounded-2xl border border-dashed border-[var(--gold)]/40 p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px]",
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[var(--gold)]/10 text-[var(--gold)] mb-3 ring-1 ring-[var(--gold)]/30">
        <Lock className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-display text-base sm:text-lg">{label}</h3>
        <Badge
          variant="outline"
          className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {minName}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {reason ?? `Esta funcionalidad está disponible a partir del plan ${minName}.`}
      </p>
      <Button
        size="sm"
        onClick={onUpgrade}
        className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] font-medium"
      >
        Actualizar
        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
}

/* ========================================================= */
/*  Plan switcher (demo helper)                              */
/* ========================================================= */

export interface PlanSwitcherProps {
  className?: string;
  /** Hide the label text (icon-only). */
  compact?: boolean;
}

/**
 * Demo helper to switch the active plan. Useful for testing the Gate
 * component across plans in storybook / dev.
 */
export function PlanSwitcher({ className, compact = false }: PlanSwitcherProps) {
  const plan = useEntitlementStore((s) => s.plan);
  const setPlan = useEntitlementStore((s) => s.setPlan);
  const { toast } = useToast();

  const plans: PlanId[] = ["starter", "professional", "enterprise"];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border/60 bg-card/40 p-0.5",
        className
      )}
      role="tablist"
      aria-label="Selector de plan (demo)"
    >
      {plans.map((p) => {
        const active = p === plan;
        const accent = PLAN_DISPLAY[p].accent;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              setPlan(p);
              toast({
                title: "Plan cambiado (demo)",
                description: `Plan activo: ${PLAN_DISPLAY[p].name}.`,
              });
            }}
            className={cn(
              "min-h-[28px] rounded px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
              active
                ? accent === "gold"
                  ? "bg-[var(--gold)] text-black font-medium"
                  : accent === "teal"
                    ? "bg-[var(--teal)] text-black font-medium"
                    : "bg-foreground/15 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {compact ? PLAN_DISPLAY[p].name.charAt(0) : PLAN_DISPLAY[p].name}
          </button>
        );
      })}
    </div>
  );
}
