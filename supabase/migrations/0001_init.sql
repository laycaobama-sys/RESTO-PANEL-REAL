-- ============================================================================
-- RestoPanel — Supabase Schema Migration 0001
-- Multi-tenant SaaS for restaurants
-- All money in cents (integer). All timestamps timestamptz UTC.
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pgtap"; -- for RLS tests

-- ============================================================================
-- CONTEXT FUNCTIONS (RLS)
-- ============================================================================

create schema if not exists auth;

create or replace function auth.organization_id()
returns uuid language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'organization_id',
      current_setting('request.jwt.claims', true)::jsonb ->> 'organization_id'
    ), ''
  )::uuid
$$;

create or replace function auth.is_platform_staff()
returns boolean language sql stable as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'platform_staff')::boolean,
    false
  )
$$;

create or replace function auth.has_permission(p_code text)
returns boolean language sql stable as $$
  select exists (
    select 1 from employee_roles er
    join role_permissions rp on rp.role_id = er.role_id
    where er.employee_id = auth.uid()
    and rp.permission_code = p_code
  )
$$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- IDENTITY & TENANT
-- ============================================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text,
  tax_id text,
  country text default 'ES',
  timezone text default 'Europe/Madrid',
  currency text default 'EUR',
  locale text default 'es-ES',
  status text default 'trialing' check (status in ('trialing','active','past_due','suspended','canceled','archived')),
  plan_code text default 'starter',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_account_id text,
  logo_url text,
  brand_colors jsonb default '{"primary":"#10B981"}'::jsonb,
  onboarding_completed boolean default false,
  onboarding_wizard_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  logo_url text,
  colors jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  address text,
  city text,
  province text,
  postal_code text,
  country text default 'ES',
  timezone text default 'Europe/Madrid',
  phone text,
  email text,
  tax_rate numeric default 0.21,
  status text default 'active' check (status in ('active','inactive','maintenance')),
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table zones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  type text check (type in ('interior','terraza','barra','reservados','vip','delivery','takeaway')),
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  code text not null,
  capacity int not null default 4,
  shape text default 'circle' check (shape in ('circle','square','rectangle')),
  pos_x numeric default 0,
  pos_y numeric default 0,
  status text default 'free' check (status in ('free','reserved','occupied','billed','cleaning','blocked')),
  qr_token text unique,
  mergeable boolean default true,
  active boolean default true,
  reservation_id uuid,
  opened_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- USERS & PERMISSIONS
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  locale text default 'es-ES',
  avatar_url text,
  is_owner boolean default false,
  status text default 'active' check (status in ('active','invited','disabled')),
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid references venues(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  first_name text not null,
  last_name text,
  employee_code text,
  position text,
  pin_hash text,
  qr_token text,
  contract_type text,
  hired_at date,
  color text default '#10B981',
  status text default 'active' check (status in ('active','inactive','on_leave','terminated')),
  photo_url text,
  sales_today_cents int default 0,
  avg_ticket_cents int default 0,
  tips_today_cents int default 0,
  tables_today int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, employee_code)
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  is_system boolean default false,
  created_at timestamptz default now()
);

create table permissions (
  code text primary key,
  name text not null,
  category text,
  description text
);

create table role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_code text references permissions(code) on delete cascade,
  primary key (role_id, permission_code)
);

create table employee_roles (
  employee_id uuid references employees(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  primary key (employee_id, role_id)
);

create table employee_devices (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  device_fingerprint text not null,
  platform text,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- CATALOG
-- ============================================================================

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  active boolean default true,
  schedule jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents int not null default 0,
  cost_cents int default 0,
  tax_rate numeric default 0.21,
  image_url text,
  video_url text,
  prep_minutes int default 10,
  active boolean default true,
  available boolean default true,
  kitchen_station text,
  sort_order int default 0,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table menu_item_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  price_delta_cents int default 0,
  active boolean default true
);

create table menu_modifier_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  min_select int default 0,
  max_select int default 0,
  required boolean default false
);

create table menu_modifiers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references menu_modifier_groups(id) on delete cascade,
  name text not null,
  price_delta_cents int default 0,
  active boolean default true
);

create table menu_item_modifier_groups (
  menu_item_id uuid references menu_items(id) on delete cascade,
  group_id uuid references menu_modifier_groups(id) on delete cascade,
  primary key (menu_item_id, group_id)
);

