const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const cwd=path.resolve(__dirname,'..');
function validate(overrides){
 const result=spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs','-e',"require('./src/lib/config.ts')"],{cwd,env:{...process.env,NODE_ENV:'production',DATABASE_URL:'postgresql://fixture:fixture@127.0.0.1/fixture',JWT_SECRET:'7562e64a969f4424421d1ec41e68126c81bf290524980918',CORS_ORIGIN:'https://frontend.example.test',STORAGE_MODE:'s3',S3_BUCKET_NAME:'fixture-bucket',ALLOW_LOCAL_STORAGE:'',ALLOW_HTTP_ORIGINS:'',...overrides},encoding:'utf8'});
 return result.status;
}
test('production accepts explicit secure role-based S3 configuration',()=>assert.equal(validate({}),0));
test('production rejects placeholder JWT secret',()=>assert.notEqual(validate({JWT_SECRET:'REPLACE_WITH_RANDOM_VALUE_AT_LEAST_32_CHARACTERS'}),0));
test('production rejects short JWT secret',()=>assert.notEqual(validate({JWT_SECRET:'short'}),0));
test('production rejects wildcard CORS',()=>assert.notEqual(validate({CORS_ORIGIN:'*'}),0));
test('production rejects insecure remote frontend origin',()=>assert.notEqual(validate({CORS_ORIGIN:'http://public.example.test'}),0));
test('production rejects S3 mode without bucket',()=>assert.notEqual(validate({S3_BUCKET_NAME:''}),0));
test('production cannot silently fall back to local disk',()=>assert.notEqual(validate({STORAGE_MODE:'local'}),0));
