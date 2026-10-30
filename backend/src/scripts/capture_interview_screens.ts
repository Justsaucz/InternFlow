import { chromium } from 'playwright';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\deb3c21e-565a-4dfe-8f40-9e00043205d4';

async function main() {
  console.log('📸 Launching Chromium to capture interview stage screenshots...');
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

  const hr = await prisma.user.findUnique({ where: { email: 'hr@techcorp.com' } });
  const student = await prisma.user.findUnique({ where: { email: '6622@g.siit.tu.ac.th' } });

  const hrToken = jwt.sign({ userId: hr!.id, email: hr!.email, role: hr!.role }, JWT_SECRET, { expiresIn: '7d' });
  const studentToken = jwt.sign({ userId: student!.id, email: student!.email, role: student!.role }, JWT_SECRET, { expiresIn: '7d' });

  const browser = await chromium.launch({ headless: true });
  
  // 1. Company HR Applicants View
  const hrContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const hrPage = await hrContext.newPage();
  await hrPage.goto('http://localhost:3000/login');
  await hrPage.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: hrToken, user: { id: hr!.id, email: hr!.email, name: hr!.name, role: hr!.role } });

  await hrPage.goto('http://localhost:3000/dashboard/company/applicants');
  await hrPage.waitForSelector('text=ผู้สมัครและนักศึกษาฝึกงานในความดูแล');
  await hrPage.waitForTimeout(1000);
  const hrScreenPath = path.join(ARTIFACT_DIR, 'company_applicants_interview.png');
  await hrPage.screenshot({ path: hrScreenPath, fullPage: true });
  console.log('✓ Captured HR applicants view:', hrScreenPath);

  // 2. Student My Applications View
  const studentContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const studentPage = await studentContext.newPage();
  await studentPage.goto('http://localhost:3000/login');
  await studentPage.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: studentToken, user: { id: student!.id, email: student!.email, name: student!.name, role: student!.role } });

  await studentPage.goto('http://localhost:3000/dashboard/applications');
  await studentPage.waitForSelector('text=การสมัครฝึกงานของฉัน');
  await studentPage.waitForTimeout(1000);
  const studentScreenPath = path.join(ARTIFACT_DIR, 'student_applications_interview.png');
  await studentPage.screenshot({ path: studentScreenPath, fullPage: true });
  console.log('✓ Captured student applications view:', studentScreenPath);

  await browser.close();
  console.log('🎉 All screenshots captured successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
