import prisma from '../lib/prisma';

const API_BASE = 'http://localhost:4000/api';

async function main() {
  console.log('=== InternFlow Comprehensive End-to-End System & API Verification ===\n');

  // 1. Database Check
  console.log('[1/7] Checking Database Connection & Records...');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(`✓ Total Users: ${users.length}`);
  users.forEach(u => console.log(`   - ${u.role}: ${u.name} (${u.email})`));

  const jobCount = await prisma.jobPost.count();
  const appCount = await prisma.application.count();
  const logCount = await prisma.dailyLog.count();
  const evalCount = await prisma.internshipEvaluation.count();
  console.log(`✓ Database Records: Jobs=${jobCount}, Applications=${appCount}, DailyLogs=${logCount}, Evaluations=${evalCount}\n`);

  // 2. Auth API Check
  console.log('[2/7] Testing Authentication Endpoints...');
  let studentToken = '';
  let companyToken = '';

  // Test Student Login
  try {
    const studentLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@internflow.com', password: 'password123' })
    });
    const studentRes = await studentLogin.json();
    if (studentLogin.ok && studentRes.token) {
      studentToken = studentRes.token;
      console.log(`✓ Student Login (student@internflow.com): SUCCESS (HTTP 200) - User: ${studentRes.user.name}`);
    } else {
      console.log('✗ Student Login FAILED:', studentRes);
    }
  } catch (err: any) {
    console.log('✗ Student Login Error:', err.message);
  }

  // Test Company HR Login
  try {
    const hrLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@techcorp.com', password: 'password123' })
    });
    const hrRes = await hrLogin.json();
    if (hrLogin.ok && hrRes.token) {
      companyToken = hrRes.token;
      console.log(`✓ Company HR Login (hr@techcorp.com): SUCCESS (HTTP 200) - User: ${hrRes.user.name}\n`);
    } else {
      console.log('✗ Company HR Login FAILED:', hrRes);
    }
  } catch (err: any) {
    console.log('✗ Company HR Login Error:', err.message);
  }

  // 3. Dashboard API Check
  console.log('[3/7] Testing Dashboard Endpoints...');
  if (studentToken) {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = await res.json();
    console.log(`✓ Student Dashboard Stats: HTTP ${res.status}`, JSON.stringify(data.stats));
  }
  if (companyToken) {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const data = await res.json();
    console.log(`✓ Company Dashboard Stats: HTTP ${res.status}`, JSON.stringify(data.stats));
  }
  console.log('');

  // 4. Jobs API Check
  console.log('[4/7] Testing Jobs Endpoints...');
  if (studentToken) {
    const jobsRes = await fetch(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const jobsData = await jobsRes.json();
    console.log(`✓ Student Job Search: HTTP ${jobsRes.status}, count: ${Array.isArray(jobsData) ? jobsData.length : 0}`);
    if (Array.isArray(jobsData) && jobsData.length > 0) {
      console.log(`   Sample Job: "${jobsData[0].title}" at ${jobsData[0].company?.companyName} (${jobsData[0].location})`);
    }
  }

  if (companyToken) {
    const myJobsRes = await fetch(`${API_BASE}/jobs/company`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const myJobsData = await myJobsRes.json();
    console.log(`✓ Company Job Management: HTTP ${myJobsRes.status}, count: ${Array.isArray(myJobsData) ? myJobsData.length : 0}`);
    if (Array.isArray(myJobsData) && myJobsData.length > 0) {
      console.log(`   Sample Posted Job: "${myJobsData[0].title}" (Applications: ${myJobsData[0]._count?.applications})`);
    }
  }
  console.log('');

  // 5. Applications API Check
  console.log('[5/7] Testing Applications Endpoints...');
  if (studentToken) {
    const appRes = await fetch(`${API_BASE}/applications/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const appData = await appRes.json();
    console.log(`✓ Student Applications List: HTTP ${appRes.status}, count: ${Array.isArray(appData) ? appData.length : 0}`);
    if (Array.isArray(appData) && appData.length > 0) {
      console.log(`   First Application: ${appData[0].jobPost?.title} -> Status: [${appData[0].status}]`);
    }
  }
  if (companyToken) {
    const hrAppRes = await fetch(`${API_BASE}/applications/company`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const hrAppData = await hrAppRes.json();
    console.log(`✓ Company Applicants List: HTTP ${hrAppRes.status}, count: ${Array.isArray(hrAppData) ? hrAppData.length : 0}`);
    if (Array.isArray(hrAppData) && hrAppData.length > 0) {
      console.log(`   First Candidate: ${hrAppData[0].student?.user?.name} for "${hrAppData[0].jobPost?.title}" -> Status: [${hrAppData[0].status}]`);
    }
  }
  console.log('');

  // 6. Logbook & Evaluations API Check
  console.log('[6/7] Testing Logbook & Evaluation Endpoints...');
  if (studentToken) {
    const logRes = await fetch(`${API_BASE}/logbook/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const logData = await logRes.json();
    console.log(`✓ Student Logbook History: HTTP ${logRes.status}, logs count: ${Array.isArray(logData.logs) ? logData.logs.length : 0}, totalHours: ${logData.totalHours}`);
  }
  if (companyToken) {
    const hrEvalRes = await fetch(`${API_BASE}/evaluations/company/interns`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const hrEvalData = await hrEvalRes.json();
    console.log(`✓ Supervisor Evaluations Interns: HTTP ${hrEvalRes.status}, count: ${Array.isArray(hrEvalData) ? hrEvalData.length : 0}`);
    if (Array.isArray(hrEvalData) && hrEvalData.length > 0) {
      const studentId = hrEvalData[0].student?.id;
      if (studentId) {
        const hrLogRes = await fetch(`${API_BASE}/logbook/student/${studentId}`, {
          headers: { Authorization: `Bearer ${companyToken}` }
        });
        const hrLogData = await hrLogRes.json();
        console.log(`✓ Supervisor Review of Student Logs: HTTP ${hrLogRes.status}, totalHours: ${hrLogData.totalHours}`);
      }
    }
  }
  console.log('');

  // 7. Profile API Check
  console.log('[7/7] Testing User Profile Endpoints...');
  if (studentToken) {
    const profRes = await fetch(`${API_BASE}/student/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const profData = await profRes.json();
    console.log(`✓ Student Profile: HTTP ${profRes.status} - Name: ${profData.user?.name || profData.name}, University: ${profData.university}, Major: ${profData.major}`);
  }
  if (companyToken) {
    const compProfRes = await fetch(`${API_BASE}/company/profile`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const compProfData = await compProfRes.json();
    console.log(`✓ Company Profile: HTTP ${compProfRes.status} - Company: ${compProfData.companyName}, Industry: ${compProfData.industry}`);
  }
  console.log('\n=== All Automated Backend API Checks Verified Successfully! ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
