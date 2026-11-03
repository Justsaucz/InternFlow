import prisma from '../lib/prisma';
import { usesS3, localFile } from '../lib/file-storage';
import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const candidates = new Map<string, { owners: Set<string>; profile: boolean; private: boolean }>();
function add(url: string | null, owner: string, profile = false) {
  if (!url) return;
  const item = candidates.get(url) || { owners: new Set<string>(), profile: false, private: false };
  item.owners.add(owner); if (profile) item.profile = true; else item.private = true;
  candidates.set(url, item);
}
function keyFor(url: string) {
  if (url.startsWith('/uploads/')) return url.slice('/uploads/'.length);
  try {
    const parsed = new URL(url), bucket = process.env.S3_BUCKET_NAME;
    if (!bucket || !usesS3) return null;
    if (parsed.protocol === 'https:' && parsed.hostname.startsWith(bucket+'.s3.') && parsed.hostname.endsWith('.amazonaws.com')) return decodeURIComponent(parsed.pathname.slice(1));
  } catch { /* external link or invalid URL */ }
  return null;
}
const types: Record<string,string> = { '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.pdf':'application/pdf','.doc':'application/msword','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.zip':'application/zip' };
async function main() {
  const [users, students, companies, docs, daily, weekly] = await Promise.all([
    prisma.user.findMany(), prisma.studentProfile.findMany(), prisma.companyProfile.findMany(), prisma.document.findMany(),
    prisma.dailyLog.findMany({include:{student:true}}), prisma.weeklyLog.findMany({include:{student:true}})
  ]);
  users.forEach(u=>add(u.avatarUrl,u.id,true)); students.forEach(s=>add(s.avatarUrl,s.userId,true));
  companies.forEach(c=>add(c.logoUrl,c.userId,true)); docs.forEach(d=>add(d.fileUrl,d.userId));
  for(const log of [...daily,...weekly]) {
    if(!log.attachmentUrl)continue;
    try { const entries=JSON.parse(log.attachmentUrl); if(Array.isArray(entries)) entries.forEach(e=>add(e?.url,log.student.userId)); }
    catch { add(log.attachmentUrl,log.student.userId); }
  }
  let imported=0, skipped=0, ambiguous=0;
  for(const [fileUrl, candidate] of candidates) {
    const key=keyFor(fileUrl);if(!key){skipped++;continue;}
    if(candidate.owners.size!==1){ambiguous++;continue;}
    if(await prisma.uploadedFile.findFirst({where:{OR:[{key},{fileUrl}]}})){skipped++;continue;}
    const ext=path.extname(key).toLowerCase(),mimeType=types[ext];
    if(!mimeType){skipped++;continue;}
    try { if(!usesS3&&!fs.existsSync(localFile(key))){skipped++;continue;} } catch {skipped++;continue;}
    if(apply)await prisma.uploadedFile.create({data:{key,fileUrl,ownerId:[...candidate.owners][0],isPublic:candidate.profile&&!candidate.private&&mimeType.startsWith('image/'),mimeType,originalName:path.basename(key)}});
    imported++;
  }
  console.log(JSON.stringify({mode:apply?'apply':'dry-run',eligible:imported,skipped,ambiguous}));
}
main().catch(()=>{console.error('Upload backfill failed; check schema and storage configuration.');process.exitCode=1;}).finally(()=>prisma.$disconnect());
