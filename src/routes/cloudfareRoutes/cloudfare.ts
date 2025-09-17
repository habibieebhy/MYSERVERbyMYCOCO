// server/src/routes/r2Uploads.ts
import { Request, Response, Express } from 'express';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Pool } from 'pg';
import crypto from 'crypto';

const {
    R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_URL, NEON_DATABASE_URL,
} = process.env;

if (!R2_ACCOUNT_ID || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL || !NEON_DATABASE_URL) {
    console.error('Missing required ENV vars.');
    process.exit(1);
}

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const pgPool = new Pool({ connectionString: NEON_DATABASE_URL });

function deliveryUrlFor(imageId: string) {
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${imageId}`;
}

// ====================================================================
// ✨ 1. NEW REUSABLE FUNCTION
// This function contains the core logic and can be called from anywhere.
// ====================================================================
export async function generatePresignedUpload(
    formType: string,
    userId: number,
    metadata: object = {}
) {
    const allowed = ['attendance-in', 'attendance-out', 'dvr', 'tvr'];
    if (!formType || !allowed.includes(formType)) {
        throw new Error('INVALID_FORM_TYPE');
    }

    const imageId = crypto.randomUUID();
    const fullMetadata = { ...metadata, userId, formType };

    // Get the presigned URL from R2/S3
    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: imageId });
    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

    // Save the initial record to the database
    const client = await pgPool.connect();
    try {
        await client.query(
            `INSERT INTO uploads (image_id, user_id, form_type, status, metadata)
              VALUES ($1,$2,$3,$4,$5)`,
            [imageId, userId, formType, 'draft', JSON.stringify(fullMetadata)]
        );
    } finally {
        client.release();
    }

    return { uploadUrl, imageId };
}


export default function setupR2UploadsRoutes(app: Express) {
    // ====================================================================
    // ✨ 2. SIMPLIFIED ROUTE HANDLER
    // This endpoint now calls the reusable function.
    // ====================================================================
    app.post('/api/uploads/direct', async (req: Request, res: Response) => {
        try {
            const userId = 1; // Hardcoded user
            const { formType, metadata = {} } = req.body || {};

            const result = await generatePresignedUpload(formType, userId, metadata);

            return res.json(result);
        } catch (err: any) {
            console.error('POST /api/uploads/direct error', err);
            // Handle specific known error from our function
            if (err.message === 'INVALID_FORM_TYPE') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: 'URL_GENERATION_FAILED', detail: String(err) });
        }
    });

    // Other GET routes remain unchanged...
    //app.get('/api/uploads/:imageId', async (req, res) => { /* ... existing code ... */ });
    //app.get('/api/uploads/deliver/:imageId', async (req, res) => { /* ... existing code ... */ });

    // ====================================================================
    // ✨ 3. NEW TEST ENDPOINT
    // A simple endpoint to verify the server is running and DB is connected.
    // ====================================================================
    app.get('/api/test', async (req: Request, res: Response) => {
        try {
            const client = await pgPool.connect();
            try {
                // Query the current time from the database
                const result = await client.query('SELECT now()');
                return res.json({
                    status: 'ok',
                    message: 'Server is running and database connection is successful.',
                    db_time: result.rows[0].now,
                });
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('GET /api/test error', err);
            return res.status(500).json({
                status: 'error',
                message: 'Server is running, but database connection failed.',
                detail: String(err),
            });
        }
    });

    console.log('✅ Cloudflare R2 upload routes registered (NO AUTH)');
    console.log('  -> Test endpoint available at GET /api/test');
}