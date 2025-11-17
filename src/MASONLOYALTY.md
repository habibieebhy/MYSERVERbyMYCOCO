# End-to-End Flow: Mason Loyalty Program, TSO Approval, and Backend Routes

This document provides a detailed breakdown of the complete Mason Loyalty Program lifecycle, focusing on the contractor's experience and the corresponding transactional logic and approval checkpoints handled by your Express.js backend.

-----

## I. Onboarding, Registration, and Verification (Pre-Earning)

This phase establishes the Mason's identity and eligibility for the scheme, enforced by mandatory KYC validation.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Status Change |
| :--- | :--- | :--- | :--- |
| **1. Mason Registration** | `POST /api/masons` | `masonPcSide`, `pointsLedger` | **Atomic Transaction (Credit):** A Mason profile is created (e.g., by a TSO). The logic calculates a **`joiningBonus`**, sets the initial `pointsBalance` to that bonus, and immediately inserts a corresponding **credit record** into the `pointsLedger` to document the source of the points. |
| **2. Scheme Enrollment** | `POST /api/masons-on-scheme` | `masonOnScheme` | Mason opts into a specific loyalty scheme. Logic handles foreign key checks and returns **409 Conflict** if the Mason is already enrolled. |
| **3. KYC Submission** | `POST /api/kyc-submissions` | `kycSubmissions`, `masonPcSide` | **Atomic Transaction:** Inserts the detailed submission record. Crucially, it updates the primary `masonPcSide.kycStatus` to **'pending'**, gating future earning and redemption access until approval. |
| **4. TSO KYC Approval** | `PATCH /api/kyc-submissions/:id` | `kycSubmissions`, `masonPcSide` | TSO action. **Atomic Transaction:** Updates the specific submission record's status. The core logic ensures the main `masonPcSide.kycStatus` is updated to **'approved'** or **'rejected'** to unlock the full application features. |

-----

-----

## II. Earning Points: The TSO Approval Loop (The Core Logic)

The heart of the program is the double-verification system: points are calculated on submission but only credited upon TSO approval.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Point Flow |
| :--- | :--- | :--- | :--- |
| **5. Bag Lift Submission** | `POST /api/bag-lifts` | `bagLifts` | Creates a new record with `status: 'pending'`. **Server-Side Calculation:** Points are immediately calculated using `calculateBaseAndBonanzaPoints` and stored in the **`pointsCredited`** column, but **not yet applied** to the Mason's balance. |
| **6. TSO Bag Lift Approval** | `PATCH /api/bag-lifts/:id` | `bagLifts`, `pointsLedger`, `masonPcSide` | **(Protected by `tsoAuth`)<br>Atomic Transaction (Credit):**<br>1. Updates `bagLifts.status` to **'approved'**.<br>2. Inserts a **POSITIVE** ledger entry for Base/Bonanza points.<br>3. **Calculates & applies Extra Bonus** for slab crossing; inserts a *separate* ledger entry if applicable.<br>4. **Checks & applies Referral Bonus** to the *referrer's* account, inserting a *third* ledger entry.<br>5. Atomically updates `masonPcSide.pointsBalance` and increments `bagsLifted`. |
| **7. TSO Rejection/Unwind** | `PATCH /api/bag-lifts/:id` | `bagLifts`, `pointsLedger`, `masonPcSide` | **(Protected by `tsoAuth`)<br>Atomic Transaction (Debit/Unwind):**<br>1. If reversing a previous approval, inserts a **NEGATIVE** debit/adjustment record into `pointsLedger`.<br>2. Reduces `masonPcSide.pointsBalance` and `bagsLifted` using atomic subtraction to reverse the initial credit. |
| **8. View Submission Status** | `GET /api/bag-lifts/mason/:masonId` | `bagLifts` (Joined with `masonPcSide`, `dealers`, `users`) | Allows the Mason to track their submissions by status: `pending`, `approved`, or `rejected`. Includes joins to show dealer and approver names. |
| **9. Account Statement** | `GET /api/points-ledger/mason/:masonId` | `pointsLedger` | **(Protected by `tsoAuth`)**<br>The single source of truth for all point movements (+/-) derived from approved lifts, redemptions, and adjustments. |

-----

-----

## III. Redemption and Fulfillment Phase

This phase allows the Mason to utilize their earned points, which triggers an immediate atomic debit, followed by manual administrative fulfillment.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Status Change |
| :--- | :--- | :--- | :--- |
| **10. View Catalogue** | `GET /api/rewards` | `rewards`, `rewardCategories` | Fetches the live reward catalogue, with details like `pointCost` and `stock`, joined with category names and filtered by `isActive` status. |
| **11. Place Redemption Order** | `POST /api/rewards-redemption` | `rewardRedemptions`, `pointsLedger`, `masonPcSide` | **Atomic Transaction (Debit):**<br>1. **Critical Check:** Validates `masonPcSide.pointsBalance` against the total cost.<br>2. Creates order in `rewardRedemptions` with status **'placed'**.<br>3. Inserts a **NEGATIVE** debit record into `pointsLedger` linking to the redemption ID.<br>4. Atomically updates `masonPcSide.pointsBalance` (debit). |
| **12. View Order History** | `GET /api/rewards-redemption/mason/:masonId` | `rewardRedemptions` | Mason views their orders and their current fulfillment status, joined with reward item names. |
| **13. Fulfillment Tracking (TSO/Admin)** | `PATCH /api/rewards-redemption/:id` | `rewardRedemptions` | **(Protected by `tsoAuth`)**<br>TSO/Admin tool. Used to manually update the order's status through its lifecycle (`'placed'` → `'approved'` → `'shipped'` → `'delivered'`). **No financial transaction occurs here** as the points were already debited in Step 11. |

-----

-----

## IV. Administrative & TSO Routes

These routes support TSO/Admin roles for managing the scheme's resources, participants, and related field activities.

| Route (Method) | Purpose | Data Access Example |
| :--- | :--- | :--- |
| `POST /api/points-ledger` | **Manual Point Adjustment** | **(Protected by `tsoAuth`)**<br>TSO manually credits/debits points via an atomic transaction, updating `pointsLedger` and `masonPcSide.pointsBalance`. |
| `GET /api/points-ledger` | **Audit/Reconciliation** | **(Protected by `tsoAuth`)**<br>View the *entire* ledger of point movements across all participants for audit purposes. |
| `POST /api/dealers` | **Dealer Creation** | Create a new dealer, which also makes a call to an external service (Radar) to create a geofence for that dealer. |
| `PATCH /api/dealers/:id` | **Dealer Update** | Update dealer details; also triggers a `PUT` request to the Radar geofence service to keep it in sync. |
| `GET /api/masons` | **Mason Master List** | Fetch a full list of all Mason/Contractor profiles, joined with Dealer and TSO names for TSO dashboards. |
| `PATCH /api/rewards/:id` | **Catalogue Maintenance** | Adjust `stock`, `pointCost`, or toggle `isActive` status of a gift. |
| `GET /api/rewards-redemption` | **Order Management (Admin)** | Fetch a list of all redemption orders for fulfillment processing, filtered by status (`'placed'`). |
| `GET /api/pjp` | **View Journey Plans** | TSO views Permanent Journey Plans, filterable by user, dealer, or date. |
| `GET /api/daily-visit-reports` | **View Visit Reports** | TSO views Daily Visit Reports (DVRs), filterable by user, dealer, or date range. |