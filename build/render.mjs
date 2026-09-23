// Fragments HTML du site. Reprend à l'identique le balisage produit jusqu'ici par app.js.
export const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

const ARROW = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
export const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

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
    return `
      <a class="card-campus" href="${link.campus(c.id)}">${head}
        <span class="card-campus__foot"><span>${c.poles.length} pôles</span>${ARROW}</span>
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

/** Cartes responsable(s) d'un pôle. */
export function renderLeads(pole, campus) {
  const duo = pole.leads.length > 1;
  return pole.leads.map(l => `
      <div class="card-lead">
        ${l.photo ? `<img class="card-lead__photo" src="${esc(l.photo)}" alt="${esc(l.name)}">` : `<div class="card-lead__photo" aria-hidden="true">${esc(l.name[0])}</div>`}
        <div class="card-lead__info">
          <div class="card-lead__name">${esc(l.name)}</div>
          <div class="card-lead__role">${duo ? 'Co-responsable' : 'Responsable'} du pôle ${esc(pole.name)}</div>
          <div class="card-lead__meta">CentraleSupélec · ${esc(campus.name)}</div>
        </div>
      </div>`).join('');
}

/** « Contact direct : Maxime · conferences.rennes@csnetwork.fr » */
export const contactNote = pole =>
  `Contact direct : ${pole.leads.map(l => l.name.replace(' [Nom]', '')).join(' et ')} · ${pole.email}`;

/**
 * Seule règle de style ajoutée par le build : elle retire l'effet de survol des
 * cartes « Bientôt », qui ne sont pas cliquables. styles.css n'est pas modifié.
 */
export const SOON_STYLE = '<style>.card-campus--soon{cursor:default}.card-campus--soon:hover{border-color:var(--border)}</style>';