create table allergens (
  code text primary key,
  name text not null
);

create table menu_item_allergens (
  menu_item_id uuid references menu_items(id) on delete cascade,
  allergen_code text references allergens(code) on delete cascade,
  primary key (menu_item_id, allergen_code)
);

create table menu_channel_prices (
  menu_item_id uuid references menu_items(id) on delete cascade,
  channel text not null,
  price_cents int not null,
  primary key (menu_item_id, channel)
);

-- ============================================================================
-- RESERVATIONS & FLOOR
-- ============================================================================

create table customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  birthday date,
  locale text default 'es-ES',
  tags text[] default '{}',
  dietary_restrictions text[] default '{}',
  preferences jsonb default '{}'::jsonb,
  notes text,
  vip boolean default false,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  total_visits int default 0,
  total_spent_cents bigint default 0,
  avg_ticket_cents int default 0,
  lifecycle_stage text default 'new' check (lifecycle_stage in ('new','recurrent','loyal','risk','lost')),
  marketing_consent jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  table_ids uuid[] default '{}',
  reserved_at timestamptz not null,
  party_size int not null default 2,
  duration_minutes int default 90,
  status text default 'pending' check (status in ('pending','confirmed','seated','completed','canceled','no_show')),
  source text default 'phone' check (source in ('phone','online','google','whatsapp','instagram','thefork')),
  channel text,
  notes text,
  special_requests text,
  deposit_cents int default 0,
  no_show_risk numeric default 0,
  created_by uuid,
  seated_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  party_size int not null default 2,
  estimated_wait_minutes int default 30,
  status text default 'waiting' check (status in ('waiting','notified','accepted','expired','cancelled')),
  notified_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- ORDERS & PAYMENTS
-- ============================================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  reservation_id uuid references reservations(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  channel text default 'sala' check (channel in ('sala','barra','takeaway','delivery','qr','glovo','ubereats','justeat')),
  status text default 'open' check (status in ('open','sent','preparing','ready','served','closed','voided')),
  course_mode text default 'rounds' check (course_mode in ('rounds','single')),
  opened_by uuid references employees(id) on delete set null,
  opened_at timestamptz default now(),
  closed_at timestamptz,
  subtotal_cents int default 0,
  discount_cents int default 0,
  tax_cents int default 0,
  tip_cents int default 0,
  total_cents int default 0,
  guest_count int default 0,
  notes text,
  client_uuid text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  variant_id uuid references menu_item_variants(id) on delete set null,
  name_snapshot text not null,
  quantity int not null default 1,
  unit_price_cents int not null default 0,
  total_cents int not null default 0,
  course_number int default 1,
  status text default 'pending' check (status in ('pending','fired','preparing','ready','served','voided')),
  notes text,
  modifiers jsonb default '[]'::jsonb,
  station text,
  fired_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz,
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz default now()
);

create table kitchen_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  station text not null,
  priority_score int default 0,
  status text default 'new' check (status in ('new','accepted','preparing','ready','served','bumped','recalled')),
  created_at timestamptz default now(),
  started_at timestamptz,
  bumped_at timestamptz,
  sla_seconds int default 900
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  order_id uuid references orders(id) on delete set null,
  method text not null check (method in ('cash','card','qr','bizum','wallet','apple_pay','google_pay','mixed')),
  amount_cents int not null,
  tip_cents int default 0,
  status text default 'pending' check (status in ('pending','captured','failed','refunded','disputed')),
  provider text,
  provider_reference text,
  refunded_amount_cents int default 0,
  idempotency_key text unique,
  created_at timestamptz default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  payment_id uuid not null references payments(id) on delete restrict,
  amount_cents int not null,
  reason text,
  created_by uuid,
  created_at timestamptz default now()
);

create table cash_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  terminal_id uuid,
  opened_by uuid references employees(id) on delete set null,
  opened_at timestamptz default now(),
  opening_float_cents int default 0,
  closed_by uuid references employees(id) on delete set null,
  closed_at timestamptz,
  expected_cents int,
  counted_cents int,
  variance_cents int,
  status text default 'open' check (status in ('open','closed'))
);

