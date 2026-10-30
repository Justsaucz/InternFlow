import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function main() {
  const hr = await prisma.user.findUnique({
    where: { email: 'hr@techcorp.com' },
    include: { companyProfile: true }
  });

  console.log('HR found:', hr?.email, 'Role:', hr?.role);

  const student = await prisma.user.findUnique({
    where: { email: '6622@g.siit.tu.ac.th' },
    include: { studentProfile: true }
  });
  console.log('Student found:', student?.email, 'Role:', student?.role);

  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
  const hrToken = jwt.sign({ userId: hr!.id, email: hr!.email, role: hr!.role }, JWT_SECRET, { expiresIn: '7d' });
  const studentToken = jwt.sign({ userId: student!.id, email: student!.email, role: student!.role }, JWT_SECRET, { expiresIn: '7d' });

  // 1. HR gets applicants
  const appRes = await fetch('http://localhost:4000/api/applications/company', {
    headers: { Authorization: `Bearer ${hrToken}` }
  });
  const apps = await appRes.json();
  console.log('HR apps count:', apps.length);
  const targetApp = apps.find((a: any) => a.status === 'PENDING' || a.status === 'REVIEWING');
  console.log('Target app to schedule interview:', targetApp?.id, 'current status:', targetApp?.status);

  if (targetApp) {
    // 2. HR updates status to INTERVIEW_SCHEDULED
    const updateRes = await fetch(`http://localhost:4000/api/applications/${targetApp.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`
      },
      body: JSON.stringify({ status: 'INTERVIEW_SCHEDULED' })
    });
    const updated = await updateRes.json();
    console.log('Update result status:', updated.status);
  }

  // 3. Student gets my applications
  const studentRes = await fetch('http://localhost:4000/api/applications/my', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const myApps = await studentRes.json();
  console.log('Student apps count:', myApps.length);
  for (const a of myApps) {
    console.log(`- ${a.jobPost.title} at ${a.jobPost.company.companyName} -> status: ${a.status}`);
  }
}

main().finally(() => prisma.$disconnect());
