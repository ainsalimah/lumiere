# Lumiere Furniture

A full-stack furniture storefront for browsing collections, saving favorites, managing a cart, and sending order requests directly to the shop owner.

## Highlights

- Responsive storefront with home, shop, category, product-detail, wishlist, cart, and account pages.
- Product filtering, search, category browsing, reviews, and color selection.
- Cart and order-request flow with owner confirmation for shipping, schedule, and payment.
- Customer authentication with email/password and Google sign-in.
- Owner workspace for product management, customer lookup, and order-status workflow.
- PostgreSQL data layer powered by Prisma and Neon.

## Tech Stack

- Next.js 15 and React 19
- TypeScript and Tailwind CSS 4
- Prisma ORM with PostgreSQL / Neon
- Zod validation
- JWT authentication, bcryptjs, Nodemailer, and Google OAuth

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local`, then provide your own values. Do not commit this file.

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="use-a-long-random-value"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="\"Lumiere Furniture\" <no-reply@example.com>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev       # Start local development server
npm run build     # Create production build
npm start         # Run production server
npm test          # Run project tests
npx tsc --noEmit  # Check TypeScript types
```

## Order Workflow

This project uses an owner-confirmed ordering flow rather than automatic payment:

1. Customers add available products to their cart.
2. Customers submit a request with recipient and delivery details.
3. The owner confirms availability, shipping cost, schedule, and payment method.
4. Customers review and accept the exact offer version; only then does the order enter `Diproses`.
5. The owner marks actual dispatch and delivery. Status changes use atomic version checks and recorded timestamps.

Payment is arranged manually with the owner. This application does not collect payments or issue payment receipts. The owner can record a full manually received payment after customer approval; partial payments and refunds are not supported. Paid orders cannot be cancelled through the status button. Wishlist and cart are saved on the current device. Historical orders preserve product names, images, prices, and recipient phone numbers. Prices for legacy orders cannot be reconstructed and are shown as unknown.

## Database upgrade

For an existing database, back up first, then apply `prisma/upgrades/20261011_order_integrity.sql` in a transaction using your SQL client. Apply this upgrade once. Legacy names and images are backfilled from the current catalog and may differ from the original purchase; original values cannot be recovered. This additive upgrade preserves orders and products; it does not invent historical item prices or status dates. For a fresh development database, use `npx prisma db push`. Run `npx prisma generate` after upgrading. Do not use `db push` against an existing production database.

Demo reviews and the legacy demo account are disabled unless `ALLOW_DEMO_SEED=true` is explicitly set in development.

## Preview the original catalog

After `npm run build`, run `node scripts/catalog-preview.cjs` and open `http://localhost:4180/shop`. This copies the original catalog and public reviews into a separate localhost PostgreSQL schema using a read-only source transaction. It preserves the original database and does not include regression-test products or accounts. Accounts and orders in this preview are local and separate from the original application. PostgreSQL binaries must be installed locally.

## Local regression verification

`npm test` checks isolated service and HTTP behavior. `node scripts/local-review.cjs` provisions a separate PostgreSQL cluster on localhost:55432, runs real-database regression tests, and starts a preview on localhost:4180. The script never reads database credentials from `.env`. PostgreSQL binaries must be installed locally. Use `node scripts/local-review.cjs --production` after `npm run build` to preview the production build, and run `node scripts/http-review.cjs` in a second terminal for 25 HTTP checks. This script resets only its own local test data on each run. Stop the preview with Ctrl+C; the cluster remains available for inspection and can be stopped using the printed command.

Browser assets are ordinary binary Git files. Run `git add --renormalize public` before committing an existing checkout that still has LFS pointers, then verify `git show :public/<image>` is a real image. No deployment is performed by these checks.

## Security Notes

- Keep `.env` and `.env.local` private.
- Use a direct Neon connection locally when the pooler is unavailable.
- Rotate any credential that was accidentally exposed in logs, screenshots, or commit history.

## License

This repository is intended for portfolio and learning use.
