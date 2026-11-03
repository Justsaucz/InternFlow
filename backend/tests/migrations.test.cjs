const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{randomBytes}=require('node:crypto'),{execFileSync}=require('node:child_process');
const {Pool}=require('pg');
const cwd=path.resolve(__dirname,'..');require('dotenv').config({path:path.join(cwd,'.env'),quiet:true});
function cli(args,url){return execFileSync(process.execPath,['node_modules/prisma/build/index.js',...args],{cwd,env:{...process.env,DATABASE_URL:url},stdio:'pipe',timeout:90000}).toString();}
async function isolated(action){
 const name='internflow_migration_'+randomBytes(8).toString('hex'),url=new URL(process.env.DATABASE_URL);
 assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));
 const admin=new Pool({connectionString:url.href});url.pathname='/'+name;let db;
 try{await admin.query('CREATE DATABASE "'+name+'"');db=new Pool({connectionString:url.href});await action(db,url.href);}
 finally{if(db)await db.end();assert.match(name,/^internflow_migration_[a-f0-9]{16}$/);await admin.query('DROP DATABASE IF EXISTS "'+name+'" WITH (FORCE)');await admin.end();}
}
const migration=fs.readFileSync(path.join(cwd,'prisma/migrations/20261103090000_cloud_readiness/migration.sql'),'utf8');
test('fresh database deploys all migrations and has no schema drift',()=>isolated(async(db,url)=>{
 cli(['migrate','deploy'],url);
 cli(['migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],url);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rows[0].n,3);
}),{timeout:120000});
test('historical schema upgrade preserves university and student records',()=>isolated(async(db,url)=>{
 for(const folder of ['20260820132742_init','20260821031640_add_unique_application_constraint'])await db.query(fs.readFileSync(path.join(cwd,'prisma/migrations',folder,'migration.sql'),'utf8'));
 await db.query(`INSERT INTO "University" (id,name,domain,"updatedAt") VALUES ('legacy','Original university','legacy.test',NOW());
 INSERT INTO "User" (id,email,password,name,role,"updatedAt") VALUES ('owner','owner@test.invalid','hash','Original name','STUDENT',NOW());
 INSERT INTO "StudentProfile" (id,"userId","universityId","studentId",major,faculty,year,skills) VALUES ('s','owner','legacy','123','CS','Engineering',4,ARRAY['React']);`);
 await db.query(migration);
 const s=(await db.query('SELECT * FROM "StudentProfile" WHERE id=$1',['s'])).rows[0];
 assert.equal(s.university,'Original university');assert.equal(s.studentId,'123');assert.equal(s.universityId,'legacy');
 assert.equal((await db.query('SELECT name FROM "University" WHERE id=$1',['legacy'])).rows[0].name,'Original university');
 cli(['migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],url);
}),{timeout:120000});
test('already-current db-push schema can adopt the migration without data loss',()=>isolated(async(db,url)=>{
 cli(['db','push'],url);
 await db.query(`INSERT INTO "User" (id,email,password,name,role,"updatedAt") VALUES ('owner','owner@test.invalid','hash','Retained','STUDENT',NOW());
 ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_universityId_fkey";
 ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";
 ALTER TABLE "StudentProfile" DROP COLUMN "universityId"; ALTER TABLE "User" DROP COLUMN "universityId";
 DROP TABLE "University"; DROP TABLE "UploadedFile";`);
 await db.query(migration);await db.query(migration);
 assert.equal((await db.query('SELECT name FROM "User" WHERE id=$1',['owner'])).rows[0].name,'Retained');
 cli(['migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],url);
}),{timeout:120000});
