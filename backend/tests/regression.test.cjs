// Runs HTTP regressions against an empty, disposable PostgreSQL database.
// Never resets or seeds the database configured for the application.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const net = require('node:net');
const fs = require('node:fs');
const os = require('node:os');
const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'internflow-upload-test-'));
const privateUploadRoot = path.join(uploadRoot, 'private');
fs.mkdirSync(privateUploadRoot);
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

const cwd = path.join(__dirname, '..');
const dbName = 'internflow_test_' + randomBytes(8).toString('hex');
const dbUrl = new URL(process.env.DATABASE_URL);
const admin = new Pool({ connectionString: dbUrl.href });
dbUrl.pathname = '/' + dbName;
let db, server, base, serverLog = '', password;
const tokens = {};

async function api(method, url, actor, body) {
  const response = await fetch(base + url, {
    method, headers: { ...(actor ? { Authorization: 'Bearer ' + tokens[actor] } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  return { status: response.status, body: await response.json() };
}

async function user(id, role = 'STUDENT') {
  await db.query('INSERT INTO "User" (id,email,password,name,role,"updatedAt") VALUES ($1,$2,$3,$1,$4,NOW())', ['u-' + id, id + '@test.invalid', password, role]);
  if (role === 'STUDENT') {
    await db.query('INSERT INTO "StudentProfile" (id,"userId",skills,gpa) VALUES ($1,$2,$3,3.5)', [id, 'u-' + id, ['React']]);
  } else {
    await db.query('INSERT INTO "CompanyProfile" (id,"userId","companyName",industry) VALUES ($1,$2,$1,$3)', [id, 'u-' + id, 'Software']);
  }
  const login = await api('POST', '/api/auth/login', null, { email: id + '@test.invalid', password: 'password123' });
  assert.equal(login.status, 200);
  tokens[id] = login.body.token;
}

async function job(id, company, active = true) {
  await db.query('INSERT INTO "JobPost" (id,"companyProfileId",title,description,requirements,location,"updatedAt","isActive") VALUES ($1,$2,$1,$3,$3,$4,NOW(),$5)', [id, company, 'React TypeScript engineering', 'Bangkok', active]);
}
async function application(id, student, jobId, status) {
  await db.query('INSERT INTO "Application" (id,"studentId","jobPostId",status,"updatedAt") VALUES ($1,$2,$3,$4,NOW())', [id, student, jobId, status]);
}
async function log(id, student, applicationId, day, approved = false) {
  await db.query('INSERT INTO "DailyLog" (id,"studentId","applicationId","logDate","tasksDone",learnings,"mentorApproved","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())', [id, student, applicationId, day, '["Original task"]', 'Testing', approved]);
}
const logBody = (id, day = '2026-10-01') => ({ id, logDate: day, weekNumber: 1, hoursWorked: 8, workModality: 'ON_SITE', tasksDone: '["Changed task"]', learnings: 'Learned something' });

before(async () => {
  assert.match(dbName, /^internflow_test_[a-f0-9]{16}$/);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL).hostname), 'Regression runner requires a local PostgreSQL server.');
  await admin.query('CREATE DATABASE "' + dbName + '"');
  db = new Pool({ connectionString: dbUrl.href });
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push'], { cwd, env: { ...process.env, DATABASE_URL: dbUrl.href }, stdio: 'pipe', timeout: 60000 });
  const listener = net.createServer();
  await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  base = 'http://127.0.0.1:' + port;
  server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'src/index.ts'], { cwd, env: { ...process.env, DATABASE_URL: dbUrl.href, PORT: String(port), UPLOAD_DIR: uploadRoot, PRIVATE_UPLOAD_DIR: privateUploadRoot, STORAGE_MODE: 'local', READINESS_PROCESSOR_DISABLED: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => serverLog += chunk);
  server.stderr.on('data', chunk => serverLog += chunk);
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base + '/api/health')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, serverLog);
  password = await bcrypt.hash('password123', 4);
  for (const id of ['hr-a', 'hr-b', 'hr-c']) await user(id, 'COMPANY_HR');
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) await user(id);
  await job('job-a', 'hr-a'); await job('job-a2', 'hr-a'); await job('job-b', 'hr-b'); await job('job-closed', 'hr-c', false);
  await application('app-a', 'a', 'job-a', 'COMMITTED');
  await application('app-old', 'a', 'job-b', 'CANCELLED');
  await application('app-b', 'b', 'job-b', 'COMMITTED');
  await application('app-c-a', 'c', 'job-a', 'ACCEPTED'); await application('app-c-b', 'c', 'job-b', 'ACCEPTED');
  await application('app-d', 'd', 'job-a', 'ACCEPTED');
  await application('app-f', 'f', 'job-a', 'PENDING');
  await application('app-g', 'g', 'job-a', 'COMMITTED');
  await log('log-a-approved', 'a', 'app-a', '2026-10-01', true);
  await log('log-a-pending', 'a', 'app-a', '2026-10-02');
  await log('log-a-old', 'a', 'app-old', '2026-09-01');
  await log('log-b', 'b', 'app-b', '2026-10-01T09:00:00Z');
  await log('log-g', 'g', 'app-g', '2026-10-01');
}, { timeout: 90000 });

