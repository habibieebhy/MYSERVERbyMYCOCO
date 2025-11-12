## WORKING2.md: Comprehensive Architectural and Code-Level Analysis (Salesman + Mason Flutter App Backend)

This document provides a highly verbose, file-by-file breakdown of the core server codebase, illustrating the architectural patterns, security mechanisms, database structure, and repository layer implementation with **explicit code samples** from every available source file.

-----

## I. Architectural Overview

The application backend is engineered around a relational database, leveraging **Drizzle ORM** for type-safe database interactions and the **Neon (PostgreSQL)** serverless database platform. It serves a dual purpose: Sales Force Automation (SFA) and a Contractor (Mason) Loyalty Program.

| Feature | Implementation Detail | Source File Example |
| :--- | :--- | :--- |
| **Database/ORM** | Neon PostgreSQL via Drizzle ORM, wrapped in a singleton pattern. | `db.ts` |
| **Data Modeling** | A single `schema.ts` file defines all tables and relations (e.g., `users`, `dealers`, `masonPcSide`) using Drizzle's `pgTable` API. | `db/schema.ts` |
| **Data Access Layer** | `DatabaseStorage` class implements the Repository Pattern (`IStorage`), abstracting raw Drizzle queries from business logic. | `db/storage.ts` |
| **Authentication** | Dual-factor system: Stateless JWT + Stateful, database-backed `authSessions`. | `middleware/requireAuth.ts` |
| **Core Logic** | Supports complex queries, including recursive hierarchy fetching (manager/report structure). | `db/storage.ts` |
| **Integrations** | Firebase Admin SDK is securely initialized for client token verification (e.g., Mason login). | `firebase/admin.ts` |

-----

## II. Database Connection and Schema Layer (`db/`, `db.ts`)

This layer initializes the database connection, defines the canonical schema, and provides a centralized data access interface.

### 1\. `db.ts`: Database Connection and Singleton Management

This file sets up the connection pool for **Neon/PostgreSQL** using Drizzle ORM. It employs a critical global caching mechanism (`globalForDb`) to implement the **singleton pattern**, preventing re-initialization of the connection pool during development hot-reloads, a common practice in Node.js server development.

#### Code Sample: `db.ts` (Connection Setup & Singleton)

```typescript
// src/server/db/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Wire WS for Node (Neon serverless uses WebSockets under the hood)
neonConfig.webSocketConstructor = ws;

// Guard: env must exist
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Prevent duplicate pools in dev (HMR / tsx watch)
const globalForDb = globalThis as unknown as {
  __NEON_POOL__?: Pool;
  __DRIZZLE_DB__?: ReturnType<typeof drizzle>;
};

const pool =
  globalForDb.__NEON_POOL__ ??
  new Pool({
    connectionString: DATABASE_URL,
    max: 10,             // pool size
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

const db =
  globalForDb.__DRIZZLE_DB__ ??
  drizzle({
    client: pool,
    schema, // typed queries, thanks
  });
```

### 2\. `db/schema.ts`: Canonical Data Model Definition

This file defines all database tables (schemas) using Drizzle's `pgTable` syntax, serving as the single source of truth for the application's data model. Notably, it includes both traditional SFA tables (`users`, `dealers`) and new loyalty tables (`masonPcSide`, `authSessions`, `pointsLedger`).

#### Code Sample: `db/schema.ts` (Core Entities and Indexes)

