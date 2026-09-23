// Encodeur QR Code (ISO/IEC 18004) — mode octet, correction d'erreur H (30 %).
// Sans dépendance : sortie SVG, et PNG via le module zlib intégré à Node.
// Versions 1 à 20 prises en charge, soit jusqu'à 382 octets : largement assez pour une URL.
import { deflateSync } from 'node:zlib';

/* ---------- Tables normalisées ---------- */

// Par version : [octets de correction par bloc, blocs G1, données G1, blocs G2, données G2]
const ECC_H = [
  [17, 1, 9, 0, 0], [28, 1, 16, 0, 0], [22, 2, 13, 0, 0], [16, 4, 9, 0, 0],
  [22, 2, 11, 2, 12], [28, 4, 15, 0, 0], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15],
  [24, 4, 12, 4, 13], [28, 6, 15, 2, 16], [24, 3, 12, 8, 13], [28, 7, 14, 4, 15],
  [22, 12, 11, 4, 12], [24, 11, 12, 5, 13], [24, 11, 12, 7, 13], [30, 3, 15, 13, 16],
  [28, 2, 14, 17, 15], [28, 2, 14, 19, 15], [26, 9, 13, 16, 14], [28, 15, 15, 10, 16],
];

// Nombre total d'octets (données + correction) par version — sert de contrôle de cohérence.
const TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
  404, 466, 532, 581, 655, 733, 815, 901, 991, 1085];

// Centres des motifs d'alignement (annexe E).
const ALIGN = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46],
  [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70],
  [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
];

const ECL_H_BITS = 0b10; // indicateur du niveau de correction H

/* ---------- Corps de Galois GF(256), polynôme 0x11D ---------- */

const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x; LOG[x] = i;
  x <<= 1; if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

/**
 * Coefficients du polynôme générateur de Reed-Solomon de degré `degree`,
 * du degré le plus fort au plus faible, terme dominant (toujours 1) exclu.
 */
function generator(degree) {
  let poly = [1]; // degrés croissants : poly[j] = coefficient de x^j
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= mul(poly[j], EXP[i]); // × α^i
      next[j + 1] ^= poly[j];          // × x
    }
    poly = next;
  }
  return poly.slice(0, degree).reverse();
}

/** Octets de correction d'erreur d'un bloc de données. */
function ecBytes(data, count) {
  const gen = generator(count);
  const rem = new Uint8Array(count);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.copyWithin(0, 1); rem[count - 1] = 0;
    for (let i = 0; i < count; i++) rem[i] ^= mul(gen[i], factor);
  }
  return rem;
}

/* ---------- Encodage des données ---------- */

function chooseVersion(byteLength) {
  for (let v = 1; v <= ECC_H.length; v++) {
    const [ec, g1, d1, g2, d2] = ECC_H[v - 1];
    const dataCodewords = g1 * d1 + g2 * d2;
    if (ec * (g1 + g2) + dataCodewords !== TOTAL_CODEWORDS[v - 1])
      throw new Error(`table QR incohérente à la version ${v}`);
    const countBits = v <= 9 ? 8 : 16;
    if (4 + countBits + byteLength * 8 <= dataCodewords * 8) return v;
  }
  throw new Error(`contenu trop long pour un QR code (${byteLength} octets, maximum 382).`);
}

/** Flux binaire : mode octet + longueur + données + bourrage. */
function dataCodewords(bytes, version) {
  const [, g1, d1, g2, d2] = ECC_H[version - 1];
  const capacity = (g1 * d1 + g2 * d2) * 8;
  const bits = [];
  const push = (value, length) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };

  push(0b0100, 4);                              // mode octet
  push(bytes.length, version <= 9 ? 8 : 16);    // longueur
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity - bits.length)); // terminateur
  while (bits.length % 8) bits.push(0);         // alignement octet

  const out = [];
  for (let i = 0; i < bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let i = 0; out.length < capacity / 8; i++) out.push(i % 2 === 0 ? 0xec : 0x11);
  return out;
}

/** Découpe en blocs, calcule la correction, entrelace le tout. */
function finalCodewords(data, version) {
  const [ecLen, g1, d1, g2, d2] = ECC_H[version - 1];
  const blocks = [];
  let at = 0;
  for (let i = 0; i < g1 + g2; i++) {
    const len = i < g1 ? d1 : d2;
    const chunk = data.slice(at, at + len); at += len;
    blocks.push({ data: chunk, ec: ecBytes(chunk, ecLen) });
  }
  const out = [];
  for (let i = 0; i < Math.max(d1, d2); i++)
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i]);
  for (let i = 0; i < ecLen; i++)
    for (const b of blocks) out.push(b.ec[i]);
  return out;
}

/* ---------- Matrice ---------- */

const MASKS = [
  (y, x) => (x + y) % 2 === 0,
  (y) => y % 2 === 0,
  (y, x) => x % 3 === 0,
  (y, x) => (x + y) % 3 === 0,
  (y, x) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (y, x) => (x * y) % 2 + (x * y) % 3 === 0,
  (y, x) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
  (y, x) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
];

