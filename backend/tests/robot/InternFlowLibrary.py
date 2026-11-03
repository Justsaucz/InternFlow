"""HTTP/fixture transport for Robot assertions; no application mock or test runner."""
import json
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
        self.lines = queue.Queue()

    @keyword
    def start_isolated_internflow(self):
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
