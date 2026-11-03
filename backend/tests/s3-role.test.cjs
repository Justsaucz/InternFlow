const path=require('node:path'),fs=require('node:fs'),http=require('node:http'),{spawn}=require('node:child_process');
const cwd=path.resolve(__dirname,'..');
const {S3Client,CreateBucketCommand}=require(path.join(cwd,'node_modules/@aws-sdk/client-s3'));
const credentials={accessKeyId:'S3RVER',secretAccessKey:'S3RVER'};
(async()=>{
 const S3rver=require(process.env.S3RVER_MODULE || 's3rver');
 const tempRoot=process.env.CLOUD_TEST_TMP || path.resolve(cwd,'../../tmp/cloud-s3-tests');fs.mkdirSync(tempRoot,{recursive:true});
 const dir=fs.mkdtempSync(path.join(tempRoot,'s3-fixture-'));
 const mock=new S3rver({address:'127.0.0.1',port:19000,silent:true,directory:dir});
 await mock.run();
 const s3=new S3Client({endpoint:'http://127.0.0.1:19000',forcePathStyle:true,region:'us-east-1',credentials});
 await s3.send(new CreateBucketCommand({Bucket:'internflow-local-fixture'}));
 let requests=0;
 const metadata=http.createServer((req,res)=>{
   if(req.headers.authorization!=='local-test-token'){res.writeHead(403).end();return;}
   requests++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({AccessKeyId:credentials.accessKeyId,SecretAccessKey:credentials.secretAccessKey,Token:'local-only-session-token',Expiration:new Date(Date.now()+3600000).toISOString()}));
 });
 await new Promise(r=>metadata.listen(0,'127.0.0.1',r));
 try{
  const env={...process.env,STORAGE_MODE:'s3',S3_BUCKET_NAME:'internflow-local-fixture',S3_ENDPOINT:'http://127.0.0.1:19000',AWS_REGION:'us-east-1',
    AWS_ACCESS_KEY_ID:'',AWS_SECRET_ACCESS_KEY:'',AWS_SESSION_TOKEN:'',AWS_PROFILE:'',AWS_EC2_METADATA_DISABLED:'true',
    AWS_SHARED_CREDENTIALS_FILE:path.join(__dirname,'nonexistent-credentials'),AWS_CONFIG_FILE:path.join(__dirname,'nonexistent-config'),
    AWS_CONTAINER_CREDENTIALS_FULL_URI:'http://127.0.0.1:'+metadata.address().port+'/credentials',AWS_CONTAINER_AUTHORIZATION_TOKEN:'local-test-token',
    CLOUD_TEST_OUTPUT:path.join(__dirname,'s3-files-results.json')};
  const child=spawn(process.env.PYTHON_BINARY || 'python',['tests/cloud-files.py'],{cwd,env,stdio:'inherit'});
  const code=await new Promise(r=>child.on('exit',r));
  if(code!==0||requests<1)throw Error('S3-compatible/role provider test failed');
  console.log('PASS: SDK fetched temporary container credentials ('+requests+' request(s)); no static AWS keys supplied to application.');
 }finally{metadata.close();s3.destroy();await mock.close();
   if(path.dirname(path.resolve(dir))===path.resolve(tempRoot)&&path.basename(dir).startsWith('s3-fixture-'))fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e.message);process.exitCode=1});