```typescript
// server/src/db/schema.ts
import {
  pgTable, serial, integer, varchar, text, boolean, timestamp, date, numeric,
  uniqueIndex, index, jsonb, uuid, primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// ... imports ...

/* ========================= authSessions (New Stateful Session) ========================= */
export const authSessions = pgTable("auth_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

/* ========================= users (Dual Role Support) ========================= */
export const users = pgTable("users", {
// ... existing columns ...
  salesmanLoginId: varchar("salesman_login_id", { length: 255 }).unique(),
  hashedPassword: text("hashed_password"),
  isTechnicalRole: boolean("is_technical_role").default(false),
  techLoginId: varchar("tech_login_id", { length: 255 }).unique(),
  techHashedPassword: text("tech_hash_password"),
// ... hierarchy column ...
}, (t) => [
  uniqueIndex("users_companyid_email_unique").on(t.companyId, t.email),
]);

/* ========================= mason_pc_side (Loyalty Core) ========================= */
export const masonPcSide = pgTable("mason_pc_side", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  phoneNumber: text("phone_number").notNull(),
  kycStatus: varchar("kyc_status", { length: 50 }).default("none"), // Renamed from verificationStatus
  pointsBalance: integer("points_balance").notNull().default(0), // Denormalized Balance
  firebaseUid: varchar("firebase_uid", { length: 128 }).unique(),
// ... other columns ...
});

/* ========================= points_ledger (Audit Trail) ========================= */
export const pointsLedger = pgTable("points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type", { length: 32 }).notNull(), 
  sourceId: uuid("source_id"), 
  points: integer("points").notNull(), 
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("points_ledger_source_id_unique").on(t.sourceId),
]);
```

### 3\. `db/storage.ts`: Repository Pattern and Business Logic

The `DatabaseStorage` class implements `IStorage`, abstracting low-level Drizzle calls into business-friendly methods (the Repository Pattern). A key function demonstrates recursion for hierarchy traversal.

#### Code Sample: `db/storage.ts` (Interface and Recursive Query)

```typescript
// server/src/db/storage.ts
// ... imports and type aliases ...

export interface IStorage {
  getCompany(id: number): Promise<Company | undefined>;
  // ... many methods ...
  getUserHierarchy(userId: number): Promise<User[]>;
  getDirectReports(managerId: number): Promise<User[]>;
  // ... new loyalty methods ...
  getPointsLedgerByMasonId(masonId: string): Promise<PointsLedger[]>; 
}

export class DatabaseStorage implements IStorage {
// ... other methods ...
  async getUserHierarchy(userId: number): Promise<User[]> {
    const results = await db.execute(sql`
      WITH RECURSIVE hierarchy AS (
        SELECT * FROM users WHERE id = ${userId}
        UNION ALL
        SELECT u.* FROM users u
        JOIN hierarchy h ON u.reports_to_id = h.id
      )
      SELECT * FROM hierarchy;
    `);
    // @ts-ignore drizzle execute returns rows
    return results.rows as User[];
  }

  async getPointsLedgerByMasonId(masonId: string): Promise<PointsLedger[]> {
    return await db.select().from(pointsLedger).where(eq(pointsLedger.masonId, masonId)).orderBy(desc(pointsLedger.createdAt));
  }
// ... other methods ...
}
```

### 4\. `db/seed.ts`: Database Reset Logic

This file contains the logic to purge all application data for development and staging environments. The deletion order is carefully managed to respect foreign key (FK) constraints, deleting child tables before their respective parents.

#### Code Sample: `db/seed.ts` (FK-Safe Deletion Order)

```typescript
// Purge-only seed compatible with current schema.ts and storage.ts.
// Deletes child tables -> parent tables in FK-safe order.
// No data is inserted. This is for dev/staging reset only.

// ... imports ...

async function seedDatabase() {
  console.log("Initializing database reset...");

  // --- 1. Delete deeply nested children / audit logs ---
  await db.delete(pointsLedger);
  await db.delete(otpVerifications);
  await db.delete(kycSubmissions);
  
  // --- 2. Delete join tables and direct FK children (must precede parents) ---
  await db.delete(tsoAssignments);
  await db.delete(masonOnScheme);
  await db.delete(masonsOnMeetings);
  // ...

  // --- 4. Delete main reports and activity tables ---
  await db.delete(technicalVisitReports);
  await db.delete(dailyVisitReports);
  // ...

  // --- 6. Delete core entities (users, dealers, companies) ---
  await db.delete(dealers);
  await db.delete(users);
  await db.delete(companies);

  console.log("Database cleared successfully (no demo data inserted).");
}
```

### 5\. Database Migration Scripts (`db/migrations/*.sql`)

These SQL files document the schema evolution.

