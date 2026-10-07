# Lumiere Furniture

A full-stack furniture storefront for browsing collections, saving favorites, managing a cart, and sending order requests directly to the shop owner.

## Highlights

- Responsive storefront with home, shop, category, product-detail, wishlist, cart, and account pages.
- Product filtering, search, category browsing, reviews, and color selection.
- Cart and order-request flow with owner confirmation for shipping, schedule, and payment.
- Customer authentication with email/password and Google sign-in.
- Owner workspace for product management, customer lookup, and order-status workflow.
- AI-assisted furniture recommendations and product-description generation.
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
4. The owner progresses the order through `Menunggu konfirmasi`, `Diproses`, `Dikirim`, and `Selesai`.

## Security Notes

- Keep `.env` and `.env.local` private.
- Use a direct Neon connection locally when the pooler is unavailable.
- Rotate any credential that was accidentally exposed in logs, screenshots, or commit history.

## License

This repository is intended for portfolio and learning use.
