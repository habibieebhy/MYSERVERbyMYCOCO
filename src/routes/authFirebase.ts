import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";
import { db } from "../db/db";
import { masonPcSide } from "../db/schema";
import { authSessions } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Utility to verify the JWT and extract the payload
const verifyJwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { sub: string, role: string, phone: string, kyc: string, iat: number, exp: number };
};

export default function setupAuthFirebaseRoutes(app: Express) {
  // POST /api/auth/firebase
  app.post("/api/auth/firebase", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ success: false, error: "idToken required" });

      const decoded = await getAuth().verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const phone = decoded.phone_number || null;
      if (!phone) return res.status(400).json({ success: false, error: "Phone missing in Firebase token" });

      // upsert mason by uid/phone
      let mason = (await db.select().from(masonPcSide).where(eq(masonPcSide.firebaseUid, firebaseUid)).limit(1))[0];
      if (!mason) {
        mason = (await db.select().from(masonPcSide).where(eq(masonPcSide.phoneNumber, phone)).limit(1))[0];
        if (!mason) {
          const created = await db.insert(masonPcSide).values({
            id: crypto.randomUUID(),
            name: "New Contractor",
            phoneNumber: phone,
            firebaseUid,
            kycStatus: "none",
            pointsBalance: 0,
          }).returning();
          mason = created[0];
        } else if (!mason.firebaseUid) {
          await db.update(masonPcSide).set({ firebaseUid }).where(eq(masonPcSide.id, mason.id));
        }
      }

      // session row
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + JWT_TTL_SECONDS * 1000);
      await db.insert(authSessions).values({
        sessionId: crypto.randomUUID(),
        masonId: mason.id,
        sessionToken,
        createdAt: new Date(),
        expiresAt,
      });

      // your JWT
      const jwtToken = jwt.sign(
        { sub: mason.id, role: "mason", phone, kyc: mason.kycStatus },
        process.env.JWT_SECRET!,
        { expiresIn: JWT_TTL_SECONDS }
      );

      return res.status(200).json({
        success: true,
        jwt: jwtToken,
        sessionToken,
        sessionExpiresAt: expiresAt,
        mason: { id: mason.id, phoneNumber: mason.phoneNumber, name: mason.name, kycStatus: mason.kycStatus, pointsBalance: mason.pointsBalance },
      });
    } catch (e) {
      console.error("auth/firebase error:", e);
      return res.status(401).json({ success: false, error: "Invalid Firebase token" });
    }
  });

  // --- NEW: GET /api/auth/validate (For Auto-Login) ---
  app.get("/api/auth/validate", async (req: Request, res: Response) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyJwt(token);
      const masonId = decoded.sub;

      const [mason] = await db.select().from(masonPcSide).where(eq(masonPcSide.id, masonId)).limit(1);

      if (!mason) {
        return res.status(404).json({ success: false, error: "Mason not found" });
      }

      // Return the mason object needed by the client
      return res.status(200).json({
        success: true,
        mason: { 
          id: mason.id, 
          firebaseUid: mason.firebaseUid,
          phoneNumber: mason.phoneNumber, 
          name: mason.name, 
          kycStatus: mason.kycStatus, 
          pointsBalance: mason.pointsBalance 
        },
      });

    } catch (e) {
      // JWT verification failed (e.g., token expired, wrong secret)
      console.error("auth/validate error:", e);
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
  });
  // ---------------------------------------------------

  // POST /api/auth/logout (contractor): kill session
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const token = req.header("x-session-token");
      if (!token) return res.status(400).json({ success: false, error: "x-session-token required" });
      await db.delete(authSessions).where(eq(authSessions.sessionToken, token));
      return res.status(200).json({ success: true, message: "Logged out" });
    } catch (e) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
  });

  // POST /api/auth/refresh (optional)
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const token = req.header("x-session-token");
      if (!token) return res.status(400).json({ success: false, error: "x-session-token required" });

      const [session] = await db.select().from(authSessions).where(eq(authSessions.sessionToken, token)).limit(1);
      if (!session || (session as any).expiresAt < new Date()) return res.status(401).json({ success: false, error: "Session expired" });

      const [mason] = await db.select().from(masonPcSide).where(eq(masonPcSide.id, session.masonId)).limit(1);
      if (!mason) return res.status(401).json({ success: false, error: "Unknown user" });

      const newToken = crypto.randomBytes(32).toString("hex");
      const newExp = new Date(Date.now() + JWT_TTL_SECONDS * 1000);
      await db.update(authSessions).set({ sessionToken: newToken, expiresAt: newExp }).where(eq(authSessions.sessionId, session.sessionId));

      const jwtToken = jwt.sign(
        { sub: mason.id, role: "mason", phone: mason.phoneNumber, kyc: mason.kycStatus },
        process.env.JWT_SECRET!,
        { expiresIn: JWT_TTL_SECONDS }
      );

      return res.status(200).json({ success: true, jwt: jwtToken, sessionToken: newToken, sessionExpiresAt: newExp });
    } catch (e) {
      return res.status(500).json({ success: false, error: "Refresh failed" });
    }
  });
}