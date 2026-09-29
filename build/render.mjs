// Fragments HTML du site. Reprend le balisage rendu jusqu'ici par app.js, et ne
// compose que des classes déjà présentes dans styles.css.
export const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

const ARROW = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
export const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const MAIL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16"/><path d="m22 7-10 6L2 7"/></svg>';
const LINKEDIN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>';

/** Chemin d'une page, relatif à la racine du site. */
export const paths = {
  home: () => '',
  campus: c => `${c}/`,
  pole: (c, p) => `${c}/${p}/`,
};

/**
 * Fabrique les liens d'une page à partir de son préfixe :
 * '' pour l'accueil, '../' pour /rennes/, '../../' pour /rennes/conferences/.
 */
export const linker = prefix => ({
  home: () => prefix || './',
  campus: c => prefix + paths.campus(c),
  pole: (c, p) => prefix + paths.pole(c, p),
});

/** Compte en français : « 4 personnes », « 1 personne ». */
export const people = n => `${n} personne${n > 1 ? 's' : ''}`;
const poleCount = n => `${n} pôle${n > 1 ? 's' : ''}`;

/* ---------- Navigation et cartes campus ---------- */

/** Navigation du header : uniquement les campus publiés. */
export function renderNav(campuses, link, currentId) {
  return campuses.map(c =>
    `<a href="${link.campus(c.id)}"${c.id === currentId ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`).join('');
}

/** Cartes de l'accueil. Un campus non publié devient une carte « Bientôt », non cliquable. */
export function renderCampusCards(campuses, link) {
  return campuses.map((c, i) => {
    const num = String(i + 1).padStart(2, '0');
    const head = `
        <span class="card-campus__num">${num}</span>
        <span class="card-campus__body"><span class="card-campus__name">${esc(c.name)}</span><span class="card-campus__place">${esc(c.place)}</span></span>`;
    if (!c.published) return `
      <span class="card-campus card-campus--soon">${head}
        <span class="card-campus__foot"><span class="small">Bientôt</span></span>
      </span>`;
    // Un campus sans pôle publié annonce la taille de son équipe.
    const count = c.poles.length ? poleCount(c.poles.length) : `${c.team.length} membres`;
    return `
      <a class="card-campus" href="${link.campus(c.id)}">${head}
        <span class="card-campus__foot"><span>${count}</span>${ARROW}</span>
      </a>`;
  }).join('');
}

/** Cartes de pôles d'un campus. */
export function renderPoleCards(campus, link) {
  return campus.poles.map(p => `
      <a class="card-pole" href="${link.pole(campus.id, p.id)}">
        <span class="card-pole__head"><span class="card-pole__name">${esc(p.name)}</span>${ARROW}</span>
        <span class="card-pole__tagline">${esc(p.tagline)}</span>
        <span class="card-pole__people">Responsable${p.leads.length > 1 ? 's' : ''} : ${p.leads.map(l => esc(l.name)).join(', ')}</span>
      </a>`).join('');
}

/* ---------- Carte personne ---------- */

/**
 * Carte responsable existante (.card-lead), avec son rôle et ses deux liens de
 * contact. `meta` ajoute la ligne « CentraleSupélec · Campus » des pages pôle.
 */
export function personCard(p, role, meta = '') {
  return `
      <div class="card-lead">
        ${p.photo ? `<img class="card-lead__photo" src="${esc(p.photo)}" alt="${esc(p.name)}">` : `<div class="card-lead__photo" aria-hidden="true">${esc(p.name[0])}</div>`}
        <div class="card-lead__info">
          <div class="card-lead__name">${esc(p.name)}</div>
          <div class="card-lead__role">${esc(role)}</div>${meta ? `
          <div class="card-lead__meta">${esc(meta)}</div>` : ''}
          <div class="contact">
            <a class="btn btn--email btn--sm" href="mailto:${esc(p.email)}" aria-label="Écrire à ${esc(p.name)}">Email${MAIL_ICON}</a>
            <a class="btn btn--linkedin btn--sm" href="${esc(p.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn de ${esc(p.name)}">LinkedIn${LINKEDIN_ICON}</a>
          </div>
        </div>
      </div>`;
}

const cards = list => list.map(([p, role, meta]) => personCard(p, role, meta)).join('');

