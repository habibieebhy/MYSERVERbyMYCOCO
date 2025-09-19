// src/server/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// --- Import ALL your API route setups ---
import setupAuthRoutes from './src/routes/auth';  // NEW
import setupUsersRoutes from './src/routes/users'; // NEW
import setupCompaniesRoutes from './src/routes/companies'; // NEW2
import setupLogoutAuthRoutes from './src/routes/logout'; // NEW2
import setupR2Upload from './src/routes/cloudfareRoutes/cloudfare'; 
import setupBrandsAndMappingRoutes from './src/routes/dataFetchingRoutes/brandMappingFetch';
import setupClientReportsRoutes from './src/routes/dataFetchingRoutes/clientReports';
import setupCollectionReportsRoutes from './src/routes/dataFetchingRoutes/collectionReports';
import setupCompetitionReportsRoutes from './src/routes/dataFetchingRoutes/competetionReports';
import setupDailyTasksRoutes from './src/routes/dataFetchingRoutes/dailyTasks';
import setupDealersRoutes from './src/routes/dataFetchingRoutes/dealers';
import setupPJPRoutes from './src/routes/dataFetchingRoutes/pjp';
import setupDdpRoutes from './src/routes/dataFetchingRoutes/ddp';
import setupDealerReportsAndScoresRoutes from './src/routes/dataFetchingRoutes/dealerReportandScores';
import setupRatingsRoutes from './src/routes/dataFetchingRoutes/ratings';
import setupSalesmanLeaveApplicationsRoutes from './src/routes/dataFetchingRoutes/salesmanLeaveApplications';
import setupSalesReportRoutes from './src/routes/dataFetchingRoutes/salesReports';
import setupSalesOrdersRoutes from './src/routes/dataFetchingRoutes/salesOrder';
import setupDailyVisitReportsRoutes from './src/routes/dataFetchingRoutes/dvr';
import setupSalesmanAttendanceRoutes from './src/routes/dataFetchingRoutes/salesmanAttendance';
import setupTechnicalVisitReportsRoutes from './src/routes/dataFetchingRoutes/tvr';

// --- Import DELETE route setups ---
import setupDealersDeleteRoutes from './src/routes/deleteRoutes/dealers';
import setupPermanentJourneyPlansDeleteRoutes from './src/routes/deleteRoutes/pjp';
import setupTechnicalVisitReportsDeleteRoutes from './src/routes/deleteRoutes/tvr';
import setupDailyVisitReportsDeleteRoutes from './src/routes/deleteRoutes/dvr';
import setupDailyTasksDeleteRoutes from './src/routes/deleteRoutes/dailytask';
import setupSalesReportDeleteRoutes from './src/routes/deleteRoutes/salesreport';
import setupSalesmanLeaveApplicationsDeleteRoutes from './src/routes/deleteRoutes/salesmanleave';
import setupCompetitionReportsDeleteRoutes from './src/routes/deleteRoutes/competetionreports';
import setupColllectionReportsDeleteRoutes from './src/routes/deleteRoutes/collectionreports';
import setupBrandsDeleteRoutes from './src/routes/deleteRoutes/brands';
import setupRatingsDeleteRoutes from './src/routes/deleteRoutes/ratings';
import setupSalesOrdersDeleteRoutes from './src/routes/deleteRoutes/salesOrder';
import setupDealerReportsAndScoresDeleteRoutes from './src/routes/deleteRoutes/dealerReportsAndScores';

