# Salaam Cup - Project Setup Guide

This guide is for setting up the Salaam Cup project after forking/remixing the Replit project. Follow every step in order.

---

## Step 1: Create a PostgreSQL Database

Create a PostgreSQL database in the new Replit project. You can do this through the Replit database tool or by provisioning one from the Tools panel.

Once created, the following environment variables will be automatically set:
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

---

## Step 2: Push the Database Schema

Run the following command to create all database tables:

```bash
npm run db:push
```

This uses Drizzle ORM to push the schema defined in `shared/schema.ts` to the database. If it prompts for confirmation, accept.

**Important:** The database starts empty. All tournaments, teams, matches, players, etc. will need to be re-created through the admin dashboard.

---

## Step 3: Set Up Supabase Auth

This project uses Supabase for admin and captain authentication (email/password login). You need a Supabase project.

### 3a. Create a Supabase Project
1. Go to https://supabase.com and create a free project
2. From the Supabase dashboard, go to **Settings > API**
3. Copy the **Project URL** and the **service_role key** (NOT the anon key)

### 3b. Set the Supabase Secrets
Add these as **secrets** in the Replit project (Secrets tab):

| Secret Name | Value | Where to Find |
|---|---|---|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase > Settings > API > Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase > Settings > API > service_role key |

### 3c. (Optional) Use Supabase as the Primary Database
The project can also use a Supabase-hosted PostgreSQL database instead of the Replit-provided one. If you want this:

1. Go to Supabase > Settings > Database > Connection string (URI)
2. Copy the connection string (use **Session mode / port 5432**, NOT Transaction mode / port 6543)
3. Add it as a secret named `SUPABASE_DATABASE_URL`

The code will prefer `SUPABASE_DATABASE_URL` over `DATABASE_URL` if both are set. If using the Replit-provided database, you can skip this.

---

## Step 4: Set Up Admin Accounts

### 4a. Set the Admin Email(s)
Add an **environment variable** (not a secret):

| Variable | Value | Example |
|---|---|---|
| `ADMIN_EMAILS` | Comma-separated admin emails | `admin@example.com,owner@example.com` |

### 4b. Set an Admin Password
Add as a **secret**:

| Secret Name | Value |
|---|---|
| `ADMIN_PASSWORD` | A strong password for admin login |

On startup, the server will automatically create Supabase Auth accounts for each admin email with this password. If `ADMIN_PASSWORD` is not set, a random password will be generated and printed to the console (check the server logs).

### 4c. Admin Login
- Admin login page: `/admin-login`
- Admin dashboard: `/admin`

---

## Step 5: Set Session Secret

Add as a **secret**:

| Secret Name | Value |
|---|---|
| `SESSION_SECRET` | Any long random string (e.g., 32+ characters) |

This is used to sign session cookies. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 6: Set Up Email Service (Optional)

The project supports multiple email providers for sending team rejection notifications and captain credentials. Configure ONE of the following:

### Option A: Gmail (Currently Active)
| Secret Name | Value |
|---|---|
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | A Gmail App Password (NOT your regular password) |

To get a Gmail App Password:
1. Enable 2-Factor Authentication on the Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"

**Note:** Email is optional. The app will still work without it, but automated emails (team rejection notices, captain credentials) won't be sent.

---

## Step 7: Set Up Object Storage (For Image Uploads)

The project uses Replit's built-in Object Storage for uploading images (sponsor logos, news images, about page content, etc.).

### 7a. Create Object Storage
Use the Replit "Object Storage" tool pane to provision a bucket. This will automatically set:
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `PRIVATE_OBJECT_DIR`

### 7b. Create Required Directories
In the Object Storage tool pane, create these directories:
- `public` (for publicly accessible assets)
- `.private` (for private uploads)

### 7c. Re-upload Images
Any images that were uploaded through the admin panel (sponsor logos, news images, etc.) will NOT carry over from the original project. You'll need to re-upload them through the admin dashboard.

**Note:** Static images in `client/public/images/` (logos, hero images, backgrounds) ARE included in the fork and do not need to be re-uploaded.

---

## Step 8: Install Dependencies & Start

Dependencies should already be in `package.json`. Run:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

Or use the "Start application" workflow which runs `npm run dev`.

---

## Complete Environment Variables Summary

### Secrets (Sensitive - Add via Secrets tab)

| Secret | Required? | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `ADMIN_PASSWORD` | Recommended | Password for admin accounts |
| `GMAIL_USER` | Optional | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Optional | Gmail app password |

### Environment Variables (Non-sensitive - Add via Environment Variables)

| Variable | Required? | Description |
|---|---|---|
| `ADMIN_EMAILS` | Yes | Comma-separated list of admin email addresses |

### Auto-Configured (Set by Replit - Do NOT set manually)

| Variable | Set By |
|---|---|
| `DATABASE_URL` | Replit PostgreSQL provisioning |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Replit PostgreSQL provisioning |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Replit Object Storage provisioning |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Replit Object Storage provisioning |
| `PRIVATE_OBJECT_DIR` | Replit Object Storage provisioning |

---

## Project Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server (Express + Vite HMR) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:push` | Push database schema changes |

---

## Architecture Quick Reference

- **Frontend**: React + Vite + TypeScript at `client/`
- **Backend**: Express.js + TypeScript at `server/`
- **Shared Types**: `shared/schema.ts` (database schema + Zod validation)
- **Database ORM**: Drizzle ORM
- **Auth**: Supabase Auth (email/password for admins and captains)
- **UI**: shadcn/ui components + Tailwind CSS
- **Routing**: Wouter (client-side)
- **State Management**: TanStack React Query

---

## Troubleshooting

### "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
Set both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Secrets tab. Admin and captain login requires these.

### Database tables not found
Run `npm run db:push` to create all tables.

### Images not loading (uploaded via admin)
Set up Object Storage (Step 7). Uploaded images are stored in object storage, not in the file system.

### Static images not loading
Static images in `client/public/images/` should be included in the fork. If missing, they may need to be re-added.

### Admin can't log in
1. Check that `ADMIN_EMAILS` is set as an environment variable
2. Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Check server logs on startup - the admin account password will be printed if auto-generated
4. If `ADMIN_PASSWORD` is set, that will be used as the admin password

### Port binding
The app binds to `0.0.0.0:5000`. Do not change this - it's required by Replit.
