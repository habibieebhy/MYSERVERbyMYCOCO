// server/src/routes/auth.ts
// Authentication endpoints compatible with your existing system

import { Request, Response, Express, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { db } from '../db/db';
import { users, companies } from '../db/schema';
import { eq, or } from 'drizzle-orm';

// --- JWT Configuration ---
// IMPORTANT: Use a long, random key loaded from environment variables in production.
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to safely convert BigInt to JSON
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

// Middleware to verify JWT and attach user info to request (needed for profile endpoint)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects: 'Bearer TOKEN'

    if (token == null) return res.status(401).json({ error: "Access denied. Token missing." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token is invalid or expired
            console.error("JWT Verification Error:", err.message);
            return res.status(403).json({ error: "Token is invalid or expired." });
        }
        
        // Attach decoded payload to request
        (req as any).user = user; 
        next();
    });
};


export default function setupAuthRoutes(app: Express) {
  
  // Login endpoint - now returns a JWT on successful login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");

      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required" });

      // Pull exactly what you need for verification and token payload
      const [row] = await db
        .select({
          id: users.id,
          email: users.email,
          status: users.status,
          hashedPassword: users.hashedPassword,
          role: users.role, // Include role for the token payload
          salesmanLoginId: users.salesmanLoginId,
          companyId: users.companyId,
          companyName: companies.companyName,
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

      // --- 1. Define Token Payload ---
      const tokenPayload = {
        id: toJsonSafe(row.id),
        email: row.email,
        role: row.role,
        companyId: toJsonSafe(row.companyId),
      };

      // --- 2. Generate the JWT ---
      const token = jwt.sign(tokenPayload, JWT_SECRET);

      // --- 3. Return the token and the ID (essential for the Flutter app's second step) ---
      return res.json({ 
        token: token, 
        userId: toJsonSafe(row.id),
        // Optionally, return the initial company name if needed for display
        companyName: row.companyName || '',
        message: "Login successful" 
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // User profile endpoint - NOW PROTECTED BY JWT MIDDLEWARE
  app.get("/api/users/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
      }
      
      // OPTIONAL SECURITY CHECK: Ensure the token's user ID matches the requested ID
      if (String((req as any).user.id) !== String(userId)) {
           return res.status(403).json({ error: "Unauthorized access to another user's profile." });
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

      // Note: The frontend is expecting a 'data' key for the full profile response
      res.json({ data: toJsonSafe(user) }); 
    } catch (err) {
      console.error("GET /api/user error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });

  console.log('✅ Authentication endpoints setup complete');
}