| File | Purpose and Key Changes | Code Sample Excerpt |
| :--- | :--- | :--- |
| **`0000_cheerful_warhawk.sql`** | Initial schema creation, defining core SFA tables like `users`, `dealers`, `daily_visit_reports`, `permanent_journey_plans`, and setting up initial FKs. | `CREATE TABLE "brands" (\n\t"id" serial PRIMARY KEY NOT NULL,\n\t"brand_name" varchar(255) NOT NULL,\n\tCONSTRAINT "brands_brand_name_unique" UNIQUE("brand_name")\n);` |
| **`0001_spotty_supernaut.sql`** | Adds bulk operation (`bulk_op_id`) and **idempotency** (`idempotency_key`) fields to `permanent_journey_plans` to prevent duplicate insertions for predictable operations. | `ALTER TABLE "permanent_journey_plans" ADD COLUMN "bulk_op_id" varchar(50);--> statement-breakpoint\nCREATE UNIQUE INDEX "uniq_pjp_idempotency_key_not_null" ON "permanent_journey_plans" USING btree ("idempotency_key") WHERE "permanent_journey_plans"."idempotency_key" IS NOT NULL;` |
| **`0002_dizzy_lilandra.sql`** | Introduces the `tally_raw` table, likely used as a staging or audit table for bulk data synchronization (e.g., from Tally ERP system). | `CREATE TABLE "tally_raw" (\n\t"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t"collection_name" text NOT NULL,\n\t"raw_data" jsonb NOT NULL,\n\t"synced_at" timestamp with time zone DEFAULT now() NOT NULL\n);` |
| **`0003_stormy_surge.sql`** | Massive loyalty-focused migration: Introduces `mason_pc_side` (Contractor Profile), `schemes_offers`, `otp_verifications`, and join tables. It also links `technical_visit_reports` to `mason_id`. | `CREATE TABLE "mason_pc_side" (\n\t"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t"name" varchar(100) NOT NULL,\n\t"phone_number" text NOT NULL,\n// ...\n);\nALTER TABLE "users" ADD COLUMN "is_technical_role" boolean DEFAULT false;` |

-----

## III. Authentication and Security Layer (`middleware/`, `firebase/`)

This layer implements the critical security checks for API access and integrates with external authentication services.

### 6\. `middleware/requireAuth.ts`: Dual-Factor Authentication Middleware

This Express middleware enforces a strict **dual-factor session control** policy for protected API routes. It ensures both a stateless **JWT** (for integrity) and a stateful **`x-session-token`** (for real-time invalidation via `authSessions` table) are present and valid before granting access.

#### Code Sample: `middleware/requireAuth.ts` (Authentication Logic)

```typescript
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
    
    // State-full check against the database session table
    if (!session || (session as any).expiresAt < new Date()) return res.status(401).json({ success: false, error: "Session expired" });

    (req as any).auth = decoded; // { sub, role, phone, kyc }
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid auth" });
  }
}
```

### 7\. `firebase/admin.ts`: Firebase Admin Setup

This file securely bootstraps the Firebase Admin SDK, a necessity for server-side token validation (e.g., verifying a contractor's Firebase ID token). It includes a critical check and fix for the newline characters (`\n`) often escaped in environment variables (`\\n`) when storing the private key as a single string.

#### Code Sample: `firebase/admin.ts` (Secure Initialization)

```typescript
// server/src/firebase/admin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is missing");
    throw new Error("Firebase Admin not configured");
  }
  const creds = JSON.parse(raw);
  // private_key in env loses newlines — fix them
  if (creds.private_key?.includes("\\n")) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export const firebaseAdmin = admin;
```

---

This document provides an exhaustive, code-level analysis and sampling of every endpoint identified within the uploaded application's `routes/` directory, serving as the definitive code reference for the server's API surface.

-----

## I. Core Authentication and User Management Routes

These routes handle initial access control for both staff (Salesman/Employee) and contractors (Mason), along with fundamental user information retrieval.

### A. Staff Authentication & User Profile (`routes/auth.ts`, `routes/users.ts`)

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/auth/login` | **POST** | Performs plaintext password check against stored hash and issues a JWT with a 7-day expiry. Returns the `token` and `userId` directly for client consumption. |
| `/api/users/:id` | **GET** | **Protected by `verifyToken` middleware**. Checks if the token's `userId` matches the requested `id` (403 Forbidden on mismatch). Performs a manual join to fetch full user and company details. |
| `/api/users` | **GET** | Fetches users with extensive filtering (`role`, `region`, `status`) and searching across `email`, `firstName`, and `lastName`. Uses a **restricted select list** (`userPublicSelect`) to prevent exposing sensitive fields like password hashes. |

#### Code Sample: Authentication and User Retrieval

```typescript
// File: routes/auth.ts
// POST /api/auth/login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  // ... input validation ...
  
  // --- Plain-text password check (as requested) ---
  if (!row.hashedPassword || row.hashedPassword !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // --- Create the Token ---
  const payload = { id: row.id, email: row.email, role: row.role };
  const token = sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.json({ 
    token: token,
    userId: row.id 
  });
});

