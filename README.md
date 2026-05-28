# PayrollPilot HR — Frontend

Next.js App Router client for the PayrollPilot HR console (employees, salary insights, authentication).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/login`.

Set `NEXT_PUBLIC_API_URL` to your GraphQL endpoint (e.g. `http://localhost:8000/graphql`).

## HR login (local development)

The login page does **not** show credentials. Provision an HR user in the API database first.

From the `server` directory:

```bash
npm run seed:hr
```

Default values (override with env vars on the server):

| Field | Default |
|--------|---------|
| Email | `hr@orbitalops.net` (or `DEFAULT_HR_EMAIL` / `SEED_HR_EMAIL`) |
| Password | `PayrollPilot@123` (or `SEED_HR_PASSWORD`) |

Then sign in at `/login` with those credentials.

**Production:** run `seed:hr` once on the deployment environment; do not expose passwords via `NEXT_PUBLIC_*` variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/login` | HR & employee sign-in (role-based redirect) |
| `/auth/set-password` | Employee password setup from welcome email link |
| `/portal` | Employee profile & payslip downloads |
| `/employees` | HR employee directory (CRUD) |
| `/insights` | HR country & role salary analytics |

## Employee onboarding flow

1. HR creates an employee in the dashboard.
2. Employee receives a welcome email with **Set up your password**.
3. Employee opens the link → `/auth/set-password?email=...&otp=...`
4. After setting a password, employee signs in at `/login` and lands on `/portal`.
