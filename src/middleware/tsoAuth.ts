// src/middleware/tsoAuth.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../db/db"; 
import { users } from "../db/schema"; 
import { eq } from "drizzle-orm";

// Define the custom request interface used by requireAuth
interface CustomRequest extends Request {
    auth?: {
        sub: string; // User ID (This is the ID used to query the users table)
        role: string;
        phone: string;
        kyc: string;
    };
}

// middleware file where only the tso can call some routes if this is added as a parameter in the api call
export async function tsoAuth(req: CustomRequest, res: Response, next: NextFunction) {
    // 1. Ensure the auth object is present (guaranteed if requireAuth runs first)
    if (!req.auth || !req.auth.sub) {
        return res.status(401).json({ success: false, error: "Authentication details missing. Please log in." });
    }

    const userId = parseInt(req.auth.sub, 10); // Assume sub is the integer ID from your users table
    const userRole = req.auth.role;
    
    try {
        // 2. Query the users table to check for the isTechnicalRole flag
        const [userRecord] = await db
            .select({ isTechnicalRole: users.isTechnicalRole })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!userRecord) {
            return res.status(404).json({ success: false, error: "User not found in database." });
        }
        
        // 3. Authorization Check:
        // Check the specific database flag for TSO/Technical access
        const isAuthorized = userRecord.isTechnicalRole === true;

        if (isAuthorized) {
            next();
        } else {
            console.warn(`Unauthorized Access: User ID ${userId} (Role: ${userRole}) attempted restricted route.`);
            return res.status(403).json({ 
                success: false, 
                error: "Forbidden: You are not authorized to perform administrative actions." 
            });
        }
    } catch (error) {
        console.error("Database error during TSO authorization check:", error);
        return res.status(500).json({ success: false, error: "Internal server error during authorization." });
    }
}