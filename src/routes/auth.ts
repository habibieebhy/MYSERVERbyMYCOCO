// server/src/routes/auth.ts 
// UPDATED: NO bcrypt, YES jwt
// This version is modified to EXACTLY match the expectations of your auth_service.dart

import { Request, Response, Express, NextFunction } from 'express';
import { db } from '../db/db';
import { users, companies } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';

// Helper function to safely convert BigInt to JSON
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

// --- JWT Verification Middleware ---
// This will protect your /api/users/:id route
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  if (!process.env.JWT_SECRET) {
     console.error("JWT_SECRET is not defined. Cannot verify token.");
     return res.status(500).json({ error: "Server configuration error" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      // Your app expects a 403 for this
      return res.status(403).json({ error: "Token is invalid or expired" });
    }
    (req as any).user = user;
    next();
  });
};
// --- END OF MIDDLEWARE ---


export default function setupAuthRoutes(app: Express) {
  
  // Login endpoint - UPDATED
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");

      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required" });

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in .env. Login is impossible.");
        return res.status(500).json({ error: "Server configuration error" });
      }

      // Pull only what we need
      const [row] = await db
        .select({
          id: users.id,
          email: users.email,
          status: users.status,
          hashedPassword: users.hashedPassword, // This column holds plain text
          role: users.role,
        })
        .from(users)
        .where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId)))
        .limit(1);

      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });

      // --- Plain-text password check (as requested) ---
      if (!row.hashedPassword || row.hashedPassword !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // --- Create the Token ---
      const payload = { id: row.id, email: row.email, role: row.role };
      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // --- 6. SEND THE *EXACT* RESPONSE FLUTTER WANTS ---
      // Your app is hard-coded to look for "token" and "userId"
      return res.json({ 
        token: token,
        userId: row.id // Your app parses this as an int
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // --- User profile endpoint - RENAMED AND PROTECTED ---
  // Your app calls "/api/users/:id", so this route MUST match
  app.get("/api/users/:id", verifyToken, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
      }
      
      const tokenUser = (req as any).user;
      if (tokenUser.id !== userId) {
        return res.status(403).json({ error: "Forbidden: You cannot access this user's profile" });
      }

      // Manual join to get all data
      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          phoneNumber: users.phoneNumber,
          companyId: users.companyId,
          companyName: companies.companyName,
          region: users.region,
          area: users.area,
          salesmanLoginId: users.salesmanLoginId,
          status: users.status,
          reportsToId: users.reportsToId,
        })
        .from(users)
        .leftJoin(companies, eq(companies.id, users.companyId))
        .where(eq(users.id, userId))
        .limit(1);

      if (!rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      // This is the Employee model structure
      const row = rows[0];
      const userPayload = {
        id: row.id,
        email: row.email,
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        role: row.role,
        phoneNumber: row.phoneNumber ?? null,
        region: row.region ?? null,
        area: row.area ?? null,
        salesmanLoginId: row.salesmanLoginId ?? null,
        status: row.status,
        reportsToId: row.reportsToId ?? null,
        company: row.companyId
          ? { id: row.companyId, companyName: row.companyName ?? "" }
          : null,
      };
      
      // --- SEND THE *EXACT* RESPONSE FLUTTER WANTS ---
      // Your app is hard-coded to look for a "data" key
      res.json({ data: toJsonSafe(userPayload) });

    } catch (err) {
      console.error("GET /api/users error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });

  console.log('✅ Authentication endpoints setup complete');
}