// GET /api/users/:id (Protected Profile Fetch)
app.get("/api/users/:id", verifyToken, async (req: Request, res: Response) => {
  // ... token user check ...
  
  // Manual join to get all data
  const rows = await db
    .select({
      // ... select columns from users and companies ...
    })
    .from(users)
    .leftJoin(companies, eq(companies.id, users.companyId))
    .where(eq(users.id, userId))
    .limit(1);

  // ... return logic ...
});

// File: routes/users.ts
// GET /api/users (Search and Filter)
app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
  // ... condition building logic ...

  // Search by name or email (partial match)
  if (search) {
    const searchPattern = `%${String(search).toLowerCase()}%`;
    conditions.push(
      or(
        like(table.email, searchPattern),
        like(table.firstName, searchPattern),
        like(table.lastName, searchPattern)
      )!
    );
  }
  
  // 3. Apply the 'where' clause only if conditions exist.
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  // ... execution logic ...
});
```

### B. Contractor/Mason Authentication (`routes/authFirebase.ts`)

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/auth/firebase` | **POST** | **Primary Mason Login.** Verifies the Firebase `idToken`. Upserts/links the Mason's profile in `masonPcSide` table. Creates a **stateful `authSessions` entry** and issues a corresponding JWT. |
| `/api/auth/logout` | **POST** | **Contractor Logout.** Deletes the specific `authSessions` record using the `x-session-token` header, effectively invalidating the session immediately, regardless of JWT expiry. |
| `/api/auth/refresh` | **POST** | Checks `x-session-token` for validity, creates a new session token, and issues a new JWT. |

#### Code Sample: Firebase Auth and Session Management

```typescript
// File: routes/authFirebase.ts
// POST /api/auth/firebase
app.post("/api/auth/firebase", async (req: Request, res: Response) => {
  // ... verification, upsert mason logic ...
  
  // 1. Create a secure session token
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + JWT_TTL_SECONDS * 1000);
  
  // 2. Insert stateful session record
  await db.insert(authSessions).values({
    sessionId: crypto.randomUUID(),
    masonId: mason.id,
    sessionToken,
    expiresAt,
  });

  // 3. Sign the JWT (stateless token)
  const jwtToken = jwt.sign(
    { sub: mason.id, role: "mason", phone: mason.phoneNumber, kyc: mason.kycStatus },
    process.env.JWT_SECRET!,
    { expiresIn: JWT_TTL_SECONDS }
  );

  return res.status(200).json({
    success: true,
    jwt: jwtToken,
    sessionToken, // Client uses this for requireAuth middleware
    sessionExpiresAt: expiresAt,
    // ... mason data ...
  });
});
```

-----

## II. POST (Form Submission & Creation) Routes

These routes handle the insertion of new records, often implementing complex logic such as transactional atomicity, external API calls, and automatic ID generation.

