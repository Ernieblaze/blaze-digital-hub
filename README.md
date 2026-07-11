# 🔥 Blaze Digital Hub

Premium digital products storefront for **Ernie Blaze (Coach Ernest Favour)** — trading guides, exam packs, design templates and hustle tools for Nigerian students, traders and creators.

**Stack:** Next.js 16 (App Router, TypeScript, Server Components) · Tailwind CSS v4 · shadcn/ui · Framer Motion · Lucide icons · next-themes (dark by default).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo — no config needed.
3. After the first deploy, update `metadataBase` in `src/app/layout.tsx` to your live domain.

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, SEO metadata, theme provider
│   ├── page.tsx                # Home (hero → featured → shop → benefits → testimonials → how-it-works)
│   ├── loading.tsx             # Global loading state
│   ├── not-found.tsx           # 404 page
│   ├── login/page.tsx          # Buyer dashboard placeholder (future auth)
│   └── products/[slug]/page.tsx# Product detail pages (SSG)
├── components/
│   ├── site/                   # Navbar, Hero, Shop, ProductCard, Footer, motion helpers…
│   └── ui/                     # shadcn/ui primitives
└── lib/
    ├── products.ts             # ★ PRODUCT CATALOG — edit everything here
    └── utils.ts
```

## Managing products

All products live in **`src/lib/products.ts`**. Each entry controls its card, detail page, testimonial and checkout link. Add/edit/remove entries there — the shop grid, featured section, testimonials and static pages all update automatically.

### Real product images

Covers are currently generated (brand gradient + icon). To use real images, drop files into `public/products/` and swap the body of `src/components/site/product-cover.tsx` for a Next `<Image />` (instructions are in that file).

## 💳 Paystack integration

Every **Buy Now** button links to the product's `paystackUrl`. To go live:

1. In your [Paystack Dashboard](https://dashboard.paystack.com) → **Payment Pages**, create one page per product (set price, enable "redirect after payment" or file delivery via a service like Fluent/SendOwl, or attach your own delivery email).
2. Copy each page's URL (e.g. `https://paystack.shop/pay/blaze-forex-blueprint`).
3. Paste it into that product's `paystackUrl` in `src/lib/products.ts`. Done — no code changes needed.

**Later (embedded checkout):** swap the links for [Paystack Inline popup](https://paystack.com/docs/payments/accept-payments/#popup) using your public key — the integration point is marked with a `PAYSTACK CHECKOUT` comment in `src/app/products/[slug]/page.tsx` and in `product-card.tsx`.

## 🔐 Owner dashboard (`/admin`)

A private dashboard for the site owner: live Paystack revenue & recent payments, product
catalog health (which checkout links are still placeholders), and pointers to traffic
analytics.

**Setup:** copy `.env.example` to `.env.local` and set:

- `ADMIN_PASSWORD` — your dashboard login password (change the default!).
- `PAYSTACK_SECRET_KEY` — from Paystack Dashboard → Settings → API Keys (optional until
  you want live sales numbers; `sk_test_…` works for testing).

On Vercel, add both under **Project → Settings → Environment Variables**. Traffic stats
come from **Vercel Analytics** (already wired in `layout.tsx`) — enable it in your Vercel
project's Analytics tab after deploying.

## 🗄️ Supabase (newsletter storage, Phase-2 backend)

The footer newsletter form stores signups in Supabase. Setup:

1. Create a project at [supabase.com](https://supabase.com) (free plan works).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, run it.
3. In **Project Settings → API**, copy the **Project URL** and **service_role key** into
   `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (in `.env.local` and on Vercel).

Subscriber count + latest signups appear in the owner dashboard. Phase 2 will add an
`orders` table fed by a Paystack webhook (schema already sketched in the SQL file).

## ⚙️ Phase 2 backend (orders, delivery, phone product management)

- **Products in Supabase** — once `supabase/schema.sql` has been run and the catalog
  imported (one click in /admin), products are managed from any device. The JSON file
  remains as a fallback/seed.
- **Orders** — set the Paystack webhook URL to `/api/paystack/webhook` (Paystack
  Dashboard → Settings → API Keys & Webhooks). Every successful charge is recorded in
  the `orders` table and shown in /admin.
- **Automatic delivery + buyer portal emails** — set `BREVO_API_KEY` (Brevo → SMTP &
  API → API Keys; free tier is 300 emails/day) and give each product a Download link
  in the admin form. Buyers get their file by email seconds after paying, and can
  re-download anytime at `/login` via an emailed code. The sender defaults to the
  site contact email — make sure it's a verified sender in Brevo, or set
  `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME`.

## Future: buyer dashboard

`/login` is a placeholder. When ready, add [Auth.js](https://authjs.dev) or [Clerk](https://clerk.com), gate a `/dashboard` route, and let buyers re-download purchases and claim bonuses.
