import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { Response } from 'express';
import type { UploadedFile } from '@prisma/client';
import prisma from './prisma';
import { HttpError } from './workflow';
import { storageMode } from './config';

export const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
// Includes temporary ECS task-role credentials; do not override with empty keys.
export const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}) });
export const usesS3 = storageMode === 's3';
export function localFile(key: string) {
  if (!/^[a-zA-Z0-9_.\/-]+$/.test(key) || key.split('/').some(part => part === '..' || !part)) throw new HttpError(400, 'Invalid file key.');
  const file = path.resolve(uploadDir, key);
  if (!file.startsWith(path.resolve(uploadDir) + path.sep)) throw new HttpError(400, 'Invalid file key.');
  return file;
}
export async function removeFile(key: string) {
  if (usesS3) await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: key }));
  else await fs.promises.unlink(localFile(key)).catch(() => {});
}
function hasLink(value: string | null, url: string) {
  if (value === url) return true;
  try { const entries = JSON.parse(value || 'null'); return Array.isArray(entries) && entries.some(item => item?.url === url); }
  catch { return false; }
}
export async function canReadFile(file: UploadedFile, userId?: string) {
  if (file.isPublic || file.ownerId === userId) return true;
  if (!userId) return false;
  const document = await prisma.document.findFirst({ where: { fileUrl: file.fileUrl, userId: file.ownerId,
    application: { student: { userId: file.ownerId }, jobPost: { company: { userId } } } }, select: { id: true } });
  if (document) return true;
  const scope = { student: { userId: file.ownerId }, application: { student: { userId: file.ownerId }, jobPost: { company: { userId } } } };
  const [daily, weekly] = await Promise.all([
    prisma.dailyLog.findMany({ where: { ...scope, attachmentUrl: { not: null } }, select: { attachmentUrl: true } }),
    prisma.weeklyLog.findMany({ where: { ...scope, attachmentUrl: { not: null } }, select: { attachmentUrl: true } })
  ]);
  return [...daily, ...weekly].some(log => hasLink(log.attachmentUrl, file.fileUrl));
}
export async function sendFile(file: UploadedFile, res: Response) {
  res.set({ 'Content-Type': file.mimeType, 'X-Content-Type-Options': 'nosniff',
    'Cache-Control': file.isPublic ? 'public, max-age=3600' : 'private, no-store',
    'Content-Disposition': `${file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.originalName)}` });
  if (usesS3) {
    const object = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: file.key }));
    if (!object.Body) throw new HttpError(404, 'File not found.');
    await pipeline(object.Body as NodeJS.ReadableStream, res);
  } else {
    const location = localFile(file.key);
    if (!fs.existsSync(location)) throw new HttpError(404, 'File not found.');
    await pipeline(fs.createReadStream(location), res);
  }
}
