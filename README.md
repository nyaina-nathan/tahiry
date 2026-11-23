<p align="center">
  <img src="./app/icon.png" alt="Tahiry logo" width="88" height="88" />
</p>

<h1 align="center">Tahiry</h1>

<p align="center">
  <em>Just an app for brokies (or not).</em><br />
  Track what comes in, what goes out, and which account is quietly funding your lifestyle.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16.3-000?logo=nextdotjs&logoColor=white" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="Prisma 7" src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169e1?logo=postgresql&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white" />
</p>

---

Tahiry is a personal finance tracker for people who want the useful numbers without the finance-app theatre. Log income and expenses, split them across accounts, move money between accounts, and see where the month actually went.

No bank connections. No subscriptions. No unsolicited advice about lattes. Just your data, your accounts, and a weekly email that tells the truth.

## Features

### Overview

- Lifetime balance, total income and total expenses across every account.
- A balance card per account, updated from every movement.
- A seven-day cash flow chart (income vs. expenses), built with Recharts.
- Latest movements with page-size control and pagination.

### Expenses and incomes

- Create, edit and delete money movements.
- Attach a category, an account, an optional description and a date (`logged_for`).
- Filter by movement type, category, account and date range.
- Paginated API and UI (`page`, `page_size` up to 100).
- Amounts are stored as `decimal(10, 2)` and exchanged as strings, so `0.1 + 0.2` does not become your problem.

Dedicated `/expenses` and `/incomes` pages show the same workspace, pre-filtered to one movement type.

### Accounts and transfers

- Each user starts with a default `cash` account created during registration.
- Create, rename and delete accounts. Names are unique per user, case-insensitively, and you must keep at least one account.
- Each account has a detail page showing its balance, income, expenses and movements.
- Transfer money between your own accounts. The source account must have sufficient funds, and source and destination must differ.
- A transfer is stored as a single `TRANSFERT` movement with `id_account_source` and `id_account` (destination). It increases the destination balance and decreases the source balance.

### Categories

- Separate `EXPENSE` and `INCOME` categories.
- Create, rename, retype and delete categories.
- Deleting a category does not delete its movements; those movements become uncategorised.

### Settings

- Update your username and display currency.
- Change your email address with password confirmation and a confirmation link.
- Configure a weekly email summary (one per user): day of the week plus time.
- Export your movements as an Excel (`.xlsx`) file, optionally limited to a date range.

### Interface

- Responsive header with desktop icons and a mobile menu.
- Dark and light themes, persisted in `localStorage` and applied before hydration.
- Loading skeletons, inline validation errors, empty states and retry actions throughout.

## How balances work

Every account balance is derived, never stored:

```text
account balance = income − expenses + transfers in − transfers out
```

| Movement                 | Effect on the account                        |
| ------------------------ | -------------------------------------------- |
| `INCOME`                 | Increases the destination account balance    |
| `EXPENSE`                | Decreases the destination account balance    |
| `TRANSFERT` (destination) | Increases the destination account balance    |
| `TRANSFERT` (source)     | Decreases the source account balance         |

Income and expenses with no account attached still count towards the global balance and global totals, but not towards any account card.

> [!NOTE]
> The enum value is spelled `TRANSFERT`, not `TRANSFER`. That spelling is part of the database enum and the API contract.

## Authentication and access control

Authentication is cookie-based and handled in three layers: the route handlers issue sessions, `proxy.ts` guards page requests, and the protected route handlers authenticate API requests before the services re-check ownership of every resource.

### Session lifecycle

