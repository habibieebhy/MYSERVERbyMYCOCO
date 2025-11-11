## MYSERVERbyMyCOCO: Express JS Backend for Salesman Flutter App. 

This is the central backend server for the "MYSERVERbyMyCOCO" salesman management platform, designed to power a companion Flutter application. It handles everything from user authentication and data management to real-time geo-tracking, AI-powered assistance, and file-heavy reporting.The server is built with Node.js, Express, and TypeScript, utilizing a modern Drizzle ORM for database interactions with a PostgreSQL database.Key FeaturesUser & Company Management: Secure authentication (/api/auth/login), user/company data retrieval.Comprehensive Salesman Reporting: Full CRUD (Create, Read, Update, Delete) operations for a wide variety of sales activities:Daily Visit Reports (DVR)Technical Visit Reports (TVR)Sales Reports & Sales OrdersCollection ReportsClient & Competition ReportsPlanning & Logistics:Permanent Journey Plans (PJP)Dealer Distribution Plans (DDP)Salesman Leave ApplicationsDealer & Brand Management:Dealer Management (Add, Update, Delete, Fetch)Brand Management & Brand-to-Dealer MappingDealer Reports & Performance ScoresReal-time & Geo-location:Salesman Attendance (Check-in / Check-out)Live Geo-Tracking via src/routes/geoTrackingRoutesIntegration with Radar.io for location services (src/integrations/radar.ts)File & Data Handling:Secure file uploads to Cloudflare R2 (/api/cloudfareRoutes/cloudfare.ts).Robust data synchronization endpoints for the mobile app (/api/dataSync/*).AI & Bot Integration:AI-powered services via src/bots/aiService.ts.Telegram Bot integration for notifications or commands (src/bots/telegramService.ts).Vector database integration with Qdrant for AI features (src/integrations/qdrant.ts).Technology StackThis project uses a modern, scalable, and type-safe technology stack.Core: Node.js, Express.js, TypeScriptDatabase:ORM: Drizzle ORM (Type-safe SQL)Database: PostgreSQL (connected via @neondatabase/serverless)Migrations: drizzle-kitFile Storage: Cloudflare R2 (via @aws-sdk/client-s3)AI & Vector Search:Qdrant (@qdrant/js-client-rest)Hugging Face (@huggingface/inference)OpenAI (openai)Location Services: Radar.io (radar-sdk-js)Real-time: Socket.ioBots: node-telegram-bot-apiBuild Tool: esbuildRuntime: tsx (for development)Project StructureThe project is organized into a modular src directory, separating concerns for scalability and maintainability..
├── src
│   ├── bots/             # AI and Telegram bot services
│   ├── db/               # Drizzle ORM setup
│   │   ├── migrations/   # Database migration files
│   │   ├── db.ts         # Drizzle client initialization
│   │   └── schema.ts     # All database table definitions
│   ├── integrations/     # Third-party API clients (Qdrant, Radar)
│   ├── routes/           # All API endpoint definitions
│   │   ├── auth.ts       # /api/auth/login
│   │   ├── users.ts      # /api/users
│   │   ├── companies.ts  # /api/companies
│   │   ├── cloudfareRoutes/
│   │   ├── dataFetchingRoutes/
│   │   ├── dataSync/
│   │   ├── deleteRoutes/
│   │   ├── formSubmissionRoutes/
│   │   ├── geoTrackingRoutes/
│   │   └── updateRoutes/
│   └── utils/
│       ├── logger.ts     # Utility functions
│       └── types.ts      # Shared TypeScript types
│
├── public/             # Static assets
├── drizzle.config.ts   # Configuration for Drizzle Kit
├── index.ts            # Server entry point (middleware, route registration)
├── package.json
└── tsconfig.json
API Endpoint CategoriesAll routes are registered in index.ts and prefixed with /api./api/auth: User login and logout./api/users, /api/companies: User and company data management./api/brands, /api/dealers, /api/dealer-brand-mapping: Brand and dealer management./api/daily-tasks, /api/pjp, /api/ddp: Planning and task routes./api/client-reports, /api/collection-reports, /api/competition-reports, /api/sales-reports, /api/sales-orders: Core reporting endpoints./api/dvr, /api/tvr: Daily and Technical Visit Reports./api/attendance: Salesman check-in and check-out./api/leave-applications: Managing leave requests./api/ratings, /api/dealer-reports-scores: Performance and rating routes./api/geo-tracking: Real-time location endpoints./api/r2-upload: Endpoints for generating pre-signed URLs for file uploads./api/data-sync: Endpoints optimized for synchronizing offline data from the mobile app.Getting StartedPrerequisitesNode.js (v20 or later recommended)npm or yarnA running PostgreSQL databaseAccess keys for Cloudflare R2, Radar.io, Qdrant, and OpenAI.1. InstallationClone the repository and install dependencies:git clone 
`https://github.com/BRIXTA-BESTCEMENT/MYSERVERbyMYCOCO`
cd myserver-project
npm install
2. Environment VariablesCreate a .env file in the root of the project. This is crucial for the application to run.# Server Configuration
PORT=8000

# Database Connection
# Example for NeonDB
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Cloudflare R2 (S3-Compatible)
R2_BUCKET_NAME="your-r2-bucket-name"
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_PUBLIC_URL="httpsGas://your-public-r2-url.com"

# Third-Party Services
RADAR_API_KEY="your-radar-api-key"
QDRANT_API_KEY="your-qdrant-api-key"
QDRANT_URL="[https://your-qdrant-cluster-url.com](https://your-qdrant-cluster-url.com)"
OPENAI_API_KEY="your-openai-api-key"

# Bot Tokens
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Security
JWT_SECRET="your-very-strong-jwt-secret"
3. Database MigrationsWith your .env file configured, run the Drizzle Kit push command to sync your schema (src/db/schema.ts) with your PostgreSQL database.npm run db:push
Note: For production, you should generate migration files (drizzle-kit generate) and run them, but db:push is fastest for development.4. Running the ServerDevelopment:Run the server with hot-reloading using tsx.npm run dev
The server will start on http://localhost:8000 (or the port specified in your .env).Production:First, build the TypeScript project into JavaScript:npm run build
Then, run the compiled output from the dist/ folder:npm run start
Available Scriptsnpm run dev: Starts the server in development mode with hot-reloading.npm run build: Compiles the TypeScript source code to JavaScript in the dist folder.npm run start: Runs the compiled production build from dist.npm run check: Runs the TypeScript compiler to check for type errors.npm run db:push: Pushes the current schema from src/db/schema.ts directly to the database (great for development).npm run upload-embeddings, npm run generate-embeddings: Custom scripts for managing AI embeddings.