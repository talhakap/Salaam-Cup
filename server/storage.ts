import { db } from "./db";
import { 
  tournaments, divisions, teams, players, matches, venues, standings, sports, awards, news, sponsors, specialAwards, aboutContent, waiverContent, mediaYears, mediaItems, faqs,
  type InsertTournament, type InsertDivision, type InsertTeam, type InsertPlayer, 
  type InsertMatch, type InsertVenue, type InsertStanding, type InsertSport, type InsertAward, type InsertNews, type InsertSponsor, type InsertSpecialAward, type InsertAboutContent,
  type InsertWaiverContent, type WaiverContent,
  type InsertMediaYear, type InsertMediaItem, type InsertFaq,
  type Tournament, type Division, type Team, type Player, type Match, type Venue, 
  type Standing, type Sport, type Award, type News, type Sponsor, type SpecialAward, type AboutContent,
  type MediaYear, type MediaItem, type MediaYearWithItems, type Faq,
  type UpdateTeamRequest, type UpdatePlayerRequest,
  type StandingWithTeam, type MatchWithTeams,
} from "@shared/schema";
import { eq, and, sql, desc, asc, isNull } from "drizzle-orm";

export interface IStorage {
  // Sports
  getSports(): Promise<Sport[]>;
  createSport(data: InsertSport): Promise<Sport>;
  updateSport(id: number, data: Partial<InsertSport>): Promise<Sport>;
  deleteSport(id: number): Promise<void>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined>;
  createTournament(data: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, data: Partial<InsertTournament>): Promise<Tournament>;
  deleteTournament(id: number): Promise<void>;
  resetTournament(id: number): Promise<void>;

  reorderTournaments(orderedIds: number[]): Promise<void>;

  // Divisions
  getDivisions(tournamentId: number): Promise<Division[]>;
  createDivision(data: InsertDivision): Promise<Division>;
  updateDivision(id: number, data: Partial<InsertDivision>): Promise<Division>;
  deleteDivision(id: number): Promise<void>;
  reorderDivisions(tournamentId: number, orderedIds: number[]): Promise<void>;

  // Teams
  getAllTeams(status?: string): Promise<Team[]>;
  getTeams(tournamentId: number, status?: string, divisionId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<(Team & { players: Player[] }) | undefined>;
  getTeamsByCaptainUserId(userId: string): Promise<(Team & { tournamentName?: string; divisionName?: string })[]>;
  claimTeamsByEmail(email: string, userId: string): Promise<Team[]>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: UpdateTeamRequest): Promise<Team>;
  deleteTeam(id: number): Promise<void>;

  // Players
  getPlayers(teamId: number): Promise<Player[]>;
  getPlayerById(id: number): Promise<Player | undefined>;
  getAllPlayersByStatus(status?: string): Promise<(Player & { team: Team | null })[]>;
  getAllRegisteredPlayers(status?: string): Promise<(Player & { team: Team | null })[]>;
  createPlayer(data: InsertPlayer): Promise<Player>;
  registerPlayerWithMatching(data: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  createPlayersBulk(data: Omit<InsertPlayer, "teamId">[], teamId: number): Promise<Player[]>;

  // Matches
  getMatch(id: number): Promise<Match | undefined>;
  getMatches(tournamentId: number, includeDrafts?: boolean): Promise<MatchWithTeams[]>;
  createMatch(data: InsertMatch): Promise<Match>;
  bulkCreateMatches(data: InsertMatch[]): Promise<Match[]>;
  updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match>;
  deleteMatch(id: number): Promise<void>;

  publishMatches(tournamentId: number): Promise<number>;

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

  // Special Awards
  getSpecialAwards(): Promise<SpecialAward[]>;
  createSpecialAward(data: InsertSpecialAward): Promise<SpecialAward>;
  updateSpecialAward(id: number, data: Partial<InsertSpecialAward>): Promise<SpecialAward>;
  deleteSpecialAward(id: number): Promise<void>;

  // Waiver Content
  getWaiverContent(): Promise<WaiverContent | undefined>;
  upsertWaiverContent(data: InsertWaiverContent): Promise<WaiverContent>;

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
  updateVenue(id: number, data: Partial<InsertVenue>): Promise<Venue>;
  deleteVenue(id: number): Promise<void>;

  // FAQs
  getFaqs(): Promise<Faq[]>;
  getFeaturedFaqs(): Promise<Faq[]>;
  createFaq(data: InsertFaq): Promise<Faq>;
  updateFaq(id: number, data: Partial<InsertFaq>): Promise<Faq>;
  deleteFaq(id: number): Promise<void>;
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

  async updateSport(id: number, data: Partial<InsertSport>): Promise<Sport> {
    const [sport] = await db.update(sports).set(data).where(eq(sports.id, id)).returning();
    return sport;
  }

  async deleteSport(id: number): Promise<void> {
    await db.delete(sports).where(eq(sports.id, id));
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(asc(tournaments.sortOrder), asc(tournaments.id));
  }

  async getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    if (!tournament) return undefined;
    const divs = await db.select().from(divisions).where(eq(divisions.tournamentId, id)).orderBy(asc(divisions.sortOrder), asc(divisions.id));
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

  async reorderTournaments(orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(tournaments).set({ sortOrder: i }).where(eq(tournaments.id, orderedIds[i]));
    }
  }

