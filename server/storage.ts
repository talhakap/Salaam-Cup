import { db } from "./db";
import { 
  tournaments, divisions, teams, players, matches, venues, standings, sports, awards, news, sponsors, aboutContent, mediaYears, mediaItems,
  type InsertTournament, type InsertDivision, type InsertTeam, type InsertPlayer, 
  type InsertMatch, type InsertVenue, type InsertStanding, type InsertSport, type InsertAward, type InsertNews, type InsertSponsor, type InsertAboutContent,
  type InsertMediaYear, type InsertMediaItem,
  type Tournament, type Division, type Team, type Player, type Match, type Venue, 
  type Standing, type Sport, type Award, type News, type Sponsor, type AboutContent,
  type MediaYear, type MediaItem, type MediaYearWithItems,
  type UpdateTeamRequest, type UpdatePlayerRequest,
  type StandingWithTeam, type MatchWithTeams,
} from "@shared/schema";
import { eq, and, sql, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // Sports
  getSports(): Promise<Sport[]>;
  createSport(data: InsertSport): Promise<Sport>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined>;
  createTournament(data: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, data: Partial<InsertTournament>): Promise<Tournament>;
  deleteTournament(id: number): Promise<void>;
  resetTournament(id: number): Promise<void>;

  // Divisions
  getDivisions(tournamentId: number): Promise<Division[]>;
  createDivision(data: InsertDivision): Promise<Division>;
  updateDivision(id: number, data: Partial<InsertDivision>): Promise<Division>;
  deleteDivision(id: number): Promise<void>;

  // Teams
  getAllTeams(status?: string): Promise<Team[]>;
  getTeams(tournamentId: number, status?: string, divisionId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<(Team & { players: Player[] }) | undefined>;
  getTeamsByCaptainUserId(userId: string): Promise<Team[]>;
  claimTeamsByEmail(email: string, userId: string): Promise<Team[]>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: UpdateTeamRequest): Promise<Team>;
  deleteTeam(id: number): Promise<void>;

  // Players
  getPlayers(teamId: number): Promise<Player[]>;
  getAllPlayersByStatus(status?: string): Promise<(Player & { team: Team | null })[]>;
  getAllRegisteredPlayers(status?: string): Promise<(Player & { team: Team | null })[]>;
  createPlayer(data: InsertPlayer): Promise<Player>;
  registerPlayerWithMatching(data: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  createPlayersBulk(data: Omit<InsertPlayer, "teamId">[], teamId: number): Promise<Player[]>;

  // Matches
  getMatches(tournamentId: number): Promise<MatchWithTeams[]>;
  createMatch(data: InsertMatch): Promise<Match>;
  bulkCreateMatches(data: InsertMatch[]): Promise<Match[]>;
  updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match>;
  deleteMatch(id: number): Promise<void>;

  // Standings
  getStandings(tournamentId: number): Promise<StandingWithTeam[]>;
  recalculateStandings(tournamentId: number): Promise<void>;

  // Awards
  getAwards(tournamentId: number): Promise<Award[]>;
  getAllAwards(): Promise<Award[]>;
  createAward(data: InsertAward): Promise<Award>;
  updateAward(id: number, data: Partial<InsertAward>): Promise<Award>;
  deleteAward(id: number): Promise<void>;

  // News
  getNews(): Promise<News[]>;
  createNews(data: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;

  // Sponsors
  getSponsors(): Promise<Sponsor[]>;
  createSponsor(data: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: number, data: Partial<InsertSponsor>): Promise<Sponsor>;
  deleteSponsor(id: number): Promise<void>;

  // About Content
  getAboutContent(): Promise<AboutContent | undefined>;
  upsertAboutContent(data: InsertAboutContent): Promise<AboutContent>;

  // Media
  getMediaYears(): Promise<MediaYearWithItems[]>;
  createMediaYear(data: InsertMediaYear): Promise<MediaYear>;
  updateMediaYear(id: number, data: Partial<InsertMediaYear>): Promise<MediaYear>;
  deleteMediaYear(id: number): Promise<void>;
  getMediaItems(mediaYearId: number): Promise<MediaItem[]>;
  createMediaItem(data: InsertMediaItem): Promise<MediaItem>;
  updateMediaItem(id: number, data: Partial<InsertMediaItem>): Promise<MediaItem>;
  deleteMediaItem(id: number): Promise<void>;

  // Venues
  getVenues(): Promise<Venue[]>;
  createVenue(data: InsertVenue): Promise<Venue>;
}

export class DatabaseStorage implements IStorage {
  // Sports
  async getSports(): Promise<Sport[]> {
    return await db.select().from(sports);
  }

  async createSport(data: InsertSport): Promise<Sport> {
    const [sport] = await db.insert(sports).values(data).returning();
    return sport;
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    if (!tournament) return undefined;
    const divs = await db.select().from(divisions).where(eq(divisions.tournamentId, id));
    return { ...tournament, divisions: divs };
  }

  async createTournament(data: InsertTournament): Promise<Tournament> {
    const [tournament] = await db.insert(tournaments).values(data).returning();
    return tournament;
  }

  async updateTournament(id: number, data: Partial<InsertTournament>): Promise<Tournament> {
    const [tournament] = await db.update(tournaments).set(data).where(eq(tournaments.id, id)).returning();
    return tournament;
  }

  async resetTournament(id: number): Promise<void> {
    await db.delete(standings).where(eq(standings.tournamentId, id));
    await db.delete(matches).where(eq(matches.tournamentId, id));
    const teamRows = await db.select().from(teams).where(eq(teams.tournamentId, id));
    for (const t of teamRows) {
      await db.delete(players).where(eq(players.teamId, t.id));
    }
    await db.delete(teams).where(eq(teams.tournamentId, id));
  }

  async deleteTournament(id: number): Promise<void> {
    await db.update(awards).set({ tournamentId: null, divisionId: null }).where(eq(awards.tournamentId, id));
    await db.update(news).set({ tournamentId: null }).where(eq(news.tournamentId, id));
    await db.delete(standings).where(eq(standings.tournamentId, id));
    await db.delete(matches).where(eq(matches.tournamentId, id));
    const teamRows = await db.select().from(teams).where(eq(teams.tournamentId, id));
    for (const t of teamRows) {
      await db.delete(players).where(eq(players.teamId, t.id));
    }
    await db.delete(teams).where(eq(teams.tournamentId, id));
    await db.delete(divisions).where(eq(divisions.tournamentId, id));
    await db.delete(tournaments).where(eq(tournaments.id, id));
  }

  // Divisions
  async getDivisions(tournamentId: number): Promise<Division[]> {
    return await db.select().from(divisions).where(eq(divisions.tournamentId, tournamentId));
  }

  async createDivision(data: InsertDivision): Promise<Division> {
    const [division] = await db.insert(divisions).values(data).returning();
    return division;
  }

  async updateDivision(id: number, data: Partial<InsertDivision>): Promise<Division> {
    const [division] = await db.update(divisions).set(data).where(eq(divisions.id, id)).returning();
    return division;
  }

  async deleteDivision(id: number): Promise<void> {
    await db.delete(standings).where(eq(standings.divisionId, id));
    await db.delete(matches).where(eq(matches.divisionId, id));
    const teamRows = await db.select().from(teams).where(eq(teams.divisionId, id));
    for (const t of teamRows) {
      await db.delete(players).where(eq(players.teamId, t.id));
    }
    await db.delete(teams).where(eq(teams.divisionId, id));
    await db.delete(divisions).where(eq(divisions.id, id));
  }

  // Teams
  async getAllTeams(status?: string): Promise<Team[]> {
    if (status) {
      return await db.select().from(teams).where(eq(teams.status, status as any));
    }
    return await db.select().from(teams);
  }

  async getTeams(tournamentId: number, status?: string, divisionId?: number): Promise<Team[]> {
    const conditions = [eq(teams.tournamentId, tournamentId)];
    if (status) conditions.push(eq(teams.status, status as any));
    if (divisionId) conditions.push(eq(teams.divisionId, divisionId));
    return await db.select().from(teams).where(and(...conditions));
  }

  async getTeam(id: number): Promise<(Team & { players: Player[] }) | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    if (!team) return undefined;
    const teamPlayers = await db.select().from(players).where(eq(players.teamId, id));
    return { ...team, players: teamPlayers };
  }

  async getTeamsByCaptainUserId(userId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.captainUserId, userId));
  }

  async claimTeamsByEmail(email: string, userId: string): Promise<Team[]> {
    const claimed = await db.update(teams)
      .set({ captainUserId: userId })
      .where(
        and(
          eq(teams.captainEmail, email),
          eq(teams.status, "approved"),
          sql`${teams.captainUserId} IS NULL`
        )
      )
      .returning();
    return claimed;
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }

  async updateTeam(id: number, data: UpdateTeamRequest): Promise<Team> {
    const [team] = await db.update(teams).set(data).where(eq(teams.id, id)).returning();
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(standings).where(eq(standings.teamId, id));
    await db.delete(players).where(eq(players.teamId, id));
    await db.delete(matches).where(
      sql`${matches.homeTeamId} = ${id} OR ${matches.awayTeamId} = ${id}`
    );
    await db.delete(teams).where(eq(teams.id, id));
  }

  // Players
  async getPlayers(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  async createPlayer(data: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(data).returning();
    return player;
  }

  async getAllPlayersByStatus(status?: string): Promise<(Player & { team: Team | null })[]> {
    const conditions = status ? [eq(players.status, status as any)] : [];
    const allPlayers = conditions.length > 0
      ? await db.select().from(players).where(and(...conditions))
      : await db.select().from(players);
    const enriched = await Promise.all(allPlayers.map(async (p) => {
      let team: Team | null = null;
      if (p.teamId) {
        const [t] = await db.select().from(teams).where(eq(teams.id, p.teamId));
        team = t || null;
      }
      return { ...p, team };
    }));
    return enriched;
  }

  async getAllRegisteredPlayers(status?: string): Promise<(Player & { team: Team | null })[]> {
    const conditions: any[] = [
      sql`${players.registrationType} IN ('player', 'free_agent')`
    ];
    if (status) conditions.push(eq(players.status, status as any));
    const allPlayers = await db.select().from(players)
      .where(and(...conditions))
      .orderBy(desc(players.registeredAt));
    const enriched = await Promise.all(allPlayers.map(async (p) => {
      let team: Team | null = null;
      if (p.teamId) {
        const [t] = await db.select().from(teams).where(eq(teams.id, p.teamId));
        team = t || null;
      }
      return { ...p, team };
    }));
    return enriched;
  }

  async registerPlayerWithMatching(data: InsertPlayer): Promise<Player> {
    if (data.registrationType === 'free_agent') {
      const [player] = await db.insert(players).values({
        ...data,
        status: 'flagged',
        registrationType: 'free_agent',
      }).returning();
      return player;
    }

    const normalizedFirst = data.firstName.trim().toLowerCase();
    const normalizedLast = data.lastName.trim().toLowerCase();
    const normalizedDob = data.dob;

    let matched = false;
    if (data.teamId) {
      const rosterPlayers = await db.select().from(players).where(
        and(
          eq(players.teamId, data.teamId),
          eq(players.registrationType, 'roster')
        )
      );

      matched = rosterPlayers.some(rp => {
        return rp.firstName.trim().toLowerCase() === normalizedFirst
          && rp.lastName.trim().toLowerCase() === normalizedLast
          && rp.dob === normalizedDob;
      });

      if (matched) {
        const matchedRoster = rosterPlayers.find(rp =>
          rp.firstName.trim().toLowerCase() === normalizedFirst
          && rp.lastName.trim().toLowerCase() === normalizedLast
          && rp.dob === normalizedDob
        );
        if (matchedRoster) {
          await db.update(players).set({ status: 'confirmed' }).where(eq(players.id, matchedRoster.id));
        }
      }
    }

    const [player] = await db.insert(players).values({
      ...data,
      status: matched ? 'confirmed' : 'flagged',
      registrationType: 'player',
    }).returning();
    return player;
  }

  async updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player> {
    const [player] = await db.update(players).set(data).where(eq(players.id, id)).returning();
    return player;
  }

  async deletePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async createPlayersBulk(data: Omit<InsertPlayer, "teamId">[], teamId: number): Promise<Player[]> {
    const toInsert = data.map(p => ({ ...p, teamId }));
    return await db.insert(players).values(toInsert).returning();
  }

  // Matches
  async getMatches(tournamentId: number): Promise<MatchWithTeams[]> {
    const matchRows = await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
    const enriched = await Promise.all(matchRows.map(async (m) => {
      let homeTeam: Team | null = null;
      let awayTeam: Team | null = null;
      if (m.homeTeamId) {
        const [ht] = await db.select().from(teams).where(eq(teams.id, m.homeTeamId));
        homeTeam = ht || null;
      }
      if (m.awayTeamId) {
        const [at] = await db.select().from(teams).where(eq(teams.id, m.awayTeamId));
        awayTeam = at || null;
      }
      return { ...m, homeTeam, awayTeam };
    }));
    return enriched;
  }

  async createMatch(data: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(data).returning();
    return match;
  }

  async bulkCreateMatches(data: InsertMatch[]): Promise<Match[]> {
    if (data.length === 0) return [];
    const result = await db.insert(matches).values(data).returning();
    return result;
  }

  async updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match> {
    const [match] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
    return match;
  }

  async deleteMatch(id: number): Promise<void> {
    await db.delete(matches).where(eq(matches.id, id));
  }

  // Standings
  async getStandings(tournamentId: number): Promise<StandingWithTeam[]> {
    const rows = await db.select().from(standings).where(eq(standings.tournamentId, tournamentId));
    const enriched = await Promise.all(rows.map(async (s) => {
      const [team] = await db.select().from(teams).where(eq(teams.id, s.teamId));
      return { ...s, team };
    }));
    return enriched.sort((a, b) => (b.points - a.points) || (b.goalDifference - a.goalDifference));
  }

  async recalculateStandings(tournamentId: number): Promise<void> {
    // Get all final matches for this tournament
    const finalMatches = await db.select().from(matches)
      .where(and(eq(matches.tournamentId, tournamentId), eq(matches.status, "final")));

    // Get all approved teams
    const allTeams = await db.select().from(teams)
      .where(and(eq(teams.tournamentId, tournamentId), eq(teams.status, "approved")));

    // Clear existing standings
    await db.delete(standings).where(eq(standings.tournamentId, tournamentId));

    // Build standings map
    const statsMap = new Map<number, InsertStanding>();
    for (const team of allTeams) {
      statsMap.set(team.id, {
        tournamentId,
        divisionId: team.divisionId,
        teamId: team.id,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: 0,
      });
    }

    for (const m of finalMatches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      const home = statsMap.get(m.homeTeamId);
      const away = statsMap.get(m.awayTeamId);
      if (!home || !away) continue;

      const hs = m.homeScore ?? 0;
      const as = m.awayScore ?? 0;

      home.gamesPlayed!++;
      away.gamesPlayed!++;
      home.goalsFor! += hs;
      home.goalsAgainst! += as;
      away.goalsFor! += as;
      away.goalsAgainst! += hs;

      if (hs > as) {
        home.wins!++;
        away.losses!++;
        home.points! += 3;
      } else if (hs < as) {
        away.wins!++;
        home.losses!++;
        away.points! += 3;
      } else {
        home.ties!++;
        away.ties!++;
        home.points! += 1;
        away.points! += 1;
      }

      home.goalDifference = home.goalsFor! - home.goalsAgainst!;
      away.goalDifference = away.goalsFor! - away.goalsAgainst!;
    }

    // Insert all standings
    const standingsArr = Array.from(statsMap.values());
    // Sort by points then GD for position
    standingsArr.sort((a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!));
    
    // Group by division for per-division positions
    const byDiv = new Map<number, InsertStanding[]>();
    for (const s of standingsArr) {
      if (!byDiv.has(s.divisionId)) byDiv.set(s.divisionId, []);
      byDiv.get(s.divisionId)!.push(s);
    }
    for (const divStandings of byDiv.values()) {
      divStandings.forEach((s, i) => { s.position = i + 1; });
    }

    if (standingsArr.length > 0) {
      await db.insert(standings).values(standingsArr);
    }
  }

  // Awards
  async getAwards(tournamentId: number): Promise<Award[]> {
    return await db.select().from(awards).where(eq(awards.tournamentId, tournamentId));
  }

  async getAllAwards(): Promise<Award[]> {
    return await db.select().from(awards).orderBy(desc(awards.year));
  }

  async createAward(data: InsertAward): Promise<Award> {
    const [award] = await db.insert(awards).values(data).returning();
    return award;
  }

  async updateAward(id: number, data: Partial<InsertAward>): Promise<Award> {
    const [award] = await db.update(awards).set(data).where(eq(awards.id, id)).returning();
    return award;
  }

  async deleteAward(id: number): Promise<void> {
    await db.delete(awards).where(eq(awards.id, id));
  }

  // News
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.publishedDate));
  }

  async createNews(data: InsertNews): Promise<News> {
    const [item] = await db.insert(news).values(data).returning();
    return item;
  }

  async updateNews(id: number, data: Partial<InsertNews>): Promise<News> {
    const [item] = await db.update(news).set(data).where(eq(news.id, id)).returning();
    return item;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Sponsors
  async getSponsors(): Promise<Sponsor[]> {
    return await db.select().from(sponsors).orderBy(sponsors.sortOrder);
  }

  async createSponsor(data: InsertSponsor): Promise<Sponsor> {
    const [item] = await db.insert(sponsors).values(data).returning();
    return item;
  }

  async updateSponsor(id: number, data: Partial<InsertSponsor>): Promise<Sponsor> {
    const [item] = await db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning();
    return item;
  }

  async deleteSponsor(id: number): Promise<void> {
    await db.delete(sponsors).where(eq(sponsors.id, id));
  }

  // About Content
  async getAboutContent(): Promise<AboutContent | undefined> {
    const [content] = await db.select().from(aboutContent).limit(1);
    return content;
  }

  async upsertAboutContent(data: InsertAboutContent): Promise<AboutContent> {
    const existing = await this.getAboutContent();
    if (existing) {
      const [updated] = await db.update(aboutContent).set({ ...data, updatedAt: new Date() }).where(eq(aboutContent.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(aboutContent).values(data).returning();
    return created;
  }

  // Media
  async getMediaYears(): Promise<MediaYearWithItems[]> {
    const years = await db.select().from(mediaYears).orderBy(desc(mediaYears.year));
    const result: MediaYearWithItems[] = [];
    for (const year of years) {
      const items = await db.select().from(mediaItems).where(eq(mediaItems.mediaYearId, year.id)).orderBy(mediaItems.sortOrder);
      result.push({ ...year, items });
    }
    return result;
  }

  async createMediaYear(data: InsertMediaYear): Promise<MediaYear> {
    const [item] = await db.insert(mediaYears).values(data).returning();
    return item;
  }

  async updateMediaYear(id: number, data: Partial<InsertMediaYear>): Promise<MediaYear> {
    const [item] = await db.update(mediaYears).set(data).where(eq(mediaYears.id, id)).returning();
    return item;
  }

  async deleteMediaYear(id: number): Promise<void> {
    await db.delete(mediaItems).where(eq(mediaItems.mediaYearId, id));
    await db.delete(mediaYears).where(eq(mediaYears.id, id));
  }

  async getMediaItems(mediaYearId: number): Promise<MediaItem[]> {
    return await db.select().from(mediaItems).where(eq(mediaItems.mediaYearId, mediaYearId)).orderBy(mediaItems.sortOrder);
  }

  async createMediaItem(data: InsertMediaItem): Promise<MediaItem> {
    const [item] = await db.insert(mediaItems).values(data).returning();
    return item;
  }

  async updateMediaItem(id: number, data: Partial<InsertMediaItem>): Promise<MediaItem> {
    const [item] = await db.update(mediaItems).set(data).where(eq(mediaItems.id, id)).returning();
    return item;
  }

  async deleteMediaItem(id: number): Promise<void> {
    await db.delete(mediaItems).where(eq(mediaItems.id, id));
  }

  // Venues
  async getVenues(): Promise<Venue[]> {
    return await db.select().from(venues);
  }

  async createVenue(data: InsertVenue): Promise<Venue> {
    const [venue] = await db.insert(venues).values(data).returning();
    return venue;
  }
}

export const storage = new DatabaseStorage();