create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  cash_session_id uuid not null references cash_sessions(id) on delete cascade,
  type text not null check (type in ('in','out','sale','refund','tip','expense')),
  amount_cents int not null,
  reason text,
  created_by uuid,
  created_at timestamptz default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  venue_id uuid references venues(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  series text not null,
  number text not null,
  issued_at timestamptz default now(),
  total_cents int not null,
  tax_cents int not null,
  customer_tax_id text,
  hash text,
  previous_hash text,
  qr_payload text,
  pdf_url text,
  unique(series, number)
);

create table terminals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  type text check (type in ('tpv','pda','kds','printer','scanner','cash_drawer','customer_display')),
  printer_config jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

create table printers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  destination text,
  connection text check (connection in ('network','usb','bluetooth')),
  address text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================================
-- INVENTORY
-- ============================================================================

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  name text not null,
  unit text default 'unit',
  stock_qty numeric default 0,
  min_stock numeric default 0,
  cost_per_unit_cents int default 0,
  supplier_id uuid references suppliers(id) on delete set null,
  track_mode text default 'daily' check (track_mode in ('daily','per_turn','per_unit','until_empty')),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id) on delete cascade,
  quantity numeric not null default 1
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  status text default 'draft' check (status in ('draft','sent','received','cancelled')),
  total_cents int default 0,
  created_at timestamptz default now()
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  type text not null check (type in ('in','out','adjust','waste','transfer')),
  quantity numeric not null,
  reason text,
  order_id uuid references orders(id) on delete set null,
  created_by uuid,
  created_at timestamptz default now()
);

-- ============================================================================
-- STAFF & SCHEDULING
-- ============================================================================

create table shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  date date not null,
  type text default 'full' check (type in ('morning','afternoon','split','full','opening','closing','refuerzo','training','rest','vacation','absence')),
  start_time time,
  end_time time,
  break_start time,
  break_end time,
  second_start time,
  second_end time,
  position text,
  status text default 'draft' check (status in ('draft','published','confirmed','cancelled')),
  notes text,
  published_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  clock_in_at timestamptz not null,
  clock_out_at timestamptz,
  break_minutes int default 0,
  method text check (method in ('pin','qr','faceid','fingerprint','nfc')),
  device text,
  source_ip text,
  status text default 'active' check (status in ('active','closed','corrected')),
  corrected_by uuid,
  correction_reason text,
  created_at timestamptz default now()
);

create table time_off_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  type text not null check (type in ('vacation','sick','personal','unpaid')),
  start_date date not null,
  end_date date not null,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- ============================================================================
-- CRM & LOYALTY
-- ============================================================================

create table loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text default 'stamps' check (type in ('stamps','points','cashback','tiers')),
  rules jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

create table loyalty_stamps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  program_id uuid references loyalty_programs(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  channel text check (channel in ('email','whatsapp','sms')),
  segment jsonb,
  template jsonb,
  status text default 'draft' check (status in ('draft','scheduled','sending','sent','paused','cancelled')),
  scheduled_at timestamptz,
  sent_count int default 0,
  revenue_attributed_cents bigint default 0,
  created_at timestamptz default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  source text check (source in ('google','tripadvisor','thefork','internal')),
  rating int check (rating between 1 and 5),
  text text,
  sentiment text check (sentiment in ('positive','neutral','negative')),
  topics text[] default '{}',
  replied boolean default false,
  reply_text text,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- DELIVERY
-- ============================================================================

create table sales_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean default true,
  config jsonb default '{}'::jsonb
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  polygon jsonb,
  min_order_cents int default 0,
  fee_cents int default 0,
  eta_minutes int default 30,
  active boolean default true
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  rider_id uuid references employees(id) on delete set null,
  status text default 'received' check (status in ('received','accepted','preparing','ready','assigned','en_route','delivered','incident')),
  address text,
  eta_at timestamptz,
  delivered_at timestamptz,
  tracking_token text unique,
  created_at timestamptz default now()
);

-- ============================================================================
-- PLATFORM & CONTROL
-- ============================================================================

create table plans (
  code text primary key,
  name text not null,
  description text,
  tier_order int,
  monthly_price_cents int,
  yearly_price_cents int,
  stripe_price_monthly text,
  stripe_price_yearly text,
  visible boolean default true,
  active boolean default true
);

