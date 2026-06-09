# MUN Conference Portal

A web application for managing a school Model United Nations conference.

This portal supports:
- role-based login for Delegates, Chairs, and Admins
- resolution uploads via `.docx` and HTML rendering for live viewing
- amendment submission and chair review workflows
- bulk user creation from CSV files
- committee room maps and conference details

## Contents
- [What the app does](#what-the-app-does)
- [Who can use it](#who-can-use-it)
- [Local setup](#local-setup)
- [Usage](#usage)
- [Database & Prisma](#database--prisma)
- [Environment variables](#environment-variables)
- [Run commands](#run-commands)
- [Deployment notes](#deployment-notes)

## What the app does

This portal implements the MVP from the conference spec:

- Authentication using pre-created accounts with `email` and `access code`
- Delegate dashboard with profile, committee info, and resolution browsing
- Resolution pages rendered from DOCX uploads
- Amendment submission for delegates, with server-side committee validation
- Chair workflow for reviewing and approving/rejecting amendments
- Admin tools for user management, committee oversight, and global resolution management
- CSV import support for bulk user creation and login code generation

## Who can use it

### Delegate
- login with email + access code
- view all resolutions
- submit amendments only for resolutions in their committee
- see committee details and room information

### Chair
- access committee-specific dashboard
- upload or replace resolution DOCX files
- review pending amendments and approve/reject them
- manage committee delegates

### Admin
- full conference oversight
- create, edit, and delete users
- assign roles and committees
- manage resolutions globally
- import user data via CSV

## Local setup

### Prerequisites
- Node.js 18+ installed
- npm available

### Install dependencies

```bash
npm install
```

### Initialize database

The project uses Prisma with SQLite for local development.

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

If `prisma migrate dev` has already been run, the database should be ready after `npm install` and seeding.

### Start the dev server

```bash
npm run dev
```

Open the local URL shown by Next.js, usually `http://localhost:3000`.

## Usage

### Login flow

Users log in with:
- Email
- Access code

After login, the app redirects based on role:
- Delegates → delegate dashboard
- Chairs → chair dashboard
- Admins → admin console

### Resolutions

- All authenticated users can view resolutions
- Resolutions are stored with original DOCX and rendered HTML
- The app preserves formatting such as bold, underline, numbering, lists, and paragraph spacing

### Amendments

- Delegates may submit amendments only for resolutions in their assigned committee
- Server-side validation enforces `user.committee_id == resolution.committee_id`
- Amendments are marked `Pending` until a chair reviews them
- Chairs can approve or reject amendments

### CSV import

The admin dashboard supports bulk user import from CSV with columns such as:
- `name`
- `email`
- `school`
- `country`
- `committee`
- `allergies`
- `role`

The import process creates users and generates login codes.

## Database & Prisma

- Schema file: `prisma/schema.prisma`
- Migrations folder: `prisma/migrations/`
- Seed script: `prisma/seed.ts`

Common commands:

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

## Environment variables

Copy `.env.example` to `.env` and update values.

Typical variables:
- `DATABASE_URL` — SQLite connection string
- `NEXT_PUBLIC_APP_URL` — app base URL for public routes
- `SESSION_SECRET` — secret used by session middleware

## Run commands

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # start built app
npm run lint   # run ESLint
```

## Deployment notes

This app is suitable for Vercel deployment.

Important considerations:
- SQLite is fine for local development, but use a hosted database for production if persistence is required
- Set environment variables in the deployment platform
- Ensure migration and seed steps are applied before production launch

---