### A. Core SFA & Personnel Submission

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/dealers` | **POST** | Creates a new dealer record. **CRITICALLY**, it makes an external PUT call to **Radar.io** to create the corresponding geofence and **rolls back the database insertion (DELETE)** if the Radar call fails (502 response). |
| `/api/daily-visit-reports` | **POST** | Creates a DVR record. Uses multiple coercion helpers to correctly handle date, nullable strings (`strOrNull`), and numeric values (coerced to `String()` for `numeric(10, 2)` columns). |
| `/api/technical-visit-reports` | **POST** | Creates a TVR record. Uses complex coercion for various text arrays and nullable numerics, generating a UUID for the primary key. |
| `/api/pjp`, `/api/bulkpjp` | **POST** | Creates a single or bulk PJP records. Uses `onConflictDoNothing` to enforce **idempotency** based on the composite unique index (`userId`, `dealerId`, `planDate`), preventing duplicate assignments. |
| `/api/attendance/check-in` | **POST** | Validates the user has not already checked in today before creating a new `salesmanAttendance` record. |
| `/api/attendance/check-out` | **POST** | Finds the existing check-in record for today (`isNull(outTimeTimestamp)`) and updates it with check-out details. |

#### Code Sample: Dealer Creation with External Dependency Rollback

```typescript
// File: routes/formSubmissionRoutes/addDealer.ts
app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
  // ... input validation and mapping to finalData ...
  
  // 3) Insert (need ID for Radar externalId)
  const dealerId = randomUUID();
  const [dealer] = await db
    .insert(table)
    .values({ ...finalData, id: dealerId })
    .returning();

  // 4) Radar upsert
  // ... fetch call logic ...
  const upRes = await fetch(radarUrl, { /* ... headers/body ... */ });
  const upJson = await upRes.json().catch(() => ({} as any));
  
  if (!upRes.ok || upJson?.meta?.code !== 200 || !upJson?.geofence) {
    // --- Rollback DB insert on Radar failure ---
    await db.delete(table).where(eq(table.id, dealer.id)); 
    return res.status(502).json({ // 502 Bad Gateway
      success: false,
      error: upJson?.meta?.message || upJson?.message || 'Failed to upsert dealer geofence in Radar',
      details: 'Database insert was rolled back.'
    });
  }
  // ... return success ...
});
```

### B. Loyalty & Sales Transaction Submission

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/bag-lifts` | **POST** | **Atomic Transaction.** Inserts the `bagLifts` record and instantly credits the points by inserting a corresponding **POSITIVE** record into `pointsLedger` within a transaction. |
| `/api/rewards-redemption` | **POST** | **Atomic Transaction.** Performs a critical **pre-transaction check for `pointsBalance`** before proceeding. If successful, it debits the points by inserting a corresponding **NEGATIVE** record into `pointsLedger` AND updates the denormalized `masonPcSide.pointsBalance`. |
| `/api/sales-orders` | **POST** | Handles sales order creation, which involves **server-side calculation** of fields like `pendingPayment` and `itemPriceAfterDiscount` based on the input amounts. |
| `/api/masons-on-scheme` | **POST** | Creates the join record. Handles `409 Conflict` (duplicate enrollment) and `400 Foreign Key` errors explicitly. |
| `/api/masons` | **POST** | Creates a new `masonPcSide` contractor profile, ensuring phone number and name fields are processed correctly. |

#### Code Sample: Atomic Debit & Balance Check

```typescript
// File: routes/formSubmissionRoutes/rewardsRedemption.ts
app.post('/api/rewards-redemption', async (req: Request, res: Response) => {
  // ... validation ...
  const totalPointsDebited = pointsDebited * quantity;

  // --- CRITICAL PRE-TRANSACTION CHECK ---
  const [masonRecord] = await db.select({ pointsBalance: masonPcSide.pointsBalance })
    .from(masonPcSide).where(eq(masonPcSide.id, masonId)).limit(1);
  if (masonRecord.pointsBalance < totalPointsDebited) {
    return res.status(400).json({ error: `Insufficient points balance. Required: ${totalPointsDebited}, Available: ${masonRecord.pointsBalance}.` });
  }
  // --- END CRITICAL CHECK ---

  const result = await db.transaction(async (tx) => {
    // 1. Insert Redemption Record
    const [newRedemption] = await tx.insert(rewardRedemptions) /* ... */ .returning();

    // 2. Insert the Points Ledger DEBIT entry (Negative points)
    const [newLedgerEntry] = await tx.insert(pointsLedger)
      .values({
        masonId: newRedemption.masonId,
        sourceType: 'redemption',
        sourceId: newRedemption.id,
        points: -totalPointsDebited, // <--- NEGATIVE DEBIT
        memo: memo || `Debit for ${newRedemption.quantity} x Reward ID ${newRedemption.rewardId}`,
      })
      .returning();

    // 3. Update the Mason's pointsBalance (denormalization)
    await tx.update(masonPcSide)
      .set({ pointsBalance: sql`${masonPcSide.pointsBalance} - ${totalPointsDebited}` })
      .where(eq(masonPcSide.id, masonId));
    
    return { redemption: newRedemption, ledger: newLedgerEntry };
  });
  // ... return success ...
});
```

