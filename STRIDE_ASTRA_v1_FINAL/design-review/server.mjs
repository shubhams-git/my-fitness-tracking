import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { loadEvidence } from './evidence.mjs';

const base = new URL('../', import.meta.url);
const files = new Map([
  ['/', ['review.html', 'text/html']], ['/app', ['app.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']], ['/app.js', ['app.js', 'text/javascript']],
  ['/review.js', ['review.js', 'text/javascript']],
]);
const server = createServer(async (req, res) => {
  const host = req.headers.host;
  if (!['127.0.0.1:4317', 'localhost:4317'].includes(host)) { res.writeHead(403); res.end(); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'");
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const path = new URL(req.url, 'http://127.0.0.1:4317').pathname;
    if (path === '/api/evidence') {
      if (req.headers['sec-fetch-site'] === 'cross-site') { res.writeHead(403); res.end(); return; }
      const data = await loadEvidence(base);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(req.method === 'HEAD' ? '' : JSON.stringify(data));
      return;
    }
    const file = files.get(path);
    if (!file) { res.writeHead(404); res.end('Not found'); return; }
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8` });
    res.end(req.method === 'HEAD' ? '' : body);
  } catch {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'The local reference files could not be loaded. Restore the supplied files in private-inputs and retry.' }));
  }
});
server.listen(4317, '127.0.0.1', () => console.log('STRIDE design review: http://127.0.0.1:4317'));