/** Barre de section + grille, ou rien du tout si la liste est vide. */
function section(title, note, body) {
  if (!body) return '';
  return `
  <div class="section-bar"><h2 class="h2">${esc(title)}</h2><span class="small">${esc(note)}</span></div>
  <div class="grid grid--pole">${body}</div>`;
}

/* ---------- Page campus ---------- */

/** Rôle d'un responsable de pôle : « Responsable Podcast », « Co-responsable Podcast ». */
const leadRole = (pole, short) =>
  `${pole.leads.length > 1 ? 'Co-responsable' : 'Responsable'}${short ? ' ' : ' du pôle '}${pole.name}`;

/**
 * Toutes les sections d'une page campus, dans l'ordre : les pôles, le bureau,
 * les responsables de pôle, les membres. Une section vide n'est pas rendue et ne
 * laisse aucun espace.
 */
export function renderCampusSections(campus, link) {
  const bureau = campus.team.filter(m => m.bureau);
  const membres = campus.team.filter(m => !m.bureau);
  // Les responsables de pôle se déduisent des pôles : personne n'est saisi deux fois.
  const responsables = campus.poles.flatMap(p => p.leads.map(l => [l, leadRole(p, true), '']));

  return [
    campus.poles.length
      ? `
  <div class="section-bar"><h2 class="h2">Les pôles</h2><span class="small">${poleCount(campus.poles.length)}</span></div>
  <div class="grid grid--pole">${renderPoleCards(campus, link)}</div>`
      : '',
    section('Le bureau', people(bureau.length), cards(bureau.map(m => [m, m.role, '']))),
    section('Les responsables de pôle', people(responsables.length), cards(responsables)),
    section('Les membres', people(membres.length), cards(membres.map(m => [m, m.role, '']))),
  ].filter(Boolean).join('\n');
}

/* ---------- Page pôle ---------- */

/** Cartes responsable(s) d'un pôle, chacune avec ses propres liens de contact. */
export const renderLeads = (pole, campus) =>
  cards(pole.leads.map(l => [l, leadRole(pole, false), `CentraleSupélec · ${campus.name}`]));

/** « Contact direct : Maxime Vila · maxime.vila@student-cs.fr » — le premier responsable. */
export const contactNote = pole => {
  const first = pole.leads[0];
  return `Contact direct : ${first.name} · ${first.email}`;
};

/* ---------- Section Hackathon de l'accueil ---------- */

export function renderHackathon(h) {
  if (!h) return '';
  const facts = h.facts.map(f => `
      <div class="card-pole card-pole--static">
        <span class="card-pole__name">${esc(f.value)}</span>
        <span class="card-pole__tagline">${esc(f.label)}</span>
      </div>`).join('');
  const companies = h.companies ? `
  <div class="ruled"><h2 class="h2 h2--sm">${esc(h.companies.title)}</h2><p class="body-lg">${esc(h.companies.text)}</p></div>` : '';
  // Bloc contacts masqué tant que la liste est vide, sans espace laissé.
  const contacts = section('Contacts', people(h.contacts.length), cards(h.contacts.map(m => [m, m.role, ''])));
  return `
  <div class="section-bar"><h2 class="h2">${esc(h.title)}</h2><span class="small">${esc(h.note)}</span></div>
  <div class="grid grid--pole">${facts}</div>${companies}${contacts}`;
}

/* ---------- Styles ajoutés par le build ---------- */
// Trois règles, injectées dans les pages générées et non dans styles.css, qui
// n'introduisent ni couleur ni police nouvelle. Les deux premières neutralisent
// le survol de cartes qui ne sont pas cliquables ; la troisième est une variante
// compacte des boutons de contact existants, à 44px de haut.

export const STYLES = {
  soon: '.card-campus--soon{cursor:default}.card-campus--soon:hover{border-color:var(--border)}',
  staticCard: '.card-pole--static{cursor:default}.card-pole--static:hover{border-color:var(--border)}',
  smallBtn: '.btn--sm{min-height:44px;padding:0 10px;font-size:14px;gap:6px;justify-content:center}',
};

/** Assemble un unique bloc <style> à partir des règles demandées. */
export const styleBlock = (...keys) => {
  const css = keys.filter(k => STYLES[k]).map(k => STYLES[k]).join('');
  return css ? `<style>${css}</style>` : '';
};
