# MoneyMate

A responsive personal finance app built with React, TypeScript, Vite, Tailwind CSS, Radix/shadcn-style UI primitives, Recharts, React Router, React Hook Form, Zod and date-fns. The backend uses **Express + MongoDB (Mongoose)**. No Supabase services are used.

## Run locally

Requires Node.js 22.12+ and npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:8000`. Choose **Explore the live demo** for six months of sample data stored in your browser. The demo works without MongoDB; it is not an authenticated cloud account. Sign out to switch from demo to account mode.

For real accounts, run MongoDB locally or create an Atlas database, then set `MONGODB_URI` in `.env` to your connection string. Restart the server. Atlas requires an allowed network address and a database user. Keep this connection string on the server; never prefix it with `VITE_`.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string, including database name |
| `PORT` | API port, default `4000` |
| `APP_ORIGIN` | Exact browser origin allowed to mutate data; development default `http://localhost:8000` |
| `NODE_ENV` | Set to `production` for HTTPS-only cookies and serving the built frontend |

Use the configured origin consistently: `localhost` and `127.0.0.1` are different origins. Vite proxies `/api` to port 4000 during development. If you change the API port, update `vite.config.ts` too.

## Included

- Sign up, sign in, sign out, onboarding and protected app views.
- Income and expense CRUD, recurring monthly entries, search, category/source/payment/date/amount filters, sorting, pagination, bulk delete and CSV export.
- Monthly dashboard: income/expense/balance/EMI totals, savings rate, per-day remaining balance, six-month cash flow, category donut, daily spending, comparisons, budgets, loan progress, financial wellness, insights, goals and due payments.
- Loans with calculated EMI, repayment progress, payment history, amortization schedule, principal/interest chart and idempotent payment recording. Marking an EMI paid records the expense once.
- Budgets with threshold warnings, editing and copy from last month.
- Savings goals, contributions, target progress and required monthly contribution.
- Reports with selectable comparison months, yearly totals, category trends, top spending, CSV export and browser print/save as PDF.
- People & Loans tracker for money given or borrowed, unlimited partial repayments, two-way balances, due reminders, simple interest, write-offs, WhatsApp/SMS reminder links, person statements, proof images/PDFs, recovery charts, CSV reporting, and dashboard cash-balance integration.
- Settings for profile, category management, theme, sample data, clear data, JSON backup and account deletion.
- Responsive navigation, light/dark appearance, accessible dialog focus management, reduced-motion support and empty/loading states.

## Data and security

MongoDB automatically creates `users`, `sessions`, and `proofs`. Financial records and proof metadata are stored as validated nested arrays in each user's document; this makes each personal workspace update atomic without needing a replica set. Binary proof files use separate owner-scoped MongoDB documents so they do not inflate the main finance document. This architecture is intended for bounded personal datasets, not large multi-user business ledgers. Each proof is limited to 5 MB and each entry or repayment accepts up to five files. Images wider than about 1600px are compressed in the browser before upload.

The server derives the user ID from a random, HttpOnly, SameSite session cookie. API requests cannot choose another user ID. Proof reads, uploads, and deletes are also scoped to that server-derived user. Passwords are hashed with bcrypt. Only a SHA-256 hash of the session token is stored in MongoDB. Sessions expire after seven days; expiration is checked on every request and a TTL index cleans them up. Unique email and session indexes are initialized at startup. Zod validates financial data server-side, including ledger references, repayment limits, and duplicates. Origin checks, security headers and rate limits protect the API. Optimistic revision checks reject conflicting edits from another tab instead of silently overwriting data.

Recurring income/expenses catch up when a workspace loads. They are not bank transactions and do not move money. EMI expenses are created when explicitly marked paid; unpaid EMIs are shown as due. Opening paid-month counts can represent payments made before you started using MoneyMate. Savings contributions track money already set aside and do not create extra expenses. Reminders are in-app only. Goal progress shows completion, overdue deadlines and the monthly amount needed; it does not infer historical contribution pace. Financial wellness is a transparent rule-based indicator, not financial advice.

Lending and borrowing do not affect income, expenses, savings rate, or category budgets. The dashboard cash balance separately accounts for lent, recovered, borrowed, and repaid money. A write-off on money given creates an expense in `Bad Debt / Lent Money Lost`; write-offs on money borrowed close the personal liability without creating income. Reminders open WhatsApp when a phone number is available and fall back to an SMS composer. They are user-triggered; background delivery is not included.

## Production

```powershell
npm run build
$env:NODE_ENV = 'production'
npm start
```

Set `APP_ORIGIN` to your public HTTPS origin and deploy behind an HTTPS reverse proxy. In production the Express server serves `dist` and `/api` together. Provision backups, monitoring and appropriate database access restrictions before storing real financial records. Configure Express proxy trust to match your infrastructure if using a reverse proxy; never blindly trust every forwarded address. Email verification, password reset, bank integrations, background notifications and scheduled billing are not included. The development server and production build are separate commands.

## Checks

```powershell
npm test
npm run build
```

For the browser smoke tests, install Google Chrome and run `npx playwright test`. The test starts the development servers, checks demo workflows and the API origin boundary, and writes desktop/mobile screenshots to `artifacts/`.

Tests cover totals, zero denominators, amortization, duplicate EMI protection, recurring month-end dates, sample-data idempotence, forecasts and invalid references.

MongoDB authentication and persistence require a running database; demo testing alone does not verify those integration paths.

References: [Vite setup](https://vite.dev/guide/), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite), [MongoDB unique indexes](https://www.mongodb.com/docs/manual/core/index-unique/create-compound/).
