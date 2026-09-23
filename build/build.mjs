// Génère le site statique dans dist/ : une page par campus et par pôle publié.
// Usage : node build/build.mjs          (URL de base : site.config.json)
//         BASE_URL=https://… node build/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData, DataError } from './data.mjs';
import * as R from './render.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const p = (...s) => join(ROOT, ...s);

/* ---------- URL de base ---------- */

export function resolveBaseUrl() {
  const cfg = JSON.parse(readFileSync(p('site.config.json'), 'utf8'));
  const raw = process.env.BASE_URL || cfg.baseUrl || 'http://localhost:8080/';
  let url;
  try { url = new URL(raw.replace(/\/+$/, '') + '/'); }
  catch { throw new DataError(`URL de base invalide : « ${raw} ». Attendu par exemple https://mon-compte.github.io/cs-network-site/`); }
  return { origin: url.origin, path: url.pathname, href: url.href };
}

/* ---------- Mini-gabarits : on remplit les éléments par leur id ---------- */

const tag = id => new RegExp(`<(\\w+)([^>]*\\sid="${id}"[^>]*)>`);

/** Remplit le contenu d'un élément vide repéré par son id. */
function fill(html, id, inner) {
  const re = new RegExp(`(<(\\w+)[^>]*\\sid="${id}"[^>]*>)\\s*</\\2>`);
  if (!re.test(html)) throw new Error(`gabarit : élément vide id="${id}" introuvable`);
  return html.replace(re, (_, open, name) => `${open}${inner}</${name}>`);
}

/** Remplit un élément avec du texte (échappé). */
const text = (html, id, value) => fill(html, id, R.esc(value));

/** Change un attribut sur l'élément repéré par son id. */
function attr(html, id, name, value) {
  const re = tag(id);
  if (!re.test(html)) throw new Error(`gabarit : élément id="${id}" introuvable`);
  return html.replace(re, m => {
    const a = new RegExp(`\\s${name}="[^"]*"`);
    const set = ` ${name}="${R.esc(value)}"`;
    return a.test(m) ? m.replace(a, set) : m.replace(/>$/, `${set}>`);
  });
}

/* ---------- Métadonnées de page ---------- */

function head({ title, description, canonical, logo, extra = '', noindex = false }) {
  return [
    `<meta name="description" content="${R.esc(description)}">`,
    noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${R.esc(canonical)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${R.esc(title)}">`,
    `<meta property="og:description" content="${R.esc(description)}">`,
    `<meta property="og:url" content="${R.esc(canonical)}">`,
    `<meta property="og:image" content="${R.esc(logo)}">`,
    extra,
  ].filter(Boolean).join('\n');
}

const template = name => readFileSync(p('templates', `${name}.html`), 'utf8');

function write(relPath, html) {
  const out = join(DIST, relPath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return relPath;
}

/* ---------- Construction ---------- */

export function build() {
  const base = resolveBaseUrl();
  const { campuses, published } = loadData(p('data.js'));
  const abs = path => base.origin + base.path + path;
  const logo = abs('assets/cs-network-logo.jpg');
  const written = [];

  const page = (tpl, { prefix, title, description, canonical, extra, noindex, currentId, fillBody }) => {
    let html = tpl
      .replace(/\{\{title\}\}/g, R.esc(title))
      .replace(/\{\{head\}\}/g, head({ title, description, canonical, logo, extra, noindex }))
      .replace(/\{\{base\}\}/g, prefix)
      .replace(/\{\{home\}\}/g, prefix || './');
    const link = R.linker(prefix);
    html = fill(html, 'nav', R.renderNav(published, link, currentId));
    return fillBody(html, link);
  };

  /* Accueil */
  const homeLead = "Adossée à CentraleSupélec Alumni, CS Network organise conférences, podcasts et mises en relation entre les étudiants de CentraleSupélec, les anciens et les professionnels.";
  written.push(write('index.html', page(template('index'), {
    prefix: '',
    title: 'CS Network — CentraleSupélec',
    description: homeLead,
    canonical: abs(''),
    extra: campuses.some(c => !c.published) ? R.SOON_STYLE : '',
    fillBody: (html, link) => fill(html, 'campus-list', R.renderCampusCards(campuses, link)),
  })));

  /* Page 404 : servie depuis n'importe quelle profondeur d'URL → chemins absolus. */
  written.push(write('404.html', page(template('404'), {
    prefix: base.path,
    title: 'Page introuvable — CS Network',
    description: 'Cette adresse ne correspond à aucune page du site CS Network.',
    canonical: abs(''),
    noindex: true,
    extra: campuses.some(c => !c.published) ? R.SOON_STYLE : '',
    fillBody: (html, link) => fill(html, 'campus-list', R.renderCampusCards(campuses, link)),
  })));

  /* Une page par campus publié, une page par pôle */
  for (const c of published) {
    written.push(write(`${c.id}/index.html`, page(template('campus'), {
      prefix: '../',
      currentId: c.id,
      title: `${c.name} — CS Network`,
      description: c.intro,
      canonical: abs(R.paths.campus(c.id)),
      fillBody: (html, link) => {
        html = text(html, 'eyebrow', `Campus · ${c.place}`);
        html = text(html, 'title', c.name);
        html = text(html, 'intro', c.intro);
        html = text(html, 'count', `${c.poles.length} pôles`);
        return fill(html, 'pole-list', R.renderPoleCards(c, link));
      },
    })));

    for (const pole of c.poles) {
      written.push(write(`${c.id}/${pole.id}/index.html`, page(template('pole'), {
        prefix: '../../',
        currentId: c.id,
        title: `${pole.name} · ${c.name} — CS Network`,
        description: pole.tagline,
        canonical: abs(R.paths.pole(c.id, pole.id)),
        fillBody: (html, link) => {
          html = attr(html, 'back', 'href', link.campus(c.id));
          html = fill(html, 'back', `${R.BACK}Pôles de ${R.esc(c.name)}`);
          html = text(html, 'eyebrow', `Pôle · Campus de ${c.name}`);
          html = text(html, 'title', pole.name);
          html = attr(html, 'btn-email', 'href', `mailto:${pole.email}`);
          html = attr(html, 'btn-linkedin', 'href', pole.linkedin);
          html = text(html, 'contact-note', R.contactNote(pole));
          html = text(html, 'desc', pole.desc);
          html = text(html, 'lead-title', pole.leads.length > 1 ? 'Responsables' : 'Responsable');
          return fill(html, 'lead-list', R.renderLeads(pole, c));
        },
      })));
    }
  }

  /* Ressources statiques */
  cpSync(p('styles.css'), join(DIST, 'styles.css'));
  cpSync(p('assets'), join(DIST, 'assets'), { recursive: true });
  writeFileSync(join(DIST, '.nojekyll'), '');

  return { base, written, campuses, published };
}

/* ---------- Exécution ---------- */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    rmSync(DIST, { recursive: true, force: true });
    const { base, written, campuses, published } = build();
    const soon = campuses.filter(c => !c.published).map(c => c.name);
    console.log(`URL de base : ${base.href}`);
    console.log(`Campus publiés : ${published.map(c => c.name).join(', ')}`);
    if (soon.length) console.log(`Campus non publiés (« Bientôt », aucune page générée) : ${soon.join(', ')}`);
    console.log(`${written.length} pages écrites dans dist/ :`);
    for (const f of written) console.log(`  dist/${f}`);
  } catch (e) {
    console.error(`\n✖ Le site n'a pas pu être généré.\n\n${e instanceof DataError ? e.message : e.stack}\n`);
    process.exit(1);
  }
}
