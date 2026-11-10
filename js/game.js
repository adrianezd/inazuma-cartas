'use strict';
/* Inazuma Cartas: lógica (carrera, mapa y partido). La pantalla está en ui.js. */

var SAVE_KEY = 'inazumaCartas.run';
var OPTS_KEY = 'inazumaCartas.opts';
var STATS_KEY = 'inazumaCartas.stats';

var G = { screen: 'menu', run: null, opts: { sound: true, video: true }, busy: false, modal: null, fx: [], ui: {} };

/* ---------- utilidades ---------- */
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rr(r) { return ri(r[0], r[1]); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function load(k) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function forget(k) { try { localStorage.removeItem(k); } catch (e) {} }

function cardDef(c) { return CARDS[c.id]; }
function cardV(c) { var d = CARDS[c.id]; var v = {}; var k; for (k in d.v) v[k] = d.v[k]; if (c.up && d.u) for (k in d.u) v[k] = d.u[k]; return v; }
function cardCost(c) { var v = cardV(c); return v.c != null ? v.c : CARDS[c.id].c; }
function cardEl(c) { var d = CARDS[c.id]; return d.p ? PLAYERS[d.p].el : null; }
function canUpgrade(c) { var d = CARDS[c.id]; return !c.up && d.t !== 'estado'; }

/* ---------- carrera ---------- */
function has(pid) { return !!(G.run && G.run.team.indexOf(pid) >= 0); }
function captain() { return G.run ? G.run.cap : null; }
function newCard(id, up) { var r = G.run; r.uid = (r.uid || 1) + 1; return { u: 'k' + r.uid, id: id, up: !!up }; }
function addCard(id, up) { var c = newCard(id, up); G.run.deck.push(c); return c; }
function keeperMax() { return 12 + (G.run.kBonus || 0) + (has('r13') ? 4 : 0) + (has('r51') ? 6 : 0) + (hasR('guantes') ? 4 : 0); }
function hasR(id) { return !!(G.run && G.run.relics && G.run.relics.indexOf(id) >= 0); }
function tpBase() { return 3 + (hasR('meteorito') ? 1 : 0) + (hasR('contrato') ? 1 : 0) + (hasR('botas_axel') ? 1 : 0); }
function rollRelic(rar) {
  var have = G.run.relics || [];
  var opts = Object.keys(RELICS).filter(function (k) { return have.indexOf(k) < 0 && (rar ? RELICS[k].r === rar : RELICS[k].r !== 'B'); });
  if (!opts.length) opts = Object.keys(RELICS).filter(function (k) { return have.indexOf(k) < 0 && RELICS[k].r !== 'B'; });
  return opts.length ? pick(opts) : null;
}
function gainRelic(id) {
  if (!id || hasR(id)) return;
  G.run.relics = G.run.relics || [];
  G.run.relics.push(id);
  if (id === 'guantes') {} // se aplica en keeperMax
  sfx('up');
}
function randomCardOf(rars) { return pick(POOL.filter(function (id) { return rars.indexOf(CARDS[id].r) >= 0; })); }
var MY_KEEPER = 'r01';

function newRun(capIdx) {
  var cap = CAPTAINS[capIdx];
  G.run = {
    v: 2, cap: cap.id, team: BASE_TEAM.concat([cap.id]), deck: [], moral: 40, moralMax: 40, coins: 40, kBonus: 0, relics: [],
    act: 0, map: null, pos: null, uid: 1, removeCost: 60, lastTeams: [], battle: null, reward: null,
    shop: null, event: null, screen: 'map',
    stats: { wins: 0, goals: 0, against: 0, floors: 0, start: Date.now() }
  };
  STARTER.forEach(function (id) { addCard(id); });
  addCard(cap.card);
  G.run.map = genMap(0);
  G.run.boons = shuffle(BOONS.slice()).slice(0, 3).map(function (b) { return b.id; });
  goScreen('boon');
}

/* Ventaja inicial */
function takeBoon(id) {
  var r = G.run; if (!r.boons) return;
  r.boons = null;
  var msg = '';
  switch (id) {
    case 'relicC': var rc = rollRelic('C'); gainRelic(rc); msg = 'Consigues ' + RELICS[rc].n + '.'; break;
    case 'relicU': var ru = rollRelic('U'); gainRelic(ru); changeMoral(-8); msg = 'Consigues ' + RELICS[ru].n + '.'; break;
    case 'remove': G.modal = { k: 'deck', mode: 'remove', from: 'boon', forced: true }; break;
    case 'rare': var rr2 = randomCardOf(['R']); addCard(rr2); msg = 'Aprendes ' + CARDS[rr2].n + '.'; break;
    case 'keeper': r.kBonus = (r.kBonus || 0) + 3; msg = 'Tu portero gana 3 de aguante.'; break;
    case 'coins': r.coins += 60; msg = 'Ganas 60 monedas.'; break;
    case 'up2':
      shuffle(r.deck.filter(canUpgrade)).slice(0, 2).forEach(function (c) { c.up = true; });
      msg = 'Mejoras 2 cartas.'; break;
    case 'cards3':
      r.reward = { coins: 0, cards: shuffle(POOL.filter(function (x) { return CARDS[x].r === 'U'; })).slice(0, 3), sign: null, start: true };
      goScreen('reward'); return;
  }
  if (msg) G.toastMsg = msg;
  sfx('up');
  goScreen('map');
}

function saveRun() { if (G.run) store(SAVE_KEY, G.run); }
function goScreen(s) { G.screen = s; if (G.run) { G.run.screen = s; saveRun(); } render(); }

function changeMoral(d) {
  var r = G.run; r.moral = clamp(r.moral + d, 0, r.moralMax);
}

/* ---------- mapa ---------- */
var MAP_ROWS = 6, MAP_COLS = 4;
function nodeKey(r, c) { return r + '_' + c; }

function genMap(act) {
  var nodes = {}, edges = {};
  function ensure(r, c) { var k = nodeKey(r, c); if (!nodes[k]) nodes[k] = { k: k, r: r, c: c, type: null }; return nodes[k]; }
  var starts = shuffle([0, 1, 2, 3]).slice(0, 3);
  starts.push(ri(0, 3));
  starts.forEach(function (c0) {
    var c = c0; ensure(0, c);
    for (var r = 1; r < MAP_ROWS; r++) {
      var nc = clamp(c + ri(-1, 1), 0, MAP_COLS - 1);
      // evita que dos caminos se crucen en diagonal
      if (nc !== c && edges[nodeKey(r - 1, nc) + '>' + nodeKey(r, c)]) nc = c;
      ensure(r, nc);
      edges[nodeKey(r - 1, c) + '>' + nodeKey(r, nc)] = 1;
      c = nc;
    }
  });
  var list = Object.keys(nodes).map(function (k) { return nodes[k]; });
  var hasElite = false, hasShop = false;
  list.forEach(function (n) {
    if (n.r === 0) n.type = 'partido';
    else if (n.r === MAP_ROWS - 1) n.type = 'descanso';
    else {
      var bag = ['partido', 'partido', 'partido', 'partido', 'evento', 'evento', 'evento'];
      if (n.r >= 2) bag.push('elite', 'tienda', 'cofre');
      if (n.r === 2 || n.r === 3) bag.push('descanso');
      n.type = pick(bag);
      if (n.type === 'elite') hasElite = true;
      if (n.type === 'tienda') hasShop = true;
    }
  });
  // como mucho 2 élites, y al menos una élite y una tienda por acto
  var elites = shuffle(list.filter(function (n) { return n.type === 'elite'; }));
  elites.slice(2).forEach(function (n) { n.type = 'partido'; });
  var mids = list.filter(function (n) { return n.r >= 2 && n.r <= MAP_ROWS - 2 && n.type === 'partido'; });
  if (!hasElite && mids.length) { pick(mids).type = 'elite'; mids = mids.filter(function (n) { return n.type === 'partido'; }); }
  if (!hasShop && mids.length) { pick(mids).type = 'tienda'; mids = mids.filter(function (n) { return n.type === 'partido'; }); }
  if (!list.some(function (n) { return n.type === 'cofre'; }) && mids.length) pick(mids).type = 'cofre';
  list.filter(function (n) { return n.type === 'cofre'; }).slice(2).forEach(function (n) { n.type = 'evento'; });
  var boss = { k: 'boss', r: MAP_ROWS, c: 1.5, type: 'jefe' };
  nodes.boss = boss;
  list.filter(function (n) { return n.r === MAP_ROWS - 1; }).forEach(function (n) { edges[n.k + '>boss'] = 1; });
  return { nodes: nodes, edges: Object.keys(edges), done: [] };
}

function mapNextKeys() {
  var r = G.run, m = r.map;
  if (!r.pos) return Object.keys(m.nodes).filter(function (k) { return m.nodes[k].r === 0; });
  var out = [];
  m.edges.forEach(function (e) { var p = e.split('>'); if (p[0] === r.pos) out.push(p[1]); });
  return out;
}

function enterNode(k) {
  if (G.busy) return;
  var r = G.run, n = r.map.nodes[k];
  if (mapNextKeys().indexOf(k) < 0) return;
  r.pos = k; r.map.done.push(k); r.stats.floors++;
  sfx('tap');
  if (n.type === 'partido') startBattle('normal');
  else if (n.type === 'elite') startBattle('elite');
  else if (n.type === 'jefe') startBattle('boss');
  else if (n.type === 'evento') {
    // el interrogante puede esconder cualquier cosa
    var x = Math.random();
    if (x < 0.62) startEvent();
    else if (x < 0.8) { G.toastMsg = '¡Un rival te reta!'; startBattle('normal'); }
    else if (x < 0.9) startShop();
    else startChest();
  }
  else if (n.type === 'cofre') startChest();
  else if (n.type === 'tienda') startShop();
  else if (n.type === 'descanso') goScreen('rest');
}

/* ---------- partido ----------
   Cada turno: 3 TP y 5 cartas. Los tiros restan aguante al portero rival
   (primero se comen su muro); al llegar a 0 es gol. La Parada frena el tiro
   que anuncia el rival. Quien lleve más goles al final de los 8 turnos gana. */
// Profundidad en la carrera: 0 en la primera casilla, 20 en el último jefe.
function runDepth() {
  var r = G.run, n = r.map && r.pos ? r.map.nodes[r.pos] : null;
  return r.act * (MAP_ROWS + 1) + (n ? n.r : 0);
}
// Los rivales crecen un 6 % por casilla en el primer acto y un 12 % después; las élites, algo más.
function depthFactor(d) { return 1 + 0.06 * Math.min(d, MAP_ROWS) + 0.12 * Math.max(0, d - MAP_ROWS); }
function scaleTeam(id, act, kind) {
  var T = TEAMS[id], depth = runDepth();
  var F = depthFactor(depth);
  if (kind === 'elite') F += 0.2;
  var o = {}; for (var k in T) o[k] = T[k];
  var s = function (x) { return Math.max(1, Math.round(x * F)); };
  o.id = id; o.kind = kind; o.depth = depth;
  o.res = s(T.res);
  o.shot = T.shot.map(function (x) { return s(x * 1.2); });
  o.muro = T.muro.map(s);
  o.spow = T.spow ? s(T.spow * 1.15) : 0;
  o.golpe = (kind === 'boss' ? 5 : kind === 'elite' ? 4 : 3) + act;
  return o;
}

function chooseTeam(kind) {
  var r = G.run, A = ACTS[r.act];
  if (kind === 'boss') return A.boss;
  var pool = (kind === 'elite' ? A.elite : A.normal).filter(function (t) { return r.lastTeams.indexOf(t) < 0; });
  if (!pool.length) pool = kind === 'elite' ? A.elite : A.normal;
  var t = pick(pool);
  r.lastTeams.push(t); if (r.lastTeams.length > 2) r.lastTeams.shift();
  return t;
}

function startBattle(kind) {
  var r = G.run, tid = chooseTeam(kind);
  var T = scaleTeam(tid, r.act, kind);
  var km = keeperMax();
  var B = {
    tid: tid, kind: kind, T: T, turn: 0, maxT: 8, extra: false, gYo: 0, gRv: 0,
    par: 0, tp: 0, kmax: km, kres: km, rmax: T.res, rres: T.res, rmuro: 0,
    conc: (has('r20') ? 1 : 0) + (has('r14') ? 1 : 0) + (hasR('banda') ? 1 : 0), oca: 0, dbl: 0, rvul: has('r07') ? (hasR('bufanda') ? 3 : 2) : 0,
    rfat: 0, rimp: 0, rconc: 0, parT: 0,
    tpNext: (has('r14') ? 1 : 0) + (hasR('silbato') ? 1 : 0), drawNext: (has('r15') ? 2 : 0) + (has('r20') ? 1 : 0) + (hasR('cuaderno') ? 2 : 0),
    matchShot: false, esp: false,
    draw: shuffle(r.deck.map(function (c) { return { u: c.u, id: c.id, up: c.up }; })), hand: [], disc: [], exh: [],
    intent: null, shots: 0, played: 0, erik: false, rt: 0, calm: 0,
    seen: {}, over: null, log: []
  };
  r.battle = B;
  if (hasR('contrato')) { B.draw.push({ u: 'x' + Date.now() + 'c', id: 'cansancio' }); shuffle(B.draw); }
  G.screen = 'battle'; r.screen = 'battle';
  startTurn(true);
  saveRun();
  render();
  sfx('whistle');
  G.busy = true;
  playFx(function () {
    G.busy = false;
    if (!load('inazumaCartas.tuto')) { store('inazumaCartas.tuto', 1); G.modal = { k: 'help' }; }
    render();
  });
}

function B_() { return G.run && G.run.battle; }
function minuteOf(t) { return Math.min(90, Math.round((t - 1) * 90 / 8)); }

function drawCards(n) {
  var B = B_();
  for (var i = 0; i < n; i++) {
    if (B.hand.length >= 10) break;
    if (!B.draw.length) {
      if (!B.disc.length) break;
      B.draw = shuffle(B.disc); B.disc = [];
    }
    var c = B.draw.pop(); c.fresh = 1; B.hand.push(c);
  }
}

function pushFx(f) { G.fx.push(f); }
function logB(s) { var B = B_(); if (!B) return; B.log.unshift(s); if (B.log.length > 30) B.log.pop(); }

function startTurn(first) {
  var B = B_(), T = B.T;
  B.turn++;
  B.extra = B.turn > B.maxT;
  if (B.extra) {
    B.kres = Math.max(1, B.kres - 3); B.rres = Math.max(1, B.rres - 3);
    if (B.turn === B.maxT + 1) pushFx({ k: 'banner', t: 'Gol de oro', s: 'Quien marque gana. Los porteros pierden 3 de aguante cada turno.', c: 'gold' });
  } else if (B.turn === 5 && !first) {
    pushFx({ k: 'banner', t: 'Segunda parte', s: '', c: 'blue' });
  }
  B.tp = Math.max(0, tpBase() + B.tpNext); B.tpNext = 0;
  B.par = B.parT + (captain() === 'r08' ? 2 : 0) + (first && hasR('neumatico') ? 4 : 0);
  B.shots = 0; B.played = 0; B.rmuro = 0;
  if (T.rasgo === 'nectar' && B.turn > 1) B.rconc++;
  if (T.rasgo === 'kageyama' && B.turn === 5) {
    B.draw.push({ u: 'x' + Date.now() + 'a', id: 'cansancio' }, { u: 'x' + Date.now() + 'b', id: 'cansancio' });
    shuffle(B.draw);
    pushFx({ k: 'banner', t: 'Trampa de Kageyama', s: 'Entran 2 Cansancio en tu mazo.', c: 'red' });
  }
  drawCards(5 + B.drawNext + (captain() === 'r04' ? 1 : 0)); B.drawNext = 0;
  B.intent = rollIntent();
  if (B.intent.muro) B.rmuro = B.intent.muro;
  if (B.intent.st && !B.intent.pow) pushFx({ k: 'rtech', who: B.intent.who || T.gk, tech: B.intent.tech, vid: G.opts.video && !B.seen['r_' + B.intent.tech] ? B.intent.vid : null });
  if (B.intent.st && !B.intent.pow) B.seen['r_' + B.intent.tech] = 1;
  if (first) pushFx({ k: 'banner', t: '¡Empieza el partido!', s: 'Tira para marcar y para con Parada.', c: 'blue' });
}

function rivalShotValue(pow, el) {
  var B = B_();
  var v = pow + B.rconc - B.rfat - (has('r16') ? 1 : 0);
  return Math.max(0, Math.round(v * elemMult(el, PLAYERS[MY_KEEPER].el)));
}
function incoming() {
  var B = B_(), I = B.intent || {};
  if (!I.pow) return 0;
  var one = rivalShotValue(I.pow, I.el);
  // el cansancio solo frena el primer tiro
  var rest = (I.hits || 1) > 1 ? Math.max(0, Math.round((I.pow + B.rconc - (has('r16') ? 1 : 0)) * elemMult(I.el, PLAYERS[MY_KEEPER].el))) * ((I.hits || 1) - 1) : 0;
  return one + rest;
}

function shotIntent(pow, special) {
  var B = B_(), T = B.T;
  return { k: 'tiro', pow: pow + B.rimp, el: PLAYERS[T.st].el, who: T.st, tech: special ? (T.stech || T.tech) : 'Tiro', st: special ? 1 : 0, vid: special ? T.vid : null, hits: 1 };
}

function rollIntent() {
  var B = B_(), T = B.T, rg = T.rasgo;
  var n = B.rt++;
  var I;
  // jefes
  if (rg === 'genesis') {
    if (n % 3 === 0) I = { k: 'avance', val: Math.round(5 * depthFactor(T.depth)), tech: 'Carga de Supernova', st: 1, who: T.st };
    else if (n % 3 === 1) I = shotIntent(T.spow, true);
    else I = Math.random() < 0.5 ? { k: 'muro', muro: rr(T.muro), tech: T.muroTech, who: T.gk } : shotIntent(rr(T.shot), false);
    return I;
  }
  if (T.boss && n % 3 === 2) return shotIntent(T.spow, true);
  if (rg === 'nectar' && Math.random() < 0.2) return { k: 'presion', tpDown: 1, tech: 'Hora Celestial', st: 1, who: T.st };

  var w = { tiro: 45, tiromuro: 15, muro: 15, avance: B.rimp ? 0 : 12, presion: 13 };
  if (rg === 'ninja' || rg === 'escaner') { w.muro += 15; w.tiromuro += 5; }
  if (rg === 'salvaje' || rg === 'llamas') { w.tiro += 15; w.muro = 5; w.tiromuro = 5; }
  if (rg === 'bolafalsa' || rg === 'hielo' || rg === 'maldicion') w.presion += 12;
  if (rg === 'murdock' && !B.rimp) w.avance += 10;
  // después de dos turnos sin tirar, tiran seguro
  if (B.calm >= 2) { w = { tiro: 1 }; }
  var tot = 0, k; for (k in w) tot += w[k];
  var x = Math.random() * tot;
  for (k in w) { x -= w[k]; if (x < 0) break; }
  var special = Math.random() < 0.35;
  if (k === 'tiro') {
    I = shotIntent(rr(T.shot) + (special ? 2 : 0), special && !T.boss);
    if (rg === 'alius' && Math.random() < 0.45) { I.pow = Math.round(I.pow * 0.6); I.hits = 2; }
  } else if (k === 'tiromuro') {
    I = shotIntent(Math.round(rr(T.shot) * 0.7), false);
    I.k = 'tiromuro'; I.muro = Math.round(rr(T.muro) * 0.7);
  } else if (k === 'muro') {
    I = { k: 'muro', muro: rr(T.muro) };
    if (T.muroTech) { I.tech = T.muroTech; I.st = 1; I.vid = T.muroVid; I.who = T.gk; }
  } else if (k === 'avance') {
    I = { k: 'avance', val: Math.round((ri(2, 3) + (rg === 'murdock' ? 2 : 0)) * depthFactor(T.depth)), who: T.st };
  } else {
    I = { k: 'presion', tpDown: (rg === 'maldicion') ? 0 : 1, cans: (rg === 'maldicion' || rg === 'kageyama') ? 1 : 0, who: T.st };
    if (!I.tpDown && !I.cans) I.tpDown = 1;
  }
  B.calm = I.pow ? 0 : B.calm + 1;
  return I;
}

function shotPower(c, extraShots) {
  var B = B_(), v = cardV(c), d = CARDS[c.id];
  var shotsBefore = B.shots + (extraShots || 0);
  var base = (v.pow || 0) + B.conc + B.oca;
  if (captain() === 'r02' && shotsBefore === 0) base += 2;
  if (v.axel && has('r02')) base += v.axel;
  if (v.jude && has('r04')) base += v.jude;
  if (v.ps) base += v.ps * shotsBefore;
  if (v.parpow) base += B.par;
  if (hasR('botas') && !B.matchShot) base += 5;
  var mult = elemMult(PLAYERS[d.p].el, PLAYERS[B.T.gk].el);
  if (hasR('gafas') && mult > 1) base += 2;
  var vul = B.rvul > 0 ? 1.5 : 1;
  return { base: base, mult: mult, vul: vul, final: Math.round(base * mult * vul) };
}

function cardCostB(c) {
  var B = B_(), cost = cardCost(c);
  if (B && has('r22') && !B.played && cost > 0) cost--;
  return cost;
}

function playReason(c) {
  var B = B_();
  if (!B || B.over) return 'Fin del partido';
  if (CARDS[c.id].v.unplay) return 'No se puede jugar';
  if (cardCostB(c) > B.tp) return 'Te faltan TP';
  return '';
}

function playCard(uid) {
  var B = B_();
  if (!B || G.busy || B.over) return;
  var idx = -1; for (var i = 0; i < B.hand.length; i++) if (B.hand[i].u === uid) idx = i;
  if (idx < 0) return;
  var c = B.hand[idx], d = CARDS[c.id], v = cardV(c);
  var why = playReason(c);
  if (why) { pushFx({ k: 'toast', t: why }); sfx('no'); playFx(); return; }
  var paid = cardCostB(c);
  B.tp -= paid;
  B.played++;
  B.hand.splice(idx, 1);
  G.ui.sel = null;
  if (d.st) {
    var first = !B.seen[c.id]; B.seen[c.id] = 1;
    pushFx({ k: 'tech', who: d.p, tech: d.n, vid: (first && G.opts.video) ? d.vid : null, el: cardEl(c) });
  } else sfx('card');
  if (v.par) B.par += v.par + (hasR('cinta') ? 1 : 0);
  if (v.heal) B.kres = Math.min(B.kmax, B.kres + v.heal);
  if (v.tp) B.tp += v.tp;
  if (v.tpn) B.tpNext += v.tpn;
  if (v.conc) B.conc += v.conc;
  if (v.fat) B.rfat += v.fat;
  if (v.parT) B.parT += v.parT;
  if (d.t === 'tiro') {
    var times = B.dbl ? 2 : 1; B.dbl = 0;
    for (var t = 0; t < times && !B.over; t++) doShot(c);
  }
  // efectos que preparan el siguiente tiro: van después para no gastarse en esta carta
  if (v.oca) B.oca += v.oca;
  if (v.dbl) B.dbl = 1;
  if (v.vul) B.rvul += v.vul + (hasR('bufanda') ? 1 : 0);
  if (paid === 0 && hasR('pizarra')) B.oca += 1;
  if (v.draw) drawCards(v.draw);
  if (v.agota || v.perm) B.exh.push(c); else B.disc.push(c);
  logB('Juegas ' + d.n + (c.up ? '+' : ''));
  afterAction();
}

function doShot(c) {
  var B = B_(), v = cardV(c);
  var hits = v.hits || 1;
  for (var h = 0; h < hits && !B.over; h++) {
    var sp = shotPower(c);
    B.shots++; B.oca = 0; B.matchShot = true;
    var dmg = sp.final, absorbed = v.pierce ? 0 : Math.min(B.rmuro, dmg);
    B.rmuro -= absorbed; dmg -= absorbed;
    B.rres -= dmg;
    pushFx({ k: 'shot', dmg: dmg, absorbed: absorbed, mult: sp.mult, who: CARDS[c.id].p });
    if (B.rres <= 0) {
      B.gYo++; G.run.stats.goals++;
      B.rres = B.rmax;
      pushFx({ k: 'goal', me: true, who: CARDS[c.id].p });
      logB('¡Gol!');
      if (has('r09')) B.conc++;
      if (v.gdraw) drawCards(v.gdraw);
      if (hasR('balon')) drawCards(1);
      if (B.extra) B.over = 'win';
    }
  }
}

function rivalShot(pow, el, who, tech) {
  var B = B_(), T = B.T;
  var fin = rivalShotValue(pow, el);
  B.rfat = 0;
  var blocked = Math.min(B.par, fin);
  B.par -= blocked;
  var rem = fin - blocked;
  B.kres -= rem;
  pushFx({ k: 'rshot', dmg: rem, blocked: blocked, who: who, tech: tech });
  if (B.kres <= 0 && hasR('espinilleras') && !B.esp) { B.esp = true; B.kres = 1; pushFx({ k: 'float', side: 'me', t: 'Espinilleras', c: 'blue' }); }
  if (B.kres <= 0) {
    B.gRv++; G.run.stats.against++;
    changeMoral(-T.golpe - (hasR('meteorito') ? 2 : 0));
    if (hasR('brazalete')) B.tpNext += 1;
    B.kres = B.kmax;
    pushFx({ k: 'goal', me: false, who: who, golpe: T.golpe });
    logB('Gol de ' + T.n);
    if (has('r10') && !B.erik) { B.erik = true; B.tpNext += 2; B.drawNext += 2; }
    if (B.extra) B.over = 'lose';
  }
}

function endTurn() {
  var B = B_();
  if (!B || G.busy || B.over) return;
  G.busy = true; G.ui.sel = null;
  sfx('tap');
  // el Cansancio que se queda en la mano desaparece
  B.hand.forEach(function (c) { delete c.fresh; if (c.id === 'cansancio') B.exh.push(c); else B.disc.push(c); });
  B.hand = [];
  var I = B.intent, T = B.T;
  if (I.pow) {
    if (I.st) pushFx({ k: 'rtech', who: I.who, tech: I.tech, vid: (G.opts.video && I.vid && !B.seen['r_' + I.tech]) ? I.vid : null });
    if (I.st) B.seen['r_' + I.tech] = 1;
    for (var h = 0; h < (I.hits || 1) && !B.over; h++) rivalShot(I.pow, I.el, I.who, I.tech);
    B.rimp = 0;
  } else if (I.k === 'avance') {
    B.rimp += I.val;
    pushFx({ k: 'float', side: 'rv', t: 'Avanzan +' + I.val, c: 'red' });
  } else if (I.k === 'presion') {
    if (I.tpDown) { B.tpNext -= I.tpDown; pushFx({ k: 'float', side: 'me', t: '-' + I.tpDown + ' TP', c: 'red' }); }
  }
  if (I.cans) {
    for (var i = 0; i < I.cans; i++) B.disc.push({ u: 'x' + Date.now() + i, id: 'cansancio' });
    pushFx({ k: 'float', side: 'me', t: '+' + I.cans + ' Cansancio', c: 'red' });
  }
  if (B.rvul > 0) B.rvul--;
  if (!B.over && B.turn >= B.maxT && B.gYo !== B.gRv) B.over = B.gYo > B.gRv ? 'win' : 'lose';
  if (G.run.moral <= 0) B.over = 'lose';
  afterAction(true);
}

function afterAction(turnEnd) {
  var B = B_();
  if (B && !B.over && G.run.moral <= 0) B.over = 'lose';
  saveRun();
  render();
  G.busy = true;
  playFx(function () {
    var B2 = B_();
    if (B2 && B2.over) { G.busy = false; finishBattle(B2.over === 'win'); return; }
    if (turnEnd && B2) {
      startTurn(false);
      saveRun(); render();
      playFx(function () { G.busy = false; render(); });
      return;
    }
    G.busy = false;
    render();
  });
}

function finishBattle(win) {
  var r = G.run, B = r.battle;
  if (!win) {
    r.battle = null;
    var pen = B.kind === 'elite' ? 10 : 8;
    if (B.kind !== 'boss') changeMoral(-pen);
    if (B.kind === 'boss' || r.moral <= 0) { endRun(false, B); return; }
    r.reward = { lost: true, pen: pen, coins: 0, cards: null, sign: null, score: B.gYo + ' - ' + B.gRv, team: B.tid };
    sfx('lose');
    goScreen('reward');
    return;
  }
  r.stats.wins++;
  r.kBonus = (r.kBonus || 0) + 1;
  var coins = (B.kind === 'boss' ? 90 : B.kind === 'elite' ? 40 : ri(16, 24)) + (hasR('hucha') ? 12 : 0);
  if (hasR('isotonica')) changeMoral(4);
  coins += Math.max(0, B.gYo - B.gRv) * 3;
  r.coins += coins;
  var rw = { coins: coins, cards: rollCards(B.kind), sign: null, score: B.gYo + ' - ' + B.gRv, team: B.tid, boss: B.kind === 'boss' };
  if (B.kind === 'elite') { rw.relic = rollRelic(Math.random() < 0.5 ? 'U' : 'C'); gainRelic(rw.relic); }
  if (B.kind === 'boss') {
    var bs = { royal: ['r13', 'r22'], zeus: ['r20', 'r51'] }[B.tid];
    if (bs) rw.sign = bs.filter(function (p) { return !has(p); });
    rw.bossRelics = shuffle(Object.keys(RELICS).filter(function (k) { return RELICS[k].r === 'B' && !hasR(k); })).slice(0, 3);
    changeMoral(10);
  }
  r.battle = null;
  r.reward = rw;
  if (B.kind === 'boss' && r.act === ACTS.length - 1) { endRun(true, B); return; }
  sfx('win');
  goScreen('reward');
}

function endRun(win, B) {
  var r = G.run;
  var st = load(STATS_KEY) || { runs: 0, wins: 0, best: 0 };
  st.runs++; if (win) st.wins++;
  var floors = r.stats.floors + r.act * 100;
  if (floors > st.best) st.best = floors;
  store(STATS_KEY, st);
  G.ended = { win: win, stats: r.stats, act: r.act, team: B ? B.tid : null, score: B ? (B.gYo + ' - ' + B.gRv) : '', cap: r.cap, deck: r.deck.length, teamSize: r.team.length };
  G.run = null; forget(SAVE_KEY);
  G.screen = 'end';
  sfx(win ? 'win' : 'lose');
  render();
}

/* ---------- recompensas ---------- */
function rollCards(kind) {
  var w = kind === 'boss' ? { C: 0, U: 60, R: 40 } : kind === 'elite' ? { C: 40, U: 45, R: 15 } : { C: 62, U: 32, R: 6 };
  var out = [];
  var guard = 0;
  while (out.length < 3 && guard++ < 200) {
    var x = Math.random() * 100, r = x < w.C ? 'C' : x < w.C + w.U ? 'U' : 'R';
    var opts = POOL.filter(function (id) { return CARDS[id].r === r && out.indexOf(id) < 0; });
    if (opts.length) out.push(pick(opts));
  }
  // a veces una sale ya mejorada
  return out.map(function (id) { return Math.random() < 0.15 ? id + '+' : id; });
}
function rollSignings(n) {
  return shuffle(SIGN_POOL.filter(function (p) { return !has(p); })).slice(0, n);
}
function takeCard(id) {
  var rw = G.run.reward; if (!rw) return;
  var up = /\+$/.test(id); addCard(id.replace('+', ''), up); rw.cards = null; sfx('card');
  rewardNext();
}
function skipCards() { var rw = G.run.reward; rw.cards = null; rewardNext(); }
function sign(pid) {
  var r = G.run;
  if (!has(pid)) r.team.push(pid);
  addCard(SIGNINGS[pid].card);
  sfx('win');
  if (r.reward) { r.reward.sign = null; rewardNext(); }
}
function takeBossRelic(id) { var rw = G.run.reward; gainRelic(id); rw.bossRelics = null; rewardNext(); }
function skipSign() { G.run.reward.sign = null; rewardNext(); }
function rewardNext() {
  var r = G.run, rw = r.reward;
  if (rw && (rw.cards || (rw.sign && rw.sign.length) || (rw.bossRelics && rw.bossRelics.length))) { saveRun(); render(); return; }
  var wasBoss = rw && rw.boss;
  r.reward = null;
  if (wasBoss) {
    r.act++; r.map = genMap(r.act); r.pos = null; r.lastTeams = [];
    G.ui.actIntro = true;
  }
  goScreen('map');
}

/* ---------- descanso ---------- */
function restHeal() {
  if (hasR('botas_axel')) return;
  changeMoral(Math.round(G.run.moralMax * 0.3) + (hasR('ramen') ? 8 : 0));
  sfx('heal');
  goScreen('map');
}
function upgradeCard(uid) {
  var c = G.run.deck.filter(function (x) { return x.u === uid; })[0];
  if (!c || !canUpgrade(c)) return;
  c.up = true; sfx('up');
}
function removeCard(uid) {
  var d = G.run.deck;
  for (var i = 0; i < d.length; i++) if (d[i].u === uid) { d.splice(i, 1); break; }
}

/* ---------- tienda ---------- */
var PRICE = { C: 45, U: 70, R: 110 };
function startShop() {
  var r = G.run;
  var ids = shuffle(POOL.slice()).slice(0, 5);
  r.shop = {
    cards: ids.map(function (id) { return { id: id, price: Math.round(PRICE[CARDS[id].r] * (0.9 + Math.random() * 0.25)), sold: false }; }),
    sign: rollSignings(1)[0] || null, signPrice: 140, signSold: false, removed: false,
    relics: [rollRelic('C'), rollRelic('U')].filter(function (x, i, a) { return x && a.indexOf(x) === i; }).map(function (id) { return { id: id, price: RELICS[id].r === 'U' ? 130 : 95, sold: false }; })
  };
  goScreen('shop');
}
function buyCard(i) {
  var r = G.run, s = r.shop.cards[i];
  if (!s || s.sold || r.coins < s.price) return;
  r.coins -= s.price; s.sold = true; addCard(s.id); sfx('coin'); saveRun(); render();
}
function buyRelic(i) {
  var r = G.run, s = r.shop.relics[i];
  if (!s || s.sold || r.coins < s.price) return;
  r.coins -= s.price; s.sold = true; gainRelic(s.id); sfx('coin'); saveRun(); render();
}
/* ---------- cofre ---------- */
function startChest() {
  var r = G.run, x = Math.random();
  var sg = rollSignings(1)[0];
  r.chest = x < 0.25 && sg ? { sign: sg, opened: false } : { relic: rollRelic(Math.random() < 0.3 ? 'U' : 'C'), coins: ri(15, 35), opened: false };
  goScreen('chest');
}
function openChest() {
  var r = G.run, ch = r.chest; if (!ch || ch.opened) return;
  ch.opened = true;
  if (ch.relic) { gainRelic(ch.relic); r.coins += ch.coins; }
  sfx('win'); saveRun(); render();
}
function buySign() {
  var r = G.run, s = r.shop;
  if (!s.sign || s.signSold || r.coins < s.signPrice) return;
  r.coins -= s.signPrice; s.signSold = true; sign(s.sign); sfx('coin'); saveRun(); render();
}

/* ---------- eventos ---------- */
function startEvent() {
  var r = G.run;
  r.seenEvents = r.seenEvents || [];
  var pool = EVENTS.filter(function (e) { return r.seenEvents.indexOf(e.id) < 0; });
  if (!pool.length) { r.seenEvents = []; pool = EVENTS; }
  var e = pick(pool);
  r.seenEvents.push(e.id);
  r.event = { id: e.id, result: null };
  goScreen('event');
}
function eventChoice(i) {
  var r = G.run, e = EVENTS.filter(function (x) { return x.id === r.event.id; })[0];
  var o = e.o[i]; if (!o || r.event.result) return;
  var res = '';
  switch (o.a) {
    case 'upRandom':
      var ups = r.deck.filter(canUpgrade);
      if (ups.length) { var c = pick(ups); c.up = true; res = 'Mejoras ' + CARDS[c.id].n + '.'; } else res = 'No te queda nada por mejorar.';
      changeMoral(-6); if (r.moral < 1) r.moral = 1; res += ' Pierdes 6 de Moral.';
      break;
    case 'heal8': changeMoral(8); res = 'Recuperas 8 de Moral.'; break;
    case 'heal6': changeMoral(6); res = 'El dueño te lo agradece. Recuperas 6 de Moral.'; break;
    case 'apuesta':
      if (Math.random() < 0.5) { r.coins += 50; res = '¡Dentro! Ganas 50 monedas.'; }
      else { changeMoral(-6); if (r.moral < 1) r.moral = 1; res = 'Fuera por poco. Pierdes 6 de Moral.'; }
      break;
    case 'perdido': var pr = rollRelic(); gainRelic(pr); addCard('cansancio'); res = 'Te quedas ' + RELICS[pr].n + '. Entra 1 Cansancio en tu mazo.'; break;
    case 'penaltis':
      if (Math.random() < 0.5) { var pc = randomCardOf(['R', 'U']); addCard(pc); res = '¡Gol! Mark te enseña ' + CARDS[pc].n + '.'; }
      else { changeMoral(-5); if (r.moral < 1) r.moral = 1; res = 'Mark la para con una mano. Pierdes 5 de Moral.'; }
      break;
    case 'upOne':
      var u1 = r.deck.filter(canUpgrade); if (u1.length) { var cu = pick(u1); cu.up = true; res = 'Aprendes mirando. Mejoras ' + CARDS[cu.id].n + '.'; } else res = 'No te queda nada por mejorar.';
      break;
    case 'heal5': changeMoral(5); res = 'Te vas con la cabeza alta. Recuperas 5 de Moral.'; break;
    case 'rare':
      var rares = POOL.filter(function (id) { return CARDS[id].r === 'R'; });
      var id = pick(rares); addCard(id); changeMoral(-7); if (r.moral < 1) r.moral = 1;
      res = 'Aprendes ' + CARDS[id].n + '. Pierdes 7 de Moral.'; break;
    case 'coins25': r.coins += 25; res = 'Ganas 25 monedas.'; break;
    case 'ramen':
      if (r.coins >= 20) { r.coins -= 20; changeMoral(18); res = 'El equipo sale como nuevo. Recuperas 18 de Moral.'; }
      else res = 'No te llega el dinero. Os vais con hambre.';
      break;
    case 'remove': G.modal = { k: 'deck', mode: 'remove', from: 'event' }; res = 'Eliges qué vicio quitar.'; break;
    case 'common':
      var cm = pick(POOL.filter(function (id) { return CARDS[id].r === 'C'; })); addCard(cm);
      res = 'Aprendes ' + CARDS[cm].n + '.'; break;
    case 'sign70':
      if (r.coins >= 70) {
        var opts = rollSignings(2);
        if (opts.length) { r.coins -= 70; G.modal = { k: 'sign', opts: opts }; res = 'Elige a quién fichar.'; }
        else res = 'Ya tienes a todos los jugadores que conocía.';
      } else res = 'No tienes 70 monedas. Se marcha sin decir nada.';
      break;
    case 'trato':
      r.coins += 70; addCard('cansancio'); addCard('cansancio');
      res = 'Ganas 70 monedas. Tu mazo carga con 2 Cansancio.'; break;
    default: res = 'Sigues tu camino.';
  }
  r.event.result = res;
  sfx('tap');
  saveRun(); render();
}

/* ---------- opciones y arranque ---------- */
function loadOpts() { var o = load(OPTS_KEY); if (o) { G.opts.sound = o.sound !== false; G.opts.video = o.video !== false; } }
function saveOpts() { store(OPTS_KEY, G.opts); }

function continueRun() {
  var r = load(SAVE_KEY);
  if (!r || r.v !== 2) { forget(SAVE_KEY); G.screen = 'menu'; render(); return; }
  if (!r) return;
  G.run = r;
  if (r.battle) {
    // si se cerró justo al acabar el partido, se cierra ahora
    if (r.battle.over) { finishBattle(r.battle.over === 'win'); return; }
    G.screen = 'battle';
  } else G.screen = r.screen || 'map';
  render();
}
