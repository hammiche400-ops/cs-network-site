// Génère un QR code (PNG 1000 px + SVG) pour chaque page publiée, dans qrcodes/.
// Usage : node build/qrcodes.mjs        (URL de base : site.config.json)
//         BASE_URL=https://… node build/qrcodes.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData, DataError } from './data.mjs';
import { resolveBaseUrl } from './build.mjs';
import { paths } from './render.mjs';
import { encode, toSvg, toPng } from './qr.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'qrcodes');

// Bordeaux foncé sur blanc — assez sombre pour un contraste sûr à l'impression.
const STYLE = { color: '#560D20', background: '#FFFFFF', margin: 4, size: 1000 };

/** Les pages publiées et le nom de fichier de leur QR code. */
export function targets(published, base) {
  const list = [];
  for (const c of published) {
    list.push({ file: c.id, label: `Campus de ${c.name}`, url: base + paths.campus(c.id) });
    for (const p of c.poles)
      list.push({ file: `${c.id}-${p.id}`, label: `${c.name} · ${p.name}`, url: base + paths.pole(c.id, p.id) });
  }
  return list;
}

export function generate() {
  const base = resolveBaseUrl();
  const { published } = loadData(join(ROOT, 'data.js'));
  const list = targets(published, base.href);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  for (const t of list) {
    const { matrix, version } = encode(t.url);
    writeFileSync(join(OUT, `${t.file}.png`), toPng(matrix, STYLE));
    writeFileSync(join(OUT, `${t.file}.svg`), toSvg(matrix, STYLE));
    t.version = version;
  }

  writeFileSync(join(OUT, 'liste.txt'),
    `QR codes CS Network — régénérés avec « npm run qr »\n` +
    `URL de base : ${base.href}\n\n` +
    list.map(t => `${t.file}.png / .svg\n  ${t.label}\n  ${t.url}\n`).join('\n'));

  return { base, list };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { base, list } = generate();
    console.log(`URL de base : ${base.href}`);
    console.log(`${list.length} QR codes écrits dans qrcodes/ (PNG 1000 px + SVG, correction d'erreur élevée) :`);
    for (const t of list) console.log(`  ${t.file.padEnd(22)} → ${t.url}`);
    console.log(`\nRécapitulatif des URL : qrcodes/liste.txt`);
  } catch (e) {
    console.error(`\n✖ Les QR codes n'ont pas pu être générés.\n\n${e instanceof DataError ? e.message : e.stack}\n`);
    process.exit(1);
  }
}
