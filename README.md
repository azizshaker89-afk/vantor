# VANTOR — Men's Accessories Store

A bilingual (Arabic RTL / English) e-commerce store for men's watches, wallets, bracelets and sunglasses, with a full admin panel. Built as a portfolio project around the realities of selling online in Egypt: cash on delivery, governorate-based shipping and Arabic-first UX.

> All brands, products, prices and customers are fictional demo data.

| | |
|---|---|
| **Storefront** | `/ar` (default), `/en` |
| **Admin** | `/admin` |
| **Customer demo** | `demo@vantor.store` / `Demo@1234` |
| **Admin demo** | `admin@vantor.store` / `Admin@1234` |
| **Coupons** | `VANTOR10` (10%, min 1,500), `WELCOME200` (200 EGP, min 2,000) |

---

## Features

### Storefront
- **Home**: animated hero slider, collections, promos, tabbed product rails, brand strip.
- **Catalog**: every filter lives in the URL, so links are shareable and the back button works. Filters cover category, brand, price range, in stock and on sale, and each option shows a live count. The catalog also has sorting, page size, a 3/4-column grid and pagination, with a filter drawer on mobile.
- **Search**: live suggestions with debounce and request cancellation. Arabic singular words (محفظة, ساعة) map to their categories.
- **Product page**:
  - Gallery with hover zoom and swipe.
  - Delivery cost and ETA by governorate.
  - Low-stock meter, buy now, and a sticky purchase bar.
  - Specs, description and shipping tabs, related products and recently viewed.
  - Share to WhatsApp, plus `Product` and `BreadcrumbList` JSON-LD.
- **Cart, wishlist, quick view**: persisted in local storage.
- **Checkout**:
  - Three steps, with cash or card on delivery.
  - Coupon codes and shipping across all 27 governorates (free over 3,000 EGP).
  - Signed-in customers get their details pre-filled.
- **After purchase**: an animated confirmation and a status timeline. Orders can be tracked by number **and** phone.
- **Accounts**: register, sign in, order history, profile and password change.
- **Content**: about, contact (form and FAQ), shipping, returns and privacy pages.

### Admin
- **Overview**:
  - Revenue, orders, average order value and new customers, compared with the previous period (7, 30 or 90 days).
  - Interactive revenue chart with a table view.
  - Status breakdown, top products, sales by category and top governorates.
  - Low-stock alerts and the latest orders.
- **Orders**:
  - Status tabs with counts, search and CSV export (Excel-safe UTF-8, formula-injection-safe).
  - Status changes: cancelling restocks the items, and un-cancelling re-reserves them.
  - Printable invoice and a pre-written WhatsApp confirmation.
- **Products**:
  - Filters and search.
  - Create and edit with bilingual fields, auto slug, live discount %, specs and flags.
  - **Image upload**: each photo is processed with `sharp` into square, close-up and full variants.
  - Delete falls back to *hide* when the product has order history.
- **Categories and brands, coupons** (usage and total discount given), **customers** (lifetime value), **messages** (unread state, reply by email), and **settings** (contact details shown on the storefront).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 4 with design tokens (`@theme`), logical properties for RTL |
| Data | Prisma 6 + SQLite |
| Auth | Signed JWT (`jose`) in an httpOnly cookie, `bcryptjs` hashes |
| Validation | `zod`, shared by client and server |
| Client state | `zustand` (cart, wishlist, recently viewed) |
| Images | `next/image` with `sharp` (build script and upload pipeline) |
| Tests | Vitest (unit), Playwright (end-to-end, desktop and mobile) |

---

## Key decisions

- **The server owns every price.** The browser sends only `{ id, qty }`. `placeOrder` re-reads prices from the database, re-validates the coupon and recomputes shipping. A tampered cart is rejected, and an end-to-end test covers this.
- **No overselling.** Stock is decremented inside the order transaction with a conditional `updateMany` (`stock >= qty`). Two shoppers can't both buy the last piece.
- **Authorisation on every action, not just on pages.** Admin pages call `requireAdmin()`, and each admin server action calls `assertAdmin()` again. Customer order pages are scoped to the session user, so another customer's order returns 404. Guest confirmation links use unguessable ids.
- **The URL is the catalog state.** Filtering runs in Prisma. Each facet count applies every *other* active filter, so counts always say what you'd get by clicking.
- **i18n without a library.** `/[locale]` segment, middleware redirect, and one typed dictionary per language (`src/i18n/dict.ts`). TypeScript forces the English dictionary to match the Arabic one. Client components read strings through context, because the dictionary contains functions.
- **Uploads outside `/public`.** `next start` doesn't serve files added to `public` after the build, so uploads are written to `/uploads` and served by a route handler with path validation and immutable caching.
- **Accessibility.** Semantic landmarks, a skip link, labelled controls, `aria-live` counts, focus return on dialogs, keyboard-steppable chart and reduced-motion support. Colour is never the only signal.

