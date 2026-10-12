# Yeasin Arafat's developer portfolio

A portfolio and content manager built with Next.js, TypeScript, Neon PostgreSQL, and Drizzle ORM.

## Configure Neon

1. Create a Neon project and copy its pooled PostgreSQL connection string.
2. Put it in `.env.local` as `DATABASE_URL`. Keep the connection string private.
3. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local`. Use a unique admin password and at least 32 random characters for the session secret.
4. Install packages with `npm install`, then apply the included schema migration:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

The migrations create separate relational tables for profile details, languages, interests, social links, projects, project technologies, skill groups and items, education, achievements, contact messages, and rate limits. Migration `0000` records the previous schema for upgrade compatibility; `0001` copies any existing JSONB portfolio row into the relational tables and drops it. The finished database has no JSONB portfolio storage. On the first request to a fresh database, the app inserts seed values from `src/data/` into the relational tables. Later admin edits are stored in Neon.

`npm run db:seed` explicitly inserts the same initial portfolio content from `src/data/` into Neon. It is safe to rerun: existing rows are preserved, and missing seed rows are added.

To run the sample content from Neon’s SQL Editor, use `npm run db:seed:sql` to generate `drizzle/seed.sql`, then paste that file into the editor and run it after the migrations.

Use `npm run db:generate` after changing `src/db/schema.ts`, review the generated SQL in `drizzle/`, then run `npm run db:migrate` to apply it. The public contact form and admin tools use validated Next.js Server Actions. Every content or inbox mutation checks the admin session on the server.

## Run locally

```powershell
npm install
npm run dev
```

The app requires a Neon PostgreSQL `DATABASE_URL`; it no longer creates or uses a local SQLite database. `.env.local` is ignored by Git. Do not commit it or put production credentials in `.env.example`.

## Deploy

Add `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to the deployment environment, apply migrations from a trusted environment with `npm run db:migrate`, then deploy. Neon’s pooled connection URL is suitable for the app’s serverless HTTP driver.

Contact submissions are limited to five per hour per visitor address. `CONTACT_RATE_LIMIT_SECRET` can be set to a separate random secret; if omitted, the app uses `ADMIN_SESSION_SECRET` or `DATABASE_URL` to hash visitor identifiers.

## Update portfolio content

After setup, edit content in `/admin`. Files in `src/data/` provide initial seed content only:

- `profile.json` — identity, introduction, contact details, languages, CV path, and social links.
- `projects.json` — project descriptions, technologies, illustrations, and links.
- `skills.json` — grouped technical skills.
- `education.json` — education details.
- `achievements.json` — competition results and programming milestones.

The CV download points to `public/Yeasin-Arafat-CV.pdf`. Replace that file when the CV changes and keep `resumeUrl` in the profile aligned with its public path. Empty or invalid social and project links are hidden.

## Replace the local assets

- Replace `public/images/developer.svg` with a local developer illustration and update `illustration` in the profile if its path changes.
- Replace `public/images/bookbazar.svg` with a BookBazar screenshot if one is available; the current asset is labeled as a project illustration.

# yeasinarafat1

# yeasin-s-portfolio
