// Chargement et validation de data.js — la seule source de contenu du site.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class DataError extends Error {}

/** Lit data.js (un simple `window.CSN_DATA = {...}`) sans le charger dans un navigateur. */
function evaluate(file) {
  const ctx = { window: {} };
  try {
    runInNewContext(readFileSync(file, 'utf8'), ctx, { filename: file });
  } catch (e) {
    throw new DataError(`data.js n'est pas un fichier JavaScript valide — ${e.message}\n` +
      `Vérifiez les virgules, les accolades et les apostrophes autour du texte que vous avez modifié.`);
  }
  if (!ctx.window.CSN_DATA) throw new DataError("data.js ne définit pas window.CSN_DATA.");
  return ctx.window.CSN_DATA;
}

const need = (obj, key, where) => {
  const v = obj?.[key];
  if (typeof v !== 'string' || !v.trim()) throw new DataError(`${where} : le champ « ${key} » est vide ou manquant.`);
  return v;
};

/** Le répertoire des personnes, chacune décrite une seule fois. */
function loadPeople(raw) {
  const people = new Map();
  for (const [id, p] of Object.entries(raw.people || {})) {
    const where = `personne « ${id} »`;
    if (!SLUG.test(id)) throw new DataError(`${where} : l'identifiant ne peut contenir que des lettres minuscules non accentuées, des chiffres et des tirets.`);
    people.set(id, {
      id,
      name: need(p, 'name', where),
      email: need(p, 'email', where),
      linkedin: need(p, 'linkedin', where),
      photo: p.photo || '',
    });
  }
  if (people.size === 0) throw new DataError("data.js : le répertoire « people » est vide.");
  return people;
}

/**
 * Renvoie { campuses, published, hackathon } : les campus dans l'ordre de `order`,
 * toutes les références de personnes résolues. Lève une erreur lisible si data.js
 * contient une faute de saisie.
 */
export function loadData(file) {
  const raw = evaluate(file);
  if (!Array.isArray(raw.order) || raw.order.length === 0)
    throw new DataError("data.js : « order » doit lister au moins un campus.");

  const people = loadPeople(raw);
  const used = new Set();

  /** Résout un identifiant de personne, ou explique comment le corriger. */
  const person = (id, where) => {
    if (typeof id !== 'string') throw new DataError(`${where} : attendu un identifiant de personne entre guillemets, reçu ${JSON.stringify(id)}.`);
    const p = people.get(id);
    if (!p) throw new DataError(`${where} : la personne « ${id} » n'existe pas dans « people ». ` +
      `Identifiants disponibles : ${[...people.keys()].join(', ')}.`);
    used.add(id);
    return p;
  };

  const seen = new Set();
  const campuses = raw.order.map(cid => {
    const where = `campus « ${cid} »`;
    if (!SLUG.test(cid)) throw new DataError(`${where} : l'identifiant ne peut contenir que des lettres minuscules, des chiffres et des tirets.`);
    if (seen.has(cid)) throw new DataError(`${where} apparaît deux fois dans « order ».`);
    seen.add(cid);

    const c = raw.campuses?.[cid];
    if (!c) throw new DataError(`${where} est listé dans « order » mais absent de « campuses ».`);
    if (typeof c.published !== 'boolean')
      throw new DataError(`${where} : ajoutez « published: true » ou « published: false ».`);

    const poleIds = new Set();
    const poles = (c.poles || []).map(p => {
      const pw = `${where}, pôle « ${p?.id} »`;
      if (!SLUG.test(p?.id || '')) throw new DataError(`${where} : un pôle a un identifiant invalide (${JSON.stringify(p?.id)}). Lettres minuscules, chiffres et tirets uniquement.`);
      if (poleIds.has(p.id)) throw new DataError(`${where} : deux pôles portent l'identifiant « ${p.id} ».`);
      poleIds.add(p.id);
      if (typeof p.published !== 'boolean')
        throw new DataError(`${pw} : ajoutez « published: true » ou « published: false ».`);

      const leads = (p.leads || []).map((id, i) => person(id, `${pw}, responsable n° ${i + 1}`));
      if (p.published && leads.length === 0)
        throw new DataError(`${pw} est publié mais n'a aucun responsable. Ajoutez un identifiant dans « leads », ou passez « published » à false.`);

      return {
        id: p.id,
        published: p.published,
        name: need(p, 'name', pw),
        tagline: need(p, 'tagline', pw),
        desc: need(p, 'desc', pw),
        leads,
      };
    });

    const team = (c.team || []).map((m, i) => {
      const mw = `${where}, membre n° ${i + 1}`;
      return { ...person(m?.person, mw), role: need(m, 'role', mw), bureau: m.bureau === true };
    });

    const livePoles = poles.filter(p => p.published);
    if (c.published && livePoles.length === 0 && team.length === 0)
      throw new DataError(`${where} est publié mais n'a ni pôle publié ni équipe. Publiez un pôle, ajoutez une équipe (« team »), ou passez « published » à false.`);

    return {
      id: cid,
      name: need(c, 'name', where),
      place: need(c, 'place', where),
      intro: need(c, 'intro', where),
      published: c.published,
      poles: livePoles,          // seuls les pôles publiés sont rendus
      allPoles: poles,
      team,
    };
  });

  const orphans = Object.keys(raw.campuses || {}).filter(id => !seen.has(id));
  if (orphans.length) throw new DataError(`campus absent(s) de « order » : ${orphans.join(', ')}. Ajoutez-les à la liste « order » en haut de data.js.`);
  if (!campuses.some(c => c.published)) throw new DataError("Aucun campus n'est publié : le site serait vide. Passez « published » à true pour au moins un campus.");

  const hackathon = loadHackathon(raw, person);
  return {
    campuses,
    published: campuses.filter(c => c.published),
    hackathon,
    people,
    unusedPeople: [...people.keys()].filter(id => !used.has(id)),
  };
}

/** La section Hackathon de l'accueil. Absente de data.js, elle n'est simplement pas rendue. */
function loadHackathon(raw, person) {
  const h = raw.hackathon;
  if (!h) return null;
  const where = 'hackathon';
  return {
    title: need(h, 'title', where),
    note: h.note || '',
    facts: (h.facts || []).map((f, i) => ({
      value: need(f, 'value', `${where}, fait n° ${i + 1}`),
      label: need(f, 'label', `${where}, fait n° ${i + 1}`),
    })),
    companies: h.companies ? {
      title: need(h.companies, 'title', `${where}, bloc entreprises`),
      text: need(h.companies, 'text', `${where}, bloc entreprises`),
    } : null,
    contacts: (h.contacts || []).map((m, i) => {
      const mw = `${where}, contact n° ${i + 1}`;
      return { ...person(m?.person, mw), role: need(m, 'role', mw) };
    }),
  };
}

export { DataError };
