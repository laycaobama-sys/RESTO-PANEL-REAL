/**
 * Database query layer — typed queries per domain.
 * Uses Supabase client with RLS (no service role).
 * Each function receives the authenticated client.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ── Tables ──────────────────────────────────────────────

export async function getTables(supabase: SupabaseClient, venueId: string) {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("venue_id", venueId)
    .order("code");
  if (error) throw error;
  return data;
}

export async function updateTableStatus(
  supabase: SupabaseClient,
  tableId: string,
  status: string,
) {
  const { data, error } = await supabase
    .from("tables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", tableId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Orders ──────────────────────────────────────────────

export async function getOrders(supabase: SupabaseClient, venueId: string, status?: string) {
  let query = supabase.from("orders").select("*, order_items(*)").eq("venue_id", venueId);
  if (status) query = query.eq("status", status);
  query = query.order("opened_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createOrder(
  supabase: SupabaseClient,
  order: {
    organization_id: string;
    venue_id: string;
    table_id?: string;
    channel: string;
    items: Array<{
      menu_item_id: string;
      quantity: number;
      notes?: string;
    }>;
  },
) {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      organization_id: order.organization_id,
      venue_id: order.venue_id,
      table_id: order.table_id || null,
      channel: order.channel,
      status: "open",
      opened_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (orderError) throw orderError;

  // Insert items
  const items = order.items.map((item) => ({
    organization_id: order.organization_id,
    order_id: orderData.id,
    menu_item_id: item.menu_item_id,
    name_snapshot: "", // Will be filled from menu_items
    quantity: item.quantity,
    notes: item.notes,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw itemsError;

  return orderData;
}

// ── Reservations ────────────────────────────────────────

export async function getReservations(
  supabase: SupabaseClient,
  venueId: string,
  date?: string,
) {
  let query = supabase
    .from("reservations")
    .select("*, customers(*)")
    .eq("venue_id", venueId);
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query = query.gte("reserved_at", start.toISOString()).lte("reserved_at", end.toISOString());
  }
  query = query.order("reserved_at");
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ── Dashboard ───────────────────────────────────────────

export async function getDashboardMetrics(supabase: SupabaseClient, venueId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [ticketsRes, ordersRes, reservationsRes, tablesRes, customersRes] = await Promise.all([
    supabase.from("payments").select("amount_cents, created_at").eq("venue_id" as never, venueId).gte("created_at", todayISO),
    supabase.from("orders").select("id, status, total_cents, opened_at").eq("venue_id", venueId).gte("opened_at", todayISO),
    supabase.from("reservations").select("id, status").eq("venue_id", venueId).gte("reserved_at", todayISO),
    supabase.from("tables").select("id, status").eq("venue_id", venueId),
    supabase.from("customers").select("id").eq("organization_id" as never, venueId).gte("created_at", todayISO),
  ]);

  const payments = ticketsRes.data || [];
  const orders = ordersRes.data || [];
  const reservations = reservationsRes.data || [];
  const tables = tablesRes.data || [];

  const ventasDia = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const ticketsAbiertos = orders.filter((o) => o.status === "open").length;
  const ticketsCerrados = orders.filter((o) => o.status === "closed").length;
  const reservasHoy = reservations.length;
  const noShows = reservations.filter((r) => r.status === "no_show").length;
  const ocupacion = tables.length > 0
    ? Math.round((tables.filter((t) => t.status === "occupied").length / tables.length) * 100)
    : 0;
  const ticketMedio = ticketsCerrados > 0 ? Math.round(ventasDia / ticketsCerrados) : 0;

  return {
    ventasDia,
    ventasMes: ventasDia, // Simplified — in production, query month range
    ticketsAbiertos,
    ticketsCerrados,
    ticketMedio,
    clientesHoy: customersRes.data?.length || 0,
    reservasHoy,
    noShows,
    ocupacion,
    camarerosActivos: 0, // Query time_entries
    productosAgotados: 0, // Query menu_items available=false
    valorStock: 0, // Query inventory_items
  };
}

// ── Menu ────────────────────────────────────────────────

export async function getMenuItems(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("organization_id", organizationId)
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function getCategories(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

// ── Employees ───────────────────────────────────────────

export async function getEmployees(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("first_name");
  if (error) throw error;
  return data;
}

// ── KDS ─────────────────────────────────────────────────

export async function getKdsTickets(supabase: SupabaseClient, venueId: string) {
  const { data, error } = await supabase
    .from("kitchen_tickets")
    .select("*, orders(*, order_items(*), tables(code))")
    .eq("venue_id", venueId)
    .in("status", ["new", "accepted", "preparing", "ready"])
    .order("created_at");
  if (error) throw error;
  return data;
}

// ── Customers ───────────────────────────────────────────

export async function getCustomers(supabase: SupabaseClient, organizationId: string, query?: string) {
  let q = supabase.from("customers").select("*").eq("organization_id", organizationId);
  if (query) {
    q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
  }
  q = q.order("last_seen_at", { ascending: false, nullsFirst: false }).limit(100);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
