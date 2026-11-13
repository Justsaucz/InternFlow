import type { Prisma } from '@prisma/client';
import { HttpError } from './workflow';
import { canReadLegacyLogbookFile } from './legacy-logbook-files';

export function attachmentLinks(value: unknown): { title: string; url: string }[] {
  if (value == null || value === '') return [];
  if (typeof value !== 'string' || value.length > 30000) throw new HttpError(400, 'Invalid attachments.');
  let entries: unknown;
  try { entries = JSON.parse(value); } catch { entries = value.split('\n').filter(Boolean); }
  if (!Array.isArray(entries) || entries.length > 20) throw new HttpError(400, 'Use up to 20 attachments.');
  return entries.map(entry => {
    const url = typeof entry === 'string' ? entry.trim() : typeof entry?.url === 'string' ? entry.url.trim() : '';
    const title = typeof entry?.title === 'string' ? entry.title.trim() : 'Artifact';
    if (!url || url.length > 2000 || title.length > 300 || (!/^https?:\/\//i.test(url) && !/^\/(?:uploads|private-uploads)\/[a-zA-Z0-9_./-]+$/.test(url))) throw new HttpError(400, 'Attachments must use HTTP(S) links or uploaded files.');
    if (url.startsWith('/') && url.split('/').some((part: string) => part === '..')) throw new HttpError(400, 'Invalid attachment path.');
    try { if (!url.startsWith('/')) { const parsed = new URL(url); if (parsed.username || parsed.password) throw new Error(); } } catch { throw new HttpError(400, 'Invalid attachment URL.'); }
    return { title, url };
  });
}

export async function validateAttachments(tx: Prisma.TransactionClient, value: unknown, userId: string) {
  const links = attachmentLinks(value);
  for (const link of links) {
    if (link.url.startsWith('/private-uploads/')) {
      if (!await canReadLegacyLogbookFile(link.url, userId, true)) throw new HttpError(400, 'Use your own logbook file upload.');
      continue;
    }
    let key = link.url.startsWith('/uploads/') ? link.url : null;
    try { const url = new URL(link.url); if (['localhost','127.0.0.1'].includes(url.hostname) && url.pathname.startsWith('/uploads/')) key = url.pathname; } catch { /* relative */ }
    const file = await tx.uploadedFile.findUnique({ where: { fileUrl: key || link.url } });
    if (key || file) {
      if (!file || file.ownerId !== userId || file.isPublic) throw new HttpError(400, 'Use your own private attachment upload.');
      link.url = file.fileUrl;
    }
  }
  return links.length ? JSON.stringify(links) : null;
}
