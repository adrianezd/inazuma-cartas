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
function keeperMax() { return 16 + (has('r13') ? 6 : 0) + (has('r51') ? 10 : 0); }
var MY_KEEPER = 'r01';

function newRun(capIdx) {
  var cap = CAPTAINS[capIdx];
  G.run = {
    v: 1, cap: cap.id, team: BASE_TEAM.concat([cap.id]), deck: [], moral: 60, moralMax: 60, coins: 40,
    act: 0, map: null, pos: null, uid: 1, removeCost: 60, lastTeams: [], battle: null, reward: null,
    shop: null, event: null, screen: 'map',
    stats: { wins: 0, goals: 0, against: 0, floors: 0, start: Date.now() }
  };
  STARTER.forEach(function (id) { addCard(id); });
  addCard(cap.card);
  G.run.map = genMap(0);
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
      if (n.r >= 2) bag.push('elite', 'tienda');
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
  if (!hasShop && mids.length) pick(mids).type = 'tienda';
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
  else if (n.type === 'evento') startEvent();
  else if (n.type === 'tienda') startShop();
  else if (n.type === 'descanso') goScreen('rest');
}

/* ---------- partido ---------- */
function scaleTeam(id, act, kind) {
  var T = TEAMS[id], F = T.boss ? 1 : [1, 1.3, 1.6][act];
  var o = {}; for (var k in T) o[k] = T[k];
  var s = function (x) { return Math.round(x * F); };
  var a = T.boss ? 0 : act;
  o.id = id; o.kind = kind;
  o.res = Math.round(s(T.res) * (T.boss ? 1 : 0.85));
  o.shot = T.shot.map(function (x) { return s(x) + (T.boss ? 0 : 2); });
  o.pos = T.pos.map(function (x) { return x + a + 1; });
  o.pres = T.pres.map(function (x) { return x + a; });
  o.muro = T.muro.map(function (x) { return x + 2 * a; });
  if (kind === 'elite') {
    o.res = Math.round(o.res * 1.3);
    o.shot = o.shot.map(function (x) { return x + 2; });
    o.pos = o.pos.map(function (x) { return x + 1; });
    o.pres = o.pres.map(function (x) { return x + 1; });
  }
  o.golpe = (kind === 'boss' ? 10 : kind === 'elite' ? 8 : 6) + act;
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
    tid: tid, kind: kind, T: T, turn: 0, maxT: 8, extra: false, gYo: 0, gRv: 0, ball: 'yo',
    jug: 0, ctl: 0, par: 0, tp: 0, kmax: km, kres: km, rmax: T.res, rres: T.res, rmuro: 0,
    conc: (has('r20') ? 2 : 0) + (has('r14') ? 1 : 0), rfat: 0, rimp: 0, rconc: 0,
    tpNext: has('r14') ? 1 : 0, drawNext: has('r15') ? 2 : 0,
    draw: shuffle(r.deck.map(function (c) { return { u: c.u, id: c.id, up: c.up }; })), hand: [], disc: [], exh: [],
    parT: 0, intent: null, stole: false, shots: 0, jugCards: 0, cambio: false, erik: false, atk: 0,
    seen: {}, over: null, log: []
  };
  r.battle = B;
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
    B.kres = Math.max(1, B.kres - 4); B.rres = Math.max(1, B.rres - 4);
    if (B.turn === B.maxT + 1) pushFx({ k: 'banner', t: 'Gol de oro', s: 'Quien marque gana. Los porteros pierden 4 de aguante cada turno.', c: 'gold' });
  } else if (B.turn === 5 && !first) {
    pushFx({ k: 'banner', t: 'Segunda parte', s: '', c: 'blue' });
  }
  B.tp = Math.max(0, 3 + B.tpNext); B.tpNext = 0;
  B.par = B.parT;
  B.ctl = (B.ball === 'rv' && captain() === 'r08') ? 3 : 0;
  B.stole = false; B.shots = 0; B.jugCards = 0; B.cambio = false; B.rmuro = 0;
  if (T.rasgo === 'nectar' && B.turn > 1) B.rconc++;
  if (T.rasgo === 'kageyama' && B.turn === 5) {
    B.draw.push({ u: 'x' + Date.now() + 'a', id: 'cansancio' }, { u: 'x' + Date.now() + 'b', id: 'cansancio' });
    shuffle(B.draw);
    pushFx({ k: 'banner', t: 'Trampa de Kageyama', s: 'Entran 2 Cansancio en tu mazo.', c: 'red' });
  }
  drawCards(5 + B.drawNext); B.drawNext = 0;
  B.intent = rollIntent();
  if (B.intent.muro) B.rmuro = B.intent.muro;
  if (B.intent.st && B.intent.k !== 'tiro') pushFx({ k: 'rtech', who: B.intent.who || T.gk, tech: B.intent.tech, vid: B.intent.vid });
  checkSteal(null);
  if (first) pushFx({ k: 'banner', t: 'Saque inicial', s: 'Empiezas con el balón.', c: 'blue' });
}