1. `POST /api/auth/register` hashes the password with bcrypt (12 rounds), creates the user and a default `cash` account in one transaction, then signs a JWT.
2. `POST /api/auth/login` compares the password with the stored hash and signs a JWT.
3. The JWT is signed with HS256 via `jose`, expires after **7 days**, and carries the user ID in the `sub` claim.
4. The token is stored in the `sess_id` cookie: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production, `Max-Age` 7 days.
5. `proxy.ts` verifies the cookie for page requests. Valid session: continue. No session: redirect to `/login`.
6. Protected route handlers call `getCurrentUser(request)` from `libs/api/get-current-user.ts`, which reads the `sess_id` cookie, verifies the JWT and returns the user ID, or throws a `401`. Every service then validates that the ID is a UUID and that the requested row belongs to that user.
7. `POST /api/auth/logout` deletes the cookie and returns `204`.

### What `proxy.ts` protects

`proxy.ts` is the Next.js 16 replacement for `middleware.ts`. It only guards pages. All `/api` routes are excluded from the matcher and authenticate themselves, so API clients receive a JSON `401` instead of a redirect. It runs on every page request except `_next/static`, `_next/image`, `favicon.ico` and `icon.png`.

| Route class     | Routes                                                    | Behaviour                                                       |
| --------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Public page     | `/`, `/password-change`, `/robots.txt`                    | Passed through without a session                                |
| Auth page       | `/login`                                                  | Signed-in users are redirected to `/dashboard`; everyone else continues |
| Protected page  | Everything else, including `/dashboard`, `/accounts`, `/settings` | No valid session redirects to `/login`                   |
| API routes      | `/api/**`                                                 | Excluded from the proxy; protected handlers enforce the session |

The login page also passes through when it carries `?isPasswordResetFail=true`, so an expired reset link can show its error without a session.

> [!NOTE]
> `getCurrentUser` reads the session directly from the request cookie. Never trust a client-supplied user ID header.

### Password reset

1. `POST /api/auth/password-reset` with `{ "email": "..." }` always returns `202`, whether or not the account exists, to avoid account enumeration.
2. A random 32-byte token is generated. Its SHA-256 hash is stored in `password_reset_token` with a **5-minute** expiry; only the hash touches the database.
3. The raw token is emailed through Resend as a link to `/api/auth/password-change/confirm?token=...`.
4. The confirm route validates the token and redirects (`303`) to `/password-change?token=...`. Invalid or expired tokens redirect to `/login?isPasswordResetFail=true`.
5. `POST /api/auth/password-reset/change` with `{ "token": "...", "newPassword": "..." }` consumes the token, sets the new password and returns `204`.

### Email change

1. `POST /api/auth/email-change` with `{ "newEmail": "...", "currentPassword": "..." }` requires a session. It verifies the current password, checks that the new address is not taken, and stores `pending_email`, a hashed token and a **10-minute** expiry on the user row.
2. A confirmation link is sent to the **new** address: `/api/auth/email-change/confirm?token=...`.
3. The confirm route applies the change in a transaction, clears the pending fields, sends a notice to the old address, and redirects to `/settings?emailChangeSuccess=true` (or `false`).
4. The settings page reads that flag, shows a one-time banner, and removes it from the URL.

### Security notes