create table features (
  key text primary key,
  name text not null,
  description text,
  type text check (type in ('bool','limit','enum')),
  category text,
  min_plan text,
  status text default 'GA' check (status in ('GA','beta','interno','deprecado'))
);

create table plan_features (
  plan_code text references plans(code) on delete cascade,
  feature_key text references features(key) on delete cascade,
  value jsonb,
  primary key (plan_code, feature_key)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan_code text not null references plans(code),
  cycle text check (cycle in ('monthly','yearly')),
  status text default 'active' check (status in ('trialing','active','past_due','canceled','unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  stripe_subscription_id text,
  negotiated_price_cents int,
  created_at timestamptz default now()
);

create table entitlement_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  feature_key text not null,
  value jsonb,
  reason text,
  expires_at timestamptz,
  granted_by text
);

create table usage_counters (
  organization_id uuid not null references organizations(id) on delete cascade,
  feature_key text not null,
  period text not null,
  used int default 0,
  limit_snapshot int,
  primary key (organization_id, feature_key, period)
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_type text,
  actor_id uuid,
  action text not null,
  entity text,
  entity_id text,
  before jsonb,
  after jsonb,
  ip text,
  user_agent text,
  correlation_id text,
  created_at timestamptz default now()
);

create table outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  topic text not null,
  payload jsonb,
  status text default 'pending' check (status in ('pending','published','failed','dead')),
  attempts int default 0,
  available_at timestamptz default now(),
  created_at timestamptz default now(),
  processed_at timestamptz
);

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text unique,
  type text not null,
  payload_hash text,
  status text default 'received',
  received_at timestamptz default now(),
  processed_at timestamptz,
  retry_count int default 0,
  error text,
  organization_id uuid,
  correlation_id text
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  status text default 'pending' check (status in ('pending','connected','error','disabled')),
  config jsonb,
  credentials_ref text,
  connected_at timestamptz,
  last_check_at timestamptz,
  last_error text,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  recipient_type text,
  recipient_id uuid,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid,
  task text not null,
  provider text,
  model text,
  input_tokens int default 0,
  output_tokens int default 0,
  cost_cents int default 0,
  latency_ms int,
  confidence text,
  sources jsonb,
  created_at timestamptz default now()
);

