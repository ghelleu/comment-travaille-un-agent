/*
  COMMENT TRAVAILLE UN AGENT IA — slider pas à pas.
  Aucune donnée ici : tout vient de window.PRESENTATION (contenu.js).
  Aucune bibliothèque, aucune requête réseau.

  1. Mise à l'échelle de la scène
  2. Dessin du schéma (pièces, boucle de l'agent, flux)
  3. Affichage d'une slide (texte, pièces visibles, flux animés, pannes)
  4. Animations : point lumineux le long des flux, orbite de la boucle
  5. Navigation : flèches, barre de progression, adresse (#3), plein écran
*/
(function () {
  'use strict';

  const P = window.PRESENTATION;
  const NS = 'http://www.w3.org/2000/svg';
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deux = (n) => String(n).padStart(2, '0');

  function cree(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => { if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function texte(parent, attrs, contenu) { const t = cree('text', attrs, parent); t.textContent = contenu; return t; }

  /* ============ 1. Mise à l'échelle ============ */

  const scene = document.getElementById('scene');
  function ajuster() { scene.style.setProperty('--k', Math.min(innerWidth / 1920, innerHeight / 1080)); }
  addEventListener('resize', ajuster);
  ajuster();

  /* ============ 2. Schéma ============ */

  const svg = document.getElementById('schema');
  const defs = cree('defs', null, svg);
  const ombre = cree('filter', { id: 'ombre', x: '-20%', y: '-20%', width: '140%', height: '160%' }, defs);
  cree('feDropShadow', { dx: 0, dy: 4, stdDeviation: 8, 'flood-color': '#14140f', 'flood-opacity': 0.07 }, ombre);
  [['fl-repos', '#c9c8c1'], ['fl-actif', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()]].forEach(([id, c]) => {
    const m = cree('marker', { id: id, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }, defs);
    cree('path', { d: 'M1,1.5 L9,5 L1,8.5', fill: 'none', stroke: c, 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
  });

  const gFlux = cree('g', null, svg);
  const gPieces = cree('g', null, svg);
  const gJeton = cree('g', { 'class': 'jeton', visibility: 'hidden' }, svg);
  cree('circle', { 'class': 'halo', r: 15 }, gJeton);
  cree('circle', { 'class': 'coeur', r: 7 }, gJeton);

  const ETAPES_BOUCLE = [{ t: 'Penser', a: -90 }, { t: 'Agir', a: 30 }, { t: 'Observer', a: 150 }];
  let boucle = null;
  const pieces = {};
  const HAUT_TETE = 70;     // titre + sous-titre
  const HAUT_LIGNE = 31;
  const HAUT_LIGNE_PANNE = 50;   // une ligne de panne porte son état sur une seconde ligne

  P.schema.pieces.forEach((p) => {
    const g = cree('g', { 'class': 'piece cachee', 'data-id': p.id }, gPieces);
    p._g = g;
    pieces[p.id] = p;
    if (p.type === 'boucle') { dessinerBoucle(p, g); return; }
    p._fond = cree('rect', { 'class': 'piece-fond', x: p.x, y: p.y, width: p.w, height: p.h, rx: 14, filter: 'url(#ombre)' }, g);
    cree('circle', { 'class': 'piece-pastille', cx: p.x + 22, cy: p.y + 29, r: 4.5 }, g);
    texte(g, { 'class': 'piece-titre', x: p.x + 36, y: p.y + 36 }, p.titre);
    texte(g, { 'class': 'piece-sous', x: p.x + 36, y: p.y + 57 }, p.sous);
    let yCourant = p.y + HAUT_TETE;
    p._lignes = (p.lignes || []).map((l) => {
      const y = yCourant;
      yCourant += l.panne ? HAUT_LIGNE_PANNE : HAUT_LIGNE;
      const gl = cree('g', { 'class': l.panne ? 'ligne-panne cachee' : 'ligne' }, g);
      cree('line', { 'class': 'ligne-filet', x1: p.x + 18, x2: p.x + p.w - 18, y1: y + 4, y2: y + 4 }, gl);
      if (l.panne) {
        const c = cree('g', { 'class': 'ligne-croix', transform: 'translate(' + (p.x + 26) + ',' + (y + 20) + ')' }, gl);
        cree('circle', { r: 7 }, c);
        cree('path', { d: 'M-2.5,-2.5 L2.5,2.5 M2.5,-2.5 L-2.5,2.5' }, c);
        texte(gl, { 'class': 'ligne-texte', x: p.x + 40, y: y + 25 }, l.t);
        if (l.s) texte(gl, { 'class': 'ligne-etat', x: p.x + 40, y: y + 43 }, l.s);
      } else {
        texte(gl, { 'class': 'ligne-texte', x: p.x + 36, y: y + 25 }, l.t);
      }
      return { el: gl, panne: !!l.panne };
    });
  });

  // Hauteur d'une carte : en-tête + lignes affichées (les lignes de panne n'apparaissent qu'à la fin)
  function hauteur(p, pannes) {
    if (p.type === 'boucle') return 0;
    const lignes = (p.lignes || []).filter((l) => !l.panne || pannes);
    if (!lignes.length) return p.h;
    return HAUT_TETE + lignes.reduce((h, l) => h + (l.panne ? HAUT_LIGNE_PANNE : HAUT_LIGNE), 0) + 12;
  }

  // La boucle de l'agent : un anneau, trois étapes, des flèches de rotation
  function dessinerBoucle(p, g) {
    cree('circle', { 'class': 'anneau-fond', cx: p.cx, cy: p.cy, r: p.r + 34, filter: 'url(#ombre)' }, g);
    cree('circle', { 'class': 'anneau', cx: p.cx, cy: p.cy, r: p.r }, g);
    // Flèches de rotation, à mi-chemin entre deux étapes
    [-30, 90, 210].forEach((a) => {
      const rad = a * Math.PI / 180;
      const x = p.cx + p.r * Math.cos(rad);
      const y = p.cy + p.r * Math.sin(rad);
      const tg = rad + Math.PI / 2;
      const pointe = 'M' + (x + 7 * Math.cos(tg + Math.PI - 0.6)) + ',' + (y + 7 * Math.sin(tg + Math.PI - 0.6)) +
        ' L' + x + ',' + y + ' L' + (x + 7 * Math.cos(tg + Math.PI + 0.6)) + ',' + (y + 7 * Math.sin(tg + Math.PI + 0.6));
      cree('path', { 'class': 'anneau-fleche', d: pointe }, g);
    });
    texte(g, { 'class': 'agent-titre', x: p.cx, y: p.cy + 4, 'text-anchor': 'middle' }, p.titre);
    texte(g, { 'class': 'agent-sous', x: p.cx, y: p.cy + 28, 'text-anchor': 'middle' }, p.sous);
    const etapes = ETAPES_BOUCLE.map((e) => {
      const rad = e.a * Math.PI / 180;
      const x = p.cx + p.r * Math.cos(rad);
      const y = p.cy + p.r * Math.sin(rad);
      const ge = cree('g', { 'class': 'etape-boucle' }, g);
      const w = e.t.length * 8.6 + 26;
      cree('rect', { x: x - w / 2, y: y - 15, width: w, height: 30, rx: 15 }, ge);
      texte(ge, { x: x, y: y + 5, 'text-anchor': 'middle' }, e.t);
      return { el: ge, a: e.a };
    });
    const orb = cree('g', { visibility: 'hidden' }, g);
    cree('circle', { 'class': 'orbite-halo', r: 13 }, orb);
    cree('circle', { 'class': 'orbite', r: 6 }, orb);
    boucle = { p: p, etapes: etapes, orb: orb };
  }

  // Point d'accroche d'une pièce, du côté de l'autre pièce
  function centre(p, hauteurs) {
    if (p.type === 'boucle') return { x: p.cx, y: p.cy };
    return { x: p.x + p.w / 2, y: p.y + hauteurs[p.id] / 2 };
  }
  function accroche(p, vers, hauteurs) {
    const c = centre(p, hauteurs);
    if (p.type === 'boucle') {
      const a = Math.atan2(vers.y - c.y, vers.x - c.x);
      const r = p.r + 34;
      return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
    }
    const h = hauteurs[p.id];
    const dx = vers.x - c.x;
    const dy = vers.y - c.y;
    if (Math.abs(dx) > p.w / 2 + 20) return { x: c.x + Math.sign(dx) * p.w / 2, y: c.y, nx: Math.sign(dx), ny: 0 };
    return { x: c.x, y: c.y + Math.sign(dy) * h / 2, nx: 0, ny: Math.sign(dy) };
  }
  function trace(f, hauteurs) {
    const a = pieces[f.de];
    const b = pieces[f.vers];
    const ca = centre(a, hauteurs);
    const cb = centre(b, hauteurs);
    const p1 = accroche(a, cb, hauteurs);
    const p2 = accroche(b, ca, hauteurs);
    const k = Math.max(40, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.4);
    return 'M' + p1.x + ',' + p1.y + ' C' + (p1.x + p1.nx * k) + ',' + (p1.y + p1.ny * k) + ' ' +
      (p2.x + p2.nx * k) + ',' + (p2.y + p2.ny * k) + ' ' + p2.x + ',' + p2.y;
  }

  const flux = {};
  P.schema.flux.forEach((f) => {
    const g = cree('g', { 'class': 'flux cache' }, gFlux);
    f._g = g;
    f._trait = cree('path', { 'class': 'flux-trait' }, g);
    f._perles = cree('path', { 'class': 'flux-perles' }, g);
    flux[f.id] = f;
  });

  /* ============ 3. Affichage d'une slide ============ */

  const el = (id) => document.getElementById(id);
  const zoneTexte = el('texte');
  let courante = -1;
  let minuterieTexte = null;   // un seul fondu à la fois, même si l'on enchaîne les flèches

  function afficher(i, instantane) {
    i = Math.max(0, Math.min(P.slides.length - 1, i));
    const s = P.slides[i];
    const premiere = courante < 0;
    courante = i;

    // Texte : fondu sortant puis entrant
    const remplir = () => {
      el('rubrique').textContent = s.rubrique || '';
      el('titre-slide').textContent = s.titre;
      el('corps').textContent = s.texte;
      el('exemple').hidden = !s.exemple;
      el('exemple-texte').textContent = s.exemple || '';
      el('hermes').hidden = !s.hermes;
      el('hermes-texte').textContent = s.hermes ? s.hermes.texte : '';
      el('hermes-source').textContent = s.hermes ? '§ ' + s.hermes.source : '';
    };
    clearTimeout(minuterieTexte);
    if (premiere || instantane || mouvementReduit) { remplir(); zoneTexte.classList.remove('change'); }
    else {
      zoneTexte.classList.add('change');
      minuterieTexte = setTimeout(() => { remplir(); zoneTexte.classList.remove('change'); }, 280);
    }

    // Pièces : visibles, mises en avant, en retrait
    const visibles = new Set(s.visibles || []);
    const accent = new Set(s.accent || []);
    const hauteurs = {};
    P.schema.pieces.forEach((p) => {
      hauteurs[p.id] = hauteur(p, !!s.pannes);
      if (p._fond) p._fond.setAttribute('height', hauteurs[p.id]);
      p._g.classList.toggle('cachee', !visibles.has(p.id));
      p._g.classList.toggle('accent', accent.has(p.id));
      p._g.classList.toggle('retrait', visibles.has(p.id) && accent.size > 0 && !accent.has(p.id));
      (p._lignes || []).forEach((l) => { if (l.panne) l.el.classList.toggle('cachee', !s.pannes); });
      p._g.classList.toggle('en-panne', !!s.pannes && (p.lignes || []).some((l) => l.panne));
    });

    // Flux : dessinés entre pièces visibles, animés s'ils sont au cœur de la slide
    const actifs = new Set(s.flux || []);
    P.schema.flux.forEach((f) => {
      const d = trace(f, hauteurs);
      f._trait.setAttribute('d', d);
      f._perles.setAttribute('d', d);
      const visible = visibles.has(f.de) && visibles.has(f.vers) && (actifs.has(f.id) || accent.size === 0 || s.jeton.indexOf(f.id) >= 0 || i >= 3);
      f._g.classList.toggle('cache', !visible);
      f._g.classList.toggle('actif', actifs.has(f.id));
      f._g.classList.toggle('retrait', visible && !actifs.has(f.id) && accent.size > 0);
      const m = actifs.has(f.id) ? 'url(#fl-actif)' : 'url(#fl-repos)';
      f._trait.setAttribute('marker-end', m);
      f._trait.setAttribute('marker-start', f.double ? m : '');
    });

    animerJeton(s.jeton || []);
    animerBoucle(!!s.boucle);
    majNavigation();
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* sans conséquence */ }
  }

  /* ============ 4. Animations ============ */

  let animJeton = null;
  function animerJeton(ids) {
    cancelAnimationFrame(animJeton);
    const chemins = ids.map((id) => flux[id] && flux[id]._trait).filter(Boolean);
    if (!chemins.length) { gJeton.setAttribute('visibility', 'hidden'); return; }
    const placer = (c, f) => { const pt = c.getPointAtLength(c.getTotalLength() * f); gJeton.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')'); };
    gJeton.setAttribute('visibility', 'visible');
    placer(chemins[0], 0);
    if (mouvementReduit) { placer(chemins[chemins.length - 1], 1); return; }
    const duree = 1150;
    const pause = 700;
    let t0 = performance.now() + 450;      // laisse le schéma apparaître
    const pas = (t) => {
      const e = t - t0;
      if (e >= 0) {
        const total = chemins.length * duree + pause;
        const r = e % total;
        const k = Math.min(chemins.length - 0.0001, r / duree);
        const n = Math.floor(k);
        const f = k - n;
        placer(chemins[n], f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
      }
      animJeton = requestAnimationFrame(pas);
    };
    animJeton = requestAnimationFrame(pas);
  }

  let animBoucle = null;
  function animerBoucle(active) {
    cancelAnimationFrame(animBoucle);
    if (!boucle) return;
    boucle.orb.setAttribute('visibility', active ? 'visible' : 'hidden');
    boucle.etapes.forEach((e) => e.el.classList.remove('active'));
    if (!active) return;
    const p = boucle.p;
    const tour = 5400;   // un tour complet de la boucle, en ms
    const t0 = performance.now();
    const pas = (t) => {
      const a = (-90 + 360 * (((t - t0) % tour) / tour)) % 360;
      const rad = a * Math.PI / 180;
      boucle.orb.setAttribute('transform', 'translate(' + (p.cx + p.r * Math.cos(rad)) + ',' + (p.cy + p.r * Math.sin(rad)) + ')');
      // L'étape allumée est celle que l'orbite vient de passer
      boucle.etapes.forEach((e) => {
        const d = ((a - e.a) % 360 + 360) % 360;
        e.el.classList.toggle('active', d < 100);
      });
      if (!mouvementReduit) animBoucle = requestAnimationFrame(pas);
    };
    animBoucle = requestAnimationFrame(pas);
  }

  /* ============ 5. Navigation ============ */

  const prog = el('progression');
  P.slides.forEach((s, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = deux(k + 1) + ' · ' + s.titre;
    b.setAttribute('aria-label', 'Slide ' + (k + 1) + ' : ' + s.titre);
    b.addEventListener('click', () => afficher(k));
    prog.appendChild(b);
  });
  function majNavigation() {
    [...prog.children].forEach((b, k) => {
      b.classList.toggle('vu', k < courante);
      if (k === courante) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    el('prec').disabled = courante === 0;
    el('suiv').disabled = courante === P.slides.length - 1;
    el('compteur').innerHTML = '<b>' + deux(courante + 1) + '</b> / ' + deux(P.slides.length);
  }
  el('prec').addEventListener('click', () => afficher(courante - 1));
  el('suiv').addEventListener('click', () => afficher(courante + 1));
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].indexOf(e.key) >= 0) { e.preventDefault(); afficher(courante + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(e.key) >= 0) { e.preventDefault(); afficher(courante - 1); }
    else if (e.key === 'Home') afficher(0);
    else if (e.key === 'End') afficher(P.slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {});
    }
  });
  // Clic dans la moitié droite de l'écran : slide suivante (pratique avec une télécommande ou une souris)
  svg.addEventListener('click', () => afficher(courante + 1));

  el('surtitre').textContent = P.surtitre;
  el('source').textContent = P.source;
  document.title = P.titre;
  const depart = parseInt(location.hash.slice(1), 10);
  afficher(isNaN(depart) ? 0 : depart - 1, true);
})();
