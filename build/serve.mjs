// Serveur local pour prévisualiser dist/ exactement comme en ligne,
// y compris le sous-chemin et la vraie page 404. Usage : node build/serve.mjs
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBaseUrl } from './build.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

const base = resolveBaseUrl();
const prefix = base.path; // ex. « /cs-network-site/ »

const notFound = res => {
  res.writeHead(404, { 'content-type': TYPES['.html'] });
  try { res.end(readFileSync(join(DIST, '404.html'))); }
  catch { res.end('404'); }
};

createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  if (!url.startsWith(prefix)) {
    if (url === prefix.slice(0, -1)) { res.writeHead(302, { location: prefix }); return res.end(); }
    return notFound(res);
  }

  let rel = normalize(url.slice(prefix.length));
  if (rel.startsWith('..')) return notFound(res);
  let file = join(DIST, rel);

  try {
    if (statSync(file).isDirectory()) {
      if (!url.endsWith('/')) { res.writeHead(302, { location: url + '/' }); return res.end(); }
      file = join(file, 'index.html');
    }
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    notFound(res);
  }
}).listen(PORT, () => {
  console.log(`\n  Site disponible sur  http://localhost:${PORT}${prefix}`);
  console.log(`  (Ctrl+C pour arrêter)\n`);
});