---

## Getting started

Requirements: Node 20+.

```bash
npm install
cp .env.example .env          # set AUTH_SECRET
npx prisma db push            # create prisma/dev.db
npm run db:seed               # 50 products, 25 customers, 140 orders, coupons, messages
npm run dev                   # http://localhost:3000
```

Product photos are already in `public/img`. To regenerate them from a folder of source JPEGs, run `npm run images -- <folder>`.

### Scripts

| Script | What it does |
|---|---|
| `dev`, `build`, `start` | Next.js |
| `lint`, `typecheck` | ESLint, `tsc --noEmit` |
| `test` | Vitest unit tests |
| `test:e2e` | Playwright against a production build and an isolated `prisma/e2e.db` (run `build` first) |
| `check` | lint + typecheck + unit tests |
| `db:seed`, `db:reset` | Reload demo data, or recreate the schema and reload |
| `images` | Regenerate optimised WebP images from source photos |

---

## Testing

- **Unit tests** (`tests/unit`, 28 tests): shipping zones and threshold, money and discount formatting, every validation schema, catalog URL parsing (including hostile input), and coupon rules with a mocked database.
- **End-to-end tests** (`tests/e2e`): run against `next start` with a freshly seeded database. They cover:
  - Language switch and RTL.
  - URL-driven filters, sorting and the Arabic search.
  - Product page JSON-LD and the 404 page.
  - Guest checkout with coupon maths and order tracking, plus tampered-cart rejection.
  - Sign-in errors, account scoping, registration and the contact form.
  - Admin access control, order status changes, CSV export, and product create/upload/delete.
  - Sitemap, robots, canonical and hreflang tags, Open Graph and security headers.
  - Mobile layout checks.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, build and the end-to-end suite on every push.

---

## SEO

- Localised `<title>` and description on every page, with canonical URLs and `hreflang` alternates (`x-default` points to Arabic).
- `sitemap.xml`: all public pages in both languages, cross-linked.
- `robots.txt`: blocks admin, API, cart, checkout and account pages. Search-result pages are `noindex, follow`.
- JSON-LD: `OnlineStore` and `WebSite` with `SearchAction` on the home page; `Product` and `BreadcrumbList` on product pages. The JSON is escaped so data can't break out of the `<script>` tag.
- Open Graph and Twitter cards with product images.

---

## Deployment

The app builds as a Next.js **standalone** server. Docker:

```bash
echo "AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env
docker compose up --build     # http://localhost:3000
```

- On first boot the container creates the schema and seeds the demo data into the `/data` volume. Uploads persist in their own volume.
- Behind HTTPS, set `INSECURE_COOKIES=0` (the default compose file allows plain HTTP for local testing) and `SITE_URL` to the public origin.
- For multi-instance hosting, switch the Prisma datasource to PostgreSQL and move uploads to object storage. Nothing else in the code depends on SQLite or the local disk.

Security headers (`nosniff`, frame options, referrer and permissions policies, HSTS) are set in `next.config.ts`, and `X-Powered-By` is removed.

---

## Project structure

```
prisma/
  schema.prisma        data model
  catalog.ts           product copy, specs and prices (source of truth for the seed)
  seed.ts              deterministic demo data
src/
  app/
    [locale]/          storefront (root layout per language)
    admin/             admin root layout, login, (panel)/… guarded pages
    api/               search suggestions, wishlist hydration
    uploads/           serves uploaded product images
    sitemap.ts, robots.ts
  actions/             server actions (auth, checkout, contact, admin/*)
  components/          UI by area: layout, home, catalog, pdp, cart, checkout, account, admin…
  i18n/                dictionaries and long-form page copy
  lib/                 db, auth, catalog queries, coupons, validation, Egypt shipping, SEO
  store/               zustand stores
tests/
  unit/                Vitest
  e2e/                 Playwright
```