// --- Import POST route setups ---
import setupDailyVisitReportsPostRoutes from './src/routes/formSubmissionRoutes/dvr';
import setupTechnicalVisitReportsPostRoutes from './src/routes/formSubmissionRoutes/tvr';
import setupPermanentJourneyPlansPostRoutes from './src/routes/formSubmissionRoutes/pjp';
import setupDealersPostRoutes from './src/routes/formSubmissionRoutes/addDealer';
import setupSalesmanLeaveApplicationsPostRoutes from './src/routes/formSubmissionRoutes/salesManleave';
import setupClientReportsPostRoutes from './src/routes/formSubmissionRoutes/clientReport';
import setupCompetitionReportsPostRoutes from './src/routes/formSubmissionRoutes/competitionReport';
import setupDailyTasksPostRoutes from './src/routes/formSubmissionRoutes/dailytasks';
import setupDealerReportsAndScoresPostRoutes from './src/routes/formSubmissionRoutes/dealerReportsAndScores';
import setupSalesReportPostRoutes from './src/routes/formSubmissionRoutes/salesreport';
import setupCollectionReportsPostRoutes from './src/routes/formSubmissionRoutes/collectionReport';
import setupDdpPostRoutes from './src/routes/formSubmissionRoutes/ddp';
import setupRatingsPostRoutes from './src/routes/formSubmissionRoutes/ratings';
import setupBrandsPostRoutes from './src/routes/formSubmissionRoutes/brand';
import setupSalesOrdersPostRoutes from './src/routes/formSubmissionRoutes/salesOrder';
import setupDealerBrandMappingPostRoutes from './src/routes/formSubmissionRoutes/brandMapping';
import setupAttendanceCheckInRoutes from './src/routes/formSubmissionRoutes/attendanceIn';
import setupAttendanceCheckOutRoutes from './src/routes/formSubmissionRoutes/attendanceOut';

// --- Import UPDATE (PATCH) route setups ---
import setupDealersPatchRoutes from './src/routes/updateRoutes/dealers';
import setupPjpPatchRoutes from './src/routes/updateRoutes/pjp';
import setupDailyTaskPatchRoutes from './src/routes/updateRoutes/dailytask';
import setupDealerBrandMappingPatchRoutes from './src/routes/updateRoutes/brandMapping';
import setupBrandsPatchRoutes from './src/routes/updateRoutes/brands';
import setupRatingsPatchRoutes from './src/routes/updateRoutes/ratings';
import setupDealerScoresPatchRoutes from './src/routes/updateRoutes/dealerReportandScores';

// --- Import GEO TRACKING route setups ---
import setupGeoTrackingRoutes from './src/routes/geoTrackingRoutes/geoTracking';

// Initialize environment variables

// ADD THIS DEBUG LINE:
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

// --- Server Setup ---
const app: Express = express();
//const PORT = process.env.PORT || 8080;
const DEFAULT_PORT = 8000;
const parsed = parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10);
const PORT = Number.isNaN(parsed) ? DEFAULT_PORT : parsed;


// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Enable the express.json middleware to parse JSON request bodies
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

// Simple logging middleware to see incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---

// A simple health-check or welcome route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Welcome to the Field Force Management API!',
    timestamp: new Date().toISOString()
  });
});

// --- Modular Route Setup ---
console.log('🔌 Registering API routes...');

// Authentication and Users (FIRST)
setupAuthRoutes(app);                    // /api/auth/login, /api/user/:id
setupUsersRoutes(app);                   // /api/users/*
setupCompaniesRoutes(app);                // /api/companies
setupLogoutAuthRoutes(app);               // /api/auth/logout

// Core Data Endpoints (GET)
setupBrandsAndMappingRoutes(app);        // /api/brands/*, /api/dealer-brand-mapping/*
setupDealersRoutes(app);                 // /api/dealers/*
setupDailyTasksRoutes(app);              // /api/daily-tasks/*
setupPJPRoutes(app);                     // /api/pjp/*

// Reports Endpoints (GET)
setupClientReportsRoutes(app);           // /api/client-reports/*
setupCollectionReportsRoutes(app);       // /api/collection-reports/*
setupCompetitionReportsRoutes(app);      // /api/competition-reports/*
setupDailyVisitReportsRoutes(app);       // /api/daily-visit-reports/*
setupTechnicalVisitReportsRoutes(app);   // /api/technical-visit-reports/*

