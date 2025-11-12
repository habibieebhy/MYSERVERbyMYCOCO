# 💎 End-to-End Flow: Mason Loyalty Program, TSO Approval, and Backend Routes

This document provides a detailed breakdown of the complete Mason Loyalty Program lifecycle, focusing on the contractor's experience and the corresponding transactional logic and approval checkpoints handled by your Express.js backend.

-----

## I. Onboarding, Registration, and Verification (Pre-Earning)

This phase establishes the Mason's identity and eligibility for the scheme, enforced by mandatory KYC validation.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Status Change |
| :--- | :--- | :--- | :--- |
| **1. Login & Profile Setup** | `POST /api/auth/firebase` | `masonPcSide`, `authSessions` | **Authentication:** Verifies Firebase ID Token. **Upsert:** Creates the Mason profile if it doesn't exist (initial `kycStatus: 'none'`). Creates a secure `authSessions` record. |
| **2. Scheme Enrollment** | `POST /api/masons-on-scheme` | `masonOnScheme` | Mason opts into a specific loyalty scheme. Logic handles foreign key checks and returns **409 Conflict** if the Mason is already enrolled. |
| **3. KYC Submission** | `POST /api/kyc-submissions` | `kycSubmissions`, `masonPcSide` | **Atomic Transaction:** Inserts the detailed submission record. Crucially, it updates the primary `masonPcSide.kycStatus` to **'pending'**, gating future earning and redemption access until approval. |
| **4. TSO KYC Approval** | `PATCH /api/kyc-submissions/:id` | `kycSubmissions`, `masonPcSide` | TSO action. **Atomic Transaction:** Updates the specific submission record's status. The core logic ensures the main `masonPcSide.kycStatus` is updated to **'approved'** or **'rejected'** to unlock the full application features. |

-----

## II. Earning Points: The TSO Approval Loop (The Core Logic)

The heart of the program is the double-verification system: points are earned on submission but only credited upon TSO approval.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Point Flow |
| :--- | :--- | :--- | :--- |
| **5. Bag Lift Submission** | `POST /api/bag-lifts` | `bagLifts` | Creates a new record for the bags lifted, setting `status` to **'pending'**. **No transactional point change occurs here.** This enforces the TSO validation process. |
| **6. TSO Bag Lift Approval** | `PATCH /api/bag-lifts/:id` | `bagLifts`, `pointsLedger`, `masonPcSide` | **Atomic Transaction (Credit):**<br>1. Updates `bagLifts.status` from `'pending'` to **'approved'**.<br>2. Inserts a **POSITIVE** record into `pointsLedger` (documenting the credit event).<br>3. Updates the denormalized `masonPcSide.pointsBalance` (credit). |
| **7. TSO Rejection/Unwind** | `PATCH /api/bag-lifts/:id` | `bagLifts`, `pointsLedger`, `masonPcSide` | **Atomic Transaction (Debit/Unwind):**<br>1. If reversing a previous approval (`'approved'` to `'rejected'`): inserts a **NEGATIVE** debit/adjustment record into `pointsLedger` and reduces the `masonPcSide.pointsBalance` to unwind the initial credit. |
| **8. View Submission Status** | `GET /api/bag-lifts/mason/:masonId` | `bagLifts` (Joined with `masonPcSide`, `dealers`, `users`) | Allows the Mason to track their submissions by status: `pending`, `approved`, or `rejected`. |
| **9. Account Statement** | `GET /api/points-ledger/mason/:masonId` | `pointsLedger` | The single source of truth for all point movements (+/-) derived from approved lifts, redemptions, and adjustments. |

-----

## III. Redemption and Fulfillment Phase

This phase allows the Mason to utilize their earned points, which triggers an immediate atomic debit, followed by manual administrative fulfillment.

| Flow Step & User Action | Backend Route (Method) | Tables Involved | Key Backend Logic & Status Change |
| :--- | :--- | :--- | :--- |
| **10. View Catalogue** | `GET /api/rewards` | `rewards`, `rewardCategories` | Fetches the live reward catalogue, with details like `pointCost` and `stock`, often filtered by `isActive` status. |
| **11. Place Redemption Order** | `POST /api/rewards-redemption` | `rewardRedemptions`, `pointsLedger`, `masonPcSide` | **Atomic Transaction (Debit):**<br>1. **Critical Check:** Performs a **pre-transaction validation** of `masonPcSide.pointsBalance` against the total cost.<br>2. If successful, creates an order in `rewardRedemptions` with status **'placed'**.<br>3. Inserts a **NEGATIVE** debit record into `pointsLedger`.<br>4. Updates `masonPcSide.pointsBalance` (debit). |
| **12. View Order History** | `GET /api/rewards-redemption/mason/:masonId` | `rewardRedemptions` | Mason views their orders and their current fulfillment status. |
| **13. Fulfillment Tracking** | `PATCH /api/rewards-redemption/:id` | `rewardRedemptions` | TSO/Admin tool. Used to manually update the order's status through its lifecycle (e.g., `'placed'` → `'approved'` → `'shipped'` → `'delivered'`), completing the final mile of the loyalty process. |

-----

## IV. Administrative and Data Access Routes

These routes support TSO/Admin roles for managing the scheme's resources and checking overall data health.

| Route (Method) | Purpose | Data Access Example |
| :--- | :--- | :--- |
| `GET /api/rewards` | **Catalogue View (Admin/TSO)** | View all rewards, including those set to `isActive: false`, to manage the entire product offering. |
| `PATCH /api/rewards/:id` | **Catalogue Maintenance** | Adjust `stock`, `pointCost`, or toggle `isActive` status of a gift. |
| `GET /api/rewards-redemption` | **Order Management (Admin)** | Fetch a list of all redemption orders for fulfillment processing, filtered by status (`'placed'`). |
| `GET /api/masons` | **Mason Master List** | Fetch a full list of all Mason/Contractor profiles, joined with Dealer and TSO names. |
| `GET /api/points-ledger` | **Audit/Reconciliation** | View the entire ledger of point movements across all participants for audit purposes. |\<ctrl63\>