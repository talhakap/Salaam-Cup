# Salaam Cup - Tournament Management Platform

## Overview

Salaam Cup is a multi-tournament sports competition platform for managing community-based tournaments. It handles the full lifecycle from team registration through roster verification. The platform serves three user types: **Team Captains** (register teams, submit rosters), **Players** (listed on rosters, must be verified), and **Admins** (approve teams, verify players, manage tournaments).

Core features include:
- Tournament creation and management with divisions
- Public team registration (no login required) with admin approval workflows
- Player and free agent self-registration with bi-directional auto-matching against captain-submitted rosters
  - Player registration compares (team + name + DOB) against roster entries; matched = "confirmed", unmatched = "flagged"
  - Roster submission also compares against existing self-registered players; if a match is found, both the roster entry and the previously-flagged registration are confirmed
  - Free agents register without a team and are automatically flagged for admin review
- Captain auto-linking: when a captain logs in, their email is matched against approved teams to auto-assign ownership
- Player roster management with eligibility verification
- Match scheduling and standings tracking
- Admin dashboard with real data (pending teams count, approved teams, quick approve actions)
- Admin team management page with status filtering (all/pending/approved/rejected) and approve/reject buttons
- Admin players page showing all self-registered players/free agents with confirmed/flagged status filters, sorted by registration date
- Roster visibility control: per-tournament `rostersVisible` toggle on admin tournaments page; when off, the Roster tab is hidden on public team detail pages; toggle switch shown inline on tournament cards alongside registration toggle
- Team detail view with roster tab (shows which roster players have registered) and registrations tab (shows self-registered players with match status)
- Captain dashboard showing teams linked to their account via /api/my-teams
- Tournament sub-pages: Schedule (with division/date/status filters), Standings (full table with division tabs), Rules (rich text per division, admin-editable via inline Quill editor), Awards (by year/division/category)
- Tournament sub-navigation bar component (TournamentNav) used on all tournament pages (Home, Schedule, Standings, Rules, Awards)
- Awards management: awards table with tournamentId, divisionId, year, category (Champions, Runner Up, MVP, etc.), team/player name, logo
- Admin Awards page for CRUD operations on awards by tournament
- News system: admin can create news items (headline, image URL, date, optional tournament link); displayed on home page in "Where Stories Become Legacy" section with 3-column card grid and pagination dots
- Admin News page for CRUD operations on news items
- Reusable ReadyToCompete CTA and FAQSection components used across tournament pages
- Sponsor system: sponsors table with name, logoUrl, websiteUrl, sortOrder; animated marquee SponsorBar component on home/about pages; Admin Sponsors page with CRUD and image upload
- About page: Full design with Hero ("Who We Are"), SponsorBar, admin-managed letter section (PDF embed or rich text), moments gallery, history (Our Beginnings/How We Grew), value cards, "We Admire Them" section, celebrations gallery, upcoming events carousel, ReadyToCompete CTA
- Admin About Content page: toggle between PDF upload or rich text editor (Quill) for the letter/content section on the About page
- Media Gallery page: admin-managed past tournaments gallery with year-based accordion sections; each year contains tournament cards (image, category, name, "Show All" link URL)
- Admin Media Gallery page: CRUD for media years and tournament cards with image upload support
- FAQ system: faqs table with question, answer, featured boolean, sortOrder; featured FAQs (max 5) shown on homepage in accordion; full /faq page shows all FAQs; Admin FAQs page (/admin/faqs) with CRUD, featured toggle, sort order management; backend enforces max 5 featured cap
- Special Awards system: special_awards table with imageUrl, header, description, sortOrder; displayed in "We Admire Them" section on About page (dark background, 2-column grid with image + header + description); Admin Special Awards page (/admin/special-awards) with CRUD and image upload; section hidden when no awards exist
- Venue management: venues table with name, address, mapLink; Admin Venues page (/admin/venues) with full CRUD; venueId on tournaments, divisions, and matches tables; fieldLocation text field on matches for specific field/rink designation; venue selector in tournament, division, and match admin forms; venue + field info displayed on public schedule page and admin match cards
- SEO: react-helmet-async for per-page meta tags; SEO component (`client/src/components/SEO.tsx`) added to all 13 public pages with Toronto/GTA-targeted titles, descriptions, keywords, and canonical URLs; index.html has base OG/Twitter/geo meta tags and JSON-LD SportsOrganization schema; server-side `/sitemap.xml` (dynamic with tournaments + approved teams) and `/robots.txt` endpoints
- Standings calculation: Now supports per-team pulled flags (pulledHomeTeam, pulledAwayTeam) allowing match to be excluded from one team's standings while counting for the opponent; legacy pulled flag still supported for backward compatibility
- Configurable standings system: Per-tournament `standingsType` field (hockey_standard W=2/T=1/L=0, soccer_standard W=3/D=1/L=0, basketball_standard win%-based, softball_standard win%-based); strategy pattern in `server/standingsStrategies.ts`; dynamic column rendering via `shared/standingsConfig.ts`; admin selects type in tournament create/edit form
- Standings adjustments: `standings_adjustments` table for admin manual overrides (points, wins, losses, ties, goals for/against adjustments with notes); Admin Standings Adjustments page (/admin/standings-adjustments) with CRUD; adjustments applied after base calculation in `recalculateStandings`, then re-sorted
- Team rejection email: Automatic Gmail notification sent to captain when admin rejects a team registration (server/gmail.ts sendTeamRejectionEmail)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Structure
The project uses a monorepo layout with three top-level code directories:

- **`client/`** — React SPA (Vite + TypeScript)
- **`server/`** — Express.js API server (TypeScript, run via `tsx`)
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

### Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **Forms**: React Hook Form + Zod resolvers for validation
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (sporty red & navy palette)
- **Fonts**: Oswald (display/headings), Inter (body), DM Sans
- **Key Pages**: Home, Tournaments listing, Tournament detail (with tabs for teams/matches/standings), Team detail, Registration, Captain Dashboard, Admin Dashboard
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`

### Backend (server/)
- **Framework**: Express.js on Node.js
- **Language**: TypeScript (executed with `tsx`)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definitions**: Shared route contract in `shared/routes.ts` with Zod schemas for input validation and response typing — used by both server handlers and client hooks
- **Authentication**: Replit Auth via OpenID Connect (passport.js strategy), session-based with `connect-pg-simple` session store
- **Storage Layer**: `server/storage.ts` defines an `IStorage` interface with a Drizzle ORM implementation, providing a clean abstraction over the database

### Database
- **Database**: PostgreSQL (required, referenced via `DATABASE_URL` env var)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` (main tables), `shared/models/auth.ts` (auth tables)
- **Migrations**: Managed via `drizzle-kit push` (`npm run db:push`)
- **Core Tables**: `sports`, `tournaments`, `divisions`, `teams`, `players`, `matches`, `venues`, `standings`, `standings_adjustments`, `users`, `sessions`

### Key Design Decisions

1. **Shared Route Contract** (`shared/routes.ts`): API routes, input schemas, and response schemas are defined once and consumed by both the Express server and React Query hooks. This ensures type safety across the full stack without code generation.

2. **Storage Interface Pattern**: The server uses an `IStorage` interface in `storage.ts`, decoupling business logic from the database implementation. This makes it possible to swap storage backends.

3. **Drizzle + Zod Integration**: Database schemas defined with Drizzle's `pgTable` are automatically converted to Zod validation schemas via `drizzle-zod`'s `createInsertSchema`, reducing duplication.

4. **Auth via Replit**: Authentication uses Replit's OpenID Connect provider. The `sessions` and `users` tables are mandatory for this integration and should not be dropped.

### Build System
- **Development**: `npm run dev` — runs Vite dev server (HMR) proxied through Express
- **Production Build**: `npm run build` — Vite builds the client to `dist/public/`, esbuild bundles the server to `dist/index.cjs`
- **Production Start**: `npm start` — runs the bundled server which serves static files

## External Dependencies

### Required Services
- **PostgreSQL Database**: Supabase-hosted PostgreSQL. Connection via `SUPABASE_DATABASE_URL` environment variable (falls back to `DATABASE_URL`). Uses Supabase session-mode pooler (port 5432). The code auto-converts transaction-mode pooler URLs (port 6543) to session mode. Used for all data storage and session management.
- **Supabase Auth**: Used for both admin and captain login (email/password). Server-side admin client (`server/supabaseAdmin.ts`) manages user accounts. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
  - Users table has a `role` column ("admin" or "captain") to distinguish access levels
  - Admin accounts seeded on startup via `ADMIN_EMAILS` env var (comma-separated). If the Supabase Auth account doesn't exist, one is created with a generated password logged to the console
  - Admin auth endpoints: POST `/api/admin/login`, POST `/api/admin/logout`, GET `/api/auth/user`
  - Captain auth endpoints: POST `/api/captain/login`, POST `/api/captain/logout`, GET `/api/captain/me`
  - Team approval endpoint: POST `/api/admin/teams/:id/approve` creates Supabase Auth user + generated password, inserts user with role='captain', returns credentials to admin
  - Admin login page: `/admin-login`, Admin dashboard: `/admin`
  - Captain login page: `/captain-login`, Captain dashboard: `/captain`
  - AdminLayout gates all admin pages behind auth check, redirects to `/admin-login` if not authenticated
  - `requireAdmin` middleware protects all admin API routes, checks role='admin' in users table
  - To add a new admin: add their email to the `ADMIN_EMAILS` env var and restart the app

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express** + **express-session**: HTTP server and session management
- **connect-pg-simple**: PostgreSQL-backed session store
- **@supabase/supabase-js**: Supabase Auth client for admin operations
- **zod** + **drizzle-zod**: Runtime validation
- **@tanstack/react-query**: Async state management
- **react-hook-form** + **@hookform/resolvers**: Form handling
- **wouter**: Client-side routing
- **shadcn/ui** (Radix UI primitives): Component library
- **date-fns**: Date formatting
- **lucide-react**: Icon library
- **recharts**: Charting (available via shadcn chart component)