create table analytics_daily (
  organization_id uuid not null references organizations(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  date date not null,
  metric text not null,
  value numeric,
  meta jsonb,
  primary key (organization_id, venue_id, date, metric)
);

create table platform_staff (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text,
  totp_secret_ref text,
  status text default 'active',
  last_login_at timestamptz,
  created_at timestamptz default now()
);

create table health_scores (
  organization_id uuid not null references organizations(id) on delete cascade,
  date date not null,
  score int check (score between 0 and 100),
  dimensions jsonb,
  risk_band text check (risk_band in ('critical','risk','stable','healthy')),
  primary key (organization_id, date)
);

create table impact_benchmarks (
  id uuid primary key default gen_random_uuid(),
  metric text not null,
  value numeric,
  sample_size int,
  period text,
  segment text,
  source text,
  verified_by text,
  updated_at timestamptz default now()
);

-- ============================================================================
-- TRIGGERS: set_updated_at on all tables with updated_at
-- ============================================================================

do $$
declare
  t text;
begin
  for t in select table_name from information_schema.columns where column_name = 'updated_at' and table_schema = 'public'
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_brands_org on brands(organization_id);
create index idx_venues_org on venues(organization_id);
create index idx_zones_org_venue on zones(organization_id, venue_id);
create index idx_tables_org_venue on tables(organization_id, venue_id);
create index idx_tables_venue_status on tables(venue_id, status);
create index idx_tables_qr_token on tables(qr_token);
create index idx_employees_org on employees(organization_id);
create index idx_employees_org_code on employees(organization_id, employee_code);
create index idx_menu_items_org_cat on menu_items(organization_id, category_id);
create index idx_reservations_org_venue_date on reservations(organization_id, venue_id, reserved_at);
create index idx_reservations_org_status on reservations(organization_id, status);
create index idx_orders_org_venue_status on orders(organization_id, venue_id, status);
create index idx_orders_org_venue_opened on orders(organization_id, venue_id, opened_at desc);
create index idx_order_items_org_order on order_items(organization_id, order_id);
create index idx_kitchen_tickets_org_venue_status on kitchen_tickets(organization_id, venue_id, status);
create index idx_payments_org_created on payments(organization_id, created_at desc);
create index idx_cash_sessions_org_venue_status on cash_sessions(organization_id, venue_id, status);
create index idx_inventory_items_org on inventory_items(organization_id);
create index idx_shifts_org_venue_date on shifts(organization_id, venue_id, date);
create index idx_time_entries_org_emp on time_entries(organization_id, employee_id);
create index idx_customers_org on customers(organization_id);
create index idx_audit_log_org_created on audit_log(organization_id, created_at desc);
create index idx_notifications_org_recipient on notifications(organization_id, recipient_id);
create index idx_ai_usage_org on ai_usage(organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on ALL tenant tables
do $$
declare
  t text;
begin
  for t in select table_name from information_schema.columns where column_name = 'organization_id' and table_schema = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy tenant_isolation on public.%I for all using (organization_id = auth.organization_id()) with check (organization_id = auth.organization_id())', t);
  end loop;
end $$;

-- Platform staff tables: only accessible by platform staff
alter table platform_staff enable row level security;
alter table platform_staff force row level security;
create policy platform_staff_only on platform_staff for all using (auth.is_platform_staff()) with check (auth.is_platform_staff());

alter table health_scores enable row level security;
alter table health_scores force row level security;
create policy platform_staff_health on health_scores for all using (auth.is_platform_staff()) with check (auth.is_platform_staff());

-- Plans, features, plan_features: public read
alter table plans enable row level security;
create policy plans_read on plans for select using (true);

alter table features enable row level security;
create policy features_read on features for select using (true);

alter table plan_features enable row level security;
create policy plan_features_read on plan_features for select using (true);

alter table allergens enable row level security;
create policy allergens_read on allergens for select using (true);

alter table impact_benchmarks enable row level security;
create policy benchmarks_read on impact_benchmarks for select using (true);

-- Audit log: tenant can read own, system can write
alter table audit_log enable row level security;
create policy audit_read on audit_log for select using (organization_id = auth.organization_id() or auth.is_platform_staff());

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

alter publication supabase_realtime add table orders, order_items, kitchen_tickets, tables, reservations, waitlist_entries, deliveries, notifications, menu_items;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public) values
  ('menu-media', 'menu-media', true),
  ('brand-assets', 'brand-assets', true),
  ('documents', 'documents', false),
  ('backups', 'backups', false)
on conflict (id) do nothing;

-- Storage policies: {bucket}/{organization_id}/{venue_id}/{file}
create policy "tenant_read_menu_media" on storage.objects for select using (bucket_id = 'menu-media');
create policy "tenant_write_menu_media" on storage.objects for insert with check (
  bucket_id = 'menu-media' and
  (storage.foldername(name))[1] = auth.organization_id()::text
);
create policy "tenant_read_brand_assets" on storage.objects for select using (bucket_id = 'brand-assets');
create policy "tenant_write_brand_assets" on storage.objects for insert with check (
  bucket_id = 'brand-assets' and
  (storage.foldername(name))[1] = auth.organization_id()::text
);
create policy "tenant_rw_documents" on storage.objects for all using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = auth.organization_id()::text
);

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Create order from QR (public, validates qr_token)
create or replace function public.create_order_from_qr(p_qr_token text, p_items jsonb)
returns uuid language plpgsql security definer as $$
declare
  v_table record;
  v_order_id uuid;
  v_item jsonb;
  v_menu_item record;
