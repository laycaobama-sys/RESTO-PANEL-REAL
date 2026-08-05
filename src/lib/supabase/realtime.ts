"use client";

import { createClient } from "@/lib/supabase/client";
import * as React from "react";

/**
 * Realtime hooks using Supabase Realtime.
 * Automatically subscribes to changes filtered by organization_id + venue_id.
 */

function useRealtimeTable<T>(
  table: string,
  venueId: string | undefined,
  onPayload: (payload: { eventType: string; new: T; old: T }) => void,
) {
  const cbRef = React.useRef(onPayload);
  React.useEffect(() => {
    cbRef.current = onPayload;
  }, [onPayload]);

  React.useEffect(() => {
    if (!venueId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`${table}:${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          cbRef.current({
            eventType: payload.eventType,
            new: payload.new as T,
            old: payload.old as T,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, venueId]);
}

export function useRealtimeOrders(venueId: string | undefined, onChange: () => void) {
  useRealtimeTable("orders", venueId, () => onChange());
}

export function useKitchenTickets(venueId: string | undefined, station: string | undefined, onChange: () => void) {
  const supabase = createClient();
  React.useEffect(() => {
    if (!venueId) return;
    const channel = supabase
      .channel(`kitchen_tickets:${venueId}:${station || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kitchen_tickets",
          filter: `venue_id=eq.${venueId}`,
        },
        () => onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, station, onChange]);
}

export function useTableStatus(venueId: string | undefined, onChange: () => void) {
  useRealtimeTable("tables", venueId, () => onChange());
}

export function useReservations(venueId: string | undefined, onChange: () => void) {
  useRealtimeTable("reservations", venueId, () => onChange());
}

export function useNotifications(venueId: string | undefined, onChange: () => void) {
  const supabase = createClient();
  React.useEffect(() => {
    if (!venueId) return;
    const channel = supabase
      .channel(`notifications:${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `organization_id=eq.${venueId}`,
        },
        () => onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, onChange]);
}

export function useMenuItemAvailability(venueId: string | undefined, onChange: () => void) {
  useRealtimeTable("menu_items", venueId, () => onChange());
}
