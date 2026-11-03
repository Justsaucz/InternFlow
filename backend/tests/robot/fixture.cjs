// Runs HTTP regressions against an empty, disposable PostgreSQL database.
// Never resets or seeds the database configured for the application.

const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const net = require('node:net');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });

const cwd = path.join(__dirname, '../..');
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

async function setup() {
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
  server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'src/index.ts'], { cwd, env: { ...process.env, DATABASE_URL: dbUrl.href, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
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
}

async function cleanup() {
  if (server) {
    // tsx launches a child on Windows; terminate that process tree, not unrelated servers.
    if (process.platform === 'win32') {
      try { execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
    } else server.kill('SIGTERM');
  }
  if (db) await db.end();
  if (/^internflow_test_[a-f0-9]{16}$/.test(dbName)) await admin.query('DROP DATABASE IF EXISTS "' + dbName + '" WITH (FORCE)');
  await admin.end();
}

// JSON-lines transport only. Robot Framework performs the test assertions.
async function freePort() {
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
let frontend;
async function stop() {
  if (frontend) {
    try { execFileSync('taskkill', ['/PID', String(frontend.pid), '/T', '/F'], {stdio:'ignore'}); } catch {}
  }
  await cleanup();
}
function reply(value) { process.stdout.write(JSON.stringify(value) + '\n'); }
(async () => {
  try {
    const port = await freePort();
    process.env.CORS_ORIGIN = 'http://127.0.0.1:' + port;
    await setup();
    const frontCwd = path.resolve(cwd, '../frontend');
    frontend=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{
      cwd:frontCwd,env:{...process.env,VITE_API_URL:base},stdio:['ignore','ignore','ignore']
    });
    const web='http://127.0.0.1:'+port;
    let ready=false;
    for(let n=0;n<100;n++) {
      try { if((await fetch(web)).ok) { ready=true;break; } } catch {}
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    assert.ok(ready,'Isolated frontend did not start');
    reply({ready:true,base,web});
    const lines=require('node:readline').createInterface({input:process.stdin});
    for await (const line of lines) {
      try {
        const q=JSON.parse(line);
        if(q.op==='stop') { await stop();reply({stopped:true});process.exit(0); }
        if(q.op==='api') reply(await api(q.method,q.path,q.actor,q.body));
        else if(q.op==='upload') {
          const form=new FormData();
          if(q.purpose&&!q.purposeLate)form.append('purpose',q.purpose);
          form.append('file',new Blob([Buffer.from(q.data,'base64')],{type:q.mime}),q.filename);
          if(q.purpose&&q.purposeLate)form.append('purpose',q.purpose);
          const response=await fetch(base+'/api/upload',{method:'POST',headers:{Authorization:'Bearer '+tokens[q.actor]},body:form});
          reply({status:response.status,body:await response.json()});
        }
        else if(q.op==='download') {
          const response=await fetch(base+q.path,{headers:{...(q.actor?{Authorization:'Bearer '+tokens[q.actor]}:{}),...(q.origin?{Origin:q.origin}:{})}});
          const buffer=Buffer.from(await response.arrayBuffer());
          reply({status:response.status,headers:Object.fromEntries(response.headers),data:buffer.toString('base64')});
        }
        else if(q.op==='parallel') reply(await Promise.all(q.requests.map(r=>api(r.method,r.path,r.actor,r.body))));
        else if(q.op==='query') {
          assert.match(q.sql,/^SELECT\s/i,'Fixture transport accepts SELECT only');
          reply((await db.query(q.sql,q.params||[])).rows);
        }
        else if(q.op==='session') reply({token:tokens[q.actor]});
      } catch(error) {reply({error:error.message});}
    }
    await stop();
  } catch(error) {reply({error:error.stack || String(error)});await stop();process.exitCode=1;}
})();