-----

## III. PATCH and PUT (Update) Routes

These routes enable partial (`PATCH`) or full (`PUT`) modification of existing resources, ensuring validation and data integrity.

### A. Core Update Operations

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/dealers/:id` | **PATCH** | Dealer partial update. **Key:** Re-uses the complex Radar upsert logic. Updates the DB only if the geofence update succeeds, combining data from the existing record and the patch. |
| `/api/sales-orders/:id` | **PATCH** | Sales Order update. **Key:** Handles updates to the new `status` field. Re-calculates dependent numeric fields (`pendingPayment`, `itemPriceAfterDiscount`) only if their input components (e.g., `receivedPayment`, `itemPrice`) are present in the patch or exist on the original record. |
| `/api/dealer-reports-scores/:dealerId` | **PATCH** | Updates dealer scores, using `dealerId` as the identifier (as it's a unique field in that table). Always updates `lastUpdatedDate` and `updatedAt`. |
| `/api/schemes-offers/:id` | **PATCH** | Partial updates for schemes. |
| `/api/schemes-offers/:id` | **PUT** | Full resource replacement for schemes. Requires all fields, ensuring the resulting record is complete. |
| `/api/tvr/:id` | **PATCH** | Technical Visit Report update. Manually maps various optional fields, including number-to-string coercion for numeric coordinates/values. |

#### Code Sample: Sales Order Recalculation on Patch

```typescript
// File: routes/updateRoutes/salesorder.ts
app.patch('/api/sales-orders/:id', async (req: Request, res: Response) => {
  // ... validation and fetch existing record ...
  
  const patch: any = { updatedAt: new Date() };

  // ... map incoming fields to patch ...
  if (input.status !== undefined) patch.status = input.status; // <--- Status Update

  // Computed Logic: Use patched value or existing value for calculation
  const p = input.itemPrice !== undefined ? patch.itemPrice : existing.itemPrice;
  const d = input.discountPercentage !== undefined ? patch.discountPercentage : existing.discountPercentage;
  
  // Recalculate itemPriceAfterDiscount if components changed
  if (input.itemPriceAfterDiscount !== undefined) {
    patch.itemPriceAfterDiscount = toDecimalString(input.itemPriceAfterDiscount);
  } else if (input.itemPrice !== undefined || input.discountPercentage !== undefined) {
    if (p != null && d != null) {
      patch.itemPriceAfterDiscount = String(Number(p) * (1 - Number(d) / 100));
    }
  }
  
  // Recalculate pendingPayment if components changed
  // ... similar logic ...

  const [updated] = await db.update(salesOrders).set(patch).where(eq(salesOrders.id, id)).returning();
  // ... return updated ...
});
```

-----

## IV. DELETE (Cleanup) Routes

All deletion routes require explicit confirmation (`?confirm=true`) for bulk operations.

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/dealers/:id` | **DELETE** | Deletes single dealer. Calls `deleteRadarGeofence` first and only deletes from DB if the external deletion succeeds. |
| `/api/dealers/firm-name/:nameOfFirm` | **DELETE** | Bulk deletes all dealers matching the firm name. Uses the `bulkDeleteDealers` helper to handle the required **one-by-one Radar cleanup** for multiple records. |
| `/api/pjp/:id` | **DELETE** | Deletes PJP. Uses a **transaction** to conditionally clean up any matching records in a legacy `master_connected_table` before deleting the PJP itself. |
| `/api/daily-visit-reports/bulk/brands` | **DELETE** | Complex bulk delete. Uses PostgreSQL's array operators (`@>` for contains, `&&` for overlaps) with `sql` tags to target DVRs based on the contents of the `brandSelling` array column. |
| `/api/tso-meetings/:id` | **DELETE** | Deletes TSO Meeting. Includes explicit error handling (409 Conflict/23503 SQLSTATE) if the meeting is still referenced by a `technicalVisitReport`. |
| `/api/sales-orders/status/:status` | **DELETE** | Bulk deletes all sales orders matching a specific `status`. |

