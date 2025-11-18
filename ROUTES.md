# ROUTES

A deeply weird and specific list of all the server endpoints this app uses.

---

## Authentication (TSO/Employee Portal)

WTF is this: The classic email/password login for your internal team (TSOs, Admins).

### POST /api/auth/login

-   **Role**: `Public`
-   **Purpose**: TSO/Admin logs in with their Login ID and Password.
-   **Body**:
    -   `loginId`: string
    -   `password`: string
-   **Response**:
    -   `token`: string (The JWT)
    -   `userId`: number (The TSO's Employee/User ID)

### GET /api/users/:id

-   **Role**: `TSO` (Self)
-   **Purpose**: Fetches the profile for the logged-in TSO/Employee after login.
-   **Query Params**:
    -   None.
-   **Response**:
    -   `data`: Employee (JSON object)

---

## Authentication (Mason Portal)

MIDDLEWARE

Authentication

requireAuth

Type: Express Middleware

File: server/src/middleware/requireAuth.ts

Purpose: Protects routes by validating both the JWT signature and the active session persistence in the database.

Headers:

Authorization: string (Format: Bearer <jwt_token>)

x-session-token: string (Database session identifier)

Logic:

Checks for presence of Bearer token and x-session-token.

Verifies JWT signature using process.env.JWT_SECRET.

Queries authSessions table to ensure session exists and is not expired.

Request Mutation:

req.auth: Decoded JWT payload (e.g., { sub, role, phone, kyc })

Response (Error):

401 Unauthorized: { "success": false, "error": "Missing auth headers" }

401 Unauthorized: { "success": false, "error": "Session expired" }

401 Unauthorized: { "success": false, "error": "Invalid auth" } (Malformed token or verification failure)

Response (Success):

Passes control to next() function.

WTF is this: The hybrid Firebase OTP system for contractors (Masons).

### POST /api/auth/firebase

-   **Role**: `Public` (via Firebase Token)
-   **Purpose**: The main login/signup. Exchanges a Firebase ID Token (from OTP) for your app's JWT and a persistent Session Token. Creates the mason if they don't exist.
-   **Body**:
    -   `idToken`: string (From Firebase)
    -   `name`: string (Optional, used on first-time sign up)
-   **Response**:
    -   `success`: boolean
    -   `jwt`: string (Short-lived API token)
    -   `sessionToken`: string (Long-lived refresh token)
    -   `mason`: Mason (JSON object)

### GET /api/auth/validate

-   **Role**: `Mason`
-   **Purpose**: Checks if the Mason's short-lived JWT is still valid. Used for auto-login on app start.
-   **Response**:
    -   `success`: boolean
    -   `mason`: Mason (JSON object)

### POST /api/auth/refresh

-   **Role**: `Public` (but needs a valid session token)
-   **Purpose**: Exchanges a long-lived `sessionToken` for a new `jwt` and `sessionToken`.
-   **Headers**:
    -   `x-session-token`: string
-   **Response**:
    -   `success`: boolean
    -   `jwt`: string (New token)
    -   `sessionToken`: string (New token)
    -   `mason`: Mason (JSON object)

### POST /api/auth/logout

-   **Role**: `Mason`
-   **Purpose**: Deletes the persistent session token from the database.
-   **Headers**:
    -   `x-session-token`: string
-   **Response**:
    -   `success`: boolean
    -   `message`: string

### POST /api/auth/dev-bypass

-   **Role**: `Development Only`
-   **Purpose**: Bypasses Firebase OTP entirely. Logs in or creates a mason with just a phone number.
-   **Body**:
    -   `phone`: string
    -   `name`: string
-   **Response**:
    -   (Same as `/api/auth/firebase`)

---

## Masons (Contractors)

WTF is this: Core CRUD for the Mason (contractor) entities.

### POST /api/masons

-   **Role**: `TSO` or `Mason` (Depends on logic, `masonpcSide.ts` implies TSO/Admin)
-   **Purpose**: Creates a new Mason profile. Automatically credits a joining bonus via the Points Ledger.
-   **Body**:
    -   `name`: string
    -   `phoneNumber`: string
    -   `kycStatus`: string (e.g., "pending")
    -   `dealerId`: string (Optional)
    -   `userId`: int (Optional, TSO who manages them)
    -   ... (other optional fields like `isReferred`)
-   **Response**:
    -   `success`: boolean
    -   `data`: Mason (The new Mason object)
    -   `ledgerEntry`: PointsLedger (The joining bonus entry)

### GET /api/masons

-   **Role**: `TSO`
-   **Purpose**: Gets a list of all Masons, with filters.
-   **Query Params**:
    -   `limit`: number
    -   `page`: number
    -   `userId`: int (TSO ID)
    -   `dealerId`: string
    -   `kycStatus`: string
    -   `search`: string (by name, phone)
-   **Response**:
    -   `success`: boolean
    -   `data`: Mason[] (Joined with `dealerName` and `userName`)

### GET /api/masons/:id

-   **Role**: `TSO` / `Mason` (Self)
-   **Purpose**: Gets a single Mason by their UUID.
-   **Response**:
    -   `success`: boolean
    -   `data`: Mason (Joined with `dealerName` and `userName`)

### PATCH /api/masons/:id

-   **Role**: `TSO` / `Mason` (Self)
-   **Purpose**: Updates a Mason's profile. Used by KYC flow to set `kycStatus: 'pending'` and `userId`.
-   **Body**:
    -   (Any partial `Mason` fields)
    -   `kycStatus`: string
    -   `userId`: int
-   **Response**:
    -   `success`: boolean
    -   `data`: Mason (The updated object)

---

## KYC Submissions

WTF is this: Manages the approval queue for Mason KYC.

### POST /api/kyc-submissions

-   **Role**: `Mason`
-   **Purpose**: Mason submits their documents for review. This transactionally creates the submission and sets the mason's `kycStatus` to 'pending'.
-   **Body**:
    -   `masonId`: string (UUID)
    -   `aadhaarNumber`: string (Optional)
    -   `panNumber`: string (Optional)
    -   `documents`: object (e.g., `{ "aadhaarFrontUrl": "..." }`)
    -   `remark`: string (Optional)
-   **Response**:
    -   `success`: boolean
    -   `data`: KycSubmission

### GET /api/kyc-submissions

-   **Role**: `TSO` / `Admin`
-   **Purpose**: Gets a list of KYC submissions, usually filtered by `status=pending`.
-   **Query Params**:
    -   `status`: string (e.g., "pending", "approved")
    -   `masonId`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: KycSubmission[]

### PATCH /api/kyc-submissions/:id

-   **Role**: `TSO` / `Admin`
-   **Purpose**: TSO approves or rejects a submission. This transactionally updates the submission *and* the mason's main `kycStatus`.
-   **Body**:
    -   `status`: string ("approved" or "rejected")
    -   `remark`: string (Optional, for rejection reason)
-   **Response**:
    -   `success`: boolean
    -   `data`: KycSubmission (The updated submission)

---

## Bag Lifts (Points)

WTF is this: The core "proof-of-purchase" flow for Masons to earn points.

### POST /api/bag-lifts

-   **Role**: `Mason`
-   **Purpose**: Mason submits a new bag lift request (with photo) for approval.
-   **Body**:
    -   `masonId`: string
    -   `bagCount`: int
    -   `dealerId`: string (Optional)
    -   `imageUrl`: string (URL from R2 Upload)
-   **Response**:
    -   `success`: boolean
    -   `data`: BagLift (Status will be 'pending')

### GET /api/bag-lifts/mason/:masonId

-   **Role**: `Mason` (Self)
-   **Purpose**: Gets the Mason's own submission history.
-   **Response**:
    -   `success`: boolean
    -   `data`: BagLift[] (Joined with `masonName`, `dealerName`, etc.)

### PATCH /api/bag-lifts/:id

-   **Role**: `TSO` (Requires TSO Auth)
-   **Purpose**: TSO approves or rejects a bag lift. This is a critical transaction.
-   **Logic**:
    -   If `status: 'approved'` (from 'pending'):
        1.  Updates BagLift `status` to 'approved'.
        2.  Calculates main points and *all* bonuses (Extra, Referral).
        3.  Creates multiple `pointsLedger` entries (one for each bonus type).
        4.  Atomically updates `masonPcSide.pointsBalance` and `masonPcSide.bagsLifted`.
        5.  Also updates the *referrer's* `pointsBalance` if referral bonus was triggered.
-   **Body**:
    -   `status`: string ("approved" or "rejected")
    -   `memo`: string (Optional)
-   **Response**:
    -   `success`: boolean
    -   `data`: BagLift (The updated object)

---

## Rewards & Redemptions

WTF is this: The gift catalog and system for Masons to spend their points.

### GET /api/reward-categories

-   **Role**: `Mason`
-   **Purpose**: Fetches the list of gift categories (e.g., "Electronics", "Vouchers").
-   **Response**:
    -   `success`: boolean
    -   `data`: RewardCategory[]

### GET /api/rewards

-   **Role**: `Mason`
-   **Purpose**: Fetches the gift catalog.
-   **Query Params**:
    -   `isActive`: boolean
    -   `categoryId`: int
-   **Response**:
    -   `success`: boolean
    -   `data`: Reward[] (Joined with `categoryName`)

### POST /api/rewards-redemption

-   **Role**: `Mason`
-   **Purpose**: Mason spends points to redeem a reward.
-   **Logic**:
    1.  Checks if `mason.pointsBalance >= totalPointsDebited`.
    2.  If yes, starts a transaction.
    3.  Creates `rewardRedemptions` record with `status: 'placed'`.
    4.  Creates a *debit* `pointsLedger` entry (negative points).
    5.  Atomically updates (subtracts from) `masonPcSide.pointsBalance`.
-   **Body**:
    -   `masonId`: string
    -   `rewardId`: int
    -   `quantity`: int
    -   `pointsDebited`: int (cost per item)
    -   `deliveryName`: string
    -   `deliveryPhone`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: RewardRedemption

### GET /api/rewards-redemption/mason/:masonId

-   **Role**: `Mason` (Self)
-   **Purpose**: Gets the Mason's redemption history.
-   **Response**:
    -   `success`: boolean
    -   `data`: RewardRedemption[] (Joined with `rewardName`, `masonName`)

### PATCH /api/rewards-redemption/:id

-   **Role**: `TSO`
-   **Purpose**: TSO updates the fulfillment status of a redemption (e.g., "shipped", "delivered").
-   **Body**:
    -   `status`: string ("approved", "shipped", "delivered", "rejected")
-   **Response**:
    -   `success`: boolean
    -   `data`: RewardRedemption

---

## Points Ledger (Admin)

WTF is this: The master financial log for all point transactions. TSO-access only.

### POST /api/points-ledger

-   **Role**: `TSO` (Requires TSO Auth)
-   **Purpose**: Manually adds or subtracts points from a Mason (a "manual adjustment").
-   **Logic**:
    1.  Starts a transaction.
    2.  Creates a `pointsLedger` entry with `sourceType: 'adjustment'`.
    3.  Atomically updates `masonPcSide.pointsBalance` with the new points.
-   **Body**:
    -   `masonId`: string
    -   `points`: int (can be negative)
    -   `memo`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: PointsLedger (The new ledger entry)

### GET /api/points-ledger

-   **Role**: `TSO` (Requires TSO Auth)
-   **Purpose**: Gets the full, filterable ledger for all masons.
-   **Query Params**:
    -   `masonId`: string
    -   `sourceType`: string
    -   `startDate` / `endDate`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: PointsLedger[] (Joined with `masonName`, `masonPhone`)

---

## Dealers

WTF is this: CRUD for Dealers. These are created by TSOs.

### POST /api/dealers

-   **Role**: `TSO`
-   **Purpose**: Creates a new Dealer.
-   **Logic**:
    1.  Validates input (requires `latitude`, `longitude`).
    2.  Inserts into `dealers` table.
    3.  Calls Radar API (`PUT /v1/geofences/...`) to create/update a geofence.
    4.  If Radar fails, the database insert is *rolled back*.
-   **Body**:
    -   (Full `Dealer` object, see `addDealer.ts` for all 50+ fields)
    -   `radius`: number (Optional, for geofence)
-   **Response**:
    -   `success`: boolean
    -   `data`: Dealer (The new dealer)
    -   `geofenceRef`: object (Info from Radar)

### GET /api/dealers

-   **Role**: `TSO`
-   **Purpose**: Gets a list of dealers.
-   **Query Params**:
    -   `limit`: number
    -   `page`: number
    -   `userId`: int (TSO ID)
    -   `region`: string
    -   `area`: string
    -   `search`: string (by name, phone, etc.)
-   **Response**:
    -   `success`: boolean
    -   `data`: Dealer[]

### PATCH /api/dealers/:id

-   **Role**: `TSO`
-   **Purpose**: Updates a Dealer. If `latitude`, `longitude`, or `radius` is included, it also updates the Radar geofence.
-   **Body**:
    -   (Partial `Dealer` object)
-   **Response**:
    -   `success`: boolean
    -   `data`: Dealer (Updated dealer)

### DELETE /api/dealers/:id

-   **Role**: `TSO`
-   **Purpose**: Deletes a Dealer.
-   **Logic**:
    1.  Calls Radar API (`DELETE /v1/geofences/...`) to delete geofence.
    2.  If Radar fails, the request fails.
    3.  If Radar succeeds, deletes from `dealers` table.
-   **Response**:
    -   `success`: boolean
    -   `deletedId`: string

---

## PJP (Permanent Journey Plan)

WTF is this: The TSO's daily/monthly visit plan.

### POST /api/pjp

-   **Role**: `TSO`
-   **Purpose**: Creates a single PJP entry.
-   **Body**:
    -   `userId`: int (TSO ID)
    -   `createdById`: int (Creator ID, usually same as `userId`)
    -   `dealerId`: string
    -   `planDate`: string (YYYY-MM-DD)
    -   `areaToBeVisited`: string
    -   `status`: string (e.g., "pending")
    -   `verificationStatus`: string (e.g., "PENDING")
-   **Response**:
    -   `success`: boolean
    -   `data`: Pjp

### POST /api/bulkpjp

-   **Role**: `TSO`
-   **Purpose**: Creates a large number of PJPs automatically based on a list of dealers and a date.
-   **Body**:
    -   `userId`: int
    -   `createdById`: int
    -   `dealerIds`: string[]
    -   `baseDate`: string (YYYY-MM-DD)
    -   `batchSizePerDay`: int (How many visits per day)
-   **Response**:
    -   `success`: boolean
    -   `totalRowsCreated`: number
    -   `totalRowsSkipped`: number (due to conflicts)

### GET /api/pjp

-   **Role**: `TSO`
-   **Purpose**: Gets a list of PJPs.
-   **Query Params**:
    -   `startDate` / `endDate`: string
    -   `status`: string (e.g., "started", "APPROVED")
    -   `verificationStatus`: string
    -   `userId`: int
-   **Response**:
    -   `success`: boolean
    -   `data`: Pjp[]

### PATCH /api/pjp/:id

-   **Role**: `TSO`
-   **Purpose**: Updates a PJP, most commonly to change its `status` (e.g., to "started" or "completed").
-   **Body**:
    -   `status`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: Pjp (Updated object)

---

## TSO Forms (DVR, TVR, etc.)

WTF is this: A collection of various report forms TSOs fill out.

### POST /api/daily-visit-reports

-   **Role**: `TSO`
-   **Purpose**: Submits the (very large) DVR form.
-   **Body**:
    -   (Full `DailyVisitReport` object, see `dvr.ts`)
-   **Response**:
    -   `success`: boolean
    -   `data`: DailyVisitReport

### GET /api/daily-visit-reports

-   **Role**: `TSO`
-   **Purpose**: Gets a list of DVRs.
-   **Query Params**:
    -   `startDate` / `endDate`: string
    -   `userId`: int
    -   `dealerId`: string
-   **Response**:
    -   `success`: boolean
    -   `data`: DailyVisitReport[]

### POST /api/technical-visit-reports

-   **Role**: `TSO`
-   **Purpose**: Submits the (very large) TVR form.
-   **Body**:
    -   (Full `TechnicalVisitReport` object, see `tvr.ts`)
-   **Response**:
    -   `success`: boolean
    -   `data`: TechnicalVisitReport

### GET /api/technical-visit-reports

-   **Role**: `TSO`
-   **Purpose**: Gets a list of TVRs.
-   **Query Params**:
    -   `startDate` / `endDate`: string
    -   `userId`: int
-   **Response**:
    -   `success`: boolean
    -   `data`: TechnicalVisitReport[]

### POST /api/competition-reports

-   **Role**: `TSO`
-   **Purpose**: Submits the competition form.
-   **Body**:
    -   `userId`: int
    -   `brandName`: string
    -   `billing`: string
    -   ... (see `create_competition_form.dart`)
-   **Response**:
    -   `success`: boolean
    -   `data`: CompetitionReport

### POST /api/leave-applications

-   **Role**: `TSO`
-   **Purpose**: TSO applies for leave.
-   **Body**:
    -   `userId`: int
    -   `leaveType`: string
    -   `startDate`: string (ISO Date)
    -   `endDate`: string (ISO Date)
    -   `reason`: string
    -   `status`: string ("Pending")
-   **Response**:
    -   `success`: boolean
    -   `data`: LeaveApplication

### POST /api/daily-tasks

-   **Role**: `TSO`
-   **Purpose**: TSO creates a daily task for themself.
-   **Body**:
    -   `userId`: int
    -   `assignedByUserId`: int
    -   `taskDate`: string (ISO Date)
    -   `visitType`: string
    -   `pjpId`: string (Optional)
    -   `relatedDealerId`: string (Optional)
-   **Response**:
    -   `success`: boolean
    -   `data`: DailyTask

---

## TSO Attendance

WTF is this: The TSO's daily Check-in and Check-out.

### POST /api/attendance/check-in

-   **Role**: `TSO`
-   **Purpose**: TSO checks in for the day. Fails if already checked in.
-   **Body**:
    -   `userId`: int
    -   `attendanceDate`: string (ISO Date)
    -   `locationName`: string
    -   `inTimeImageUrl`: string
    -   `inTimeLatitude`: number
    -   `inTimeLongitude`: number
-   **Response**:
    -   `success`: boolean
    -   `data`: Attendance

### POST /api/attendance/check-out

-   **Role**: `TSO`
-   **Purpose**: TSO checks out for the day. Fails if not checked in.
-   **Body**:
    -   `userId`: int
    -   `attendanceDate`: string (ISO Date)
    -   `outTimeImageUrl`: string
    -   `outTimeLatitude`: number
    -   `outTimeLongitude`: number
-   **Response**:
    -   `success`: boolean
    -   `data`: Attendance

### GET /api/attendance/user/:userId/today

-   **Role**: `TSO`
-   **Purpose**: Gets today's attendance record (if any) to see if user is already checked in/out.
-   **Response**:
    -   `success`: boolean
    -   `data`: Attendance

---

## File Upload

WTF is this: The single endpoint for uploading images to Cloudflare R2.

### POST /api/r2/upload-direct

-   **Role**: `TSO` / `Mason` (Authenticated)
-   **Purpose**: Uploads a single file.
-   **Body**:
    -   `multipart/form-data` with a `file` field.
-   **Response**:
    -   `success`: boolean
    -   `publicUrl`: string (The CDN URL for the uploaded file)

---

## Geo-Tracking

WTF is this: The "live-tracking" endpoint for the TSO's journey.

### POST /api/geotracking

-   **Role**: `TSO`
-   **Purpose**: The TSO's app sends a location datapoint to this endpoint every few seconds.
-   **Body**:
    -   `userId`: int
    -   `journeyId`: string
    -   `latitude`: number
    -   `longitude`: number
    -   `totalDistanceTravelled`: number
    -   `isActive`: boolean
-   **Response**:
    -   `success`: boolean
    -   `data`: GeoTrackingPoint

### GET /api/geotracking/journey/:journeyId

-   **Role**: `TSO`
-   **Purpose**: Gets all points for a specific journey to draw the route on a map.
-   **Response**:
    -   `success`: boolean
    -   `data`: GeoTrackingPoint[]