-- Blaze Digital Hub — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS).

-- ── Newsletter subscribers (live now — footer form on the site) ─────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

-- Row Level Security: the site talks to this table only through the
-- service-role key on the server, so lock the public/anon role out entirely.
alter table public.newsletter_subscribers enable row level security;

-- ── Phase 2 (coming next): orders recorded by the Paystack webhook ──────────
-- Uncomment when we wire the webhook:
--
-- create table if not exists public.orders (
--   id uuid primary key default gen_random_uuid(),
--   paystack_reference text not null unique,
--   product_slug text not null,
--   customer_email text not null,
--   amount_kobo bigint not null,
--   status text not null,
--   paid_at timestamptz,
--   created_at timestamptz not null default now()
-- );
-- alter table public.orders enable row level security;
