import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8000);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.gif':'image/gif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.md':'text/plain; charset=utf-8'};
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, {Allow:'GET, HEAD'}).end('Method not allowed');
    return;
  }
  let path;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (pathname.includes('\\') || path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end('Forbidden'); return;
    }
  } catch { res.writeHead(400).end('Bad request'); return; }
  try {
    const info = await stat(path);
    if (!info.isFile()) { res.writeHead(404).end('Not found'); return; }
    const bytes = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404).end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`OMAR / FIT: http://localhost:${port}\nPress Ctrl+C to stop. Local development server only.`));