function effPos(I) { return I && I.pos != null ? Math.max(1, I.pos - (has('r16') ? 2 : 0)) : null; }

function rivalShotValue(pow, el) {
  var B = B_();
  return Math.max(0, Math.round((pow + B.rconc - B.rfat) * elemMult(el, PLAYERS[MY_KEEPER].el)));
}

function rollIntent() {
  var B = B_(), T = B.T, el = PLAYERS[T.st].el, rg = T.rasgo;
  if (B.ball === 'rv') {
    var n = B.atk;
    var I;
    if (T.boss) {
      if (rg === 'genesis') {
        if (B.rimp === 0 && n % 2 === 0) I = { k: 'avance', val: 8, pos: rr(T.pos) + 1, tech: 'Carga de Supernova', who: T.st };
        else if (B.rimp > 0) I = { k: 'tiro', pow: T.spow + B.rimp, pos: rr(T.pos) + 1, el: el, who: T.st, tech: T.stech, st: 1, vid: T.vid };
        else I = { k: 'tiro', pow: rr(T.shot), pos: rr(T.pos), el: el, who: T.st, tech: 'Tiro' };
      } else if (n % 3 === 2) {
        I = { k: 'tiro', pow: T.spow + B.rimp, pos: T.pos[1] + 2, el: el, who: T.st, tech: T.stech, st: 1, vid: T.vid };
      } else if (B.rimp === 0 && Math.random() < 0.3) {
        I = { k: 'avance', val: ri(4, 6), pos: rr(T.pos) - 1, who: T.st, tech: 'Avance' };
      } else {
        I = { k: 'tiro', pow: rr(T.shot) + B.rimp, pos: rr(T.pos), el: el, who: T.st, tech: 'Tiro' };
      }
    } else if (B.rimp === 0 && Math.random() < 0.33) {
      I = { k: 'avance', val: ri(3, 5) + G.run.act + (rg === 'murdock' ? 3 : 0), pos: rr(T.pos) - 1, who: T.st, tech: 'Avance' };
    } else {
      var special = Math.random() < 0.4;
      I = { k: 'tiro', pow: rr(T.shot) + B.rimp + (special ? 2 : 0), pos: rr(T.pos), el: el, who: T.st,
            tech: special ? T.tech : 'Tiro', st: special ? 1 : 0, vid: special ? T.vid : null };
    }
    B.atk++;
    return I;
  }
  // tienes tú el balón
  var r = Math.random();
  var contra = (rg === 'contra' || rg === 'alius' || rg === 'genesis') ? Math.max(4, rr(T.shot) - 3) : 0;
  if (rg === 'nectar' && r < 0.3) return { k: 'presion', pres: rr(T.pres) - 1, tpDown: 1, tech: 'Hora Celestial', st: 1, who: T.st };
  if (r < 0.45) return { k: 'presion', pres: rr(T.pres), contra: contra, cans: rg === 'maldicion' ? 1 : 0 };
  if (r < 0.8) {
    var mu = rr(T.muro);
    if (T.muroTech) return { k: 'muro', muro: mu, tech: T.muroTech, st: 1, vid: T.muroVid, who: T.gk };
    return { k: 'muro', muro: mu };
  }
  return { k: 'mixto', pres: rr(T.pres) - 2, muro: Math.max(2, rr(T.muro) - 2), contra: contra, cans: rg === 'maldicion' ? 1 : 0 };
}

function shotPower(c) {
  var B = B_(), v = cardV(c), d = CARDS[c.id];
  var base = (v.pow || 0) + B.jug * (v.k || 2) + B.conc;
  if (captain() === 'r02' && B.shots === 0) base += 3;
  if (v.robo && B.stole) base += v.robo;
  if (v.axel && has('r02')) base += v.axel;
  if (v.jude && has('r04')) base += v.jude;
  if (v.j3 && B.jug >= 3) base += v.j3;
  if (v.jc) base += v.jc * B.jugCards;
  if (has('r09') && B.jug >= 4) base += 4;
  var mult = elemMult(PLAYERS[d.p].el, PLAYERS[B.T.gk].el);
  return { base: base, mult: mult, final: Math.round(base * mult) };
}

function playReason(c) {
  var B = B_(), d = CARDS[c.id];
  if (!B || B.over) return 'Fin del partido';
  if (CARDS[c.id].v.unplay) return 'No se puede jugar';
  if (cardCost(c) > B.tp) return 'Te faltan TP';
  if (d.t === 'tiro' && B.ball !== 'yo') return 'Necesitas el balón';
  return '';
}

