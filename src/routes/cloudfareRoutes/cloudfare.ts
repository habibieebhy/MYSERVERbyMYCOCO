import { Express, Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

// --- Load Environment Variables ---
const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL 
} = process.env;

// --- S3 Client for R2 ---
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

// --- Multer for File Handling ---
const upload = multer({
  storage: multer.memoryStorage(),
});

// --- The Upload Route ---
export default function setupR2Upload(app: Express) {
  app.post("/api/r2/upload-direct", upload.single('file'), async (req: Request, res: Response) => {
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file was uploaded." });
    }

    try {
      console.log(`Received file: ${req.file.originalname}. Starting upload to R2...`);
      const objectKey = `${Date.now()}-${req.file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3.send(command);
      console.log(`Successfully uploaded ${objectKey} to bucket ${R2_BUCKET_NAME}.`);

      const publicUrl = `${R2_PUBLIC_URL}/${objectKey}`;

      return res.json({
        success: true,
        publicUrl: publicUrl
      });

    } catch (err: any) {
      console.error("--- R2 UPLOAD FAILED ---");
      console.error(err); // Log the full error object
      console.error("--- END OF ERROR ---");
      return res.status(500).json({ success: false, error: err.message || "Upload failed due to an unknown error." });
    }
  });
} 