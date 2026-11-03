"""Real local/S3-compatible file-access checks using the isolated Robot fixture."""
import base64, json, os, sys, tempfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'robot'))
from InternFlowLibrary import InternFlowLibrary

results=[]
def check(name, condition):
    assert condition, name
    results.append({'name':name,'status':'PASS'})
    print('PASS:',name,flush=True)

lib=InternFlowLibrary()
workspace=Path(__file__).resolve().parents[3]/'tmp'
workspace.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='internflow-cloud-files-',dir=workspace) as directory:
    assert Path(directory).resolve().parent==workspace.resolve()
    os.environ['UPLOAD_DIR']=directory
    try:
        web=lib.start_isolated_internflow()
        pdf=b'%PDF-1.4\nInternFlow private test fixture\n%%EOF'
        uploaded=lib._rpc(dict(op='upload',actor='e',filename='resume.pdf',mime='application/pdf',data=base64.b64encode(pdf).decode()))
        check('PDF upload',uploaded['status']==200)
        url=uploaded['body']['url']
        def read(actor=None,path=None,origin=None):
            from urllib.parse import quote
            return lib._rpc(dict(op='download',actor=actor,path=path or '/api/upload/content?url='+quote(url,safe=''),origin=origin))
        check('Anonymous private read blocked',read()['status']==401)
        check('Private static URL blocked',read(path=url)['status']==404)
        r=read('e');check('Owner reads exact uploaded bytes',r['status']==200 and base64.b64decode(r['data'])==pdf)
        check('Private response cannot be cached',r['headers'].get('cache-control')=='private, no-store')
        check('Other student blocked',read('b')['status']==404)
        check('Unrelated HR blocked',read('hr-a')['status']==404)
        r=lib.api_request('POST','/api/applications','e',{'jobPostId':'job-a','attachments':[{'title':'Resume','url':url}]})
        check('Application attaches uploaded file',r['status']==201)
        check('Related company reads applicant file',read('hr-a')['status']==200)
        check('Other company stays blocked',read('hr-b')['status']==404)
        r=lib.api_request('POST','/api/applications','f',{'jobPostId':'job-b','attachments':[{'title':'Forged reference','url':url}]})
        check('Foreign reference does not grant file ownership',r['status']==201 and read('hr-b')['status']==404)
        png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2i8AAAAASUVORK5CYII=')
        image=lib._rpc(dict(op='upload',actor='e',purpose='profile-image',filename='avatar.png',mime='image/png',data=base64.b64encode(png).decode()))
        check('Profile image upload',image['status']==200)
        r=read(path=image['body']['url']);check('Public profile image remains visible',r['status']==200 and base64.b64decode(r['data'])==png)
        bad=lib._rpc(dict(op='upload',actor='e',purpose='profile-image',filename='resume.pdf',mime='application/pdf',data=base64.b64encode(pdf).decode()))
        check('PDF cannot become public profile image',bad['status']==400)
        bad=lib._rpc(dict(op='upload',actor='e',purpose='profile-image',purposeLate=True,filename='late.pdf',mime='application/pdf',data=base64.b64encode(pdf).decode()))
        check('Late multipart purpose cannot publish a PDF',bad['status']==400)
        bad=lib._rpc(dict(op='upload',actor='e',filename='x.exe',mime='application/octet-stream',data='eA=='))
        check('Unsupported upload rejected',bad['status']==400)
        bad=lib._rpc(dict(op='upload',actor='e',filename='large.pdf',mime='application/pdf',data=base64.b64encode(b'x'*(5*1024*1024+1)).decode()))
        check('5MB limit enforced',bad['status']==400)
        check('Allowed CORS origin reflected',read(path='/api/health',origin=web)['headers'].get('access-control-allow-origin')==web)
        check('Unlisted CORS origin not allowed','access-control-allow-origin' not in read(path='/api/health',origin='https://unrelated.invalid')['headers'])
        check('Database readiness check',read(path='/api/ready')['status']==200)
    finally:
        lib.stop_isolated_internflow()
out=Path(os.environ.get('CLOUD_TEST_OUTPUT',str(workspace/'cloud-files-results.json')))
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps({'storage':os.environ.get('STORAGE_MODE','local'),'passed':len(results),'tests':results},indent=2),encoding='utf-8')
