import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { verifyCaptainCredentials } from "../../supabaseAdmin";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: ((process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || "").replace(/\\n/g, "").trim()).replace("pooler.supabase.com:6543", "pooler.supabase.com:5432"),
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const result = await verifyCaptainCredentials(email, password);
      if (result.error) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = await authStorage.getUserBySupabaseId(result.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      (req.session as any).adminUserId = user.id;
      (req.session as any).adminEmail = email;
      (req.session as any).adminRole = "admin";
      req.session.save((err) => {
        if (err) return res.status(500).json({ message: "Session error" });
        res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
      });
    } catch (err) {
      console.error("Admin login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    (req.session as any).adminUserId = null;
    (req.session as any).adminEmail = null;
    (req.session as any).adminRole = null;
    req.session.save(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    const adminUserId = (req.session as any)?.adminUserId;
    if (!adminUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await authStorage.getUser(adminUserId);
      if (!user) return res.status(401).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/logout", (req, res) => {
    (req.session as any).adminUserId = null;
    (req.session as any).adminEmail = null;
    (req.session as any).adminRole = null;
    req.session.save(() => {
      res.redirect("/");
    });
  });
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const adminUserId = (req.session as any)?.adminUserId;
  const adminRole = (req.session as any)?.adminRole;

  if (!adminUserId || adminRole !== "admin") {
    return res.status(401).json({ message: "Admin access required" });
  }

  try {
    const user = await authStorage.getUser(adminUserId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    (req as any).adminUser = user;
    next();
  } catch {
    res.status(500).json({ message: "Auth check failed" });
  }
};

export const isAuthenticated = requireAdmin;
