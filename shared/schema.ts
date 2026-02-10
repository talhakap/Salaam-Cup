import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS (Replit Auth + Roles) ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// === VENUES ===
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  mapLink: text("map_link"),
});

export const insertVenueSchema = createInsertSchema(venues).omit({ id: true });
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

// === TOURNAMENTS ===
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g., "salaam-cup-2025"
  year: integer("year").notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: text("status", { enum: ["upcoming", "active", "completed"] }).default("upcoming").notNull(),
  heroImage: text("hero_image"),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

// === DIVISIONS ===
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  name: text("name").notNull(), // e.g. "Men's A", "U16 Boys"
  category: text("category"), // e.g. "Men", "Women", "Youth"
  description: text("description"),
  registrationFee: integer("registration_fee"), // in cents
});

export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true });
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;

// === TEAMS ===
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  divisionId: integer("division_id").references(() => divisions.id).notNull(),
  name: text("name").notNull(),
  captainId: integer("captain_id").references(() => users.id), // Link to user if registered
  captainName: text("captain_name").notNull(),
  captainEmail: text("captain_email").notNull(),
  captainPhone: text("captain_phone").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid"] }).default("unpaid").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

// === PLAYERS ===
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dob: date("dob", { mode: "string" }).notNull(),
  jerseyNumber: integer("jersey_number"),
  status: text("status", { enum: ["staging", "verified", "rejected"] }).default("staging").notNull(),
  photoUrl: text("photo_url"),
  waiverSigned: boolean("waiver_signed").default(false),
  adminNotes: text("admin_notes"), // Reason for rejection/verification issues
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// === MATCHES ===
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  divisionId: integer("division_id").references(() => divisions.id).notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id), // nullable for TBD
  awayTeamId: integer("away_team_id").references(() => teams.id),
  venueId: integer("venue_id").references(() => venues.id),
  startTime: timestamp("start_time"),
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  status: text("status", { enum: ["scheduled", "live", "final", "cancelled"] }).default("scheduled").notNull(),
  round: text("round"), // "Group A", "Quarter Final", etc.
});

export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// === RELATIONS ===
export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  divisions: many(divisions),
  teams: many(teams),
  matches: many(matches),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [divisions.tournamentId],
    references: [tournaments.id],
  }),
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [teams.tournamentId],
    references: [tournaments.id],
  }),
  division: one(divisions, {
    fields: [teams.divisionId],
    references: [divisions.id],
  }),
  players: many(players),
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
    relationName: "homeMatch",
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
    relationName: "awayMatch",
  }),
  venue: one(venues, {
    fields: [matches.venueId],
    references: [venues.id],
  }),
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  division: one(divisions, {
    fields: [matches.divisionId],
    references: [divisions.id],
  }),
}));

// === API TYPES ===
export type CreateTeamRequest = InsertTeam;
export type UpdateTeamRequest = Partial<InsertTeam>;
export type CreatePlayerRequest = InsertPlayer;
export type UpdatePlayerRequest = Partial<InsertPlayer>;
export type TeamWithDetails = Team & { players?: Player[], division?: Division, tournament?: Tournament };
