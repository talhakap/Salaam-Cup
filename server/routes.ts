import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === TOURNAMENTS ===
  app.get(api.tournaments.list.path, async (req, res) => {
    const tournaments = await storage.getTournaments();
    res.json(tournaments);
  });

  app.get(api.tournaments.get.path, async (req, res) => {
    const tournament = await storage.getTournament(Number(req.params.id));
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(tournament);
  });

  app.post(api.tournaments.create.path, async (req, res) => {
    // Check admin
    if (!req.user || !(req.user as any).claims?.isAdmin) {
       // TODO: Implement proper admin check via roles
       // For now, allow logged in users to create for demo or check specific emails
    }
    try {
      const input = api.tournaments.create.input.parse(req.body);
      const tournament = await storage.createTournament(input);
      res.status(201).json(tournament);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  // === DIVISIONS ===
  app.get(api.divisions.list.path, async (req, res) => {
    const divisions = await storage.getDivisions(Number(req.params.tournamentId));
    res.json(divisions);
  });

  app.post(api.divisions.create.path, async (req, res) => {
    try {
      const input = api.divisions.create.input.parse(req.body);
      const division = await storage.createDivision(input);
      res.status(201).json(division);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  // === TEAMS ===
  app.get(api.teams.list.path, async (req, res) => {
    const tournamentId = Number(req.params.tournamentId);
    const { status, divisionId } = req.query;
    const teams = await storage.getTeams(
        tournamentId, 
        status as string, 
        divisionId ? Number(divisionId) : undefined
    );
    res.json(teams);
  });

  app.get(api.teams.get.path, async (req, res) => {
    const team = await storage.getTeam(Number(req.params.id));
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  });

  app.post(api.teams.create.path, async (req, res) => {
    try {
      const input = api.teams.create.input.parse(req.body);
      const team = await storage.createTeam(input);
      res.status(201).json(team);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  app.patch(api.teams.update.path, async (req, res) => {
    try {
      const input = api.teams.update.input.parse(req.body);
      const team = await storage.updateTeam(Number(req.params.id), input);
      res.json(team);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  // === PLAYERS ===
  app.get(api.players.list.path, async (req, res) => {
    const players = await storage.getPlayers(Number(req.params.teamId));
    res.json(players);
  });

  app.post(api.players.create.path, async (req, res) => {
    try {
      const input = api.players.create.input.parse(req.body);
      const player = await storage.createPlayer(input);
      res.status(201).json(player);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  app.post(api.players.bulkCreate.path, async (req, res) => {
    try {
      const input = api.players.bulkCreate.input.parse(req.body);
      const players = await storage.createPlayersBulk(input, Number(req.params.teamId));
      res.status(201).json(players);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });
  
  app.patch(api.players.update.path, async (req, res) => {
    try {
      const input = api.players.update.input.parse(req.body);
      const player = await storage.updatePlayer(Number(req.params.id), input);
      res.json(player);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      throw err;
    }
  });

  // === MATCHES ===
  app.get(api.matches.list.path, async (req, res) => {
    const matches = await storage.getMatches(Number(req.params.tournamentId));
    res.json(matches);
  });
  
  app.post(api.matches.create.path, async (req, res) => {
    try {
       const input = api.matches.create.input.parse(req.body);
       const match = await storage.createMatch(input);
       res.status(201).json(match);
    } catch (err) {
       if (err instanceof z.ZodError) {
          res.status(400).json({ message: err.errors[0].message });
          return;
       }
       throw err;
    }
  });

  app.patch(api.matches.update.path, async (req, res) => {
    try {
       const input = api.matches.update.input.parse(req.body);
       const match = await storage.updateMatch(Number(req.params.id), input);
       res.json(match);
    } catch (err) {
       if (err instanceof z.ZodError) {
          res.status(400).json({ message: err.errors[0].message });
          return;
       }
       throw err;
    }
  });
  
  // === VENUES ===
  app.get(api.venues.list.path, async (req, res) => {
     const venues = await storage.getVenues();
     res.json(venues);
  });
  
  app.post(api.venues.create.path, async (req, res) => {
     try {
        const input = api.venues.create.input.parse(req.body);
        const venue = await storage.createVenue(input);
        res.status(201).json(venue);
     } catch (err) {
        if (err instanceof z.ZodError) {
           res.status(400).json({ message: err.errors[0].message });
           return;
        }
        throw err;
     }
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getTournaments();
  if (existing.length > 0) return;

  const tournament = await storage.createTournament({
    name: "Salaam Cup 2025",
    slug: "salaam-cup-2025",
    year: 2025,
    startDate: "2025-06-01",
    endDate: "2025-06-02",
    status: "active",
    description: "The premier community sports tournament.",
    isFeatured: true,
  });

  const divA = await storage.createDivision({
    tournamentId: tournament.id,
    name: "Men's A",
    category: "Men",
    description: "Competitive division for experienced players.",
  });
  
  const divB = await storage.createDivision({
    tournamentId: tournament.id,
    name: "Men's B",
    category: "Men",
    description: "Recreational division.",
  });
  
  const team1 = await storage.createTeam({
     tournamentId: tournament.id,
     divisionId: divA.id,
     name: "Dirty Clan",
     captainName: "John Doe",
     captainEmail: "john@example.com",
     captainPhone: "555-0123",
     status: "approved",
     description: "Returning champions.",
     logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Nashville_Predators_Logo_%282011%29.svg/1200px-Nashville_Predators_Logo_%282011%29.svg.png" 
  });
  
  const team2 = await storage.createTeam({
     tournamentId: tournament.id,
     divisionId: divA.id,
     name: "The Mafia",
     captainName: "Jane Smith",
     captainEmail: "jane@example.com",
     captainPhone: "555-0124",
     status: "approved",
     description: "New contenders."
  });
  
  await storage.createPlayer({
     teamId: team1.id,
     firstName: "Ali",
     lastName: "Hassan",
     email: "ali@example.com",
     dob: "1995-05-15",
     jerseyNumber: 10,
     status: "verified"
  });
  
  await storage.createMatch({
     tournamentId: tournament.id,
     divisionId: divA.id,
     homeTeamId: team1.id,
     awayTeamId: team2.id,
     startTime: new Date("2025-06-01T10:00:00Z"),
     status: "scheduled",
     round: "Group A"
  });
}
