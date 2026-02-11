# Salaam Cup - Tournament Management Platform

## Overview

Salaam Cup is a multi-tournament sports competition platform for managing community-based tournaments. It handles the full lifecycle from team registration through roster verification. The platform serves three user types: **Team Captains** (register teams, submit rosters), **Players** (listed on rosters, must be verified), and **Admins** (approve teams, verify players, manage tournaments).

Core features include:
- Tournament creation and management with divisions
- Public team registration (no login required) with admin approval workflows
- Player and free agent self-registration with auto-matching against captain-submitted rosters
  - Player registration compares (team + name + DOB) against roster entries; matched = "confirmed", unmatched = "flagged"
  - Free agents register without a team and are automatically flagged for admin review
- Captain auto-linking: when a captain logs in, their email is matched against approved teams to auto-assign ownership
- Player roster management with eligibility verification
- Match scheduling and standings tracking
- Admin dashboard with real data (pending teams count, approved teams, quick approve actions)
- Admin team management page with status filtering (all/pending/approved/rejected) and approve/reject buttons
- Admin players page showing all self-registered players/free agents with confirmed/flagged status filters, sorted by registration date
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
- **Core Tables**: `sports`, `tournaments`, `divisions`, `teams`, `players`, `matches`, `venues`, `standings`, `users`, `sessions`

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
- **Replit Auth (OpenID Connect)**: Authentication provider for admins. Requires `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables.
- **Supabase Auth**: Used for captain login (email/password). Server-side admin client (`server/supabaseAdmin.ts`) creates captain accounts when admin approves teams. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
  - Dual auth: Admins use Replit Auth, captains use Supabase Auth email/password. Both share the same Express session store.
  - Captain auth endpoints: POST `/api/captain/login`, POST `/api/captain/logout`, GET `/api/captain/me`
  - Team approval endpoint: POST `/api/admin/teams/:id/approve` creates Supabase Auth user + generated password, returns credentials to admin
  - Captain login page: `/captain-login`, Captain dashboard: `/captain`

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express** + **express-session**: HTTP server and session management
- **connect-pg-simple**: PostgreSQL-backed session store
- **passport** + **openid-client**: Authentication strategy
- **zod** + **drizzle-zod**: Runtime validation
- **@tanstack/react-query**: Async state management
- **react-hook-form** + **@hookform/resolvers**: Form handling
- **wouter**: Client-side routing
- **shadcn/ui** (Radix UI primitives): Component library
- **date-fns**: Date formatting
- **lucide-react**: Icon library
- **recharts**: Charting (available via shadcn chart component)