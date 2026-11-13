import { Router, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { HttpError, handleRouteError } from '../lib/workflow';
import { s3, usesS3, uploadDir, localFile, removeFile, canReadFile, sendFile } from '../lib/file-storage';
import { canReadLegacyLogbookFile, sendLegacyLogbookFile } from '../lib/legacy-logbook-files';

const router = Router();
function prefix(req: AuthRequest) {
  return `uploads/${req.body.purpose === 'profile-image' ? 'public' : 'private'}/${req.user!.userId}`;
}
const storage = usesS3 ? multerS3({ s3, bucket: process.env.S3_BUCKET_NAME!, contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => cb(null, `${prefix(req as AuthRequest)}/${randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }) : multer.diskStorage({
  destination: (req, _file, cb) => {
    const directory = path.dirname(localFile(prefix(req as AuthRequest) + '/placeholder'));
    fs.mkdirSync(directory, { recursive: true }); cb(null, directory);
  }, filename: (_req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname).toLowerCase())
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed: Record<string, string[]> = { '.pdf':['application/pdf'],'.doc':['application/msword'],
    '.docx':['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'],
    '.zip':['application/zip','application/x-zip-compressed'],'.png':['image/png'],'.jpg':['image/jpeg'],'.jpeg':['image/jpeg'],'.webp':['image/webp'] };
  if (!allowed[path.extname(file.originalname).toLowerCase()]?.includes(file.mimetype) ||
      (req.body.purpose === 'profile-image' && !file.mimetype.startsWith('image/'))) {
    cb(new Error('Unsupported file type. Profile images must be PNG, JPEG, or WEBP.')); return;
  }
  cb(null, true);
} });
router.post('/', authenticate, (req, res, next) => upload.single('file')(req, res, error => {
  if (error) { res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'File size must be under 5MB.' : 'Unsupported or invalid file upload.' }); return; }
  next();
}), async (req: AuthRequest, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const file = req.file as Express.Multer.File & { key?: string };
  const storageKey = usesS3 ? file.key! : path.relative(uploadDir, file.path).split(path.sep).join('/');
  const fileUrl = '/uploads/' + storageKey;
  // Multipart fields can arrive after the file. Recheck visibility after all
  // parts have been read so a late purpose field cannot publish a document.
  if (req.body.purpose === 'profile-image' && !file.mimetype.startsWith('image/')) {
    await removeFile(storageKey).catch(() => {});
    res.status(400).json({ error: 'Profile images must be PNG, JPEG, or WEBP.' }); return;
  }
  try {
    await prisma.uploadedFile.create({ data: { key: storageKey, fileUrl, ownerId: req.user!.userId,
      isPublic: req.body.purpose === 'profile-image', mimeType: file.mimetype, originalName: path.basename(file.originalname) } });
    res.json({ url: fileUrl, fileUrl });
  } catch (error) {
    await removeFile(storageKey).catch(() => {});
    handleRouteError(res, error, 'Failed to store file metadata.');
  }
});
router.get('/content', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const url = typeof req.query.url === 'string' ? req.query.url : '';
    const file = await prisma.uploadedFile.findUnique({ where: { fileUrl: url } });
    if (file) {
      if (!await canReadFile(file, req.user!.userId)) throw new HttpError(404, 'File not found or access denied.');
      await sendFile(file, res);
    } else {
      if (!await canReadLegacyLogbookFile(url, req.user!.userId)) throw new HttpError(404, 'File not found or access denied.');
      await sendLegacyLogbookFile(url, res);
    }
  } catch (error) {
    if (!res.headersSent) handleRouteError(res, error, 'Failed to read file.'); else res.destroy();
  }
});
export const uploadedFiles = Router();
uploadedFiles.get('/*key', async (req, res) => {
  try {
    const parts = req.params.key;
    const key = Array.isArray(parts) ? parts.join('/') : String(parts);
    const file = await prisma.uploadedFile.findUnique({ where: { key } });
    if (!file?.isPublic) throw new HttpError(404, 'File not found.');
    await sendFile(file, res);
  } catch (error) {
    if (!res.headersSent) handleRouteError(res, error, 'Failed to read image.'); else res.destroy();
  }
});
export default router;