function checkSteal(c) {
  var B = B_(), I = B.intent;
  if (B.ball !== 'rv' || !I || I.pos == null) return false;
  if (B.ctl < effPos(I)) return false;
  B.ball = 'yo'; B.stole = true; B.jug = 0; B.rimp = 0;
  B.intent = { k: 'robado' };
  if (c) { var v = cardV(c); if (v.cj) B.jug += v.cj; }
  if (captain() === 'r04') { B.jug += 2; drawCards(1); }
  if (has('r07')) B.rfat += 3;
  pushFx({ k: 'steal' });
  logB('Robas el balón');
  return true;
}

function playCard(uid) {
  var B = B_();
  if (!B || G.busy || B.over) return;
  var idx = -1; for (var i = 0; i < B.hand.length; i++) if (B.hand[i].u === uid) idx = i;
  if (idx < 0) return;
  var c = B.hand[idx], d = CARDS[c.id], v = cardV(c);
  var why = playReason(c);
  if (why) { pushFx({ k: 'toast', t: why }); sfx('no'); playFx(); return; }
  B.tp -= cardCost(c);
  B.hand.splice(idx, 1);
  G.ui.sel = null;
  if (d.st) {
    var first = !B.seen[c.id]; B.seen[c.id] = 1;
    pushFx({ k: 'tech', who: d.p, tech: d.n, vid: (first && G.opts.video) ? d.vid : null, el: cardEl(c) });
  } else sfx('card');
  if (v.jug) {
    var extra = (has('r22') && d.t === 'jugada' && B.jugCards === 0) ? 1 : 0;
    B.jug += v.jug + extra;
  }
  if (v.dbl) B.jug *= 2;
  if (d.t === 'jugada') B.jugCards++;
  if (v.par) B.par += v.par;
  if (v.heal) B.kres = Math.min(B.kmax, B.kres + v.heal);
  if (v.tp) B.tp += v.tp;
  if (v.tpn) B.tpNext += v.tpn;
  if (v.conc) B.conc += v.conc;
  if (v.fat) B.rfat += v.fat;
  if (v.parT) B.parT += v.parT;
  if (v.ctl) { B.ctl += v.ctl; checkSteal(c); }
  if (v.draw) drawCards(v.draw);
  if (d.t === 'tiro') doShot(c);
  if (v.agota || v.perm) B.exh.push(c); else B.disc.push(c);
  logB('Juegas ' + d.n + (c.up ? '+' : ''));
  afterAction();
}

function doShot(c) {
  var B = B_(), v = cardV(c), sp = shotPower(c);
  B.shots++;
  var dmg = sp.final, absorbed = Math.min(B.rmuro, dmg);
  B.rmuro -= absorbed; dmg -= absorbed;
  B.rres -= dmg;
  pushFx({ k: 'shot', dmg: dmg, absorbed: absorbed, mult: sp.mult });
  if (B.rres <= 0) {
    B.gYo++; G.run.stats.goals++;
    B.rres = B.rmax; B.ball = 'rv'; B.jug = 0; B.intent = { k: 'saque' };
    pushFx({ k: 'goal', me: true, who: CARDS[c.id].p });
    logB('¡Gol!');
    if (B.extra) B.over = 'win';
  } else if (v.reb) {
    B.jug = 0;
    pushFx({ k: 'float', side: 'rv', t: 'Rebote', c: 'blue' });
  } else {
    B.ball = 'rv'; B.jug = 0; B.intent = { k: 'saque' };
    pushFx({ k: 'float', side: 'rv', t: 'Parada', c: 'white' });
  }
}

function useCambio(uid) {
  var B = B_();
  if (!B || G.busy || B.cambio || B.over) return;
  var idx = -1; for (var i = 0; i < B.hand.length; i++) if (B.hand[i].u === uid) idx = i;
  if (idx < 0) return;
  var c = B.hand.splice(idx, 1)[0];
  if (c.id === 'cansancio') B.exh.push(c); else B.disc.push(c);
  B.cambio = true; G.ui.cambioMode = false; G.ui.sel = null;
  drawCards(1);
  sfx('card');
  logB('Cambio');
  afterAction();
}

function rivalShot(pow, el, who, tech) {
  var B = B_(), T = B.T;
  var fin = rivalShotValue(pow, el);
  B.rfat = 0; B.rimp = 0;
  var blocked = Math.min(B.par, fin);
  B.par -= blocked;
  var rem = fin - blocked;
  B.kres -= rem;
  pushFx({ k: 'rshot', dmg: rem, blocked: blocked, who: who, tech: tech });
  if (B.kres <= 0) {
    B.gRv++; G.run.stats.against++;
    changeMoral(-T.golpe);
    B.kres = B.kmax;
    pushFx({ k: 'goal', me: false, who: who, golpe: T.golpe });
    logB('Gol de ' + T.n);
    if (has('r10') && !B.erik) { B.erik = true; B.tpNext += 2; B.drawNext += 2; }
    if (B.extra) B.over = 'lose';
  }
  B.ball = 'yo'; B.jug = 0;
}