begin
  -- Validate table by QR token
  select * into v_table from public.tables where qr_token = p_qr_token and active = true for update;
  if not found then
    raise exception 'INVALID_QR_TOKEN';
  end if;

  -- Create order
  insert into public.orders (organization_id, venue_id, table_id, channel, status, opened_at, client_uuid)
  values (v_table.organization_id, v_table.venue_id, v_table.id, 'qr', 'open', now(), gen_random_uuid()::text)
  returning id into v_order_id;

  -- Insert items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_menu_item from public.menu_items where id = (v_item->>'menu_item_id')::uuid and available = true;
    if not found then
      raise exception 'PRODUCT_NOT_AVAILABLE: %', v_item->>'menu_item_id';
    end if;

    insert into public.order_items (organization_id, order_id, menu_item_id, name_snapshot, quantity, unit_price_cents, total_cents, status, notes)
    values (
      v_table.organization_id, v_order_id, v_menu_item.id, v_menu_item.name,
      (v_item->>'quantity')::int, v_menu_item.price_cents,
      v_menu_item.price_cents * (v_item->>'quantity')::int,
      'pending', v_item->>'notes'
    );
  end loop;

  -- Update table status
  update public.tables set status = 'occupied', opened_at = now() where id = v_table.id;

  -- Audit
  insert into public.audit_log (organization_id, action, entity, entity_id, actor_type)
  values (v_table.organization_id, 'order.created_from_qr', 'order', v_order_id::text, 'guest');

  return v_order_id;
end;
$$;

