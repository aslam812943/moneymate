# MoneyMate

MoneyMate is a full-stack personal finance workspace for tracking income, expenses, budgets, savings goals, EMIs, and informal lending or borrowing. It combines a responsive React interface with an Express API and MongoDB persistence in one deployable service.

## Product capabilities

- Secure account signup, login, seven-day sessions, and guided onboarding
- Income and expense management with filters, recurring entries, CSV export, and monthly summaries
- Budget monitoring, spending insights, forecasts, savings goals, and reports
- EMI tracking with payment history, amortization schedules, and payoff calculations
- Configurable salary recording by date, last working day, preceding working day, or manual entry
- People & Loans ledger with two-way balances, repayments, reminders, write-offs, statements, and proof files
- Light and dark themes, responsive navigation, accessible dialogs, and mobile layouts
- Browser-only demonstration workspace when MongoDB is unavailable

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| UI | Tailwind CSS integration, Radix UI primitives, Lucide icons |
| Charts | Recharts |
| Validation | Zod and React Hook Form |
| API | Node.js and Express |
| Database | MongoDB Atlas through Mongoose |
| Authentication | HttpOnly session cookies and bcrypt password hashing |
| Testing | Node test runner and Playwright |

Supabase is not used.

## Architecture

```text
Browser
  ├── React application
  └── /api requests and HttpOnly session cookie
          │
          ▼
Express server
  ├── Authentication and session validation
  ├── Finance-state validation and revision control
  ├── Proof-file authorization
  └── Production static-file hosting
          │
          ▼
MongoDB Atlas
  ├── users
  ├── sessions
  └── proofs
```

In production, Express serves both the built frontend and `/api`. This same-origin design avoids a separate CORS and cross-site-cookie configuration.

## Requirements

- Node.js 22.12 or newer
- npm
- MongoDB or MongoDB Atlas for real accounts
- Google Chrome for Playwright browser tests

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:8000](http://localhost:8000). Vite serves the frontend on port `8000` and proxies `/api` to the Express server on port `4000`.

The **Explore the live demo** option stores sample data in the browser. Account mode requires MongoDB.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Account mode | MongoDB connection string including the `moneymate` database name |
| `PORT` | No | Express port; defaults to `4000` locally and is supplied by Render |
| `APP_ORIGIN` | Production | Exact HTTPS browser origin allowed to change data |
| `NODE_ENV` | Production | Enables secure cookies and production static hosting |

Example development configuration:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/moneymate
PORT=4000
APP_ORIGIN=http://localhost:8000
NODE_ENV=development
```

Never commit `.env` or expose `MONGODB_URI` through a `VITE_` variable. The repository ignores `.env`; `.env.example` contains development placeholders only.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and the watched Express server |
| `npm run dev:client` | Start only the Vite frontend |
| `npm run build` | Type-check and build the production frontend |
| `npm start` | Start the Express production server |
| `npm test` | Run finance and validation tests |
| `npx playwright test` | Run browser and responsive smoke tests |

## Production build

```powershell
npm run build
$env:NODE_ENV='production'
npm start
```

The production server serves `dist/index.html`, compiled assets, and all API routes.

## Render deployment

Create one **Render Web Service** connected to the repository and use:

| Render setting | Value |
| --- | --- |
| Runtime | Node |
| Region | Singapore, or the nearest available region |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check | `/api/health` |

Add these Render environment variables:

```text
MONGODB_URI=<MongoDB Atlas connection string>
APP_ORIGIN=https://<service-name>.onrender.com
NODE_VERSION=24.16.0
```

Leave `PORT` unset because Render supplies it. Add the Render service's outbound IP ranges to the MongoDB Atlas Network Access list. After deployment, verify:

```text
https://<service-name>.onrender.com/api/health
```

The response should report `"database":"connected"`.

## Scheduled Render health check

The repository includes [`.github/workflows/keep-render-awake.yml`](.github/workflows/keep-render-awake.yml). It requests the production health endpoint every ten minutes and can also be run manually.

After the Render service is live:

1. Open the GitHub repository.
2. Select **Settings → Secrets and variables → Actions**.
3. Create a repository secret named `RENDER_HEALTH_URL`.
4. Use `https://<service-name>.onrender.com/api/health` as its value.
5. Open **Actions → Keep Render service warm** and run it once to verify the URL.

GitHub scheduled workflows run from the default branch and may occasionally be delayed. This health check reduces free-service cold starts but does not provide the uptime guarantee of a paid Render instance.

## Security model

- Passwords contain 4–128 characters and are hashed with bcrypt before storage.
- Session tokens are random, stored only as SHA-256 hashes, and expire after seven days.
- Browser sessions use HttpOnly, SameSite cookies; production cookies require HTTPS.
- The server derives ownership from the authenticated session rather than request-supplied user IDs.
- State updates use schema validation and optimistic revisions to prevent silent cross-tab overwrites.
- Proof reads, uploads, and deletion are scoped to their owning account.
- Origin checks reject state-changing requests from any origin other than `APP_ORIGIN`.
- API and authentication endpoints use rate limits and security headers.

Rotate any MongoDB credential that has been shared publicly or pasted into logs, and update both the local `.env` file and Render secret afterward.

## Data behavior

Financial state is stored as a validated document per user. Proof binaries are stored separately in owner-scoped MongoDB documents. Each proof is limited to 5 MB, and each ledger entry or repayment supports up to five proof files.

Recurring income and expenses are materialized when a workspace loads. EMI expenses are created only when an EMI is marked paid. Lending and borrowing do not change income, expenses, savings rate, or category budgets; the dashboard calculates their cash impact separately.

The application currently treats working days as Monday through Friday and does not use a public-holiday calendar. Reminders open WhatsApp or SMS and are user initiated. Email verification, password recovery, bank synchronization, and automatic notification delivery are outside the current scope.

## Quality checks

```powershell
npm test
npm run build
npx playwright test
```

Tests cover totals, recurring schedules, salary dates, EMI calculations, ledger balances, repayments, validation, API origin protection, primary browser workflows, custom confirmations, and responsive layouts.

## Project structure

```text
server/                  Express API, authentication, MongoDB models
shared/                  Shared schemas and finance calculations
src/components/          Reusable UI, charts, proofs, confirmations
src/pages/               Product pages and workflows
tests/                   Calculation and validation tests
tests/browser/           Playwright browser tests
.github/workflows/       Scheduled production health check
```

## License

Private project. Add a license file before distributing the source publicly.
