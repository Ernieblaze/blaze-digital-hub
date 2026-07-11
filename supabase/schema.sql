-- Blaze Digital Hub — Supabase schema (Phase 1 + Phase 2)
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS). Already ran the newsletter part? Running
-- the whole file again is fine.

-- ── Newsletter subscribers (footer form on the site) ────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;

-- ── Products (Phase 2: manage the catalog from any device via /admin) ──────
create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null,
  price integer not null,
  compare_at_price integer,
  tagline text not null default '',
  description text not null default '',
  whats_inside jsonb not null default '[]'::jsonb,
  icon text not null default 'rocket',
  cover text not null default '',
  image text,
  badge text,
  featured boolean not null default false,
  paystack_url text not null default '',
  download_url text,
  testimonial jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

-- ── Orders (Phase 2: recorded by the Paystack webhook) ─────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  product_slug text,
  customer_email text not null,
  amount_kobo bigint not null,
  status text not null default 'success',
  paid_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

-- ── Buyer portal login codes (passwordless email codes for /login) ─────────
create table if not exists public.login_codes (
  email text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.login_codes enable row level security;

-- All tables are accessed only through the server-side service key, so RLS
-- with no policies simply locks out the public/anon role entirely.