function endTurn() {
  var B = B_();
  if (!B || G.busy || B.over) return;
  G.busy = true; G.ui.sel = null; G.ui.cambioMode = false;
  sfx('tap');
  B.hand.forEach(function (c) { delete c.fresh; B.disc.push(c); });
  B.hand = [];
  var I = B.intent, T = B.T;
  if (B.ball === 'rv' && I.k === 'tiro') {
    if (I.st) pushFx({ k: 'rtech', who: I.who, tech: I.tech, vid: (G.opts.video && I.vid && !B.seen['r_' + I.tech]) ? I.vid : null });
    if (I.st) B.seen['r_' + I.tech] = 1;
    rivalShot(I.pow, I.el, I.who, I.tech);
  } else if (B.ball === 'rv' && I.k === 'avance') {
    B.rimp += I.val;
    pushFx({ k: 'float', side: 'me', t: 'Avanzan +' + I.val, c: 'red' });
  } else if (B.ball === 'yo' && I.pres) {
    if (I.tpDown) { B.tpNext -= I.tpDown; }
    if (B.ctl < I.pres) {
      B.ball = 'rv'; B.jug = 0;
      pushFx({ k: 'lost' });
      logB('Te roban el balón');
      if (T.rasgo === 'hielo') B.tpNext -= 1;
      if (I.contra) rivalShot(I.contra, PLAYERS[T.st].el, T.st, 'Contraataque');
    } else {
      pushFx({ k: 'float', side: 'me', t: 'Aguantas', c: 'blue' });
    }
  }
  if (I.cans) {
    for (var i = 0; i < I.cans; i++) B.disc.push({ u: 'x' + Date.now() + i, id: 'cansancio' });
    pushFx({ k: 'float', side: 'me', t: '+1 Cansancio', c: 'red' });
  }
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
    var pen = B.kind === 'elite' ? 15 : 12;
    if (B.kind !== 'boss') changeMoral(-pen);
    if (B.kind === 'boss' || r.moral <= 0) { endRun(false, B); return; }
    r.reward = { lost: true, pen: pen, coins: 0, cards: null, sign: null, score: B.gYo + ' - ' + B.gRv, team: B.tid };
    sfx('lose');
    goScreen('reward');
    return;
  }
  r.stats.wins++;
  var coins = B.kind === 'boss' ? 90 : B.kind === 'elite' ? 40 : ri(16, 24);
  coins += Math.max(0, B.gYo - B.gRv) * 3;
  r.coins += coins;
  var rw = { coins: coins, cards: rollCards(B.kind), sign: null, score: B.gYo + ' - ' + B.gRv, team: B.tid, boss: B.kind === 'boss' };
  if (B.kind === 'elite') rw.sign = rollSignings(2);
  if (B.kind === 'boss') {
    var bs = { royal: ['r13', 'r22'], zeus: ['r20', 'r51'] }[B.tid];
    if (bs) rw.sign = bs.filter(function (p) { return !has(p); });
    changeMoral(15);
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
  return out;
}
function rollSignings(n) {
  return shuffle(SIGN_POOL.filter(function (p) { return !has(p); })).slice(0, n);
}
function takeCard(id) {
  var rw = G.run.reward; if (!rw) return;
  addCard(id); rw.cards = null; sfx('card');
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
function skipSign() { G.run.reward.sign = null; rewardNext(); }
function rewardNext() {
  var r = G.run, rw = r.reward;
  if (rw && (rw.cards || (rw.sign && rw.sign.length))) { saveRun(); render(); return; }
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
  changeMoral(Math.round(G.run.moralMax * 0.3));
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
    sign: rollSignings(1)[0] || null, signPrice: 140, signSold: false, removed: false
  };
  goScreen('shop');
}
function buyCard(i) {
  var r = G.run, s = r.shop.cards[i];
  if (!s || s.sold || r.coins < s.price) return;
  r.coins -= s.price; s.sold = true; addCard(s.id); sfx('coin'); saveRun(); render();
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
    case 'heal5': changeMoral(5); res = 'Te vas con la cabeza alta. Recuperas 5 de Moral.'; break;
    case 'rare':
      var rares = POOL.filter(function (id) { return CARDS[id].r === 'R' || CARDS[id].r === 'U'; });
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
  if (!r) return;
  G.run = r;
  if (r.battle) {
    // si se cerró justo al acabar el partido, se cierra ahora
    if (r.battle.over) { finishBattle(r.battle.over === 'win'); return; }
    G.screen = 'battle';
  } else G.screen = r.screen || 'map';
  render();
}
