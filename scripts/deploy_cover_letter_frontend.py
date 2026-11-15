"""Run in the existing AWS CloudShell: publish only the verified frontend fix."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
from urllib.request import Request, urlopen
import zipfile

COMMIT = '19697bff419e91ec5b85b3a7e5a72d787b4c2f17'
ACCOUNT = '528301714999'
DOMAIN = 'd3lithmz8huyc9.cloudfront.net'
REGION = 'ap-southeast-2'


def run(*args, cwd=None, env=None, capture=False):
    return subprocess.run(args, cwd=cwd, env=env, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None).stdout


def aws(*args):
    output = run('aws', *args, '--region', REGION, '--output', 'json', capture=True)
    return json.loads(output) if output.strip() else {}


def download(url):
    with urlopen(Request(url, headers={'User-Agent': 'InternFlow-frontend-deploy'}), timeout=60) as response:
        return response.read()


def main():
    for command in ('aws', 'node', 'npm'):
        if not shutil.which(command):
            raise RuntimeError(f'{command} is required in CloudShell.')
    version = run('node', '--version', capture=True).strip()
    numbers = tuple(int(n) for n in version.lstrip('v').split('.')[:2])
    if not (numbers >= (22, 12) or (numbers[0] == 20 and numbers >= (20, 19))):
        raise RuntimeError('Use Node 20.19+ or 22.12+ for this existing Vite project. Current: '+version)
    if aws('sts', 'get-caller-identity')['Account'] != ACCOUNT:
        raise RuntimeError('Wrong AWS account; no changes made.')
    distributions = aws('cloudfront', 'list-distributions')['DistributionList'].get('Items', [])
    matches = [d for d in distributions if d['DomainName'] == DOMAIN]
    if len(matches) != 1:
        raise RuntimeError('Expected CloudFront distribution was not found.')
    distribution = matches[0]
    buckets = {o['DomainName'].split('.s3')[0] for o in distribution['Origins']['Items']
               if '.s3' in o['DomainName'] and o['DomainName'].startswith('internflow-g06-')
               and '-frontend.s3' in o['DomainName']}
    if len(buckets) != 1:
        raise RuntimeError('Could not uniquely identify the existing frontend S3 bucket.')
    bucket = buckets.pop()
    aws('s3api', 'head-bucket', '--bucket', bucket, '--expected-bucket-owner', ACCOUNT)
    scratch = '/tmp' if Path('/tmp').is_dir() else None
    if shutil.disk_usage(scratch or tempfile.gettempdir()).free < 500 * 1024 * 1024:
        raise RuntimeError('At least 500 MB free scratch space is required. No changes made.')
    with tempfile.TemporaryDirectory(prefix='internflow-cover-letter-', dir=scratch) as tmp:
        work = Path(tmp)
        archive = work/'source.zip'
        archive.write_bytes(download('https://codeload.github.com/Justsaucz/InternFlow/zip/'+COMMIT))
        with zipfile.ZipFile(archive) as source:
            for member in source.infolist():
                if not (work/ member.filename).resolve().is_relative_to(work.resolve()):
                    raise RuntimeError('Invalid source archive path.')
            source.extractall(work)
        frontend = work/('InternFlow-'+COMMIT)/'frontend'
        env = dict(os.environ, VITE_ROUTER_MODE='hash', VITE_API_URL='',
                   npm_config_cache=str(work/'npm-cache'))
        print('1/4 Building frontend from verified commit '+COMMIT, flush=True)
        run('npm', 'ci', '--no-audit', '--no-fund', cwd=frontend, env=env)
        run('npm', 'run', 'build', cwd=frontend, env=env)
        dist = frontend/'dist'
        index = (dist/'index.html').read_bytes()
        scripts = re.findall(rb'<script[^>]+src="([^"]+)"', index)
        if not scripts:
            raise RuntimeError('Build did not produce a script asset.')
        asset = scripts[0].decode().lstrip('/')
        if not asset.startswith('assets/') or not (dist/asset).is_file():
            raise RuntimeError('Unexpected frontend asset path.')
        if b'Cover Letter' not in (dist/asset).read_bytes():
            raise RuntimeError('Cover Letter label missing from production build.')
        print('2/4 Backing up current public index', flush=True)
        backup = Path.home()/'internflow-frontend-backups'/time.strftime('%Y%m%d-%H%M%S')
        backup.mkdir(parents=True, exist_ok=False)
        run('aws','s3','cp',f's3://{bucket}/index.html',str(backup/'index.html'),'--region',REGION)
        (backup/'deployment.json').write_text(json.dumps({'bucket':bucket,'distribution':distribution['Id'],'commit':COMMIT}))
        print('3/4 Publishing assets, then index; existing assets retained', flush=True)
        run('aws','s3','cp',str(dist),f's3://{bucket}/','--recursive','--exclude','index.html',
            '--cache-control','public,max-age=31536000,immutable','--region',REGION)
        run('aws','s3','cp',str(dist/'index.html'),f's3://{bucket}/index.html',
            '--content-type','text/html','--cache-control','no-cache','--region',REGION)
        print('4/4 Refreshing CloudFront', flush=True)
        invalidation = aws('cloudfront','create-invalidation','--distribution-id',distribution['Id'],
                           '--paths','/','/index.html')['Invalidation']['Id']
        run('aws','cloudfront','wait','invalidation-completed','--distribution-id',distribution['Id'],
            '--id',invalidation,'--region',REGION)
        live = download('https://'+DOMAIN+'/?cover-letter='+str(int(time.time())))
        if scripts[0] not in live:
            raise RuntimeError('New frontend index could not be verified; inspect CloudFront.')
        remote = download('https://'+DOMAIN+'/'+asset)
        if hashlib.sha256(remote).digest() != hashlib.sha256((dist/asset).read_bytes()).digest():
            raise RuntimeError('Deployed JavaScript checksum mismatch.')
        print('DONE: frontend deployed and checksum verified. Backend/database were not changed.')
        print('Website: https://'+DOMAIN+'/#/login')
        print('Previous index backup: '+str(backup))


if __name__ == '__main__':
    main()