// Additional Data Endpoints (GET)
setupDdpRoutes(app);                     // /api/ddp/*
setupDealerReportsAndScoresRoutes(app);  // /api/dealer-reports-scores/*
setupRatingsRoutes(app);                 // /api/ratings/*
setupSalesmanLeaveApplicationsRoutes(app); // /api/leave-applications/*
setupSalesReportRoutes(app);             // /api/sales-reports/*
setupSalesOrdersRoutes(app);             // /api/sales-orders/*
setupSalesmanAttendanceRoutes(app);      // /api/salesman-attendance/*

// POST Endpoints
setupTechnicalVisitReportsPostRoutes(app); // POST /api/technical-visit-reports/*
setupPermanentJourneyPlansPostRoutes(app); // POST /api/permanent-journey-plans/*
setupDealersPostRoutes(app);             // POST /api/dealers/*
setupSalesmanLeaveApplicationsPostRoutes(app); // POST /api/leave-applications/*
setupClientReportsPostRoutes(app);       // POST /api/client-reports/*
setupCompetitionReportsPostRoutes(app);  // POST /api/competition-reports/*
setupDailyTasksPostRoutes(app);          // POST /api/daily-tasks/*
setupDealerReportsAndScoresPostRoutes(app); // POST /api/dealer-reports-scores/*
setupSalesReportPostRoutes(app);         // POST /api/sales-reports/*
setupCollectionReportsPostRoutes(app);   // POST /api/collection-reports/*
setupDdpPostRoutes(app);                 // POST /api/ddp/*
setupRatingsPostRoutes(app);             // POST /api/ratings/*
setupBrandsPostRoutes(app);              // POST /api/brands/*
setupSalesOrdersPostRoutes(app);         // POST /api/sales-orders/*
setupDealerBrandMappingPostRoutes(app);  // POST /api/dealer-brand-mapping/*
setupDailyVisitReportsPostRoutes(app);   // POST /api/daily-visit-reports/*
setupAttendanceCheckInRoutes(app);       // POST /api/attendance/check-in/*
setupAttendanceCheckOutRoutes(app);      // POST /api/attendance/check-out/*

// DELETE Endpoints
setupDealersDeleteRoutes(app);           // DELETE /api/dealers/*
setupPermanentJourneyPlansDeleteRoutes(app); // DELETE /api/permanent-journey-plans/*
setupTechnicalVisitReportsDeleteRoutes(app); // DELETE /api/technical-visit-reports/*
setupDailyVisitReportsDeleteRoutes(app); // DELETE /api/daily-visit-reports/*
setupDailyTasksDeleteRoutes(app);        // DELETE /api/daily-tasks/*
setupSalesReportDeleteRoutes(app);       // DELETE /api/sales-reports/*
setupSalesmanLeaveApplicationsDeleteRoutes(app); // DELETE /api/leave-applications/*
setupCompetitionReportsDeleteRoutes(app); // DELETE /api/competition-reports/*
setupColllectionReportsDeleteRoutes(app); // DELETE /api/collection-reports/*
setupBrandsDeleteRoutes(app);            // DELETE /api/brands/*
setupRatingsDeleteRoutes(app);           // DELETE /api/ratings/*
setupSalesOrdersDeleteRoutes(app);       // DELETE /api/sales-orders/*
setupDealerReportsAndScoresDeleteRoutes(app); // DELETE /api/dealer-reports-scores/*

// UPDATE (PATCH) endpoints
setupDealersPatchRoutes(app);
setupDealerScoresPatchRoutes(app);
setupRatingsPatchRoutes(app);
setupDailyTaskPatchRoutes(app);
setupDealerBrandMappingPatchRoutes(app);
setupBrandsPatchRoutes(app);
setupPjpPatchRoutes(app);

// ---------- GEO TRACKING SETUP--------
setupGeoTrackingRoutes(app);

//------------ CLOUDFARE ----------------
setupR2Upload(app);
console.log('✅ All routes registered successfully.');


// --- Error Handling Middleware ---

// Handle 404 - Not Found for any routes not matched above
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Resource not found' });
});

// Handle 500 - Generic Internal Server Error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    details: err.message 
  });
});

// --- Start the Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running and listening on http://0.0.0.0:${PORT}`);
});