import { db } from "./db";
import { 
  tournaments, divisions, teams, players, matches, venues,
  type InsertTournament, type InsertDivision, type InsertTeam, type InsertPlayer, type InsertMatch, type InsertVenue,
  type Tournament, type Division, type Team, type Player, type Match, type Venue,
  type UpdateTeamRequest, type UpdatePlayerRequest
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined>;
  createTournament(data: InsertTournament): Promise<Tournament>;

  // Divisions
  getDivisions(tournamentId: number): Promise<Division[]>;
  createDivision(data: InsertDivision): Promise<Division>;

  // Teams
  getTeams(tournamentId: number, status?: string, divisionId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<(Team & { players?: Player[] }) | undefined>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: UpdateTeamRequest): Promise<Team>;

  // Players
  getPlayers(teamId: number): Promise<Player[]>;
  createPlayer(data: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player>;
  createPlayersBulk(data: Omit<InsertPlayer, "teamId">[], teamId: number): Promise<Player[]>;

  // Matches
  getMatches(tournamentId: number): Promise<(Match & { homeTeam: Team | null, awayTeam: Team | null })[]>;
  createMatch(data: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match>;

  // Venues
  getVenues(): Promise<Venue[]>;
  createVenue(data: InsertVenue): Promise<Venue>;
}

export class DatabaseStorage implements IStorage {
  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getTournament(id: number): Promise<(Tournament & { divisions: Division[] }) | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    if (!tournament) return undefined;
    
    const tournamentDivisions = await db.select().from(divisions).where(eq(divisions.tournamentId, id));
    return { ...tournament, divisions: tournamentDivisions };
  }

  async createTournament(data: InsertTournament): Promise<Tournament> {
    const [tournament] = await db.insert(tournaments).values(data).returning();
    return tournament;
  }

  // Divisions
  async getDivisions(tournamentId: number): Promise<Division[]> {
    return await db.select().from(divisions).where(eq(divisions.tournamentId, tournamentId));
  }

  async createDivision(data: InsertDivision): Promise<Division> {
    const [division] = await db.insert(divisions).values(data).returning();
    return division;
  }

  // Teams
  async getTeams(tournamentId: number, status?: string, divisionId?: number): Promise<Team[]> {
    let query = db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
    
    if (status) {
      query = query.where(eq(teams.status, status as any)) as any;
    }
    if (divisionId) {
       query = query.where(eq(teams.divisionId, divisionId)) as any;
    }
    
    return await query;
  }

  async getTeam(id: number): Promise<(Team & { players?: Player[] }) | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    if (!team) return undefined;
    
    const teamPlayers = await db.select().from(players).where(eq(players.teamId, id));
    return { ...team, players: teamPlayers };
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }

  async updateTeam(id: number, data: UpdateTeamRequest): Promise<Team> {
    const [team] = await db.update(teams).set(data).where(eq(teams.id, id)).returning();
    return team;
  }

  // Players
  async getPlayers(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  async createPlayer(data: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(data).returning();
    return player;
  }

  async updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player> {
    const [player] = await db.update(players).set(data).where(eq(players.id, id)).returning();
    return player;
  }

  async createPlayersBulk(data: Omit<InsertPlayer, "teamId">[], teamId: number): Promise<Player[]> {
    const playersToInsert = data.map(p => ({ ...p, teamId }));
    return await db.insert(players).values(playersToInsert).returning();
  }

  // Matches
  async getMatches(tournamentId: number): Promise<(Match & { homeTeam: Team | null, awayTeam: Team | null })[]> {
    const matchesData = await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
    
    // Enrich with team names (simplified for now, ideally use joins or Drizzle with...)
    const enrichedMatches = await Promise.all(matchesData.map(async (match) => {
       let homeTeam: Team | null = null;
       let awayTeam: Team | null = null;
       
       if (match.homeTeamId) {
          [homeTeam] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId));
       }
       if (match.awayTeamId) {
          [awayTeam] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId));
       }

       return { ...match, homeTeam: homeTeam || null, awayTeam: awayTeam || null };
    }));
    
    return enrichedMatches;
  }

  async createMatch(data: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(data).returning();
    return match;
  }

  async updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match> {
    const [match] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
    return match;
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
