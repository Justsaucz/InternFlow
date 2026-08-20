import { Router, Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure AWS S3 Client
// In production, ensure these environment variables are set.
const s3Config = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Create Multer-S3 Storage
const s3Storage = multerS3({
  s3: s3Config,
  bucket: process.env.S3_BUCKET_NAME || 'internflow-bucket',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to avoid S3 issues with special characters
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `uploads/${uniqueSuffix}-${safeOriginalName}`);
  }
});

// Mock Storage Fallback for local testing if AWS keys are not provided
import path from 'path';
import fs from 'fs';
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Determine which storage to use
const isAwsConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET_NAME;
const upload = multer({ 
  storage: isAwsConfigured ? s3Storage : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', authenticate, upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let fileUrl = '';
    
    // Type casting to handle both multer-s3 and local multer types
    if (isAwsConfigured && (req.file as any).location) {
      // S3 File
      fileUrl = (req.file as any).location;
    } else {
      // Local File
      fileUrl = `/uploads/${req.file.filename}`;
    }
    
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error during file upload' });
  }
});

export default router;
