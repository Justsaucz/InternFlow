"""HTTP/fixture transport for Robot assertions; no application mock or test runner."""
import json
import base64
from urllib.parse import quote
import os
from pathlib import Path
import queue
import shutil
import subprocess
import threading
from robot.api.deco import keyword, library


@library(scope='SUITE', auto_keywords=False)
class InternFlowLibrary:
    def __init__(self):
        self.process = None
        self.started = False
        self.lines = queue.Queue()

    @keyword
    def start_isolated_internflow(self):
        self.started = False
        node = os.environ.get('NODE_BINARY') or shutil.which('node')
        if not node:
            raise RuntimeError('Install Node.js or set NODE_BINARY.')
        self.process = subprocess.Popen(
            [node, str(Path(__file__).with_name('fixture.cjs'))],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, encoding='utf-8', bufsize=1)
        def collect():
            for line in self.process.stdout:
                try:
                    self.lines.put(json.loads(line))
                except ValueError:
                    pass  # Ignore package startup banners.
        threading.Thread(target=collect, daemon=True).start()
        info = self._receive(90)
        self.web = info['web']
        self.started = True
        return info['web']

    def _receive(self, timeout=30):
        try:
            result = self.lines.get(timeout=timeout)
        except queue.Empty:
            raise AssertionError('Isolated test fixture timed out.') from None
        if isinstance(result, dict) and 'error' in result:
            raise AssertionError(result['error'])
        return result

    def _rpc(self, payload):
        self.process.stdin.write(json.dumps(payload) + '\n')
        self.process.stdin.flush()
        return self._receive()

    @keyword
    def stop_isolated_internflow(self):
        if self.process and self.process.poll() is None:
            try:
                if self.started:
                    self._rpc({'op': 'stop'})
            finally:
                self.process.wait(timeout=30)

    @keyword
    def api_request(self, method, path, actor=None, body=None):
        if isinstance(body, str):
            body = json.loads(body)
        return self._rpc(dict(op='api', method=method, path=path, actor=actor, body=body))

    @keyword
    def parallel_requests(self, requests):
        return self._rpc(dict(op='parallel', requests=json.loads(requests)))

    @keyword
    def query_fixture(self, sql):
        return self._rpc(dict(op='query', sql=sql))

    @keyword
    def get_fixture_token(self, actor):
        return self._rpc(dict(op='session', actor=actor))['token']


    @keyword
    def upload_test_resume(self, actor):
        """Upload a valid one-page PDF containing only fictional fixture text."""
        stream = b"BT /F1 12 Tf 40 750 Td (Robot test resume - fictional data only) Tj ET"
        objects = [
            b"<< /Type /Catalog /Pages 2 0 R >>",
            b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        ]
        data = b"%PDF-1.4\n"
        offsets = [0]
        for index, obj in enumerate(objects, 1):
            offsets.append(len(data))
            data += str(index).encode() + b" 0 obj\n" + obj + b"\nendobj\n"
        xref = len(data)
        data += b"xref\n0 6\n0000000000 65535 f \n"
        data += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets[1:])
        data += b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + str(xref).encode() + b"\n%%EOF\n"
        return self._rpc({'op': 'upload', 'actor': actor, 'filename': 'robot-resume.pdf',
                          'mime': 'application/pdf', 'data': base64.b64encode(data).decode()})

    @keyword
    def read_uploaded_file(self, url, actor=None):
        return self._rpc({'op': 'download', 'path': '/api/upload/content?url=' + quote(url, safe=''), 'actor': actor})

    @keyword
    def read_public_file(self, url):
        return self._rpc({'op': 'download', 'path': url})
