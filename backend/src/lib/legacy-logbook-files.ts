import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import type { Response } from 'express';
import prisma from './prisma';
import { allowedOrigins } from './config';
import { s3, usesS3, uploadDir } from './file-storage';
import { HttpError, placementStatuses } from './workflow';

// Flat paths belong to the old logbook uploader. Modern nested uploads still
// require UploadedFile ownership metadata and never use this fallback.
export function legacyLogbookPath(value: string): string | null {
  let pathname = value;
  if (!value.startsWith('/')) {
    try {
      const url = new URL(value);
      const origins = [...allowedOrigins, process.env.API_PUBLIC_URL,
        `http://localhost:${process.env.PORT || 4000}`, `http://127.0.0.1:${process.env.PORT || 4000}`];
      if (!origins.includes(url.origin) || url.username || url.password || url.search || url.hash) return null;
      pathname = url.pathname;
    } catch { return null; }
  }
  return /^\/(?:private-uploads|uploads)\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:pdf|png|jpe?g|webp|docx?|zip)$/i.test(pathname) ? pathname : null;
}

function linkedUrls(value: string | null): string[] {
  if (!value) return [];
  try {
    const entries = JSON.parse(value);
    if (Array.isArray(entries)) return entries.map(entry => typeof entry === 'string' ? entry : entry?.url).filter(value => typeof value === 'string');
  } catch { /* Old entries can contain a single URL or newline-separated URLs. */ }
  return value.split('\n').map(value => value.trim()).filter(Boolean);
}

export async function canReadLegacyLogbookFile(value: string, userId: string, ownerOnly = false) {
  const key = legacyLogbookPath(value);
  if (!key) return false;
  const where = { attachmentUrl: { contains: path.basename(key) } };
  const include = {
    student: { select: { userId: true } },
    application: { select: { studentId: true, status: true, jobPost: { select: { company: { select: { userId: true } } } } } }
  };
  const [daily, weekly] = await Promise.all([
    prisma.dailyLog.findMany({ where, include }), prisma.weeklyLog.findMany({ where, include })
  ]);
  const logs = [...daily, ...weekly].filter(log => linkedUrls(log.attachmentUrl).some(url => legacyLogbookPath(url) === key));
  const owners = new Set(logs.map(log => log.student.userId));
  // Conflicting legacy ownership must fail closed rather than grant access.
  if (owners.size !== 1) return false;
  if (owners.has(userId)) return true;
  return !ownerOnly && logs.some(log => log.application?.studentId === log.studentId &&
    placementStatuses.includes(log.application.status) && log.application.jobPost.company.userId === userId);
}

export async function sendLegacyLogbookFile(value: string, res: Response) {
  const key = legacyLogbookPath(value);
  if (!key) throw new HttpError(404, 'File not found or access denied.');
  const types: Record<string, string> = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.zip': 'application/zip' };
  const name = path.basename(key), mime = types[path.extname(name).toLowerCase()];
  let stream: NodeJS.ReadableStream;
  if (usesS3) {
    try {
      const object = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: key.slice(1) }));
      if (!object.Body) throw new HttpError(404, 'File not found.');
      stream = object.Body as NodeJS.ReadableStream;
    } catch (error: any) {
      if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) throw new HttpError(404, 'File not found.');
      throw error;
    }
  } else {
    const root = key.startsWith('/private-uploads/') ? process.env.PRIVATE_UPLOAD_DIR || path.resolve(__dirname, '../../private-uploads') : uploadDir;
    const file = path.join(root, name);
    try { if (!(await fs.promises.stat(file)).isFile()) throw new Error(); }
    catch { throw new HttpError(404, 'File not found.'); }
    stream = fs.createReadStream(file);
  }
  res.set({ 'Content-Type': mime, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store',
    'Content-Disposition': `${mime.startsWith('image/') || mime === 'application/pdf' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name)}` });
  await pipeline(stream, res);
}