after(async () => {
  if (server) {
    // tsx launches a child on Windows; terminate that process tree, not unrelated servers.
    if (process.platform === 'win32') {
      try { execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
    } else server.kill('SIGTERM');
  }
  if (db) await db.end();
  if (/^internflow_test_[a-f0-9]{16}$/.test(dbName)) await admin.query('DROP DATABASE IF EXISTS "' + dbName + '" WITH (FORCE)');
  await admin.end();
  // The directory was created by mkdtemp for this test run only.
  fs.rmSync(uploadRoot, { recursive: true, force: true });
});

test('reports and logbooks enforce student and company ownership', async () => {
  assert.equal((await api('GET', '/api/evaluations/report/a')).status, 401);
  assert.equal((await api('GET', '/api/evaluations/report/a', 'b')).status, 403);
  assert.equal((await api('GET', '/api/evaluations/report/a?applicationId=app-a', 'hr-b')).status, 403);
  assert.equal((await api('GET', '/api/evaluations/report/a', 'hr-c')).status, 403);
  const historicalReport = await api('GET', '/api/evaluations/report/a', 'hr-b');
  assert.equal(historicalReport.status, 200);
  assert.equal(historicalReport.body.activeApp.id, 'app-old');
  assert.deepEqual(historicalReport.body.dailyLogs.map(log => log.id), ['log-a-old']);
  assert.equal((await api('GET', '/api/logbook/student/a', 'hr-b')).status, 403);
  const own = await api('GET', '/api/evaluations/report/a', 'a');
  assert.equal(own.status, 200); assert.equal(own.body.totalHours, 16); assert.equal(own.body.approvedHours, 8);
  assert.deepEqual(own.body.dailyLogs.map(log => log.applicationId), ['app-a', 'app-a']);
  const logs = await api('GET', '/api/logbook/student/a?applicationId=app-a', 'hr-a');
  assert.equal(logs.status, 200); assert.equal(logs.body.totalHours, 16);
  const masked = await api('GET', '/api/profile/student/a', 'hr-c');
  assert.equal(masked.body.gpa, undefined); assert.equal(masked.body.email, undefined); assert.equal(masked.body.studentId, undefined);
  assert.equal((await api('GET', '/api/profile/student/a', 'hr-a')).body.gpa, 3.5);
});

test('student totals do not include hours from a previous placement', async () => {
  const result = await api('GET', '/api/logbook/my', 'a');
  assert.equal(result.status, 200); assert.equal(result.body.totalHours, 16); assert.equal(result.body.logs.length, 2);
  assert.equal(result.body.student.user.name, 'u-a');
  const roster = await api('GET', '/api/evaluations/company', 'hr-a');
  assert.equal(roster.body.find(row => row.student.id === 'a').totalHours, 16);
  assert.ok(!roster.body.some(row => row.student.id === 'c'), 'Uncommitted offers are not active interns.');
});

test('HR cannot modify another company or overwrite committed/final states', async () => {
  assert.equal((await api('PATCH', '/api/applications/app-a/status', 'hr-b', { status: 'REJECTED' })).status, 404);
  assert.equal((await api('PATCH', '/api/applications/app-a/status', 'hr-a', { status: 'REJECTED' })).status, 409);
  assert.equal((await api('PATCH', '/api/applications/app-f/status', 'hr-a', { status: 'REVIEWING' })).status, 200);
  assert.equal((await api('PATCH', '/api/applications/app-f/status', 'hr-a', { status: 'INTERVIEW_SCHEDULED' })).status, 200);
  assert.equal((await api('PATCH', '/api/applications/app-f/status', 'hr-a', { status: 'REVIEWING' })).status, 409);
  assert.equal((await api('PATCH', '/api/applications/app-f/status', 'hr-a', { status: 'ACCEPTED' })).status, 200);
});

test('approved logs are immutable and students cannot edit another student log', async () => {
  assert.equal((await api('POST', '/api/logbook', 'a', logBody('log-b'))).status, 404);
  assert.equal((await api('POST', '/api/logbook', 'b', logBody(undefined))).status, 409, 'Legacy non-midnight records still reserve the calendar day.');
  assert.equal((await api('POST', '/api/logbook', 'a', logBody('log-a-approved'))).status, 409);
  assert.equal((await api('DELETE', '/api/logbook/log-a-approved', 'a')).status, 409);
  const row = (await db.query('SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id=$1', ['log-a-approved'])).rows[0];
  assert.equal(row.tasksDone, '["Original task"]'); assert.equal(row.mentorApproved, true);
  assert.equal((await api('POST', '/api/logbook', 'a', logBody('log-a-pending', '2026-10-02'))).status, 200);
});

test('single and batch approval cannot cross companies or placement history', async () => {
  assert.equal((await api('PUT', '/api/logbook/log-a-pending/approve', 'hr-b', { mentorRating: 5 })).status, 403);
  assert.equal((await api('POST', '/api/logbook/batch-approve', 'hr-b', { studentId: 'a', weekNumber: 1, mentorRating: 5 })).status, 403);
  assert.equal((await api('PUT', '/api/logbook/log-a-pending/approve', 'hr-a', { mentorRating: 6 })).status, 400);
  const approved = await api('POST', '/api/logbook/batch-approve', 'hr-a', { studentId: 'a', applicationId: 'app-a', weekNumber: 1, mentorRating: 4, mentorFeedback: 'Reviewed' });
  assert.equal(approved.status, 200); assert.equal(approved.body.logs.length, 2);
  assert.equal((await db.query('SELECT "mentorApproved" FROM "DailyLog" WHERE id=$1', ['log-a-old'])).rows[0].mentorApproved, false);
  assert.equal((await api('POST', '/api/logbook', 'a', logBody('log-a-pending', '2026-10-02'))).status, 409);
});

test('rubrics validate the placement, identity pair, and score range', async () => {
  const body = { studentId: 'a', applicationId: 'app-a', workQualityScore: 5, punctualityScore: 4, teamworkScore: 3, feedback: 'Good progress' };
  assert.equal((await api('POST', '/api/evaluations/submit', 'hr-b', body)).status, 403);
  assert.equal((await api('POST', '/api/evaluations/submit', 'hr-a', { ...body, studentId: 'b' })).status, 403);
  for (const score of [0, 6, 3.5]) assert.equal((await api('POST', '/api/evaluations/submit', 'hr-a', { ...body, workQualityScore: score })).status, 400);
  assert.equal((await api('POST', '/api/evaluations/submit', 'hr-a', body)).status, 200);
  assert.equal((await api('POST', '/api/evaluations/submit', 'hr-a', { ...body, feedback: 'Updated' })).status, 200);
  const rows = (await db.query('SELECT * FROM "InternshipEvaluation" WHERE "applicationId"=$1', ['app-a'])).rows;
  assert.equal(rows.length, 1); assert.equal(rows[0].companyId, 'hr-a'); assert.equal(rows[0].feedback, 'Updated');
});

test('concurrent offers cannot create two committed placements', async () => {
  const results = await Promise.all(['app-c-a', 'app-c-b'].map(id => api('PATCH', '/api/applications/' + id + '/commit', 'c', {})));
  assert.equal(results.filter(result => result.status === 200).length, 1);
  assert.ok(results.every(result => [200, 400, 409].includes(result.status)), JSON.stringify(results));
  const rows = (await db.query('SELECT status FROM "Application" WHERE "studentId"=$1', ['c'])).rows;
  assert.equal(rows.filter(row => row.status === 'COMMITTED').length, 1); assert.equal(rows.filter(row => row.status === 'REJECTED').length, 1);
});

test('applying concurrently with commitment cannot leave an active competing application', async () => {
  const results = await Promise.all([
    api('PATCH', '/api/applications/app-d/commit', 'd', {}),
    api('POST', '/api/applications', 'd', { jobPostId: 'job-b' })
  ]);
  assert.equal(results[0].status, 200);
  assert.ok([201, 400, 409].includes(results[1].status), JSON.stringify(results));
  const rows = (await db.query('SELECT status FROM "Application" WHERE "studentId"=$1', ['d'])).rows;
  assert.equal(rows.filter(row => row.status === 'COMMITTED').length, 1);
  assert.ok(rows.every(row => ['COMMITTED', 'REJECTED'].includes(row.status)));
  assert.equal((await api('POST', '/api/applications', 'd', { jobPostId: 'job-a2' })).status, 400);
});

test('concurrent applications enforce one active application per company', async () => {
  const results = await Promise.all(['job-a', 'job-a2'].map(jobPostId => api('POST', '/api/applications', 'e', { jobPostId })));
  assert.equal(results.filter(result => result.status === 201).length, 1);
  assert.ok(results.every(result => [201, 400, 409].includes(result.status)), JSON.stringify(results));
});

test('job deletion preserves committed placements and their records', async () => {
  assert.equal((await api('DELETE', '/api/jobs/job-a', 'hr-a')).status, 409);
  assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM "Application" WHERE id=$1', ['app-a'])).rows[0].count, 1);
  assert.equal((await api('POST', '/api/applications', 'f', { jobPostId: 'job-closed' })).status, 404);
});

test('validation rejects malformed accounts, profiles, dates and hours', async () => {
  assert.equal((await api('POST', '/api/auth/register', null, { email: 'admin@test.invalid', name: 'Admin', password: 'password123', role: 'UNIVERSITY_ADMIN' })).status, 400);
  assert.equal((await api('POST', '/api/auth/register', null, { email: 'short@test.invalid', name: 'Test', password: 'x', role: 'STUDENT' })).status, 400);
  assert.equal((await api('PUT', '/api/student/profile', 'a', { gpa: 8 })).status, 400);
  assert.equal((await api('PUT', '/api/student/profile', 'a', { year: 7 })).status, 400);
  for (const changes of [{ hoursWorked: -2 }, { hoursWorked: 13 }, { logDate: '2026-02-30' }, { logDate: '2999-01-01' }, { tasksDone: '{}' }]) {
    assert.equal((await api('POST', '/api/logbook', 'g', { ...logBody('log-g'), ...changes })).status, 400);
  }
  assert.equal((await api('GET', '/api/jobs')).status, 200, 'The existing public homepage can load real postings.');
});

test('editing and approval serialize: the final signed content cannot change', async () => {
  const results = await Promise.all([
    api('POST', '/api/logbook', 'g', logBody('log-g')),
    api('PUT', '/api/logbook/log-g/approve', 'hr-a', { mentorRating: 5 })
  ]);
  assert.ok([200, 409].includes(results[0].status), JSON.stringify(results)); assert.equal(results[1].status, 200);
  const signed = (await db.query('SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id=$1', ['log-g'])).rows[0];
  assert.equal(signed.mentorApproved, true);
  assert.equal((await api('POST', '/api/logbook', 'g', { ...logBody('log-g'), tasksDone: '["Tampered"]' })).status, 409);
  assert.equal((await db.query('SELECT "tasksDone" FROM "DailyLog" WHERE id=$1', ['log-g'])).rows[0].tasksDone, signed.tasksDone);
});

test('cancelled placement logs remain read-only with or without a new active placement', async () => {
  await user('archive'); await job('job-archive', 'hr-c');
  await application('app-archive', 'archive', 'job-archive', 'CANCELLED');
  await log('log-archive', 'archive', 'app-archive', '2026-09-12');
  assert.equal((await api('DELETE', '/api/logbook/log-archive', 'archive')).status, 409);
  assert.equal((await api('DELETE', '/api/logbook/log-a-old', 'a')).status, 409);
  assert.equal((await api('POST', '/api/logbook', 'archive', logBody('log-archive','2026-09-12'))).status, 403);
  assert.equal((await api('GET', '/api/logbook/my', 'archive')).body.logs[0].id, 'log-archive');
  assert.equal((await db.query('SELECT id FROM "DailyLog" WHERE id IN ($1,$2)', ['log-archive','log-a-old'])).rowCount, 2);
});

test('concurrent sign-offs preserve the first rating and feedback; repeat batch is a no-op', async () => {
  await user('signoff'); await job('job-signoff', 'hr-a');
  await application('app-signoff', 'signoff', 'job-signoff', 'COMMITTED');
  await log('log-signoff', 'signoff', 'app-signoff', '2026-09-13');
  const reviews=[{mentorRating:2,mentorFeedback:'First review'},{mentorRating:5,mentorFeedback:'Other review'}];
  const replies=await Promise.all(reviews.map(review=>api('PUT','/api/logbook/log-signoff/approve','hr-a',review)));
  assert.deepEqual(replies.map(r=>r.status).sort(),[200,409]);
  const winner=replies.findIndex(r=>r.status===200);
  const original=(await db.query('SELECT "mentorRating","mentorFeedback" FROM "DailyLog" WHERE id=$1',['log-signoff'])).rows[0];
  assert.deepEqual(original,reviews[winner]);
  const repeat=await api('POST','/api/logbook/batch-approve','hr-a',{studentId:'signoff',applicationId:'app-signoff',weekNumber:1,mentorRating:1,mentorFeedback:'Do not overwrite'});
  assert.equal(repeat.status,200);assert.equal(repeat.body.updatedCount,0);
  assert.deepEqual((await db.query('SELECT "mentorRating","mentorFeedback" FROM "DailyLog" WHERE id=$1',['log-signoff'])).rows[0],original);
});

test('weekly averages use all rated approved days without mislabelling a daily comment as a weekly review', async () => {
  await user('averages'); await job('job-averages','hr-a'); await application('app-averages','averages','job-averages','COMMITTED');
  for(const [id,day,approved,score,feedback] of [['log-average-a','2026-09-14',true,5,'Day one'],['log-average-b','2026-09-15',true,2,'Day two'],['log-average-c','2026-09-16',false,5,'Not approved']]) {
    await log(id,'averages','app-averages',day,approved);await db.query('UPDATE "DailyLog" SET "mentorRating"=$2,"mentorFeedback"=$3 WHERE id=$1',[id,score,feedback]);
  }
  for(const result of [await api('GET','/api/logbook/my','averages'),await api('GET','/api/logbook/student/averages?applicationId=app-averages','hr-a')]) {
    assert.equal(result.status,200);const week=result.body.groupedWeeks[0];assert.equal(week.mentorRating,3.5);assert.equal(week.ratedDays,2);assert.equal(week.mentorFeedback,null);assert.equal(week.approvedHours,16);
  }
});

test('evaluation rejects whitespace-only feedback and missing or blank scores without changing saved results', async () => {
  const body={studentId:'averages',applicationId:'app-averages',workQualityScore:3,punctualityScore:4,teamworkScore:2,feedback:'Specific observations'};
  assert.equal((await api('POST','/api/evaluations/submit','hr-a',body)).status,200);
  for(const patch of [{feedback:' \n\t '},{workQualityScore:''},{punctualityScore:null},{teamworkScore:undefined}]) assert.equal((await api('POST','/api/evaluations/submit','hr-a',{...body,...patch})).status,400);
  const row=(await db.query('SELECT feedback,"workQualityScore" FROM "InternshipEvaluation" WHERE "applicationId"=$1',['app-averages'])).rows[0];
  assert.deepEqual(row,{feedback:'Specific observations',workQualityScore:3});
});

test('unsafe attachment schemes cannot be saved into logbook', async () => {
  for(const url of ['javascript:alert(1)','data:text/html,test','file:///tmp/secret','/private-uploads/no-file.pdf','/uploads/../secret','https://user:password@example.test/']) assert.equal((await api('POST','/api/logbook','averages',{...logBody(undefined,'2026-09-20'),attachmentUrl:JSON.stringify([{title:'Unsafe',url}])})).status,400,url);
});

test('logbook files require authentication and ownership; placement company can read and public images remain public', async () => {
  const form=new FormData();
  form.append('applicationId','app-averages');form.append('file',new Blob(['%PDF-1.4\nSynthetic private logbook attachment\n%%EOF'],{type:'application/pdf'}),'logbook-test.pdf');
  const uploaded=await fetch(base+'/api/upload',{method:'POST',headers:{Authorization:'Bearer '+tokens.averages},body:form});
  assert.equal(uploaded.status,200);const file=await uploaded.json();const url=file.url;
  assert.ok(url);
  assert.equal((await api('POST','/api/logbook','averages',{...logBody(undefined,'2026-09-21'),weekNumber:4,attachmentUrl:JSON.stringify([{title:'Private evidence',url}])})).status,201);
  assert.equal((await api('POST','/api/logbook','b',{...logBody(undefined,'2026-09-21'),attachmentUrl:JSON.stringify([{title:'Not my file',url}])})).status,400);
  assert.equal((await fetch(base+url)).status,404,'Anonymous direct file URL is private.');
  const content='/api/upload/content?url='+encodeURIComponent(url);
  assert.equal((await fetch(base+content)).status,401);
  for(const actor of ['averages','hr-a']){
    const response=await fetch(base+content,{headers:{Authorization:'Bearer '+tokens[actor]}});assert.equal(response.status,200);assert.match(await response.text(),/Synthetic private logbook attachment/);assert.match(response.headers.get('cache-control'),/no-store/);
  }
  for(const actor of ['b','hr-b']) assert.equal((await fetch(base+content,{headers:{Authorization:'Bearer '+tokens[actor]}})).status,404);
  // Archived evidence remains readable to its owner and original company.
  await db.query('UPDATE "Application" SET status=$2 WHERE id=$1',['app-averages','CANCELLED']);
  assert.equal((await fetch(base+content,{headers:{Authorization:'Bearer '+tokens['hr-a']}})).status,200);
  const image=new FormData();image.append('purpose','profile-image');image.append('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'avatar.png');
  const publicUpload=await fetch(base+'/api/upload',{method:'POST',headers:{Authorization:'Bearer '+tokens['hr-a']},body:image});assert.equal(publicUpload.status,200);const publicFile=await publicUpload.json();assert.equal((await fetch(base+publicFile.url)).status,200);
});