-- Clock in by PIN
create or replace function public.clock_in_by_pin(p_pin text, p_organization_id uuid, p_venue_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_employee record;
  v_entry_id uuid;
begin
  -- Find employee by PIN (all PINs are bcrypt hashed, so we can't query directly)
  -- This function is called after bcrypt verification in the API layer
  -- p_pin here is actually the employee_id after verification
  select * into v_employee from public.employees where id = p_pin::uuid and organization_id = p_organization_id and status = 'active';
  if not found then
    raise exception 'EMPLOYEE_NOT_FOUND';
  end if;

  insert into public.time_entries (organization_id, venue_id, employee_id, clock_in_at, method, status)
  values (p_organization_id, p_venue_id, v_employee.id, now(), 'pin', 'active')
  returning id into v_entry_id;

  insert into public.audit_log (organization_id, action, entity, entity_id, actor_type, actor_id)
  values (p_organization_id, 'staff.clock_in', 'time_entry', v_entry_id::text, 'employee', v_employee.id);

  return v_entry_id;
end;
$$;

-- Mark item 86 (propagate to all channels)
create or replace function public.mark_item_86(p_menu_item_id uuid, p_organization_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.menu_items set available = false, updated_at = now()
  where id = p_menu_item_id and organization_id = p_organization_id;

  insert into public.audit_log (organization_id, action, entity, entity_id, actor_type)
  values (p_organization_id, 'menu.86_item', 'menu_item', p_menu_item_id::text, 'system');

  -- Notify via outbox
  insert into public.outbox_events (organization_id, topic, payload, status)
  values (p_organization_id, 'menu.item_86ed', jsonb_build_object('menu_item_id', p_menu_item_id), 'pending');
end;
$$;

-- Provision organization (called after Stripe payment)
create or replace function public.provision_organization(p_payload jsonb)
returns uuid language plpgsql security definer as $$
declare
  v_org_id uuid;
  v_venue_id uuid;
  v_zone_id uuid;
  v_member_id uuid;
  v_i int;
begin
  -- Create organization
  insert into public.organizations (legal_name, trade_name, tax_id, country, timezone, currency, status, plan_code)
  values (
    p_payload->>'legal_name',
    p_payload->>'trade_name',
    p_payload->>'tax_id',
    coalesce(p_payload->>'country', 'ES'),
    coalesce(p_payload->>'timezone', 'Europe/Madrid'),
    coalesce(p_payload->>'currency', 'EUR'),
    'active',
    coalesce(p_payload->>'plan_code', 'starter')
  )
  returning id into v_org_id;

  -- Create venue
  insert into public.venues (organization_id, name, address, city, timezone)
  values (v_org_id, coalesce(p_payload->>'venue_name', 'Local Principal'), p_payload->>'address', p_payload->>'city', coalesce(p_payload->>'timezone', 'Europe/Madrid'))
  returning id into v_venue_id;

  -- Create zones
  insert into zones (organization_id, venue_id, name, type, sort_order) values
    (v_org_id, v_venue_id, 'Interior', 'interior', 1),
    (v_org_id, v_venue_id, 'Terraza', 'terraza', 2),
    (v_org_id, v_venue_id, 'Barra', 'barra', 3),
    (v_org_id, v_venue_id, 'Reservados', 'reservados', 4);

  -- Create tables
  for v_i in 1..coalesce((p_payload->>'num_tables')::int, 10)
  loop
    insert into tables (organization_id, venue_id, code, capacity, qr_token)
    values (v_org_id, v_venue_id, 'M' || v_i, 4, encode(gen_random_bytes(16), 'hex'));
  end loop;

  -- Create menu categories
  insert into menu_categories (organization_id, venue_id, name, sort_order) values
    (v_org_id, v_venue_id, 'Entrantes', 1),
    (v_org_id, v_venue_id, 'Principales', 2),
    (v_org_id, v_venue_id, 'Postres', 3),
    (v_org_id, v_venue_id, 'Bebidas', 4);

  -- Create KDS stations
  insert into terminals (organization_id, venue_id, name, type, active) values
    (v_org_id, v_venue_id, 'Cocina Caliente', 'kds', true),
    (v_org_id, v_venue_id, 'Cocina Fría', 'kds', true),
    (v_org_id, v_venue_id, 'Plancha', 'kds', true),
    (v_org_id, v_venue_id, 'Postres', 'kds', true),
    (v_org_id, v_venue_id, 'Barra', 'kds', true);

  -- Create cash session
  insert into cash_sessions (organization_id, venue_id, opening_float_cents, status)
  values (v_org_id, v_venue_id, 0, 'open');

  -- Audit
  insert into audit_log (organization_id, action, entity, entity_id, actor_type)
  values (v_org_id, 'org.provisioned', 'organization', v_org_id::text, 'system');

  return v_org_id;
end;
$$;

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into plans (code, name, description, tier_order, monthly_price_cents, yearly_price_cents, visible, active) values
  ('starter', 'Starter', 'Empieza a operar mejor hoy', 1, 4900, 47000, true, true),
  ('professional', 'Professional', 'Haz crecer la facturación', 2, 9900, 95000, true, true),
  ('enterprise', 'Enterprise', 'Escala sin perder el control', 3, 24900, 239000, true, true)
on conflict (code) do nothing;

insert into features (key, name, description, type, category, min_plan, status) values
  ('pos.terminal', 'TPV', 'Terminal punto de venta', 'bool', 'POS', 'starter', 'GA'),
  ('pda.unlimited_devices', 'PDA ilimitada', 'Licencias ilimitadas', 'bool', 'PDA', 'starter', 'GA'),
  ('kds.station', 'Pantallas KDS', 'Número de pantallas', 'limit', 'KDS', 'starter', 'GA'),
  ('menu.digital', 'Carta digital', 'Carta QR', 'bool', 'MENU', 'starter', 'GA'),
  ('reservation.online', 'Reservas online', 'Reservas 24/7', 'bool', 'RESERVATIONS', 'starter', 'GA'),
  ('crm.enabled', 'CRM', 'Gestión de clientes', 'bool', 'CRM', 'starter', 'GA'),
  ('delivery.own_channel', 'Delivery propio', '0% comisión', 'bool', 'DELIVERY', 'professional', 'GA'),
  ('ai.copilot', 'Copilot IA', 'Asistente IA', 'bool', 'AI', 'professional', 'GA'),
  ('inventory.enabled', 'Inventario', 'Stock y escandallos', 'bool', 'INVENTORY', 'professional', 'GA'),
  ('staff.scheduling', 'Cuadrantes', 'Gestión de turnos', 'bool', 'STAFF', 'professional', 'GA'),
  ('gov.franchise_mode', 'Franquicias', 'Modo franquicia', 'bool', 'GOVERNANCE', 'enterprise', 'GA'),
  ('api.write', 'API escritura', 'API REST completa', 'bool', 'PLATFORM', 'enterprise', 'GA')
on conflict (key) do nothing;

insert into allergens (code, name) values
  ('gluten', 'Gluten'),
  ('crustaceans', 'Crustáceos'),
  ('eggs', 'Huevos'),
  ('fish', 'Pescado'),
  ('peanuts', 'Cacahuetes'),
  ('soy', 'Soja'),
  ('milk', 'Lácteos'),
  ('nuts', 'Frutos secos'),
  ('celery', 'Apio'),
  ('mustard', 'Mostaza'),
  ('sesame', 'Sésamo'),
  ('sulphites', 'Sulfitos'),
  ('lupin', 'Altramuz'),
  ('molluscs', 'Moluscos')
on conflict (code) do nothing;
