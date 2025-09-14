// server/src/routes/auth.ts 
// Authentication endpoints compatible with your existing system

import { Request, Response, Express } from 'express';
import { db } from '../db/db';
import { users, companies } from '../db/schema';
import { eq, or } from 'drizzle-orm';

// Helper function to safely convert BigInt to JSON
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export default function setupAuthRoutes(app: Express) {
  
  // Login endpoint - matches your existing design
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");

      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required" });

      // Pull exactly what you need
      const [row] = await db
        .select({
          id: users.id,
          email: users.email,
          status: users.status,
          hashedPassword: users.hashedPassword,
          salesmanLoginId: users.salesmanLoginId,
          companyId: users.companyId,
          companyName: companies.companyName, // optional
        })
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId)))
        .limit(1);

      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });

      // If you actually store bcrypt hashes, use bcrypt.compare here.
      if (!row.hashedPassword || row.hashedPassword !== password)
        return res.status(401).json({ error: "Invalid credentials" });

      const { hashedPassword, ...safe } = row;
      return res.json({ success: true, user: toJsonSafe(safe), message: "Login successful" });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // User profile endpoint - matches your existing design
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
      }

      // Manual join
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

      const row = rows[0];
      const user = {
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

      res.json({ user: toJsonSafe(user) });
    } catch (err) {
      console.error("GET /api/user error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });

  console.log('✅ Authentication endpoints setup complete');
}