#### Code Sample: Deleting Dealer Bulk (External Cleanup)

```typescript
// File: routes/deleteRoutes/dealers.ts
// DELETE /api/dealers/firm-name/:nameOfFirm
app.delete(`/api/${endpoint}/firm-name/:nameOfFirm`, async (req: Request, res: Response) => {
  // ... check confirmation ...
  
  // 1. Fetch rows to be deleted (including IDs)
  const rows = await db.select().from(table).where(eq(table.nameOfFirm, nameOfFirm));
  
  // 2. Perform the critical bulk delete logic (which includes Radar calls)
  const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName);
  
  // 3. Return summary of success/failure
  return res.json({
    success: true,
    message: `${deletedCount}/${totalCount} ${tableName}(s) deleted with firm name ${nameOfFirm}`,
    deletedCount,
    radarDeleted,
    radarErrors,
  });
});

// File: routes/deleteRoutes/dvr.ts
// BULK DELETE BY brandSelling (Complex Array Query)
app.delete(`/api/${endpoint}/bulk/brands`, async (req: Request, res: Response) => {
  // ... confirmation and brand array extraction ...
  
  const arrLiteral = toPgArrayLiteral(brands);
  const anyBrand = boolish(req.query.anyBrand);
  const brandCond = anyBrand
    ? sql`${table.brandSelling} && ${arrLiteral}::text[]` // Overlap
    : sql`${table.brandSelling} @> ${arrLiteral}::text[]`; // Contains

  const whereConds: (SQL | undefined)[] = [brandCond];
  // ... add user/date filters ...
  
  const finalWhere = and(...whereConds.filter(Boolean) as SQL[]);
  
  const ids = await db.select({ id: table.id }).from(table).where(finalWhere);
  await db.delete(table).where(finalWhere);
  // ... return count ...
});
```

-----

## V. Utility and Data Sync Routes

| Endpoint | Method | Description & Key Logic |
| :--- | :--- | :--- |
| `/api/r2/upload-direct` | **POST** | **File Upload.** Uses `multer` and `@aws-sdk/client-s3` (R2 config) to handle a direct file upload to Cloudflare R2, returning the public URL. |
| `/api/sync/dealers-bulk` | **POST** | **Bulk Data Upsert.** Synchronizes dealer data from a source file (assumed Tally/ERP). Uses the PostgreSQL native `ON CONFLICT DO UPDATE` (upsert) feature targeting `gstinNo` to efficiently insert new records and update existing ones in a single batch operation. |

#### Code Sample: Bulk Data Upsert

```typescript
// File: routes/dataSync/dealer.ts
app.post('/api/sync/dealers-bulk', async (req: Request, res: Response) => {
  // ... validation and mapping ...
  
  // 4. The Bulk "Upsert" Query (PostgreSQL)
  const result = await db
    .insert(dealers)
    .values(valuesToInsert) // Array of records
    .onConflictDoUpdate({ 
      target: dealers.gstinNo, // Unique constraint
      set: {
        // --- List ALL fields to update using sql.raw(`excluded."column_name"`) ---
        userId: sql.raw(`excluded."user_id"`),
        type: sql.raw(`excluded."type"`),
        // ... many more fields ...
        updatedAt: new Date(),
      },
    })
    .returning({
      id: dealers.id,
      gstinNo: dealers.gstinNo,
      name: dealers.name,
    });
    
  // ... return result ...
});
```