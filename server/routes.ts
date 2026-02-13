import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import type { InsertMatch } from "@shared/schema";
import { createCaptainAccount, verifyCaptainCredentials, generatePassword, supabaseAdmin, seedAdminAccounts } from "./supabaseAdmin";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  seedAdminAccounts().catch(err => console.error("Admin seeding error:", err));

  // === CAPTAIN AUTH (Supabase Auth - email/password) ===
  app.post("/api/captain/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const result = await verifyCaptainCredentials(email, password);
      if (result.error) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      (req.session as any).captainUserId = result.userId;
      (req.session as any).captainEmail = email;
      req.session.save((err) => {
        if (err) return res.status(500).json({ message: "Session error" });
        res.json({ userId: result.userId, email });
      });
    } catch (err) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/captain/logout", (req, res) => {
    (req.session as any).captainUserId = null;
    (req.session as any).captainEmail = null;
    req.session.save(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/captain/me", (req, res) => {
    const captainUserId = (req.session as any)?.captainUserId;
    const captainEmail = (req.session as any)?.captainEmail;
    if (captainUserId && captainEmail) {
      return res.json({ userId: captainUserId, email: captainEmail });
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // === TEAM APPROVAL (creates captain account) ===
  app.post("/api/admin/teams/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const teamId = Number(req.params.id);
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).json({ message: "Team not found" });
      if (team.status === "approved") return res.status(400).json({ message: "Team already approved" });

      const { authStorage } = await import("./replit_integrations/auth/storage");
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");

      const [existingUser] = await db.select().from(users).where(eq(users.email, team.captainEmail));

      let userId: string;
      let password: string | null = null;
      let isNewAccount = false;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        password = generatePassword();
        const { userId: newUserId, error } = await createCaptainAccount(team.captainEmail, password);

        if (error) {
          return res.status(500).json({ message: `Failed to create captain account: ${error}` });
        }
        userId = newUserId;
        isNewAccount = true;

        await authStorage.upsertUser({
          id: userId,
          email: team.captainEmail,
          firstName: team.captainName?.split(" ")[0] || null,
          lastName: team.captainName?.split(" ").slice(1).join(" ") || null,
          role: "captain",
          password: password,
        });
      }

      await storage.updateTeam(teamId, { status: "approved", captainUserId: userId });

      await storage.claimTeamsByEmail(team.captainEmail, userId);

      console.log(`Team approval - isNewAccount: ${isNewAccount}, hasPassword: ${!!password}, captainEmail: ${team.captainEmail}`);
      if (isNewAccount && password) {
        try {
          const { sendCaptainCredentialsEmail } = await import("./mailjet");
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          console.log(`Sending credentials email via Mailjet to ${team.captainEmail}...`);
          const result = await sendCaptainCredentialsEmail(
            team.captainEmail,
            team.captainName || "Captain",
            team.name,
            password,
            `${baseUrl}/captain-login`
          );
          console.log(`Mailjet send result:`, JSON.stringify(result));
        } catch (emailErr: any) {
          console.error("Failed to send credentials email:", emailErr?.message || emailErr);
          if (emailErr?.response) {
            console.error("Mailjet error response:", JSON.stringify(emailErr.response?.data || emailErr.statusCode));
          }
        }
      } else {
        console.log(`Skipping email: existing captain account for ${team.captainEmail}`);
      }

      res.json({
        team: { ...team, status: "approved", captainUserId: userId },
        credentials: isNewAccount && password ? {
          email: team.captainEmail,
          password,
          loginUrl: "/captain-login",
        } : null,
        message: isNewAccount
          ? `Captain account created for ${team.captainEmail}`
          : `Team approved. Captain already has an account (${team.captainEmail}) — no new password generated.`,
      });
    } catch (err) {
      console.error("Team approval error:", err);
      res.status(500).json({ message: "Failed to approve team" });
    }
  });

  // === ADMIN USER MANAGEMENT ===
  app.get("/api/admin/users", isAuthenticated, async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users);
      res.json(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const { email, firstName, lastName, role, password } = req.body;
      if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
      }
      if (!["admin", "captain"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'admin' or 'captain'" });
      }

      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq: eqOp } = await import("drizzle-orm");
      const [existingLocal] = await db.select().from(users).where(eqOp(users.email, email.trim().toLowerCase()));
      if (existingLocal) {
        return res.status(409).json({ message: `A user with email ${email} already exists.` });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Auth service not configured" });
      }

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        if (createError.message?.includes("already been registered") || createError.status === 422) {
          return res.status(409).json({ message: `A user with email ${email} already exists in the auth system.` });
        }
        return res.status(500).json({ message: `Failed to create auth account: ${createError.message}` });
      }

      const userId = createData.user.id;

      const { authStorage } = await import("./replit_integrations/auth/storage");
      await authStorage.upsertUser({
        id: userId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        password,
      });

      res.json({ id: userId, email, firstName, lastName, role });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["admin", "captain"].includes(role)) {
        return res.status(400).json({ message: "Valid role is required" });
      }

      const userId = String(req.params.id);
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq: eqOp } = await import("drizzle-orm");

      const [updated] = await db.update(users)
        .set({ role, updatedAt: new Date() })
        .where(eqOp(users.id, userId))
        .returning();

      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = String(req.params.id);
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq: eqOp } = await import("drizzle-orm");

      const adminUserId = (req.session as any)?.adminUserId;
      if (userId === adminUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (e) {
          console.warn("Could not delete Supabase auth user:", e);
        }
      }

      await db.delete(users).where(eqOp(users.id, userId));
      res.json({ message: "User deleted" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // === SPORTS ===
  app.get(api.sports.list.path, async (_req, res) => {
    const data = await storage.getSports();
    res.json(data);
  });

  app.post(api.sports.create.path, async (req, res) => {
    try {
      const input = api.sports.create.input.parse(req.body);
      const sport = await storage.createSport(input);
      res.status(201).json(sport);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.sports.update.path, async (req, res) => {
    try {
      const input = api.sports.update.input.parse(req.body);
      const sport = await storage.updateSport(Number(req.params.id), input);
      res.json(sport);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.sports.delete.path, async (req, res) => {
    await storage.deleteSport(Number(req.params.id));
    res.json({ success: true });
  });

  // === TOURNAMENTS ===
  app.get(api.tournaments.list.path, async (_req, res) => {
    const data = await storage.getTournaments();
    res.json(data);
  });

  app.get(api.tournaments.get.path, async (req, res) => {
    const tournament = await storage.getTournament(Number(req.params.id));
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    res.json(tournament);
  });

  app.post(api.tournaments.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tournaments.create.input.parse(req.body);
      const tournament = await storage.createTournament(input);
      res.status(201).json(tournament);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.tournamentUpdate.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tournamentUpdate.input.parse(req.body);
      const tournament = await storage.updateTournament(Number(req.params.id), input);
      res.json(tournament);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.tournamentDelete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTournament(Number(req.params.id));
      res.json({ message: "Tournament deleted" });
    } catch (err) {
      throw err;
    }
  });

  app.post("/api/tournaments/:id/reset", isAuthenticated, async (req, res) => {
    try {
      await storage.resetTournament(Number(req.params.id));
      res.json({ message: "Tournament reset successfully" });
    } catch (err) {
      throw err;
    }
  });

  // === DIVISIONS ===
  app.get(api.divisions.list.path, async (req, res) => {
    const data = await storage.getDivisions(Number(req.params.tournamentId));
    res.json(data);
  });

  app.post(api.divisions.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.divisions.create.input.parse(req.body);
      const division = await storage.createDivision(input);
      res.status(201).json(division);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.divisions.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.divisions.update.input.parse(req.body);
      const division = await storage.updateDivision(Number(req.params.id), input);
      res.json(division);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.divisions.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDivision(Number(req.params.id));
      res.json({ message: "Division deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === TEAMS ===
  app.get(api.teams.list.path, async (req, res) => {
    const tournamentId = Number(req.params.tournamentId);
    const { status, divisionId } = req.query;
    const data = await storage.getTeams(tournamentId, status as string, divisionId ? Number(divisionId) : undefined);
    res.json(data);
  });

  app.get(api.teams.get.path, async (req, res) => {
    const team = await storage.getTeam(Number(req.params.id));
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  });

  app.post(api.teams.create.path, async (req, res) => {
    try {
      const input = api.teams.create.input.parse(req.body);
      const tournament = await storage.getTournament(input.tournamentId);
      if (tournament && !tournament.registrationOpen) {
        return res.status(403).json({ message: "Registration is currently closed for this tournament." });
      }
      const existingTeams = await storage.getTeams(input.tournamentId, undefined, input.divisionId);
      const emailNormalized = input.captainEmail.trim().toLowerCase();
      const duplicate = existingTeams.find(t => t.captainEmail.trim().toLowerCase() === emailNormalized);
      if (duplicate) {
        return res.status(409).json({ message: "This email has already been used to register a team in this division." });
      }
      const team = await storage.createTeam(input);
      res.status(201).json(team);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.teams.update.path, async (req, res) => {
    try {
      const input = api.teams.update.input.parse(req.body);
      const team = await storage.updateTeam(Number(req.params.id), input);
      res.json(team);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.teams.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTeam(Number(req.params.id));
      res.json({ message: "Team deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === MY TEAMS (captain or admin auth) ===
  app.get(api.myTeams.list.path, async (req, res) => {
    const captainUserId = (req.session as any)?.captainUserId;
    const captainEmail = (req.session as any)?.captainEmail;

    const adminUserId = (req.session as any)?.adminUserId;
    const adminEmail = (req.session as any)?.adminEmail;

    const userId = captainUserId || adminUserId;
    const email = captainEmail || adminEmail;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    if (email) {
      await storage.claimTeamsByEmail(email, userId);
    }

    const myTeams = await storage.getTeamsByCaptainUserId(userId);
    res.json(myTeams);
  });

  // === ALL TEAMS (admin - requires auth) ===
  app.get(api.allTeams.list.path, isAuthenticated, async (req, res) => {
    const { status } = req.query;
    const data = await storage.getAllTeams(status as string | undefined);
    res.json(data);
  });

  // === PLAYERS ===
  app.get(api.players.list.path, async (req, res) => {
    const data = await storage.getPlayers(Number(req.params.teamId));
    res.json(data);
  });

  app.post(api.players.create.path, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.jerseyNumber !== undefined && body.jerseyNumber !== null) body.jerseyNumber = Number(body.jerseyNumber);
      if (body.teamId !== undefined && body.teamId !== null) body.teamId = Number(body.teamId);
      const input = api.players.create.input.parse(body);
      const player = await storage.createPlayer(input);
      res.status(201).json(player);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.players.register.path, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.jerseyNumber !== undefined && body.jerseyNumber !== null) {
        body.jerseyNumber = Number(body.jerseyNumber);
      }
      const input = api.players.register.input.parse(body);
      if (input.teamId) {
        const team = await storage.getTeam(input.teamId);
        if (team) {
          const tournament = await storage.getTournament(team.tournamentId);
          if (tournament && !tournament.registrationOpen) {
            return res.status(403).json({ message: "Registration is currently closed for this tournament." });
          }
        }
      }
      const player = await storage.registerPlayerWithMatching(input);
      res.status(201).json(player);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === ADMIN PLAYERS ===
  app.get(api.adminPlayers.list.path, isAuthenticated, async (req, res) => {
    const { status } = req.query;
    const data = await storage.getAllRegisteredPlayers(status as string | undefined);
    res.json(data);
  });

  app.post(api.players.bulkCreate.path, async (req, res) => {
    try {
      const teamId = Number(req.params.teamId);
      const team = await storage.getTeam(teamId);
      if (team) {
        const tournament = await storage.getTournament(team.tournamentId);
        if (tournament && !tournament.registrationOpen) {
          return res.status(403).json({ message: "Registration is currently closed for this tournament." });
        }
      }
      const input = api.players.bulkCreate.input.parse(req.body);
      const data = await storage.createPlayersBulk(input, teamId);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.players.update.path, async (req, res) => {
    try {
      const input = api.players.update.input.parse(req.body);
      const player = await storage.updatePlayer(Number(req.params.id), input);
      res.json(player);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.players.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deletePlayer(Number(req.params.id));
      res.json({ message: "Player deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === MATCHES ===
  app.get(api.matches.list.path, async (req, res) => {
    const includeDrafts = req.query.includeDrafts === "true";
    const data = await storage.getMatches(Number(req.params.tournamentId), includeDrafts);
    res.json(data);
  });

  app.post(api.matches.create.path, async (req, res) => {
    try {
      const input = api.matches.create.input.parse(req.body);
      const match = await storage.createMatch(input);
      res.status(201).json(match);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.matches.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.matches.update.input.parse(req.body);
      const match = await storage.updateMatch(Number(req.params.id), input);
      await storage.recalculateStandings(match.tournamentId);
      res.json(match);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.matches.delete.path, isAuthenticated, async (req, res) => {
    try {
      const match = await storage.getMatch(Number(req.params.id));
      await storage.deleteMatch(Number(req.params.id));
      if (match) await storage.recalculateStandings(match.tournamentId);
      res.json({ message: "Match deleted" });
    } catch (err) {
      throw err;
    }
  });

  app.post("/api/tournaments/:tournamentId/matches/import", isAuthenticated, async (req, res) => {
    try {
      const tournamentId = Number(req.params.tournamentId);
      const rows = req.body.matches as Array<{
        division: string;
        homeTeam: string;
        awayTeam: string;
        date?: string;
        time?: string;
        round?: string;
        matchNumber?: string;
        status?: string;
        homeScore?: string;
        awayScore?: string;
        venue?: string;
        fieldLocation?: string;
      }>;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: "No match rows provided" });
      }
      let allDivisions = await storage.getDivisions(tournamentId);
      let allTeams = await storage.getTeams(tournamentId);
      const allVenues = await storage.getVenues();

      const errors: string[] = [];
      const matchData: InsertMatch[] = [];
      const createdDivisions: string[] = [];
      const createdTeams: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 1;

        if (!row.division || !row.division.trim()) {
          errors.push(`Row ${rowNum}: Division name is required`);
          continue;
        }

        let division = allDivisions.find(
          (d) => d.name.toLowerCase().trim() === row.division.toLowerCase().trim()
        );
        if (!division) {
          try {
            division = await storage.createDivision({
              tournamentId,
              name: row.division.trim(),
              category: null,
              description: null,
              gameFormat: null,
              registrationFee: 0,
              venueId: null,
              heroImage: null,
            });
            allDivisions = [...allDivisions, division];
            createdDivisions.push(division.name);
          } catch (err) {
            errors.push(`Row ${rowNum}: Failed to create division "${row.division}"`);
            continue;
          }
        }

        let homeTeamId: number | null = null;
        let awayTeamId: number | null = null;
        if (row.homeTeam && row.homeTeam.trim()) {
          let ht = allTeams.find(
            (t) => t.name.toLowerCase().trim() === row.homeTeam.toLowerCase().trim()
          );
          if (!ht) {
            try {
              ht = await storage.createTeam({
                tournamentId,
                divisionId: division.id,
                name: row.homeTeam.trim(),
                captainName: "",
                captainEmail: "",
                captainPhone: "",
                status: "approved",
              });
              allTeams = [...allTeams, ht];
              createdTeams.push(ht.name);
            } catch (err) {
              errors.push(`Row ${rowNum}: Failed to create home team "${row.homeTeam}"`);
              continue;
            }
          }
          homeTeamId = ht.id;
        }
        if (row.awayTeam && row.awayTeam.trim()) {
          let at = allTeams.find(
            (t) => t.name.toLowerCase().trim() === row.awayTeam.toLowerCase().trim()
          );
          if (!at) {
            try {
              at = await storage.createTeam({
                tournamentId,
                divisionId: division.id,
                name: row.awayTeam.trim(),
                captainName: "",
                captainEmail: "",
                captainPhone: "",
                status: "approved",
              });
              allTeams = [...allTeams, at];
              createdTeams.push(at.name);
            } catch (err) {
              errors.push(`Row ${rowNum}: Failed to create away team "${row.awayTeam}"`);
              continue;
            }
          }
          awayTeamId = at.id;
        }

        let startTime: Date | null = null;
        if (row.date) {
          const dateStr = row.date.trim();
          const timeStr = (row.time || "").trim();
          try {
            const parsed = timeStr ? new Date(`${dateStr} ${timeStr}`) : new Date(dateStr);
            if (isNaN(parsed.getTime())) {
              errors.push(`Row ${rowNum}: Invalid date/time "${dateStr} ${timeStr}"`);
              continue;
            }
            startTime = parsed;
          } catch {
            errors.push(`Row ${rowNum}: Invalid date/time "${dateStr} ${timeStr}"`);
            continue;
          }
        }

        const validStatuses = ["scheduled", "live", "final", "cancelled"];
        const status = row.status && validStatuses.includes(row.status.toLowerCase().trim())
          ? row.status.toLowerCase().trim() as "scheduled" | "live" | "final" | "cancelled"
          : "scheduled";

        let venueId: number | null = null;
        if (row.venue && row.venue.trim()) {
          const v = allVenues.find(
            (v) => v.name.toLowerCase().trim() === row.venue!.toLowerCase().trim()
          );
          if (v) {
            venueId = v.id;
          } else {
            errors.push(`Row ${rowNum}: Venue "${row.venue}" not found`);
          }
        }

        matchData.push({
          tournamentId,
          divisionId: division.id,
          homeTeamId,
          awayTeamId,
          startTime: startTime as any,
          homeScore: row.homeScore ? parseInt(row.homeScore) || 0 : 0,
          awayScore: row.awayScore ? parseInt(row.awayScore) || 0 : 0,
          status,
          round: row.round || null,
          matchNumber: row.matchNumber ? parseInt(row.matchNumber) || null : null,
          venueId,
          fieldLocation: row.fieldLocation?.trim() || null,
          draft: true,
        });
      }

      const created = await storage.bulkCreateMatches(matchData);
      res.json({
        created: created.length,
        errors,
        total: rows.length,
        createdDivisions: Array.from(new Set(createdDivisions)),
        createdTeams: Array.from(new Set(createdTeams)),
      });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // === STANDINGS ===
  app.get(api.standings.list.path, async (req, res) => {
    const data = await storage.getStandings(Number(req.params.tournamentId));
    res.json(data);
  });

  app.post(api.standings.recalculate.path, async (req, res) => {
    await storage.recalculateStandings(Number(req.params.tournamentId));
    res.json({ message: "Standings recalculated" });
  });

  app.post("/api/tournaments/:tournamentId/matches/publish", isAuthenticated, async (req, res) => {
    try {
      const tournamentId = Number(req.params.tournamentId);
      const published = await storage.publishMatches(tournamentId);
      await storage.recalculateStandings(tournamentId);
      res.json({ message: "Matches published", published });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // === AWARDS ===
  app.get("/api/awards", async (_req, res) => {
    const data = await storage.getAllAwards();
    res.json(data);
  });

  app.get(api.awards.list.path, async (req, res) => {
    const data = await storage.getAwards(Number(req.params.tournamentId));
    res.json(data);
  });

  app.post(api.awards.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.awards.create.input.parse(req.body);
      const award = await storage.createAward(input);
      res.status(201).json(award);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.awards.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.awards.update.input.parse(req.body);
      const award = await storage.updateAward(Number(req.params.id), input);
      res.json(award);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.awards.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAward(Number(req.params.id));
      res.json({ message: "Award deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === NEWS ===
  app.get(api.news.list.path, async (_req, res) => {
    const data = await storage.getNews();
    res.json(data);
  });

  app.post(api.news.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.news.create.input.parse(req.body);
      const item = await storage.createNews(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.news.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.news.update.input.parse(req.body);
      const item = await storage.updateNews(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.news.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNews(Number(req.params.id));
      res.json({ message: "News deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === SPONSORS ===
  app.get(api.sponsors.list.path, async (_req, res) => {
    const data = await storage.getSponsors();
    res.json(data);
  });

  app.post(api.sponsors.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.sponsors.create.input.parse(req.body);
      const item = await storage.createSponsor(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.sponsors.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.sponsors.update.input.parse(req.body);
      const item = await storage.updateSponsor(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.sponsors.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSponsor(Number(req.params.id));
      res.json({ message: "Sponsor deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === SPECIAL AWARDS ===
  app.get(api.specialAwards.list.path, async (_req, res) => {
    const data = await storage.getSpecialAwards();
    res.json(data);
  });

  app.post(api.specialAwards.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.specialAwards.create.input.parse(req.body);
      const item = await storage.createSpecialAward(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.specialAwards.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.specialAwards.update.input.parse(req.body);
      const item = await storage.updateSpecialAward(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.specialAwards.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSpecialAward(Number(req.params.id));
      res.json({ message: "Special award deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === WAIVER CONTENT ===
  app.get(api.waiverContent.get.path, async (_req, res) => {
    const data = await storage.getWaiverContent();
    res.json(data || null);
  });

  app.post(api.waiverContent.upsert.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.waiverContent.upsert.input.parse(req.body);
      const content = await storage.upsertWaiverContent(input);
      res.json(content);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === ABOUT CONTENT ===
  app.get(api.aboutContent.get.path, async (_req, res) => {
    const data = await storage.getAboutContent();
    res.json(data || null);
  });

  app.post(api.aboutContent.upsert.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.aboutContent.upsert.input.parse(req.body);
      const content = await storage.upsertAboutContent(input);
      res.json(content);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === MEDIA ===
  app.get(api.media.listYears.path, async (_req, res) => {
    const data = await storage.getMediaYears();
    res.json(data);
  });

  app.post(api.media.createYear.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.media.createYear.input.parse(req.body);
      const item = await storage.createMediaYear(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.media.updateYear.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.media.updateYear.input.parse(req.body);
      const item = await storage.updateMediaYear(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.media.deleteYear.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMediaYear(Number(req.params.id));
      res.json({ message: "Year deleted" });
    } catch (err) {
      throw err;
    }
  });

  app.post(api.media.createItem.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.media.createItem.input.parse(req.body);
      const item = await storage.createMediaItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.media.updateItem.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.media.updateItem.input.parse(req.body);
      const item = await storage.updateMediaItem(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.media.deleteItem.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMediaItem(Number(req.params.id));
      res.json({ message: "Item deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === VENUES ===
  app.get(api.venues.list.path, async (_req, res) => {
    const data = await storage.getVenues();
    res.json(data);
  });

  app.post(api.venues.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.venues.create.input.parse(req.body);
      const venue = await storage.createVenue(input);
      res.status(201).json(venue);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.venues.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.venues.update.input.parse(req.body);
      const venue = await storage.updateVenue(Number(req.params.id), input);
      res.json(venue);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.venues.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVenue(Number(req.params.id));
      res.json({ message: "Venue deleted" });
    } catch (err) {
      throw err;
    }
  });

  // === FAQS ===
  app.get(api.faqs.list.path, async (_req, res) => {
    const data = await storage.getFaqs();
    res.json(data);
  });

  app.get(api.faqs.featured.path, async (_req, res) => {
    const data = await storage.getFeaturedFaqs();
    res.json(data);
  });

  app.post(api.faqs.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.faqs.create.input.parse(req.body);
      if (input.featured) {
        const existing = await storage.getFeaturedFaqs();
        if (existing.length >= 5) {
          return res.status(400).json({ message: "Maximum 5 featured FAQs allowed. Unfeature another FAQ first." });
        }
      }
      const faq = await storage.createFaq(input);
      res.status(201).json(faq);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.faqs.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.faqs.update.input.parse(req.body);
      if (input.featured) {
        const existing = await storage.getFeaturedFaqs();
        const currentId = Number(req.params.id);
        const otherFeatured = existing.filter(f => f.id !== currentId);
        if (otherFeatured.length >= 5) {
          return res.status(400).json({ message: "Maximum 5 featured FAQs allowed. Unfeature another FAQ first." });
        }
      }
      const faq = await storage.updateFaq(Number(req.params.id), input);
      res.json(faq);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.faqs.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFaq(Number(req.params.id));
      res.json({ message: "FAQ deleted" });
    } catch (err) {
      throw err;
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin-login\nDisallow: /captain\nDisallow: /captain-login\nSitemap: https://salaamcup.com/sitemap.xml`
    );
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      const allTeams = await Promise.all(
        tournaments.map((t) => storage.getTeams(t.id, "approved"))
      );
      const teams = allTeams.flat();

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/about", priority: "0.8", changefreq: "monthly" },
        { loc: "/tournaments", priority: "0.9", changefreq: "weekly" },
        { loc: "/register", priority: "0.8", changefreq: "monthly" },
        { loc: "/media", priority: "0.7", changefreq: "monthly" },
        { loc: "/faq", priority: "0.6", changefreq: "monthly" },
      ];

      const tournamentPages = tournaments.flatMap((t) => [
        { loc: `/tournaments/${t.id}`, priority: "0.8", changefreq: "weekly" },
        { loc: `/tournaments/${t.id}/schedule`, priority: "0.8", changefreq: "daily" },
        { loc: `/tournaments/${t.id}/standings`, priority: "0.8", changefreq: "daily" },
        { loc: `/tournaments/${t.id}/rules`, priority: "0.6", changefreq: "monthly" },
        { loc: `/tournaments/${t.id}/awards`, priority: "0.6", changefreq: "monthly" },
      ]);

      const teamPages = teams.map((t) => ({
          loc: `/teams/${t.id}`,
          priority: "0.5",
          changefreq: "weekly" as const,
        }));

      const allPages = [...staticPages, ...tournamentPages, ...teamPages];
      const baseUrl = "https://salaamcup.com";
      const today = new Date().toISOString().split("T")[0];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

      res.type("application/xml").send(xml);
    } catch (err) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // Seed database on startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getTournaments();
  if (existing.length > 0) return;

  // Create sports
  const hockey = await storage.createSport({ name: "Ball Hockey", icon: "hockey", description: "Street ball hockey" });
  const basketball = await storage.createSport({ name: "Basketball", icon: "basketball", description: "5v5 basketball" });
  const soccer = await storage.createSport({ name: "Soccer", icon: "soccer", description: "11v11 outdoor soccer" });

  // Create venue
  const venue = await storage.createVenue({ name: "Mississauga Community Centre", address: "100 City Centre Dr, Mississauga, ON" });

  // Create tournament
  const t = await storage.createTournament({
    name: "Salaam Cup 2025",
    slug: "salaam-cup-2025",
    year: 2025,
    sportId: hockey.id,
    startDate: "2025-07-12",
    endDate: "2025-07-13",
    status: "active",
    description: "The premier community ball hockey tournament bringing together athletes from across the GTA.",
    isFeatured: true,
  });

  // Create a second tournament
  const t2 = await storage.createTournament({
    name: "Salaam Cup Basketball 2025",
    slug: "salaam-cup-basketball-2025",
    year: 2025,
    sportId: basketball.id,
    startDate: "2025-08-16",
    endDate: "2025-08-17",
    status: "upcoming",
    description: "5v5 basketball tournament for the community.",
    isFeatured: true,
  });

  // Divisions for hockey
  const poolA = await storage.createDivision({
    tournamentId: t.id,
    name: "Pool A",
    category: "Men",
    description: "Competitive men's division",
    gameFormat: "3v3 + goalie",
  });

  const poolB = await storage.createDivision({
    tournamentId: t.id,
    name: "Pool B",
    category: "Men",
    description: "Recreational men's division",
    gameFormat: "3v3 + goalie",
  });

  const juniorDiv = await storage.createDivision({
    tournamentId: t.id,
    name: "Junior A",
    category: "Youth",
    description: "Youth under 16 division",
    gameFormat: "4v4",
  });

  // Division for basketball
  const bbDiv = await storage.createDivision({
    tournamentId: t2.id,
    name: "Open Division",
    category: "Men",
    description: "Open 5v5 basketball",
    gameFormat: "5v5",
  });

  // Teams
  const dirtyClan = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolA.id,
    name: "Dirty Clan",
    captainName: "Ahmed Khan",
    captainEmail: "ahmed@example.com",
    captainPhone: "416-555-0101",
    status: "approved",
    teamColor: "#1a1a1a",
    description: "Returning champions from 2024.",
  });

  const mafia = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolA.id,
    name: "The Mafia",
    captainName: "Omar Syed",
    captainEmail: "omar@example.com",
    captainPhone: "416-555-0102",
    status: "approved",
    description: "Strong contenders for the title.",
  });

  const stoughton = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolA.id,
    name: "Stoughton FC",
    captainName: "Bilal Hussain",
    captainEmail: "bilal@example.com",
    captainPhone: "416-555-0103",
    status: "approved",
    description: "First year in the tournament.",
  });

  const daneBerros = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolA.id,
    name: "Dane Berros BC",
    captainName: "Yusuf Ali",
    captainEmail: "yusuf@example.com",
    captainPhone: "416-555-0104",
    status: "approved",
    description: "Known for defensive play.",
  });

  const teamPending = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolB.id,
    name: "Brampton Lions",
    captainName: "Hassan Mahmood",
    captainEmail: "hassan@example.com",
    captainPhone: "416-555-0105",
    status: "pending",
    description: "New team from Brampton area.",
  });

  const wolves = await storage.createTeam({
    tournamentId: t.id,
    divisionId: poolB.id,
    name: "Scarborough Wolves",
    captainName: "Tariq Patel",
    captainEmail: "tariq@example.com",
    captainPhone: "416-555-0106",
    status: "approved",
    description: "Experienced recreational team.",
  });

  // Players for Dirty Clan
  const dcPlayers = [
    { firstName: "Ali", lastName: "Hassan", email: "ali@example.com", dob: "1995-05-15", jerseyNumber: 10, status: "verified" as const, position: "Forward" },
    { firstName: "Zain", lastName: "Malik", email: "zain@example.com", dob: "1997-03-22", jerseyNumber: 7, status: "verified" as const, position: "Defense" },
    { firstName: "Hamza", lastName: "Sheikh", email: "hamza@example.com", dob: "1996-11-08", jerseyNumber: 4, status: "verified" as const, position: "Goalie" },
    { firstName: "Usman", lastName: "Farooq", email: "usman@example.com", dob: "1998-01-30", jerseyNumber: 11, status: "verified" as const, position: "Forward" },
    { firstName: "Kareem", lastName: "Noor", email: "kareem@example.com", dob: "1994-07-12", jerseyNumber: 22, status: "staging" as const, position: "Defense" },
    { firstName: "Faisal", lastName: "Qureshi", email: "faisal@example.com", dob: "1999-09-05", jerseyNumber: 15, status: "staging" as const, position: "Forward", adminNotes: "Missing waiver signature" },
  ];
  for (const p of dcPlayers) {
    await storage.createPlayer({ ...p, teamId: dirtyClan.id, waiverSigned: p.status === "verified" });
  }

  // Players for The Mafia
  const mafiaPlayers = [
    { firstName: "Ibrahim", lastName: "Ahmed", email: "ibrahim@example.com", dob: "1996-02-14", jerseyNumber: 9, status: "verified" as const, position: "Forward" },
    { firstName: "Saad", lastName: "Khan", email: "saad@example.com", dob: "1997-08-21", jerseyNumber: 3, status: "verified" as const, position: "Defense" },
    { firstName: "Amir", lastName: "Raza", email: "amir@example.com", dob: "1995-12-03", jerseyNumber: 1, status: "verified" as const, position: "Goalie" },
    { firstName: "Nabil", lastName: "Younis", email: "nabil@example.com", dob: "1998-06-17", jerseyNumber: 18, status: "rejected" as const, position: "Forward", adminNotes: "Age eligibility issue" },
  ];
  for (const p of mafiaPlayers) {
    await storage.createPlayer({ ...p, teamId: mafia.id, waiverSigned: p.status === "verified" });
  }

  // Players for Stoughton
  const stoughtonPlayers = [
    { firstName: "Jamal", lastName: "Hassan", email: "jamal@example.com", dob: "1997-04-09", jerseyNumber: 5, status: "verified" as const, position: "Forward" },
    { firstName: "Khalid", lastName: "Osman", email: "khalid@example.com", dob: "1996-10-28", jerseyNumber: 8, status: "verified" as const, position: "Defense" },
    { firstName: "Rashid", lastName: "Ali", email: "rashid@example.com", dob: "1998-07-02", jerseyNumber: 12, status: "staging" as const, position: "Goalie" },
  ];
  for (const p of stoughtonPlayers) {
    await storage.createPlayer({ ...p, teamId: stoughton.id, waiverSigned: p.status === "verified" });
  }

  // Matches - Pool A round robin (all final to generate standings)
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: dirtyClan.id, awayTeamId: mafia.id,
    venueId: venue.id,
    startTime: new Date("2025-07-12T10:00:00"),
    homeScore: 5, awayScore: 3, status: "final", round: "Pool A", matchNumber: 1,
  });
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: stoughton.id, awayTeamId: daneBerros.id,
    venueId: venue.id,
    startTime: new Date("2025-07-12T11:00:00"),
    homeScore: 2, awayScore: 2, status: "final", round: "Pool A", matchNumber: 2,
  });
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: dirtyClan.id, awayTeamId: stoughton.id,
    venueId: venue.id,
    startTime: new Date("2025-07-12T14:00:00"),
    homeScore: 4, awayScore: 1, status: "final", round: "Pool A", matchNumber: 3,
  });
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: mafia.id, awayTeamId: daneBerros.id,
    venueId: venue.id,
    startTime: new Date("2025-07-12T15:00:00"),
    homeScore: 3, awayScore: 1, status: "final", round: "Pool A", matchNumber: 4,
  });
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: dirtyClan.id, awayTeamId: daneBerros.id,
    venueId: venue.id,
    startTime: new Date("2025-07-13T09:00:00"),
    homeScore: 6, awayScore: 0, status: "final", round: "Pool A", matchNumber: 5,
  });
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: mafia.id, awayTeamId: stoughton.id,
    venueId: venue.id,
    startTime: new Date("2025-07-13T10:00:00"),
    homeScore: 4, awayScore: 2, status: "live", round: "Pool A", matchNumber: 6,
  });
  // Scheduled match
  await storage.createMatch({
    tournamentId: t.id, divisionId: poolA.id,
    homeTeamId: dirtyClan.id, awayTeamId: null,
    venueId: venue.id,
    startTime: new Date("2025-07-13T14:00:00"),
    status: "scheduled", round: "Semi Final", matchNumber: 7,
  });

  // Recalculate standings
  await storage.recalculateStandings(t.id);
}
