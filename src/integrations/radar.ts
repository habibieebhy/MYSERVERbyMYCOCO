// server/src/integrations/radar.ts
import { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/db'; // Ensure this points to your Drizzle instance
// You might want to create a table to log events, e.g., import { radarEvents } from '../db/schema';

// --- Radar API Client Configuration ---
const RADAR_SECRET_KEY = process.env.RADAR_SECRET_KEY;
const RADAR_WEBHOOK_SECRET = process.env.RADAR_WEBHOOK_SECRET;
const RADAR_API_BASE = 'https://api.radar.io/v1';

/**
 * A reusable fetch client for making authenticated requests to the Radar API.
 * This uses the secret key and should only be used on the server.
 */
async function radarApiRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
    if (!RADAR_SECRET_KEY) {
        throw new Error('RADAR_SECRET_KEY is not set in environment variables.');
    }

    const response = await fetch(`${RADAR_API_BASE}${endpoint}`, {
        method,
        headers: {
            'Authorization': RADAR_SECRET_KEY,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Radar API Error (${response.status}):`, errorData);
        throw new Error(`Radar API request failed: ${errorData.meta.message}`);
    }

    return response.json();
}

// --- Geofence Management Functions ---
interface DealerForGeofence {
    id: string;
    name: string;
    latitude: string | null; // Drizzle's numeric type is often read as a string
    longitude: string | null;
}

/**
 * Creates or updates a geofence in Radar for a given dealer.
 * Call this function from your API route whenever a dealer is created or updated.
 * @param dealer - A dealer object with id, name, latitude, and longitude.
 */
export async function createOrUpdateGeofenceForDealer(dealer: DealerForGeofence) {
    if (!dealer.latitude || !dealer.longitude) {
        console.warn(`Skipping geofence for dealer ${dealer.id} due to missing coordinates.`);
        return;
    }

    const geofencePayload = {
        description: `Geofence for ${dealer.name}`,
        type: 'circle',
        tag: 'dealer', // A category for this type of geofence
        externalId: `dealer-${dealer.id}`, // A unique ID linking it to your database record
        coordinates: [parseFloat(dealer.longitude), parseFloat(dealer.latitude)], // [longitude, latitude]
        radius: 100, // Radius in meters
    };

    try {
        // Using PUT with the externalId acts as an "upsert" (create or update)
        const endpoint = `/geofences/dealer/dealer-${dealer.id}`;
        const result = await radarApiRequest(endpoint, 'PUT', geofencePayload);
        console.log(`Successfully created/updated geofence for dealer ${dealer.id} in Radar.`);
        return result;
    } catch (error) {
        console.error(`Failed to create/update Radar geofence for dealer ${dealer.id}:`, error);
    }
}

/**
 * Deletes a geofence from Radar.
 * Call this function from your API route whenever a dealer is deleted.
 * @param dealerId - The ID of the dealer whose geofence should be removed.
 */
export async function deleteGeofenceForDealer(dealerId: string) {
    try {
        const endpoint = `/geofences/dealer/dealer-${dealerId}`;
        await radarApiRequest(endpoint, 'DELETE');
        console.log(`Successfully deleted geofence for dealer ${dealerId} from Radar.`);
    } catch (error) {
        console.error(`Failed to delete Radar geofence for dealer ${dealerId}:`, error);
    }
}


// --- Webhook Handler ---

/**
 * Verifies the signature of an incoming webhook from Radar to ensure it's authentic.
 */
function verifyRadarWebhook(req: Request): boolean {
    const signature = req.headers['x-radar-signature'] as string;
    if (!signature || !RADAR_WEBHOOK_SECRET) {
        console.warn('Cannot verify Radar webhook: Missing signature or webhook secret.');
        return false;
    }

    const [timestampPart, hashPart] = signature.split(',');
    if (!timestampPart || !hashPart) return false;
    
    const timestamp = timestampPart.split('=')[1];
    const hash = hashPart.split('=')[1];
    
    const signedPayload = `${timestamp}.${JSON.stringify(req.body)}`;

    const expectedHash = crypto
        .createHmac('sha256', RADAR_WEBHOOK_SECRET)
        .update(signedPayload)
        .digest('hex');
    
    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    } catch {
        return false;
    }
}

/**
 * Sets up an Express route to handle incoming webhooks from Radar.
 */
export function setupRadarRoutes(app: Express) {
    // This endpoint must be publicly accessible for Radar to reach it.
    app.post('/api/webhooks/radar', async (req: Request, res: Response) => {
        if (!verifyRadarWebhook(req)) {
            console.error('Failed Radar webhook verification from IP:', req.ip);
            return res.status(401).send('Unauthorized');
        }

        const { events, user } = req.body;
        console.log(`Received ${events.length} event(s) for user ${user?._id}`);

        for (const event of events) {
            console.log(`- Event type: ${event.type} at ${event.createdAt}`);
            
            // Example: Log when a salesman enters a dealer's geofence
            if (event.type === 'user.entered_geofence' && event.geofence.tag === 'dealer') {
                const dealerId = event.geofence.externalId.replace('dealer-', '');
                console.log(`User ${user?._id} entered geofence for dealer ${dealerId}. Confidence: ${event.confidence}`);
                // TODO: Log this event to your own database for auditing.
                // e.g., await db.insert(radarEvents).values({ ... });
            }

            // Example: Update your PJP status when a trip is completed
            if (event.type === 'trip.completed') {
                const pjpId = event.trip.externalId;
                console.log(`Trip for PJP ${pjpId} was completed by user ${user?._id}.`);
                // TODO: Update the PJP status in your database to 'completed'.
                // e.g., await db.update(pjps).set({ status: 'completed' }).where(eq(pjps.id, pjpId));
            }
        }
        
        res.status(200).send('Webhook received successfully.');
    });

    console.log('✅ Radar webhook endpoint setup complete at /api/webhooks/radar');
}
