import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (sessions + users tables required for Replit Auth)
export * from "./models/auth";
import { users } from "./models/auth";

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

// === SPORTS ===
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  description: text("description"),
});

export const insertSportSchema = createInsertSchema(sports).omit({ id: true });
export type Sport = typeof sports.$inferSelect;
export type InsertSport = z.infer<typeof insertSportSchema>;

// === TOURNAMENTS ===
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  year: integer("year").notNull(),
  sportId: integer("sport_id").references(() => sports.id),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: text("status", { enum: ["upcoming", "active", "completed"] }).default("upcoming").notNull(),
  heroImage: text("hero_image"),
  logoUrl: text("logo_url"),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false),
  registrationOpen: boolean("registration_open").default(false),
  venueId: integer("venue_id").references(() => venues.id),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

// === DIVISIONS ===
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description"),
  gameFormat: text("game_format"),
  registrationFee: integer("registration_fee"),
  rulesContent: text("rules_content"),
  venueId: integer("venue_id").references(() => venues.id),
  heroImage: text("hero_image"),
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
  captainUserId: varchar("captain_user_id").references(() => users.id),
  captainName: text("captain_name").notNull(),
  captainEmail: text("captain_email").notNull(),
  captainPhone: text("captain_phone").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid"] }).default("unpaid").notNull(),
  logoUrl: text("logo_url"),
  teamColor: text("team_color"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

// === PLAYERS ===
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dob: date("dob", { mode: "string" }).notNull(),
  jerseyNumber: integer("jersey_number"),
  position: text("position"),
  status: text("status", { enum: ["staging", "confirmed", "flagged", "verified", "rejected"] }).default("staging").notNull(),
  registrationType: text("registration_type", { enum: ["roster", "player", "free_agent"] }).default("roster").notNull(),
  photoUrl: text("photo_url"),
  waiverSigned: boolean("waiver_signed").default(false),
  adminNotes: text("admin_notes"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, registeredAt: true });
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// === MATCHES ===
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  divisionId: integer("division_id").references(() => divisions.id).notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  venueId: integer("venue_id").references(() => venues.id),
  fieldLocation: text("field_location"),
  startTime: timestamp("start_time"),
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  status: text("status", { enum: ["scheduled", "live", "final", "cancelled"] }).default("scheduled").notNull(),
  round: text("round"),
  matchNumber: integer("match_number"),
});

export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// === STANDINGS (computed from matches) ===
export const standings = pgTable("standings", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  divisionId: integer("division_id").references(() => divisions.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  ties: integer("ties").default(0).notNull(),
  goalsFor: integer("goals_for").default(0).notNull(),
  goalsAgainst: integer("goals_against").default(0).notNull(),
  goalDifference: integer("goal_difference").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  position: integer("position").default(0),
});

export const insertStandingSchema = createInsertSchema(standings).omit({ id: true });
export type Standing = typeof standings.$inferSelect;
export type InsertStanding = z.infer<typeof insertStandingSchema>;

// === AWARDS ===
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id, { onDelete: "set null" }),
  divisionId: integer("division_id").references(() => divisions.id, { onDelete: "set null" }),
  tournamentName: text("tournament_name"),
  divisionName: text("division_name"),
  year: integer("year").notNull(),
  category: text("category").notNull(),
  teamName: text("team_name"),
  playerName: text("player_name"),
  teamLogoUrl: text("team_logo_url"),
});

export const insertAwardSchema = createInsertSchema(awards).omit({ id: true });
export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;

// === NEWS ===
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  imageUrl: text("image_url").notNull(),
  publishedDate: date("published_date", { mode: "string" }).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true });
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

// === SPONSORS ===
export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSponsorSchema = createInsertSchema(sponsors).omit({ id: true, createdAt: true });
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;

// === MEDIA YEARS ===
export const mediaYears = pgTable("media_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
});

export const insertMediaYearSchema = createInsertSchema(mediaYears).omit({ id: true });
export type MediaYear = typeof mediaYears.$inferSelect;
export type InsertMediaYear = z.infer<typeof insertMediaYearSchema>;

// === MEDIA ITEMS ===
export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  mediaYearId: integer("media_year_id").references(() => mediaYears.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  tournamentName: text("tournament_name").notNull(),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0),
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({ id: true });
export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;

export type MediaYearWithItems = MediaYear & { items: MediaItem[] };

// === FAQS ===
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;

// === SPECIAL AWARDS ===
export const specialAwards = pgTable("special_awards", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  header: text("header").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertSpecialAwardSchema = createInsertSchema(specialAwards).omit({ id: true });
export type SpecialAward = typeof specialAwards.$inferSelect;
export type InsertSpecialAward = z.infer<typeof insertSpecialAwardSchema>;

// === ABOUT CONTENT ===
export const aboutContent = pgTable("about_content", {
  id: serial("id").primaryKey(),
  contentType: text("content_type", { enum: ["pdf", "richtext"] }).default("richtext").notNull(),
  pdfUrl: text("pdf_url"),
  richTextContent: text("rich_text_content"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAboutContentSchema = createInsertSchema(aboutContent).omit({ id: true, updatedAt: true });
export type AboutContent = typeof aboutContent.$inferSelect;
export type InsertAboutContent = z.infer<typeof insertAboutContentSchema>;

// === RELATIONS ===
export const sportsRelations = relations(sports, ({ many }) => ({
  tournaments: many(tournaments),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  sport: one(sports, {
    fields: [tournaments.sportId],
    references: [sports.id],
  }),
  divisions: many(divisions),
  teams: many(teams),
  matches: many(matches),
  standings: many(standings),
  awards: many(awards),
  news: many(news),
}));

export const newsRelations = relations(news, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [news.tournamentId],
    references: [tournaments.id],
  }),
}));

export const mediaYearsRelations = relations(mediaYears, ({ many }) => ({
  items: many(mediaItems),
}));

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  mediaYear: one(mediaYears, {
    fields: [mediaItems.mediaYearId],
    references: [mediaYears.id],
  }),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [divisions.tournamentId],
    references: [tournaments.id],
  }),
  teams: many(teams),
  standings: many(standings),
  awards: many(awards),
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
    fields: [teams.captainUserId],
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

export const standingsRelations = relations(standings, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [standings.tournamentId],
    references: [tournaments.id],
  }),
  division: one(divisions, {
    fields: [standings.divisionId],
    references: [divisions.id],
  }),
  team: one(teams, {
    fields: [standings.teamId],
    references: [teams.id],
  }),
}));

export const awardsRelations = relations(awards, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [awards.tournamentId],
    references: [tournaments.id],
  }),
  division: one(divisions, {
    fields: [awards.divisionId],
    references: [divisions.id],
  }),
}));

// === API TYPES ===
export type CreateTeamRequest = InsertTeam;
export type UpdateTeamRequest = Partial<InsertTeam>;
export type CreatePlayerRequest = InsertPlayer;
export type UpdatePlayerRequest = Partial<InsertPlayer>;
export type TeamWithPlayers = Team & { players: Player[] };
export type StandingWithTeam = Standing & { team: Team };
export type MatchWithTeams = Match & { homeTeam: Team | null, awayTeam: Team | null };
