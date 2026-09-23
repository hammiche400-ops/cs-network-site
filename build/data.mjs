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

/**
 * Renvoie { campuses } : la liste des campus dans l'ordre de `order`, chacun avec
 * ses pôles normalisés. Lève une erreur lisible si data.js contient une faute.
 */
export function loadData(file) {
  const raw = evaluate(file);
  if (!Array.isArray(raw.order) || raw.order.length === 0)
    throw new DataError("data.js : « order » doit lister au moins un campus.");

  const seen = new Set();
  const campuses = raw.order.map(id => {
    const where = `campus « ${id} »`;
    if (!SLUG.test(id)) throw new DataError(`${where} : l'identifiant ne peut contenir que des lettres minuscules, des chiffres et des tirets.`);
    if (seen.has(id)) throw new DataError(`${where} apparaît deux fois dans « order ».`);
    seen.add(id);

    const c = raw.campuses?.[id];
    if (!c) throw new DataError(`${where} est listé dans « order » mais absent de « campuses ».`);
    if (typeof c.published !== 'boolean')
      throw new DataError(`${where} : ajoutez « published: true » ou « published: false ».`);

    const poleIds = new Set();
    const poles = (c.poles || []).map(p => {
      const pw = `${where}, pôle « ${p?.id} »`;
      if (!SLUG.test(p?.id || '')) throw new DataError(`${where} : un pôle a un identifiant invalide (${JSON.stringify(p?.id)}). Lettres minuscules, chiffres et tirets uniquement.`);
      if (poleIds.has(p.id)) throw new DataError(`${where} : deux pôles portent l'identifiant « ${p.id} ».`);
      poleIds.add(p.id);
      const leads = Array.isArray(p.leads) ? p.leads : [];
      if (leads.length === 0) throw new DataError(`${pw} : il faut au moins un responsable dans « leads ».`);
      leads.forEach(l => need(l, 'name', `${pw}, responsable`));
      return {
        id: p.id,
        name: need(p, 'name', pw),
        tagline: need(p, 'tagline', pw),
        desc: need(p, 'desc', pw),
        email: need(p, 'email', pw),
        linkedin: need(p, 'linkedin', pw),
        leads: leads.map(l => ({ name: l.name, photo: l.photo || '' })),
      };
    });

    if (c.published && poles.length === 0)
      throw new DataError(`${where} est publié mais n'a aucun pôle. Ajoutez un pôle ou passez « published » à false.`);

    return {
      id,
      name: need(c, 'name', where),
      place: need(c, 'place', where),
      intro: need(c, 'intro', where),
      published: c.published,
      poles,
    };
  });

  const orphans = Object.keys(raw.campuses || {}).filter(id => !seen.has(id));
  if (orphans.length) throw new DataError(`campus absent(s) de « order » : ${orphans.join(', ')}. Ajoutez-les à la liste « order » en haut de data.js.`);
  if (!campuses.some(c => c.published)) throw new DataError("Aucun campus n'est publié : le site serait vide. Passez « published » à true pour au moins un campus.");

  return { campuses, published: campuses.filter(c => c.published) };
}

export { DataError };