- Passwords: bcrypt, 12 rounds, 8–72 characters (bcrypt's input limit).
- Session tokens: JWT HS256, 7-day expiry, signed with `JWT_SECRET`.
- Reset and email-change tokens: 64 hex characters, stored only as SHA-256 hashes, single-use where applicable.
- Cookies: `HttpOnly` and `SameSite=Lax`; `Secure` is enabled automatically in production.
- There is no CSRF token. `SameSite=Lax` is the current mitigation.
- There is no rate limiting on login or password-reset requests. Put one in front of the app if it is public.

## Weekly email summary

Users can opt into a weekly recap from `/settings`: pick a day (Monday-based) and a time in their local timezone. The settings UI converts that to UTC before saving, and converts it back for display. The scheduler works entirely in UTC.

`GET /api/cron/weekly-email` is called by Vercel Cron every day at `00:00` UTC (`vercel.json`). For every reminder whose `day_of_week` matches the current UTC day, it:

1. Loads the last seven days of income and expenses (`logged_for`).
2. Computes daily totals, weekly income/expense totals, and the top three income and expense categories.
3. Sends an HTML email through Resend with `scheduledAt` set to the user's configured time, and returns `{ matched, scheduled, failed }`.

The endpoint requires `Authorization: Bearer $CRON_SECRET` and returns `401` otherwise. Vercel Cron sends that header automatically when `CRON_SECRET` is configured.

## Excel export

`POST /api/exports` accepts an optional body:

```json
{ "from": "2026-01-01", "to": "2026-01-31" }
```

It returns `money-movements.xlsx` with title, category, account, amount, type and date columns, plus summary rows for total money moved, total expenses and total income. Transfers are rendered as `Source → Destination`. The settings page exposes the same export with optional dates.

## Tech stack

| Layer          | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Next.js 16.3 (App Router)                                     |
| UI             | React 19, Tailwind CSS 4, Recharts                            |
| Language       | TypeScript 5 (strict)                                         |
| Data           | PostgreSQL, Prisma 7 with the `@prisma/adapter-pg` driver     |
| Auth           | `jose` (JWT), `bcrypt`                                        |
| Email          | Resend                                                        |
| Export         | ExcelJS                                                       |
| Deployment     | Vercel (including Cron), `@vercel/speed-insights`             |

## Getting started

### Prerequisites

- Node.js 22+ (tested on Node 24; the test suite uses Node's native TypeScript runner)
- PostgreSQL 13+
- A Resend account only if you want password reset, email change or weekly summary emails

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable         | Required            | Purpose                                                                 |
| ---------------- | ------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`   | Yes                 | PostgreSQL connection string used by Prisma and the pg adapter           |
| `JWT_SECRET`     | Yes                 | HS256 signing secret for session tokens. Use at least 32 random bytes    |
| `APP_URL`        | In production       | Public origin used in email links. Defaults to `http://localhost:3000` in development; must be HTTPS in production |
| `RESEND_API_KEY` | Email features      | Resend API key                                                           |
| `EMAIL_FROM`     | Email features      | Verified sender address, e.g. `Tahiry <no-reply@example.com>`            |
| `CRON_SECRET`    | Cron                | Bearer secret expected by `/api/cron/weekly-email`                       |

Generate a secret with:

```bash
openssl rand -base64 32
```

> [!WARNING]
> `.env.example` currently spells the cron variable `CRON_SECRETS`. The application reads `CRON_SECRET` (singular); use that name in your `.env` and on Vercel.

Email-dependent endpoints fail at request time if `RESEND_API_KEY` or `EMAIL_FROM` is missing. The rest of the app works without them.

### 3. Set up the database

The SQL scripts in `docs/db/` are the source of truth for the database schema. Apply them in this order:

```bash
psql "$DATABASE_URL" -f docs/db/v1_1__db_init.sql
psql "$DATABASE_URL" -f docs/db/V2_1__account_table.sql
psql "$DATABASE_URL" -f docs/db/V3_1__weekly_reminder_table.sql
psql "$DATABASE_URL" -f docs/db/V4_1_email_change.sql
psql "$DATABASE_URL" -f docs/db/V5_1_forgot_password.sql
```

Then generate the Prisma client:

```bash
npx prisma generate
```

The generated client lives in `prisma/generated/` and is committed. Re-run `npx prisma generate` after changing `prisma/schema.prisma`.

> [!NOTE]
> This project does not use Prisma Migrate. `prisma/schema.prisma` drives the generated client, while the SQL files drive the actual database. `prisma db push` is not recommended because some database check constraints are only expressed in the SQL scripts.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, then go to `/login`; switch to the register tab to create your first user. A `cash` account is created automatically. Visiting a protected route such as `/dashboard` without a session redirects to `/login`.

### Scripts

| Command         | What it does                                      |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Start the development server                      |
| `npm run build` | Create a production build                         |
| `npm start`     | Serve the production build                        |
| `npm run lint`  | Run ESLint                                        |
| `node --test`   | Run the unit tests (Node 22+ native TS runner)    |

Tests live next to the code as `*.test.ts` files. There is currently no `test` npm script; the native runner needs no configuration.

## Project structure

```text
.
├── app/                        # Next.js App Router
│   ├── api/                    # HTTP route handlers (thin request/response layer)
│   ├── accounts/               # /accounts and /accounts/[accountId]
│   ├── categories/             # /categories
│   ├── dashboard/              # /dashboard (protected dashboard)
│   ├── expenses/               # /expenses
│   ├── incomes/                # /incomes
│   ├── login/                  # /login
│   ├── password-change/        # /password-change (public reset screen)
│   ├── robots.ts               # /robots.txt
│   ├── settings/               # /settings
│   ├── layout.tsx              # Fonts, metadata, theme bootstrap, Speed Insights
│   └── page.tsx                # / (public landing hero)
├── components/                 # Cross-feature UI (app header, icons)
├── features/                   # Feature slices
│   ├── accounts/               # api/, components/, hooks/
│   ├── auth/                   # Login/register/reset UI and API clients
│   ├── categories/
│   ├── dashboard/              # Balance cards, cash-flow chart, movement UI
│   ├── movements/              # Shared expenses/incomes workspace
│   └── settings/               # Profile, email change, reminders, export
├── libs/
│   ├── api/with-error-handler.ts  # Converts thrown errors into JSON responses
│   ├── db/prisma.ts               # Prisma client with the pg adapter
│   └── errors/app-error.ts        # AppError and shared error factories
├── services/                   # Business logic, authorization and email flows
│   └── *.test.ts               # Service-level unit tests
├── types/                      # Shared domain and API types
├── validators/                 # Request validation (zero-dependency, hand-written)
│   └── *.test.ts
├── prisma/
│   ├── schema.prisma           # Prisma models and enum
│   └── generated/              # Generated Prisma client (committed)
├── docs/
│   ├── api/api.yaml            # OpenAPI 3.1 specification
│   └── db/*.sql                # Database bootstrap scripts
├── proxy.ts                    # Page session guard
├── prisma.config.ts            # Prisma CLI configuration
├── next.config.ts
└── vercel.json                 # Daily cron definition
```

A request flows through four layers:

```text
app/api/**/route.ts  →  validators/*  →  services/*  →  Prisma
     HTTP + auth          parse/validate     rules + ownership     SQL
```

Route handlers stay thin. Validation lives in `validators/`, business rules and authorization in `services/`, and shared error handling in `withErrorHandler`.

## API reference

All endpoints accept and return JSON unless noted. Dates use `YYYY-MM-DD`; timestamps use RFC 3339. Amounts are decimal strings such as `"125.50"`.

### Authentication

| Method | Path                               | Description                                                        |
| ------ | ---------------------------------- | ------------------------------------------------------------------ |
| `POST` | `/api/auth/register`               | Create a user and a default `cash` account, set the session cookie |
| `POST` | `/api/auth/login`                  | Authenticate and set the session cookie                            |
| `POST` | `/api/auth/logout`                 | Clear the session cookie                                           |
| `GET`  | `/api/auth/me`                     | Return the current user                                            |
| `PATCH` | `/api/auth/me`                    | Update `username` and/or `currency`                                |
| `POST` | `/api/auth/password-reset`         | Request a password reset email (`202`)                             |
| `GET`  | `/api/auth/password-change/confirm`| Validate a reset link and redirect to `/password-change`           |
| `POST` | `/api/auth/password-reset/change`  | Set a new password from a reset token                              |
| `POST` | `/api/auth/email-change`           | Request an email change (requires the current password)            |
| `GET`  | `/api/auth/email-change/confirm`   | Confirm an email change and redirect to `/settings`                |

### Money data

| Method              | Path                         | Description                                              |
| ------------------- | ---------------------------- | -------------------------------------------------------- |
| `GET` / `POST`      | `/api/accounts`              | List or create accounts                                  |
| `GET` / `PATCH` / `DELETE` | `/api/accounts/{id}`  | Read, rename or delete an account                        |
| `POST`              | `/api/transfer`              | Transfer between two accounts                            |
| `GET`               | `/api/balance`               | Global and per-account balances                          |
| `GET` / `POST`      | `/api/categories`            | List (`?cat_type=EXPENSE\|INCOME`) or create categories  |
| `GET` / `PATCH` / `DELETE` | `/api/categories/{id}` | Read, update or delete a category                        |
| `GET` / `POST`      | `/api/money-movements`       | List (with filters) or create movements                  |
| `GET` / `PATCH` / `DELETE` | `/api/money-movements/{id}` | Read, update or delete a movement               |
| `POST`              | `/api/exports`               | Download an `.xlsx` export                               |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/email-reminders` | Read, create, update or delete the weekly reminder |
| `GET`               | `/api/cron/weekly-email`     | Cron entry point, protected by a bearer secret           |

`GET /api/money-movements` supports:

| Query parameter   | Meaning                                              |
| ----------------- | ---------------------------------------------------- |
| `movement_type`   | `EXPENSE`, `INCOME` or `TRANSFERT`                   |
| `id_category`     | Filter by category UUID                              |
| `id_account`      | Filter by account UUID (matches source or destination) |
| `logged_for_from` | Inclusive start date (`YYYY-MM-DD`)                  |
| `logged_for_to`   | Inclusive end date (`YYYY-MM-DD`)                    |
| `page`            | Page number, default `1`                             |
| `page_size`       | Page size, default `25`, maximum `100`               |

`TRANSFERT` movements cannot be created or updated through `/api/money-movements`; use `/api/transfer`.

Errors use a consistent shape:

```json
{
  "error": {
    "title": "Conflict",
    "message": "The source account does not have enough funds for this transfer.",
    "status": 409,
    "origin": "transfer"
  }
}
```

The full contract, including request and response schemas, is in [`docs/api/api.yaml`](./docs/api/api.yaml).

## Database

The Prisma schema defines:

| Model / enum           | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `users`                | Account identity, password hash, currency, pending email state |
| `account`              | Named accounts owned by a user                                 |
| `categories`           | `EXPENSE` or `INCOME` categories per user                      |
| `money_movements`      | Income, expense and transfer records with amount and dates     |
| `weekly_reminder`      | One weekly email schedule per user (`day_of_week` 0–6)         |
| `password_reset_token` | Hashed, expiring, single-use reset tokens                      |
| `movement_type`        | `EXPENSE`, `INCOME`, `TRANSFERT`                               |

User-owned rows cascade on user deletion. Money movements keep `id_account` and `id_account_source` for transfers, and `id_category` becomes `NULL` when a category is deleted.

## Deployment

Tahiry is set up for Vercel:

1. Import the repository and add the environment variables from the table above.
2. Set `APP_URL` to the production HTTPS origin. The email services refuse non-HTTPS URLs in production.
3. Set `CRON_SECRET` in the project environment. `vercel.json` registers `GET /api/cron/weekly-email` at `0 0 * * *` (daily at midnight UTC).
4. Run `npx prisma generate` as part of the build if your platform does not do it automatically.
5. Deploy. Database migrations are not automated; apply new SQL scripts from `docs/db/` yourself.

On another platform, run `npm run build` and `npm start`, and schedule the cron request yourself with the same bearer header.

## Documentation

- [`docs/api/api.yaml`](./docs/api/api.yaml) — OpenAPI 3.1 specification for every endpoint.
- [`docs/db/`](./docs/db/) — ordered PostgreSQL schema scripts.

## Known rough edges

- The database enum says `TRANSFERT`; the UI and API inherit that spelling.
- `.env.example` uses the wrong cron variable name (`CRON_SECRETS`).
- Tests run through `node --test`, but there is no `npm test` script yet.
- There is no rate limiting, CSRF token or self-service flow for deleting a user account.
