// server/src/routes/auth.ts 
// UPDATED: Now includes bcrypt and jsonwebtoken

import { Request, Response, Express } from 'express';
import { db } from '../db/db';
import { users, companies } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs'; // <-- 1. IMPORT BCRYPT
import * as jwt from 'jsonwebtoken';   // <-- 2. IMPORT JWT

// Helper function to safely convert BigInt to JSON
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export default function setupAuthRoutes(app: Express) {
  
  // Login endpoint - UPDATED
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");

      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required" });

      // <-- 3. ADD SECRET CHECK
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in .env. Login is impossible.");
        return res.status(500).json({ error: "Server configuration error" });
      }

      // Pull exactly what you need
      const [row] = await db
        .select({
          id: users.id,
          email: users.email,
          status: users.status,
          hashedPassword: users.hashedPassword,
          // --- Also select the fields for the user object ---
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          phoneNumber: users.phoneNumber,
          salesmanLoginId: users.salesmanLoginId,
          companyId: users.companyId,
          companyName: companies.companyName,
          region: users.region,
          area: users.area,
        })
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId)))
        .limit(1);

      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });

      // --- 4. THE PASSWORD FIX ---
      // Use bcrypt.compare to check the hash
      const isPasswordValid = row.hashedPassword 
        ? await bcrypt.compare(password, row.hashedPassword) 
        : false;

      // If you actually store bcrypt hashes, use bcrypt.compare here.
      if (!isPasswordValid)
        return res.status(401).json({ error: "Invalid credentials" });

      // --- 5. CREATE THE TOKEN ---
      const payload = { id: row.id, email: row.email, role: row.role };
      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' } // Token lasts for 7 days
      );

      // Create the user object to send back
      const { hashedPassword, ...safe } = row;
      const user = {
        id: safe.id,
        email: safe.email,
        firstName: safe.firstName ?? null,
        lastName: safe.lastName ?? null,
        role: safe.role,
        phoneNumber: safe.phoneNumber ?? null,
        region: safe.region ?? null,
        area: safe.area ?? null,
        salesmanLoginId: safe.salesmanLoginId ?? null,
        // (Create the nested company object just like in your /api/user/:id endpoint)
        company: safe.companyId
          ? { id: safe.companyId, companyName: safe.companyName ?? "" }
          : null,
      };

      // --- 6. SEND THE CORRECT RESPONSE ---
      return res.json({ 
        success: true, 
        token: token,         // <-- The token Flutter needs
        user: toJsonSafe(user)  // <-- The user object Flutter needs
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // User profile endpoint - matches your existing design
  // (This endpoint is fine, but make sure it's protected by JWT middleware)
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    // ... (your existing /api/user/:id code is fine) ...
    // ... (BUT, it should be protected! You'll need to add JWT middleware here later) ...
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
        // --- THIS IS THE FIX ---
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
        // --- BUG FIX: Changed 'safe' to 'row' ---
        region: row.region ?? null,
        area: row.area ?? null,
        salesmanLoginId: row.salesmanLoginId ?? null,
        // --- END BUG FIX ---
        status: row.status,
        reportsToId: row.reportsToId ?? null,
        company: row.companyId
          ? { id: row.companyId, companyName: row.companyName ?? "" }
          : null,
      };
      
      // Note: your /api/users/:id returns { user: ... }
      // but your auth_service.dart expects { data: ... }
      // I will fix this in the auth_service.dart file
      res.json({ user: toJsonSafe(user) });
    } catch (err) {
      console.error("GET /api/user error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });

  console.log('✅ Authentication endpoints setup complete');
}

