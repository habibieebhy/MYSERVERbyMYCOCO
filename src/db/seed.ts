// Purge-only seed compatible with current schema.ts and storage.ts.
// Deletes child tables -> parent tables in FK-safe order.
// No data is inserted. This is for dev/staging reset only.

import { db } from "./db";
import {
  companies,
  users,
  dealers,
  dailyVisitReports,
  technicalVisitReports,
  permanentJourneyPlans,
  salesmanAttendance,
  salesmanLeaveApplications,
  competitionReports,
  geoTracking,
  dailyTasks,
  dealerReportsAndScores,
  salesOrders,
  ratings,
  brands,
  dealerBrandMapping,
  tsoMeetings,
  rewards, // UPDATED: Renamed from giftInventory
  giftAllocationLogs,
  tallyRaw,
  masonPcSide,
  otpVerifications,
  schemesOffers,
  masonOnScheme,
  masonsOnMeetings,
  rewardCategories,
  kycSubmissions,  
  tsoAssignments,  
  bagLifts,        
  rewardRedemptions, 
  pointsLedger,  
  technicalSites,
} from "./schema";

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
  await db.delete(dealerBrandMapping);
  await db.delete(dealerReportsAndScores);

  // --- 3. Delete transactional data and logs (must precede reports and core entities) ---
  await db.delete(giftAllocationLogs);
  await db.delete(rewardRedemptions); // Child of Rewards and Mason_PC_Side
  await db.delete(bagLifts);          // Child of Mason_PC_Side and Dealer
  await db.delete(salesOrders);
  await db.delete(dailyTasks);

  // --- 4. Delete main reports and activity tables ---
  await db.delete(technicalVisitReports);
  await db.delete(dailyVisitReports);
  await db.delete(permanentJourneyPlans);
  await db.delete(competitionReports);
  await db.delete(ratings);
  await db.delete(salesmanLeaveApplications);
  await db.delete(salesmanAttendance);
  await db.delete(geoTracking);

  // --- 5. Delete "parent" entity tables ---
  await db.delete(schemesOffers);
  await db.delete(rewards); // UPDATED: Renamed from giftInventory
  await db.delete(rewardCategories); // Parent of Rewards
  await db.delete(tsoMeetings);
  await db.delete(masonPcSide);
  await db.delete(brands);

  // --- 6. Delete core entities (users, dealers, companies) ---
  await db.delete(dealers);
  await db.delete(users);
  await db.delete(companies);

  // --- 7. Delete independent tables ---
  await db.delete(tallyRaw);
  await db.delete(technicalSites);
  
  console.log("Database cleared successfully (no demo data inserted).");
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch((err) => {
    console.error("Seed reset failed:", err);
    process.exit(1);
  });
}

export { seedDatabase };