  // Divisions
  async getDivisions(tournamentId: number): Promise<Division[]> {
    return await db.select().from(divisions).where(eq(divisions.tournamentId, tournamentId)).orderBy(asc(divisions.sortOrder), asc(divisions.id));
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

  async reorderDivisions(tournamentId: number, orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(divisions).set({ sortOrder: i }).where(and(eq(divisions.id, orderedIds[i]), eq(divisions.tournamentId, tournamentId)));
    }
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

  async getTeamsByCaptainUserId(userId: string): Promise<(Team & { tournamentName?: string; divisionName?: string })[]> {
    const result = await db
      .select({
        team: teams,
        tournamentName: tournaments.name,
        divisionName: divisions.name,
      })
      .from(teams)
      .leftJoin(tournaments, eq(teams.tournamentId, tournaments.id))
      .leftJoin(divisions, eq(teams.divisionId, divisions.id))
      .where(eq(teams.captainUserId, userId));
    return result.map(r => ({
      ...r.team,
      tournamentName: r.tournamentName ?? undefined,
      divisionName: r.divisionName ?? undefined,
    }));
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

  async getPlayerById(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async createPlayer(data: InsertPlayer): Promise<Player> {
    if (data.registrationType === 'roster' && data.teamId) {
      const normalizedFirst = data.firstName.trim().toLowerCase();
      const normalizedLast = data.lastName.trim().toLowerCase();
      const normalizedDob = data.dob;
      const existing = await db.select().from(players).where(
        and(
          eq(players.teamId, data.teamId),
          eq(players.registrationType, 'roster')
        )
      );
      const dup = existing.find(e =>
        e.firstName.trim().toLowerCase() === normalizedFirst
        && e.lastName.trim().toLowerCase() === normalizedLast
        && e.dob === normalizedDob
      );
      if (dup) {
        return dup;
      }
    }

    const [player] = await db.insert(players).values(data).returning();
    if (data.registrationType === 'roster' && data.teamId) {
      const matched = await this.matchRosterAgainstRegistrations(player);
      if (matched) return matched;
    }
    return player;
  }

  private async matchRosterAgainstRegistrations(rosterPlayer: Player): Promise<Player | null> {
    if (!rosterPlayer.teamId) return null;
    const normalizedFirst = rosterPlayer.firstName.trim().toLowerCase();
    const normalizedLast = rosterPlayer.lastName.trim().toLowerCase();
    const normalizedDob = rosterPlayer.dob;

    const registeredPlayers = await db.select().from(players).where(
      and(
        eq(players.teamId, rosterPlayer.teamId),
        eq(players.registrationType, 'player')
      )
    );

    const matchedRegistration = registeredPlayers.find(rp =>
      rp.firstName.trim().toLowerCase() === normalizedFirst
      && rp.lastName.trim().toLowerCase() === normalizedLast
      && rp.dob === normalizedDob
    );

    if (matchedRegistration) {
      await db.update(players).set({
        status: 'confirmed',
        email: matchedRegistration.email || rosterPlayer.email,
        phone: matchedRegistration.phone || rosterPlayer.phone,
        position: matchedRegistration.position || rosterPlayer.position,
        jerseyNumber: matchedRegistration.jerseyNumber || rosterPlayer.jerseyNumber,
        waiverSigned: matchedRegistration.waiverSigned ?? rosterPlayer.waiverSigned,
      }).where(eq(players.id, rosterPlayer.id));
      await db.delete(players).where(eq(players.id, matchedRegistration.id));
      const [updated] = await db.select().from(players).where(eq(players.id, rosterPlayer.id));
      return updated;
    }

    return null;
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
      sql`(${players.registrationType} IN ('player', 'free_agent') OR (${players.registrationType} = 'roster' AND ${players.status} = 'confirmed'))`
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
    const normalizedFirst = data.firstName.trim().toLowerCase();
    const normalizedLast = data.lastName.trim().toLowerCase();
    const normalizedDob = data.dob;

    if (data.registrationType === 'free_agent') {
      const [player] = await db.insert(players).values({
        ...data,
        status: 'flagged',
        registrationType: 'free_agent',
      }).returning();
      return player;
    }

    if (data.teamId) {
      const rosterPlayers = await db.select().from(players).where(
        and(
          eq(players.teamId, data.teamId),
          eq(players.registrationType, 'roster')
        )
      );

      const matchedRoster = rosterPlayers.find(rp =>
        rp.firstName.trim().toLowerCase() === normalizedFirst
        && rp.lastName.trim().toLowerCase() === normalizedLast
        && rp.dob === normalizedDob
      );

      if (matchedRoster) {
        const [updated] = await db.update(players).set({
          status: 'confirmed',
          registrationType: 'player',
          email: data.email || matchedRoster.email,
          phone: data.phone || matchedRoster.phone,
          position: data.position || matchedRoster.position,
          jerseyNumber: data.jerseyNumber || matchedRoster.jerseyNumber,
          waiverSigned: data.waiverSigned ?? matchedRoster.waiverSigned,
          registeredAt: new Date(),
        }).where(eq(players.id, matchedRoster.id)).returning();
        return updated;
      }

      const existingRegistration = await db.select().from(players).where(
        and(
          eq(players.teamId, data.teamId),
          eq(players.registrationType, 'player')
        )
      );
      const dupReg = existingRegistration.find(e =>
        e.firstName.trim().toLowerCase() === normalizedFirst
        && e.lastName.trim().toLowerCase() === normalizedLast
        && e.dob === normalizedDob
      );
      if (dupReg) {
        return dupReg;
      }
    }

    const [player] = await db.insert(players).values({
      ...data,
      status: 'flagged',
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
    const existingRoster = await db.select().from(players).where(
      and(
        eq(players.teamId, teamId),
        eq(players.registrationType, 'roster')
      )
    );

    const deduped = data.filter(p => {
      if (p.registrationType !== 'roster') return true;
      const nFirst = p.firstName.trim().toLowerCase();
      const nLast = p.lastName.trim().toLowerCase();
      const nDob = p.dob;
      return !existingRoster.some(e =>
        e.firstName.trim().toLowerCase() === nFirst
        && e.lastName.trim().toLowerCase() === nLast
        && e.dob === nDob
      );
    });

    if (deduped.length === 0) return existingRoster;

    const toInsert = deduped.map(p => ({ ...p, teamId }));
    const created = await db.insert(players).values(toInsert).returning();
    const results: Player[] = [];
    for (const player of created) {
      if (player.registrationType === 'roster') {
        const matched = await this.matchRosterAgainstRegistrations(player);
        results.push(matched || player);
      } else {
        results.push(player);
      }
    }
    return results;
  }

  // Matches
  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatches(tournamentId: number, includeDrafts: boolean = false): Promise<MatchWithTeams[]> {
    const conditions = [eq(matches.tournamentId, tournamentId)];
    if (!includeDrafts) {
      conditions.push(eq(matches.draft, false));
    }
    const matchRows = await db.select().from(matches).where(and(...conditions));
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

  async publishMatches(tournamentId: number): Promise<number> {
    const result = await db.update(matches)
      .set({ draft: false })
      .where(and(eq(matches.tournamentId, tournamentId), eq(matches.draft, true)))
      .returning();
    return result.length;
  }

  // Standings
  async getStandings(tournamentId: number): Promise<StandingWithTeam[]> {
    const rows = await db.select().from(standings).where(eq(standings.tournamentId, tournamentId));
    const approvedTeams = await db.select().from(teams)
      .where(and(eq(teams.tournamentId, tournamentId), eq(teams.status, "approved")));

    const teamIdsWithStandings = new Set(rows.map(r => Number(r.teamId)));

    const enriched: StandingWithTeam[] = [];
    for (const s of rows) {
      const team = approvedTeams.find(t => Number(t.id) === Number(s.teamId));
      if (team) enriched.push({ ...s, team });
    }

    for (const team of approvedTeams) {
      if (!teamIdsWithStandings.has(Number(team.id))) {
        enriched.push({
          id: 0,
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
          team,
        });
      }
    }

    return enriched.sort((a, b) => (b.points - a.points) || (b.goalDifference - a.goalDifference));
  }

  async recalculateStandings(tournamentId: number): Promise<void> {
    // Get all final matches for this tournament
    const finalMatches = await db.select().from(matches)
      .where(and(eq(matches.tournamentId, tournamentId), eq(matches.status, "final"), eq(matches.pulled, false), eq(matches.draft, false)));

    // Get all approved teams
    const allTeams = await db.select().from(teams)
      .where(and(eq(teams.tournamentId, tournamentId), eq(teams.status, "approved")));

    // Clear existing standings
    await db.delete(standings).where(eq(standings.tournamentId, tournamentId));

    // Build standings map (coerce IDs to number for consistent lookups)
    const statsMap = new Map<number, InsertStanding>();
    for (const team of allTeams) {
      statsMap.set(Number(team.id), {
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
      const home = statsMap.get(Number(m.homeTeamId));
      const away = statsMap.get(Number(m.awayTeamId));
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
        home.points! += 2;
      } else if (hs < as) {
        away.wins!++;
        home.losses!++;
        away.points! += 2;
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
    Array.from(byDiv.values()).forEach(divStandings => {
      divStandings.forEach((s: InsertStanding, i: number) => { s.position = i + 1; });
    });

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

  // Special Awards
  async getSpecialAwards(): Promise<SpecialAward[]> {
    return await db.select().from(specialAwards).orderBy(specialAwards.sortOrder);
  }

  async createSpecialAward(data: InsertSpecialAward): Promise<SpecialAward> {
    const [item] = await db.insert(specialAwards).values(data).returning();
    return item;
  }

  async updateSpecialAward(id: number, data: Partial<InsertSpecialAward>): Promise<SpecialAward> {
    const [item] = await db.update(specialAwards).set(data).where(eq(specialAwards.id, id)).returning();
    return item;
  }

  async deleteSpecialAward(id: number): Promise<void> {
    await db.delete(specialAwards).where(eq(specialAwards.id, id));
  }

  // Waiver Content
  async getWaiverContent(): Promise<WaiverContent | undefined> {
    const [content] = await db.select().from(waiverContent).limit(1);
    return content;
  }

  async upsertWaiverContent(data: InsertWaiverContent): Promise<WaiverContent> {
    const existing = await this.getWaiverContent();
    if (existing) {
      const [updated] = await db.update(waiverContent).set({ ...data, updatedAt: new Date() }).where(eq(waiverContent.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(waiverContent).values(data).returning();
    return created;
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

  async updateVenue(id: number, data: Partial<InsertVenue>): Promise<Venue> {
    const [venue] = await db.update(venues).set(data).where(eq(venues.id, id)).returning();
    return venue;
  }

  async deleteVenue(id: number): Promise<void> {
    await db.delete(venues).where(eq(venues.id, id));
  }

  // FAQs
  async getFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).orderBy(faqs.sortOrder);
  }

  async getFeaturedFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).where(eq(faqs.featured, true)).orderBy(faqs.sortOrder);
  }

  async createFaq(data: InsertFaq): Promise<Faq> {
    const [faq] = await db.insert(faqs).values(data).returning();
    return faq;
  }

  async updateFaq(id: number, data: Partial<InsertFaq>): Promise<Faq> {
    const [faq] = await db.update(faqs).set(data).where(eq(faqs.id, id)).returning();
    return faq;
  }

  async deleteFaq(id: number): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }
}

export const storage = new DatabaseStorage();