function buildMatrix(codewords, version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Uint8Array(size));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));
  const set = (x, y, dark) => { modules[y][x] = dark ? 1 : 0; reserved[y][x] = 1; };

  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

  for (let i = 8; i < size - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }

  const centres = ALIGN[version - 1];
  for (const cy of centres) for (const cx of centres) {
    if ((cx === 6 && cy === 6) || (cx === 6 && cy === size - 7) || (cx === size - 7 && cy === 6)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  // Emplacements réservés à l'information de format (remplis après le choix du masque).
  for (let i = 0; i <= 8; i++) { if (i !== 6) { set(i, 8, false); set(8, i, false); } }
  for (let i = 0; i < 8; i++) { set(size - 1 - i, 8, false); set(8, size - 1 - i, false); }
  set(8, size - 8, true); // module toujours noir

  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | (rem & 0xfff);
    for (let i = 0; i < 18; i++) {
      const bit = (bits >>> i) & 1, a = size - 11 + (i % 3), b = Math.floor(i / 3);
      set(a, b, bit); set(b, a, bit);
    }
  }

  // Placement des données en zigzag, de droite à gauche.
  let bitIndex = 0;
  const nextBit = () => {
    const i = bitIndex++;
    return i < codewords.length * 8 ? (codewords[i >>> 3] >>> (7 - (i & 7))) & 1 : 0;
  };
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!reserved[y][x]) modules[y][x] = nextBit();
      }
    }
  }

  // Choix du masque : celui qui obtient la plus faible pénalité.
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const test = modules.map(r => Uint8Array.from(r));
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
      if (!reserved[y][x] && MASKS[mask](y, x)) test[y][x] ^= 1;
    applyFormat(test, mask, size);
    const score = penalty(test, size);
    if (!best || score < best.score) best = { score, modules: test };
  }
  return best.modules;
}

function applyFormat(m, mask, size) {
  const data = (ECL_H_BITS << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | (rem & 0x3ff)) ^ 0x5412;
  const bit = i => (bits >>> i) & 1;
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  for (let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
  m[size - 8][8] = 1;
}

function penalty(m, size) {
  let score = 0;
  const FINDER = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const line = get => {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && get(i) === get(i - 1)) { run++; continue; }
      if (run >= 5) score += 3 + (run - 5);
      run = 1;
    }
    for (let i = 0; i + 11 <= size; i++) {
      let fwd = true, bwd = true;
      for (let k = 0; k < 11; k++) {
        if (get(i + k) !== FINDER[k]) fwd = false;
        if (get(i + k) !== FINDER[10 - k]) bwd = false;
      }
      if (fwd || bwd) score += 40;
    }
  };
  for (let y = 0; y < size; y++) line(x => m[y][x]);
  for (let x = 0; x < size; x++) line(y => m[y][x]);

  let dark = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    dark += m[y][x];
    if (y + 1 < size && x + 1 < size &&
      m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
  }
  score += 10 * Math.floor(Math.abs(dark * 100 / (size * size) - 50) / 5);
  return score;
}

/* ---------- API ---------- */

/** Encode un texte en matrice de modules (tableau de lignes de 0/1), correction H. */
export function encode(text) {
  const bytes = [...Buffer.from(text, 'utf8')];
  const version = chooseVersion(bytes.length);
  const matrix = buildMatrix(finalCodewords(dataCodewords(bytes, version), version), version);
  return { matrix, version, size: matrix.length };
}

/* ---------- Sorties ---------- */

/** SVG vectoriel : s'imprime à n'importe quelle taille sans perte. */
export function toSvg(matrix, { margin = 4, color = '#000000', background = '#FFFFFF', size = 1000 } = {}) {
  const n = matrix.length, total = n + margin * 2;
  const parts = [];
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!matrix[y][x]) { x++; continue; }
      let run = 0;
      while (x + run < n && matrix[y][x + run]) run++;
      parts.push(`M${x + margin} ${y + margin}h${run}v1h-${run}z`);
      x += run;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code">
<rect width="${total}" height="${total}" fill="${background}"/>
<path fill="${color}" d="${parts.join('')}"/>
</svg>
`;
}

const CRC_TABLE = Int32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = buf => {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

const rgb = hex => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};

/**
 * PNG en couleurs indexées, 1 bit par pixel. Les modules sont mis à l'échelle
 * par un entier (bords nets) puis centrés dans une image de `size` pixels ;
 * la marge restante agrandit la zone blanche, ce qui aide à la lecture.
 */
export function toPng(matrix, { margin = 4, color = '#000000', background = '#FFFFFF', size = 1000 } = {}) {
  const n = matrix.length, total = n + margin * 2;
  const scale = Math.floor(size / total);
  if (scale < 1) throw new Error(`image trop petite : il faut au moins ${total} pixels.`);
  const pad = Math.floor((size - total * scale) / 2);

  const rowBytes = (size + 7) >> 3;
  const raw = Buffer.alloc((rowBytes + 1) * size); // 1 octet de filtre par ligne
  for (let py = 0; py < size; py++) {
    const my = Math.floor((py - pad) / scale) - margin;
    if (my < 0 || my >= n) continue;
    const row = matrix[my];
    const base = py * (rowBytes + 1) + 1;
    for (let px = 0; px < size; px++) {
      const mx = Math.floor((px - pad) / scale) - margin;
      if (mx < 0 || mx >= n || !row[mx]) continue;
      raw[base + (px >> 3)] |= 0x80 >> (px & 7);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 1;  // profondeur : 1 bit
  ihdr[9] = 3;  // couleurs indexées
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('PLTE', Buffer.from([...rgb(background), ...rgb(color)])),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
