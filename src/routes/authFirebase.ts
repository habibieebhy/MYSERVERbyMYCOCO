// server/src/routes/authFirebase.ts
import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";
import { db } from "../db/db";
import { masonPcSide } from "../db/schema"; 
import { authSessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod"; // ⬅️ Added Zod for request validation

const JWT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Zod schema for validating the incoming request body
const firebaseAuthSchema = z.object({
  idToken: z.string().min(1, "idToken required"),
  // Include the fields required for the initial profile creation
  name: z.string().min(1, "Name is required for new registration"), 
}).strict();

export default function setupAuthFirebaseRoutes(app: Express) {
  // POST /api/auth/firebase
  app.post("/api/auth/firebase", async (req: Request, res: Response) => {
    
    let validatedBody: z.infer<typeof firebaseAuthSchema>;

    try {
      // 1. Validate incoming request body
      validatedBody = firebaseAuthSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Handle Zod validation errors
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: e.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })) 
        });
      }
      return res.status(500).json({ success: false, error: "Internal server error during validation." });
    }

    try {
      const { idToken, name } = validatedBody;

      const decoded = await getAuth().verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const phone = decoded.phone_number || null;
      if (!phone) return res.status(400).json({ success: false, error: "Phone missing in Firebase token" });

      // upsert mason by uid/phone
      let mason = (await db.select().from(masonPcSide).where(eq(masonPcSide.firebaseUid, firebaseUid)).limit(1))[0];
      
      let isNewMason = false;

      if (!mason) {
        mason = (await db.select().from(masonPcSide).where(eq(masonPcSide.phoneNumber, phone)).limit(1))[0];
        
        if (!mason) {
          // *** CREATION STEP ***
          isNewMason = true;
          const created = await db.insert(masonPcSide).values({
            id: crypto.randomUUID(),
            name: name, // ⬅️ Use the validated name from the request body
            phoneNumber: phone,
            firebaseUid,
            kycStatus: "none",
            pointsBalance: 0,
          }).returning();
          mason = created[0];
        } else if (!mason.firebaseUid) {
          // Existing phone record found, link it to the new Firebase UID and update name
          await db.update(masonPcSide).set({ 
            firebaseUid,
            name: name // ⬅️ Update name on linking/registration completion
          }).where(eq(masonPcSide.id, mason.id));
          // Re-fetch the updated mason record
          mason = (await db.select().from(masonPcSide).where(eq(masonPcSide.id, mason.id)).limit(1))[0];
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
        mason: { 
          id: mason.id, 
          phoneNumber: mason.phoneNumber, 
          name: mason.name, // ⬅️ Include name in response
          kycStatus: mason.kycStatus, 
          pointsBalance: mason.pointsBalance 
        },
        isNewUser: isNewMason // ⬅️ Indicate if this was a fresh creation
      });
    } catch (e) {
      console.error("auth/firebase error:", e);
      // Catch token verification errors, network issues, etc.
      return res.status(401).json({ success: false, error: "Authentication failed or Invalid Firebase token" });
    }
  });

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