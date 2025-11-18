│
├── backend/
│   ├── src/
│   │   ├── routes/              # Hono router definitions (the "API layer")
│   │   │   ├── dataFetchingRoutes/ # All GET requests
│   │   │   ├── dataSync/           # Routes for Tally, etc.
│   │   │   ├── deleteRoutes/       # All DELETE requests
│   │   │   ├── formSubmissionRoutes/ # All POST requests
│   │   │   ├── updateRoutes/       # All PATCH/PUT requests
│   │   │   ├── geoTrackingRoutes/  # Routes for live location
│   │   │   ├── cloudfareRoutes/    # Routes for R2 upload
│   │   │   ├── auth.ts             # TSO/Employee login
│   │   │   └── authFirebase.ts     # Mason/Contractor login
│   │   │
│   │   ├── controllers/         # (Standard) Logic handlers called by routes
│   │   ├── services/            # (Standard) Business logic separated from routes
│   │   │
│   │   ├── db/
│   │   │   ├── migrations/       # Drizzle migration SQL files
│   │   │   ├── db.ts             # Drizzle client instance
│   │   │   ├── schema.ts         # (The Drizzle schema file)
│   │   │   ├── seed.ts           # Script to populate test data
│   │   │   └── storage.ts        # Cloudflare R2 connection logic
│   │   │
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts    # JWT validation for Masons
│   │   │   └── tsoAuth.ts        # JWT validation for TSOs/Admins
│   │   │
│   │   ├── utils/
│   │   │   └── pointsCalcLogic.ts # Complex logic for calculating points
│   │   │
│   │   ├── integrations/
│   │   │   ├── qdrant.ts         # Qdrant vector DB client
│   │   │   └── radar.ts          # Radar.io geofencing client
│   │   │
│   │   ├── firebase/
│   │   │   └── admin.ts          # Firebase Admin SDK setup
│   │   │
│   │   └── bots/
│   │       ├── aiService.ts      # AI/LLM logic
│   │       └── telegramService.ts# Telegram bot integration
│   │
│   ├── tests/                 # (Standard) Jest/Vitest tests
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
└── README.md                  # Main project README
```