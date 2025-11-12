// server/src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { authSessions } from "../db/schema";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const bearer = (req.headers.authorization || "").startsWith("Bearer ")
      ? (req.headers.authorization as string).slice(7)
      : null;
    const sessionToken = req.header("x-session-token") || null;
    if (!bearer || !sessionToken) return res.status(401).json({ success: false, error: "Missing auth headers" });

    const decoded = jwt.verify(bearer, process.env.JWT_SECRET!) as any;
    const [session] = await db.select().from(authSessions).where(eq(authSessions.sessionToken, sessionToken)).limit(1);
    if (!session || (session as any).expiresAt < new Date()) return res.status(401).json({ success: false, error: "Session expired" });

    (req as any).auth = decoded; // { sub, role, phone, kyc }
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid auth" });
  }
}
