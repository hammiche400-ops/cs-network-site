// CS Network — rendu des 3 gabarits. URL : campus.html?c=rennes · pole.html?c=rennes&p=conferences
(function () {
  const D = window.CSN_DATA, q = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const cid = D.campuses[q.get('c')] ? q.get('c') : 'rennes';
  const C = D.campuses[cid];
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const arrow = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const back = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const $ = id => document.getElementById(id);

  $('nav').innerHTML = D.order.map(id =>
    `<a href="campus.html?c=${id}"${page !== 'home' && id === cid ? ' aria-current="page"' : ''}>${esc(D.campuses[id].name)}</a>`).join('');

  if (page === 'home') {
    $('campus-list').innerHTML = D.order.map((id, i) => { const c = D.campuses[id]; return `
      <a class="card-campus" href="campus.html?c=${id}">
        <span class="card-campus__num">0${i + 1}</span>
        <span class="card-campus__body"><span class="card-campus__name">${esc(c.name)}</span><span class="card-campus__place">${esc(c.place)}</span></span>
        <span class="card-campus__foot"><span>${c.poles.length} pôles</span>${arrow}</span>
      </a>`; }).join('');
  }

  if (page === 'campus') {
    document.title = `${C.name} — CS Network`;
    $('eyebrow').textContent = `Campus · ${C.place}`;
    $('title').textContent = C.name;
    $('intro').textContent = C.intro;
    $('count').textContent = `${C.poles.length} pôles`;
    $('pole-list').innerHTML = C.poles.map(p => `
      <a class="card-pole" href="pole.html?c=${cid}&p=${p.id}">
        <span class="card-pole__head"><span class="card-pole__name">${esc(p.name)}</span>${arrow}</span>
        <span class="card-pole__tagline">${esc(p.tagline)}</span>
        <span class="card-pole__people">Responsable${p.leads.length > 1 ? 's' : ''} : ${p.leads.map(l => esc(l.name)).join(', ')}</span>
      </a>`).join('');
  }

  if (page === 'pole') {
    const P = C.poles.find(p => p.id === q.get('p')) || C.poles[0];
    const duo = P.leads.length > 1;
    document.title = `${P.name} · ${C.name} — CS Network`;
    $('back').href = `campus.html?c=${cid}`;
    $('back').innerHTML = `${back}Pôles de ${esc(C.name)}`;
    $('eyebrow').textContent = `Pôle · Campus de ${C.name}`;
    $('title').textContent = P.name;
    $('btn-email').href = `mailto:${P.email}`;
    $('btn-linkedin').href = P.linkedin;
    $('contact-note').textContent = `Contact direct : ${P.leads.map(l => l.name.replace(' [Nom]', '')).join(' et ')} · ${P.email}`;
    $('desc').textContent = P.desc;
    $('lead-title').textContent = duo ? 'Responsables' : 'Responsable';
    $('lead-list').innerHTML = P.leads.map(l => `
      <div class="card-lead">
        ${l.photo ? `<img class="card-lead__photo" src="${esc(l.photo)}" alt="${esc(l.name)}">` : `<div class="card-lead__photo" aria-hidden="true">${esc(l.name[0])}</div>`}
        <div class="card-lead__info">
          <div class="card-lead__name">${esc(l.name)}</div>
          <div class="card-lead__role">${duo ? 'Co-responsable' : 'Responsable'} du pôle ${esc(P.name)}</div>
          <div class="card-lead__meta">CentraleSupélec · ${esc(C.name)}</div>
        </div>
      </div>`).join('');
  }
})();
