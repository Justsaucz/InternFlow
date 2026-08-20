"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Configure AWS S3 Client
// In production, ensure these environment variables are set.
const s3Config = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
// Create Multer-S3 Storage
const s3Storage = (0, multer_s3_1.default)({
    s3: s3Config,
    bucket: process.env.S3_BUCKET_NAME || 'internflow-bucket',
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const localStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Determine which storage to use
const isAwsConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET_NAME;
const upload = (0, multer_1.default)({
    storage: isAwsConfigured ? s3Storage : localStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
router.post('/', auth_1.authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        let fileUrl = '';
        // Type casting to handle both multer-s3 and local multer types
        if (isAwsConfigured && req.file.location) {
            // S3 File
            fileUrl = req.file.location;
        }
        else {
            // Local File
            fileUrl = `/uploads/${req.file.filename}`;
        }
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error during file upload' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map