'use strict';
/* Inazuma Cartas: pantallas, cartas, efectos y sonido. */

G.ui = { sel: null, gFilter: 'todas', actIntro: false, suppressClick: false };
var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var $app = document.getElementById('app');
var $fx = document.getElementById('fx');
var $modal = document.getElementById('modal');

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

var ICON = {
  ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 7l4 3-1.5 4.6h-5L8 10z" fill="#0b1630"/><path d="M12 2v5M16 10l5-1.5M14.5 14.6l3 4M9.5 14.6l-3 4M8 10L3 8.5" stroke="#0b1630" stroke-width="1.4" fill="none"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13.5 1L4 14h6.5L9 23l11-14h-7z" fill="currentColor"/></svg>',
  q: '<svg viewBox="0 0 24 24"><path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.3-1.5 2.4v.5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2z" fill="currentColor"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  rest: '<svg viewBox="0 0 24 24"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" fill="currentColor"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="currentColor"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ffcf3a"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#b07a10" stroke-width="1.6"/><path d="M12.8 7.5l-3 5h2.4l-1 4 3.3-5.3h-2.4z" fill="#b07a10"/></svg>',
  deck: '<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="16" rx="2" fill="currentColor" opacity=".45"/><rect x="4" y="6" width="12" height="16" rx="2" fill="currentColor"/></svg>',
  team: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" fill="currentColor"/><circle cx="16.5" cy="9" r="2.8" fill="currentColor" opacity=".6"/><path d="M2.5 20c.5-4 3.2-6 6.5-6s6 2 6.5 6z" fill="currentColor"/><path d="M15 14.2c3 0 5.6 1.6 6.3 5.3h-4.6" fill="currentColor" opacity=".6"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 5l1.6 1.3-2 3.4-2-.7a8 8 0 0 1-1.8 1l-.3 2.1h-3.9l-.4-2.1a8 8 0 0 1-1.7-1l-2 .7-2-3.4 1.6-1.3a8 8 0 0 1 0-2L2 10.2l2-3.4 2 .7a8 8 0 0 1 1.7-1L8.1 4.4h3.9l.3 2.1a8 8 0 0 1 1.8 1l2-.7 2 3.4-1.6 1.3a8 8 0 0 1 0 2z" fill="currentColor"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="currentColor"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  boot: '<svg viewBox="0 0 24 24"><path d="M5 3h6v8l7 3c2 .8 3 2 3 4v2H3V4z" fill="currentColor"/></svg>',
  hand: '<svg viewBox="0 0 24 24"><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5V3.5a1.5 1.5 0 0 1 3 0V10V4.5a1.5 1.5 0 0 1 3 0V11V7a1.5 1.5 0 0 1 3 0v7c0 4.4-3 8-7.5 8S5 19 4 16l-1.6-3.4a1.4 1.4 0 0 1 2.4-1.4z" fill="currentColor"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M12 3l8 9h-5v9H9v-9H4z" fill="currentColor"/></svg>'
};
var NODE_INFO = {
  partido: { n: 'Partido', icon: ICON.ball, c: '#43c6ff' },
  elite: { n: 'Élite', icon: ICON.bolt, c: '#ff5a3c' },
  evento: { n: 'Evento', icon: ICON.q, c: '#b583ff' },
  tienda: { n: 'Tienda', icon: ICON.shop, c: '#ffcf3a' },
  descanso: { n: 'Descanso', icon: ICON.rest, c: '#3ddc84' },
  jefe: { n: 'Jefe', icon: ICON.bolt, c: '#ffcf3a' }
};
var TYPE_ICON = { tiro: ICON.boot, defensa: ICON.hand, tactica: ICON.bolt, estado: ICON.q };

function avatar(pid, cls) {
  var p = PLAYERS[pid]; if (!p) return '';
  var ini = p.n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2);
  return '<span class="av ' + (cls || '') + '" style="--ec:' + ELEM_INFO[p.el].c + '"><b>' + ini + '</b><img src="' + spriteUrl(pid) + '" alt="' + esc(p.n) + '" loading="lazy" onerror="this.remove()"></span>';
}
function elemIcon(el, cls) { return el ? '<img class="elx ' + (cls || '') + '" src="' + elemUrl(el) + '" alt="' + el + '" title="' + el + '">' : ''; }
function crestImg(file, cls) { return '<img class="crest ' + (cls || '') + '" src="' + crestUrl(file) + '" alt="" onerror="this.style.visibility=\'hidden\'">'; }

/* ---------- cartas ---------- */
function cardText(c, live) {
  var d = CARDS[c.id], v = cardV(c), p = [];
  if (d.t === 'tiro') {
    var pow = v.pow, cls = '';
    if (live && B_()) { var sp = shotPower(c); pow = sp.final; cls = sp.final > v.pow ? 'hi' : sp.final < v.pow ? 'lo' : ''; }
    p.push('Tiro <b class="num ' + cls + '">' + pow + '</b>' + (v.hits > 1 ? ' x' + v.hits : '') + '.');
    if (v.pierce) p.push('Ignora el muro.');
    if (v.ps) p.push('+' + v.ps + ' por cada tiro que ya hayas hecho este turno.');
    if (v.axel) p.push('Combinada: +' + v.axel + ' si tienes a Axel Blaze.');
    if (v.jude) p.push('Combinada: +' + v.jude + ' si tienes a Jude Sharp.');
    if (v.gdraw) p.push('Si es gol, roba ' + v.gdraw + '.');
  }
  if (v.par) p.push('+' + v.par + ' Parada.');
  if (v.heal) p.push('Tu portero recupera ' + v.heal + ' de aguante.');
  if (v.fat) p.push('El próximo tiro rival pierde ' + v.fat + '.');
  if (v.vul) p.push('Desorienta ' + v.vul + (v.vul > 1 ? ' turnos.' : ' turno.'));
  if (v.oca) p.push('Tu próximo tiro suma ' + v.oca + '.');
  if (v.dbl) p.push('Tu próximo tiro se repite.');
  if (v.conc) p.push('+' + v.conc + ' Concentración.');
  if (v.draw) p.push('Roba ' + v.draw + (v.draw > 1 ? ' cartas.' : ' carta.'));
  if (v.tp) p.push('Ganas ' + v.tp + ' TP.');
  if (v.tpn) p.push('El próximo turno, +' + v.tpn + ' TP.');
  if (v.parT) p.push('Al empezar cada turno, +' + v.parT + ' Parada.');
  if (v.unplay) p.push('No se puede jugar. Si acaba el turno en tu mano, desaparece.');
  if (v.perm) p.push('<i>Para todo el partido.</i>');
  if (v.agota) p.push('<i>Agota.</i>');
  return p.join(' ');
}

function cardHTML(c, o) {
  o = o || {};
  if (typeof c === 'string') c = { id: c, up: false, u: '' };
  var d = CARDS[c.id], el = cardEl(c), tc = TYPE_INFO[d.t].c, ec = el ? ELEM_INFO[el].c : '#7d8799';
  var cost = o.live && B_() ? cardCostB(c) : cardCost(c);
  var holo = d.r === 'R' || d.r === 'S' || d.r === 'F';
  var cls = 'card t-' + d.t + ' r-' + d.r + (c.up ? ' up' : '') + (holo ? ' holo' : '') + (o.cls ? ' ' + o.cls : '') + (o.tilt ? ' tilt' : '');
  var txt = cardText(c, o.live), plain = txt.replace(/<[^>]+>/g, '');
  var tl = plain.length > 82 ? ' xlong' : plain.length > 56 ? ' long' : '';
  var art = d.p ? '<img class="cd-spr" src="' + spriteUrl(d.p) + '" alt="" loading="lazy" onerror="this.remove()">' : '<span class="cd-none">' + ICON.q + '</span>';
  return '<div class="' + cls + '" data-u="' + esc(c.u || '') + '" data-id="' + c.id + '" style="--tc:' + tc + ';--ec:' + ec + (o.style || '') + '">' +
    '<div class="cd-in">' +
      '<div class="cd-art">' + art + (el ? elemIcon(el, 'cd-el') : '') + '</div>' +
      (cost >= 0 ? '<div class="cd-cost">' + cost + '</div>' : '') +
      '<div class="cd-name">' + esc(d.n) + (c.up ? '+' : '') + '</div>' +
      '<div class="cd-type"><i>' + TYPE_ICON[d.t] + '</i>' + TYPE_INFO[d.t].n + (d.st ? '<em title="Supertécnica">' + ICON.bolt + '</em>' : '') + '</div>' +
      '<div class="cd-text' + tl + '">' + txt + '</div>' +
      (d.p ? '<div class="cd-who">' + esc(PLAYERS[d.p].n) + '</div>' : '') +
    '</div>' +
    (holo ? '<div class="cd-holo"></div>' : '') +
  '</div>';
}

/* ---------- render principal ---------- */
function render() {
  var s = G.screen, h = '';
  document.body.dataset.screen = s;
  if (s === 'menu') h = viewMenu();
  else if (s === 'captain') h = viewCaptain();
  else if (s === 'map') h = viewMap();
  else if (s === 'battle') h = viewBattle();
  else if (s === 'reward') h = viewReward();
  else if (s === 'rest') h = viewRest();
  else if (s === 'shop') h = viewShop();
  else if (s === 'event') h = viewEvent();
  else if (s === 'end') h = viewEnd();
  else if (s === 'gallery') h = viewGallery();
  $app.innerHTML = h;
  renderModal();
  if (s === 'battle') layoutHand();
  if (s === 'map') scrollMap();
  if (s === 'map' && G.ui.actIntro) { G.ui.actIntro = false; pushFx({ k: 'banner', t: 'Acto ' + (G.run.act + 1), s: ACTS[G.run.act].n, c: 'gold' }); playFx(); }
}

/* ---------- menú ---------- */
function viewMenu() {
  var saved = load(SAVE_KEY); if (saved && saved.v !== 2) saved = null;
  var st = load(STATS_KEY);
  var show = ['tornado_fuego', 'mano_celestial', 'espejismo'];
  return '<div class="menu">' +
    '<div class="bg-bolts" aria-hidden="true">' + ICON.bolt + ICON.bolt + ICON.bolt + '</div>' +
    '<section class="hero">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Roguelike de cartas</p>' +
        '<h1 class="logo"><span>Inazuma</span><b>Cartas</b></h1>' +
        '<p class="tag">Tira para marcar, para para no encajar y arma un mazo de supertécnicas para tumbar a la Royal, al Zeus y al Genesis.</p>' +
        '<div class="cta">' +
          (saved ? '<button class="btn primary big" data-a="continue">Continuar</button><button class="btn ghost" data-a="new">Nueva carrera</button>'
                 : '<button class="btn primary big" data-a="new">Jugar</button>') +
        '</div>' +
        '<div class="menu-links">' +
          '<button class="link" data-a="help">Cómo se juega</button>' +
          '<button class="link" data-a="gallery">Cartas</button>' +
          '<button class="link" data-a="notes">Novedades</button>' +
          '<button class="link" data-a="opts">Opciones</button>' +
        '</div>' +
        (st && st.runs ? '<p class="dim small">Carreras: ' + st.runs + ' · Ganadas: ' + st.wins + '</p>' : '') +
      '</div>' +
      '<div class="hero-cards" aria-hidden="true">' +
        show.map(function (id, i) { return cardHTML({ id: id, up: false, u: '' }, { cls: 'float f' + i, tilt: true }); }).join('') +
      '</div>' +
    '</section>' +
    '<section class="pillars">' +
      pillar(ICON.boot, 'Tira', 'Cada tiro desgasta al portero rival. Cuando cae, es gol.') +
      pillar(ICON.hand, 'Para', 'Ves lo que va a tirar el rival. Frénalo con Parada.') +
      pillar(ICON.bolt, 'Supertécnicas', 'Gana cartas con efectos y mira el vídeo de cada técnica.') +
      pillar(ICON.team, 'Ficha estrellas', 'Cada fichaje trae su pasiva y su supertécnica.') +
    '</section>' +
    '<p class="foot dim small">Fan game no oficial de Inazuma Eleven. Versión ' + APP_VERSION + '.</p>' +
  '</div>';
}
function pillar(ic, t, d) { return '<div class="pillar"><i>' + ic + '</i><div><b>' + t + '</b><span>' + d + '</span></div></div>'; }

/* ---------- capitán ---------- */
function viewCaptain() {
  var sel = G.ui.cap == null ? 0 : G.ui.cap;
  return '<div class="screen captain">' +
    '<header class="top"><button class="btn ghost sm" data-a="menu">Volver</button><h2>Elige capitán</h2><span></span></header>' +
    '<p class="dim center">Juega con el Raimon. Tu capitán trae una pasiva y su supertécnica.</p>' +
    '<div class="caps">' + CAPTAINS.map(function (c, i) {
      var p = PLAYERS[c.id];
      return '<button class="cap' + (i === sel ? ' on' : '') + '" data-a="cap" data-i="' + i + '" style="--ec:' + ELEM_INFO[p.el].c + '">' +
        '<div class="cap-art">' + avatar(c.id, 'xl') + elemIcon(p.el) + '</div>' +
        '<div class="cap-info"><small>' + c.titulo + '</small><b>' + p.n + '</b>' +
        '<p><strong>' + c.pas + '.</strong> ' + c.pasTxt + '</p></div>' +
        '<div class="cap-card">' + cardHTML(c.card, { cls: 'mini' }) + '</div>' +
      '</button>';
    }).join('') + '</div>' +
    '<div class="bottom-cta"><button class="btn primary big" data-a="start">Empezar</button></div>' +
  '</div>';
}

/* ---------- HUD de carrera ---------- */
function hud() {
  var r = G.run;
  var pct = Math.round(r.moral / r.moralMax * 100);
  return '<header class="hud">' +
    '<div class="hud-moral" title="Moral"><i>' + ICON.heart + '</i><div class="bar"><span style="width:' + pct + '%"></span></div><b>' + r.moral + '/' + r.moralMax + '</b></div>' +
    '<div class="hud-coins"><i>' + ICON.coin + '</i><b>' + r.coins + '</b></div>' +
    '<div class="hud-btns">' +
      '<button class="icon-btn" data-a="deck" title="Mazo">' + ICON.deck + '<small>' + r.deck.length + '</small></button>' +
      '<button class="icon-btn" data-a="team" title="Equipo">' + ICON.team + '<small>' + r.team.length + '</small></button>' +
      '<button class="icon-btn" data-a="opts" title="Opciones">' + ICON.gear + '</button>' +
    '</div>' +
  '</header>';
}

/* ---------- mapa ---------- */
function hashN(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
var ROW_H = 96;
function nodePos(n) {
  if (n.k === 'boss') return { x: 50, y: 70 };
  var j = hashN(n.k + 'x'), jy = hashN(n.k + 'y');
  return { x: 13 + n.c * (74 / (MAP_COLS - 1)) + ((j % 7) - 3) * 1.2, y: 70 + (MAP_ROWS - n.r) * ROW_H + ((jy % 5) - 2) * 5 };
}
function viewMap() {
  var r = G.run, m = r.map, A = ACTS[r.act];
  var H = 70 + MAP_ROWS * ROW_H + 70;
  var next = mapNextKeys();
  var lines = m.edges.map(function (e) {
    var p = e.split('>'), a = nodePos(m.nodes[p[0]]), b = nodePos(m.nodes[p[1]]);
    var walked = m.done.indexOf(p[0]) >= 0 && m.done.indexOf(p[1]) >= 0;
    var open = p[0] === r.pos && next.indexOf(p[1]) >= 0;
    return '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" class="' + (walked ? 'walked' : open ? 'open' : '') + '"/>';
  }).join('');
  var nodes = Object.keys(m.nodes).map(function (k) {
    var n = m.nodes[k], p = nodePos(n), info = NODE_INFO[n.type];
    var st = m.done.indexOf(k) >= 0 ? ' done' : next.indexOf(k) >= 0 ? ' next' : '';
    if (k === r.pos) st += ' here';
    if (n.type === 'jefe') {
      var T = TEAMS[A.boss];
      return '<button class="node boss' + st + '" data-a="node" data-k="' + k + '" style="left:' + p.x + '%;top:' + p.y + 'px">' + crestImg(T.esc) + '<span>' + T.n + '</span></button>';
    }
    return '<button class="node t-' + n.type + st + '" data-a="node" data-k="' + k + '" style="left:' + p.x + '%;top:' + p.y + 'px;--nc:' + info.c + '" aria-label="' + info.n + '"><i>' + info.icon + '</i></button>';
  }).join('');
  return '<div class="screen mapscr">' + hud() +
    '<div class="act-title"><small>Acto ' + (r.act + 1) + ' de ' + ACTS.length + '</small><b>' + A.n + '</b></div>' +
    '<div class="map-scroll" id="mapScroll"><div class="map" style="height:' + H + 'px">' +
      '<svg class="map-lines" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none">' + lines + '</svg>' + nodes +
    '</div></div>' +
    '<footer class="legend">' + ['partido', 'elite', 'evento', 'tienda', 'descanso'].map(function (t) {
      return '<span style="--nc:' + NODE_INFO[t].c + '"><i>' + NODE_INFO[t].icon + '</i>' + NODE_INFO[t].n + '</span>';
    }).join('') + '</footer>' +
  '</div>';
}
function scrollMap() {
  var el = document.getElementById('mapScroll'); if (!el) return;
  var next = mapNextKeys(); var m = G.run.map;
  var ys = next.map(function (k) { return nodePos(m.nodes[k]).y; });
  var y = ys.length ? Math.max.apply(null, ys) : el.scrollHeight;
  el.scrollTop = Math.max(0, y - el.clientHeight * 0.6);
}

/* ---------- partido ---------- */
function intentHTML(B) {
  var I = B.intent || {}, who = I.who ? avatar(I.who, 'sm') : '';
  var parts = [], sub = [], cls = 'it-def', title = I.tech || '';
  if (I.pow) {
    var fin = rivalShotValue(I.pow, I.el), m = elemMult(I.el, PLAYERS[MY_KEEPER].el);
    parts.push('<b class="big">' + ICON.boot + 'Tiro ' + fin + ((I.hits || 1) > 1 ? ' x' + I.hits : '') + elemIcon(I.el) + (m > 1 ? '<em class="hi">x1.5</em>' : m < 1 ? '<em class="lo">x0.75</em>' : '') + '</b>');
    sub.push('Frénalo con Parada');
    cls = 'it-shot'; title = title || 'Tiro';
  }
  if (I.muro) {
    parts.push('<b class="big">' + ICON.shield + 'Muro ' + I.muro + '</b>');
    sub.push('Frena tus tiros este turno');
    if (!I.pow) title = title || 'Defienden';
  }
  if (I.k === 'avance') {
    parts.push('<b class="big">' + ICON.up + 'Avance +' + I.val + '</b>');
    sub.push('Su próximo tiro suma ' + I.val);
    cls = 'it-adv'; title = title || 'Se preparan';
  }
  if (I.k === 'presion') {
    parts.push('<b class="big">' + ICON.team + 'Presión</b>');
    if (I.tpDown) sub.push('Tu próximo turno tendrá ' + I.tpDown + ' TP menos');
    if (I.cans) sub.push('Mete ' + I.cans + ' Cansancio en tu mazo');
    cls = 'it-adv'; title = title || 'Te agobian';
  }
  return '<div class="it ' + cls + '">' + who + '<div><small>' + esc(title) + '</small><div class="bigs">' + parts.join('') + '</div><span>' + sub.join('. ') + '</span></div></div>';
}

function statusChips(B) {
  var c = [];
  if (B.oca) c.push('<span class="chip blue" title="Se suma a tu próximo tiro">Próximo tiro +' + B.oca + '</span>');
  if (B.dbl) c.push('<span class="chip blue" title="Tu próximo tiro se repite">Pared</span>');
  if (B.conc) c.push('<span class="chip orange" title="Suma a todos tus tiros">Concentración ' + B.conc + '</span>');
  if (B.rvul) c.push('<span class="chip gold" title="Tus tiros hacen x1.5">Desorientado ' + B.rvul + '</span>');
  if (B.parT) c.push('<span class="chip yellow" title="Parada al empezar cada turno">Neumáticos ' + B.parT + '</span>');
  if (B.tpNext) c.push('<span class="chip ' + (B.tpNext > 0 ? 'blue' : 'red') + '">Próximo turno ' + (B.tpNext > 0 ? '+' : '') + B.tpNext + ' TP</span>');
  if (B.rfat) c.push('<span class="chip green" title="Resta al próximo tiro rival">Rival cansado ' + B.rfat + '</span>');
  if (B.rimp) c.push('<span class="chip red" title="Se suma a su próximo tiro">Impulso rival ' + B.rimp + '</span>');
  if (B.rconc) c.push('<span class="chip red" title="Se suma a todos sus tiros">Néctar ' + B.rconc + '</span>');
  return c.join('');
}

function viewBattle() {
  var r = G.run, B = r.battle; if (!B) return '';
  var T = B.T;
  var minute = B.extra ? '90+' : minuteOf(B.turn) + '\'';
  var half = B.extra ? 'Gol de oro' : B.turn <= 4 ? '1ª parte' : '2ª parte';
  var rPct = Math.max(0, Math.round(B.rres / B.rmax * 100)), kPct = Math.max(0, Math.round(B.kres / B.kmax * 100));
  var moralPct = Math.round(r.moral / r.moralMax * 100);
  var orbs = ''; for (var i = 0; i < Math.max(3, B.tp); i++) orbs += '<i class="' + (i < B.tp ? 'on' : '') + '"></i>';
  var kind = B.kind === 'boss' ? '<span class="tagk boss">Jefe</span>' : B.kind === 'elite' ? '<span class="tagk elite">Élite</span>' : '';
  var inc = incoming(), through = Math.max(0, inc - B.par);
  var risk = inc ? (through ? '<span class="risk bad">Te entran ' + through + (through >= B.kres ? ' · Gol' : '') + '</span>' : '<span class="risk ok">Tiro parado</span>') : '';
  var chips = statusChips(B);
  return '<div class="battle' + (through > 0 ? ' danger' : '') + '">' +
    '<header class="sb">' +
      '<div class="sb-moral" title="Moral"><i>' + ICON.heart + '</i><div class="bar"><span style="width:' + moralPct + '%"></span></div><b>' + r.moral + '</b></div>' +
      '<div class="sb-score">' + crestImg('raimon.webp') + '<b class="g">' + B.gYo + '</b><div class="sb-min"><b>' + minute + '</b><small>' + half + '</small></div><b class="g">' + B.gRv + '</b>' + crestImg(T.esc) + '</div>' +
      '<button class="icon-btn" data-a="opts" title="Opciones">' + ICON.gear + '</button>' +
    '</header>' +
    '<section class="rv">' +
      '<div class="keeper rv-k" id="rvK">' + avatar(T.gk, 'md') +
        '<div class="k-info"><small>' + esc(T.n) + ' ' + kind + '</small><b>' + esc(PLAYERS[T.gk].n) + elemIcon(PLAYERS[T.gk].el) + '</b>' +
        '<div class="kbar"><span style="width:' + rPct + '%"></span><em>' + Math.max(0, B.rres) + '/' + B.rmax + '</em></div>' +
        (B.rmuro ? '<span class="shield-chip">' + ICON.shield + B.rmuro + '</span>' : '') + '</div>' +
        '<button class="rasgo" data-a="rasgo" title="Rasgo del rival">' + ICON.q + '</button>' +
      '</div>' +
      '<div class="intent">' + intentHTML(B) + '</div>' +
    '</section>' +
    '<section class="pitch">' +
      '<div class="field"><div class="half"></div>' + fieldPlayers(B) + '<div class="ballpos">' + ICON.ball + '</div></div>' +
      (chips ? '<div class="chips">' + chips + '</div>' : '') +
    '</section>' +
    '<section class="me">' +
      '<div class="keeper me-k" id="meK">' + avatar(MY_KEEPER, 'md') +
        '<div class="k-info"><small>Raimon ' + risk + '</small><b>' + PLAYERS[MY_KEEPER].n + elemIcon(PLAYERS[MY_KEEPER].el) + '</b>' +
        '<div class="kbar me"><span style="width:' + kPct + '%"></span><em>' + B.kres + '/' + B.kmax + '</em></div>' +
        (B.par ? '<span class="shield-chip me">' + ICON.shield + B.par + '</span>' : '') + '</div>' +
      '</div>' +
    '</section>' +
    '<section class="ctrl">' +
      '<div class="tp" title="Puntos de técnica"><div class="orbs">' + orbs + '</div><b>' + B.tp + '</b><small>TP</small></div>' +
      '<button class="pile" data-a="pile" data-p="draw" title="Mazo">' + ICON.deck + '<b>' + B.draw.length + '</b></button>' +
      '<button class="pile" data-a="pile" data-p="disc" title="Descartes">' + ICON.deck + '<b>' + B.disc.length + '</b></button>' +
      '<button class="btn primary endt" data-a="end">Fin de turno</button>' +
    '</section>' +
    '<section class="hand" id="hand">' + B.hand.map(function (c, i) {
      var why = playReason(c);
      return cardHTML(c, { live: true, cls: 'in-hand' + (why ? ' dis' : '') + (G.ui.sel === c.u ? ' sel' : '') + (c.fresh ? ' drawn' : ''), style: ';--i:' + i });
    }).join('') + '</section>' +
    previewHTML(B) +
  '</div>';
}

var POS_X = { PR: 6, DF: 17, MC: 29, DL: 41 };
function fieldPlayers(B) {
  var byPos = {};
  G.run.team.forEach(function (pid) { var p = PLAYERS[pid].pos; (byPos[p] = byPos[p] || []).push(pid); });
  var h = '';
  Object.keys(byPos).forEach(function (pos) {
    var arr = byPos[pos];
    arr.forEach(function (pid, i) {
      var y = (i + 1) / (arr.length + 1) * 100;
      h += '<span class="fp" style="left:' + POS_X[pos] + '%;top:' + y + '%">' + avatar(pid, 'xs') + '</span>';
    });
  });
  var T = B.T;
  h += '<span class="fp rv" style="left:94%;top:50%">' + avatar(T.gk, 'xs') + '</span>';
  h += '<span class="fp rv" style="left:64%;top:58%">' + avatar(T.st, 'xs') + '</span>';
  return h;
}

function previewHTML(B) {
  if (FINE || !G.ui.sel) return '';
  var c = null; B.hand.forEach(function (x) { if (x.u === G.ui.sel) c = x; });
  if (!c) return '';
  var why = playReason(c);
  return '<div class="preview" data-a="unsel"><div class="pv-box" data-stop="1">' + cardHTML(c, { live: true, cls: 'big' }) +
    '<div class="pv-btns">' +
      (why ? '<p class="why">' + why + '</p>' : '<button class="btn primary" data-a="play" data-u="' + c.u + '">Jugar</button>') +
    '</div></div></div>';
}

function layoutHand() {
  var h = document.getElementById('hand'); if (!h) return;
  var cards = h.querySelectorAll('.card'); var n = cards.length; if (!n) return;
  var W = h.clientWidth - 8, cw = cards[0].offsetWidth;
  var gap = 6, total = n * cw + (n - 1) * gap;
  var ov = total > W ? (total - W) / (n - 1) + gap : 0;
  for (var i = 0; i < n; i++) {
    var off = i - (n - 1) / 2;
    cards[i].style.marginLeft = i === 0 ? '0' : (ov ? (-ov + gap) + 'px' : gap + 'px');
    cards[i].style.setProperty('--rot', (off * (n > 6 ? 2 : 3)) + 'deg');
    cards[i].style.setProperty('--ty', (Math.abs(off) * Math.abs(off) * 1.6) + 'px');
    cards[i].style.zIndex = G.ui.sel === cards[i].dataset.u ? 50 : i + 1;
  }
  var B = B_(); if (B) B.hand.forEach(function (c) { delete c.fresh; });
}
window.addEventListener('resize', function () { if (G.screen === 'battle') layoutHand(); });

/* ---------- recompensa ---------- */
function viewReward() {
  var r = G.run, rw = r.reward; if (!rw) return '';
  var T = TEAMS[rw.team];
  if (rw.lost) {
    return '<div class="screen reward"><header class="win-head lost">' + crestImg('raimon.webp') + '<div><small>Derrota</small><b>' + rw.score + '</b><span>contra ' + esc(T.n) + '</span></div>' + crestImg(T.esc) + '</header>' +
      '<p class="center gain red"><i>' + ICON.heart + '</i>-' + rw.pen + ' Moral</p>' +
      '<p class="center dim">Sin premio esta vez. El torneo sigue mientras te quede Moral.</p>' +
      '<div class="center"><button class="btn primary" data-a="skipcards">Seguir</button></div></div>';
  }
  var h = '<div class="screen reward"><header class="win-head">' + crestImg('raimon.webp') + '<div><small>Victoria</small><b>' + rw.score + '</b><span>contra ' + esc(T.n) + '</span></div>' + crestImg(T.esc) + '</header>' +
    '<p class="center gain"><i>' + ICON.coin + '</i>+' + rw.coins + ' monedas' + (rw.boss ? ' · +10 Moral' : '') + ' · Portero +1 aguante</p>';
  if (rw.sign && rw.sign.length) {
    h += '<h3 class="center">' + (rw.boss ? 'Ficha a una estrella rival' : 'Fichaje') + '</h3><div class="signs">' + rw.sign.map(signHTML).join('') + '</div>' +
      '<div class="center"><button class="btn ghost" data-a="skipsign">Saltar</button></div>';
  } else if (rw.cards) {
    h += '<h3 class="center">Elige una carta</h3><div class="picks">' + rw.cards.map(function (id) {
      return '<button class="pick" data-a="take" data-id="' + id + '">' + cardHTML(id, { tilt: true }) + '</button>';
    }).join('') + '</div><div class="center"><button class="btn ghost" data-a="skipcards">Saltar</button></div>';
  }
  return h + '</div>';
}
function signHTML(pid, extraBtn) {
  var p = PLAYERS[pid], s = SIGNINGS[pid];
  return '<div class="sign" style="--ec:' + ELEM_INFO[p.el].c + '">' +
    '<div class="sign-top">' + avatar(pid, 'lg') + '<div><small>' + p.pos + ' · ' + p.el + '</small><b>' + p.n + '</b><p><strong>' + s.pas + '.</strong> ' + s.txt + '</p></div></div>' +
    '<div class="sign-card">' + cardHTML(s.card, { cls: 'mini' }) + '</div>' +
    (extraBtn || '<button class="btn primary" data-a="sign" data-p="' + pid + '">Fichar</button>') +
  '</div>';
}

/* ---------- descanso ---------- */
function viewRest() {
  var r = G.run, heal = Math.round(r.moralMax * 0.3);
  return '<div class="screen rest">' + hud() +
    '<div class="rest-box"><div class="rest-art">' + avatar('r01', 'xl') + '</div><h2>Vestuario</h2><p class="dim">Un respiro antes del siguiente partido.</p>' +
    '<div class="rest-opts">' +
      '<button class="opt" data-a="restheal"><i>' + ICON.rest + '</i><b>Descansar</b><span>Recuperas ' + heal + ' de Moral</span></button>' +
      '<button class="opt" data-a="resttrain"><i>' + ICON.up + '</i><b>Entrenar</b><span>Mejora una carta</span></button>' +
    '</div></div></div>';
}

/* ---------- tienda ---------- */
function viewShop() {
  var r = G.run, s = r.shop;
  var h = '<div class="screen shop">' + hud() + '<h2 class="center">Tienda del barrio</h2><div class="shop-grid">' +
    s.cards.map(function (x, i) {
      return '<div class="shop-item' + (x.sold ? ' sold' : '') + '">' + cardHTML(x.id, { tilt: !x.sold }) +
        (x.sold ? '<span class="price">Vendida</span>' : '<button class="price' + (r.coins < x.price ? ' poor' : '') + '" data-a="buy" data-i="' + i + '"><i>' + ICON.coin + '</i>' + x.price + '</button>') + '</div>';
    }).join('') + '</div>';
  if (s.sign && !s.signSold) {
    h += '<h3 class="center">Jugador libre</h3><div class="signs one">' + signHTML(s.sign,
      '<button class="btn primary' + (r.coins < s.signPrice ? ' poor' : '') + '" data-a="buysign"><i>' + ICON.coin + '</i>' + s.signPrice + '</button>') + '</div>';
  }
  h += '<div class="shop-services">' +
    (s.removed ? '<span class="dim">Ya has quitado una carta</span>' :
      '<button class="btn' + (r.coins < r.removeCost ? ' poor' : '') + '" data-a="shopremove">Quitar carta <i>' + ICON.coin + '</i>' + r.removeCost + '</button>') +
    '<button class="btn primary" data-a="leave">Salir</button></div>';
  return h + '</div>';
}

/* ---------- evento ---------- */
function viewEvent() {
  var r = G.run, e = EVENTS.filter(function (x) { return x.id === r.event.id; })[0];
  return '<div class="screen event">' + hud() + '<div class="ev-box">' +
    (e.p ? '<div class="ev-art">' + avatar(e.p, 'xl') + '</div>' : '<div class="ev-art q">' + ICON.q + '</div>') +
    '<h2>' + esc(e.t) + '</h2><p>' + esc(e.d) + '</p>' +
    (r.event.result ? '<p class="ev-res">' + esc(r.event.result) + '</p><button class="btn primary" data-a="leave">Seguir</button>' :
      '<div class="ev-opts">' + e.o.map(function (o, i) { return '<button class="opt" data-a="evo" data-i="' + i + '"><b>' + o.l + '</b><span>' + o.h + '</span></button>'; }).join('') + '</div>') +
  '</div></div>';
}

/* ---------- final ---------- */
function viewEnd() {
  var e = G.ended || {};
  var mins = e.stats ? Math.round((Date.now() - e.stats.start) / 60000) : 0;
  return '<div class="screen end ' + (e.win ? 'won' : 'lost') + '"><div class="end-box">' +
    '<div class="end-art">' + avatar(e.cap || 'r01', 'xl') + '</div>' +
    '<h1>' + (e.win ? '¡Campeones!' : 'Eliminados') + '</h1>' +
    '<p class="dim">' + (e.win ? 'Has tumbado al Genesis. El Raimon es leyenda.' : (e.team ? 'Caíste ante ' + esc(TEAMS[e.team].n) + ' (' + e.score + ') en el acto ' + (e.act + 1) + '.' : 'Tu carrera ha terminado.')) + '</p>' +
    (e.stats ? '<div class="end-stats"><div><b>' + e.stats.wins + '</b><small>Victorias</small></div><div><b>' + e.stats.goals + '</b><small>Goles</small></div><div><b>' + e.stats.against + '</b><small>Encajados</small></div><div><b>' + mins + '</b><small>Minutos</small></div></div>' : '') +
    '<div class="cta"><button class="btn primary big" data-a="new">Otra carrera</button><button class="btn ghost" data-a="menu">Menú</button></div>' +
  '</div></div>';
}

/* ---------- galería ---------- */
function viewGallery() {
  var f = G.ui.gFilter;
  var ids = Object.keys(CARDS).filter(function (id) { return id !== 'cansancio'; });
  if (f !== 'todas') ids = ids.filter(function (id) { return CARDS[id].t === f; });
  var up = !!G.ui.gUp;
  return '<div class="screen gallery"><header class="top"><button class="btn ghost sm" data-a="menu">Volver</button><h2>Cartas</h2><button class="btn sm' + (up ? ' on' : '') + '" data-a="gup">' + (up ? 'Mejoradas' : 'Normales') + '</button></header>' +
    '<div class="filters">' + ['todas', 'tiro', 'defensa', 'tactica'].map(function (t) {
      return '<button class="fchip' + (f === t ? ' on' : '') + '" data-a="gf" data-f="' + t + '" style="--tc:' + (TYPE_INFO[t] ? TYPE_INFO[t].c : '#ffcf3a') + '">' + (TYPE_INFO[t] ? TYPE_INFO[t].n : 'Todas') + '</button>';
    }).join('') + '</div>' +
    '<div class="grid">' + ids.map(function (id) { return '<div class="g-item">' + cardHTML({ id: id, up: up, u: '' }, { tilt: true }) + '<small>' + RARITY_INFO[CARDS[id].r] + '</small></div>'; }).join('') + '</div>' +
    '<h3 class="center">Fichajes</h3><div class="signs">' + Object.keys(SIGNINGS).map(function (p) { return signHTML(p, ' '); }).join('') + '</div>' +
  '</div>';
}

/* ---------- modales ---------- */
function renderModal() {
  var m = G.modal;
  if (!m) { $modal.innerHTML = ''; $modal.className = ''; return; }
  var h = '';
  if (m.k === 'deck') h = modalDeck(m);
  else if (m.k === 'pile') h = modalPile(m);
  else if (m.k === 'team') h = modalTeam();
  else if (m.k === 'opts') h = modalOpts();
  else if (m.k === 'help') h = modalHelp();
  else if (m.k === 'notes') h = modalNotes();
  else if (m.k === 'sign') h = '<h2>Elige fichaje</h2><div class="signs">' + m.opts.map(function (p) { return signHTML(p); }).join('') + '</div>';
  else if (m.k === 'confirmUp') h = modalConfirmUp(m);
  else if (m.k === 'rasgo') h = modalRasgo();
  else if (m.k === 'abandon') h = '<h2>¿Abandonar la carrera?</h2><p class="dim">Perderás todo el progreso de esta carrera.</p><div class="row"><button class="btn danger" data-a="abandonok">Abandonar</button><button class="btn ghost" data-a="close">Seguir</button></div>';
  var closable = !(m.k === 'sign' || (m.k === 'deck' && m.mode !== 'view' && m.forced));
  $modal.className = 'on';
  $modal.innerHTML = '<div class="m-back" data-a="' + (closable ? 'close' : '') + '"></div><div class="m-box">' + (closable ? '<button class="m-x" data-a="close" aria-label="Cerrar">×</button>' : '') + h + '</div>';
}
function sortDeck(arr) {
  var order = { tiro: 0, defensa: 1, tactica: 2, estado: 3 };
  return arr.slice().sort(function (a, b) { return order[CARDS[a.id].t] - order[CARDS[b.id].t] || CARDS[a.id].n.localeCompare(CARDS[b.id].n); });
}
function modalDeck(m) {
  var deck = sortDeck(G.run.deck);
  if (m.mode === 'upgrade') deck = deck.filter(canUpgrade);
  var title = m.mode === 'upgrade' ? 'Elige una carta para mejorar' : m.mode === 'remove' ? 'Elige una carta para quitar' : 'Tu mazo (' + G.run.deck.length + ')';
  return '<h2>' + title + '</h2><div class="grid">' + deck.map(function (c) {
    return '<button class="g-item" data-a="' + (m.mode === 'view' ? '' : 'deckpick') + '" data-u="' + c.u + '">' + cardHTML(c) + '</button>';
  }).join('') + '</div>' + (m.mode !== 'view' && !m.forced ? '<div class="center"><button class="btn ghost" data-a="close">Cancelar</button></div>' : '');
}
function modalPile(m) {
  var B = B_(); var arr = m.p === 'draw' ? sortDeck(B.draw) : B.disc.slice().reverse();
  return '<h2>' + (m.p === 'draw' ? 'Por robar (' + arr.length + ')' : 'Descartes (' + arr.length + ')') + '</h2>' +
    (m.p === 'draw' ? '<p class="dim small center">Ordenadas por tipo, no en el orden en que saldrán.</p>' : '') +
    '<div class="grid">' + arr.map(function (c) { return '<div class="g-item">' + cardHTML(c) + '</div>'; }).join('') + '</div>';
}
function modalTeam() {
  var r = G.run;
  return '<h2>Tu equipo</h2><div class="team-list">' + r.team.map(function (pid) {
    var p = PLAYERS[pid], cap = pid === r.cap ? CAPTAINS.filter(function (c) { return c.id === pid; })[0] : null, s = SIGNINGS[pid];
    var desc = cap ? '<strong>Capitán · ' + cap.pas + '.</strong> ' + cap.pasTxt : s ? '<strong>' + s.pas + '.</strong> ' + s.txt : 'Titular del Raimon.';
    return '<div class="tm" style="--ec:' + ELEM_INFO[p.el].c + '">' + avatar(pid, 'md') + '<div><b>' + p.n + ' <small>' + p.pos + '</small>' + elemIcon(p.el) + '</b><p>' + desc + '</p></div></div>';
  }).join('') + '</div>';
}
function modalOpts() {
  return '<h2>Opciones</h2><div class="opts">' +
    '<button class="toggle' + (G.opts.sound ? ' on' : '') + '" data-a="tsound"><span>Sonido</span><i></i></button>' +
    '<button class="toggle' + (G.opts.video ? ' on' : '') + '" data-a="tvideo"><span>Vídeos de supertécnicas</span><i></i></button>' +
    '<button class="btn ghost wide" data-a="help">Cómo se juega</button>' +
    (G.run ? '<button class="btn ghost wide" data-a="menu">Menú principal</button><button class="btn danger wide" data-a="abandon">Abandonar carrera</button>' : '') +
  '</div>';
}
function modalNotes() {
  return '<h2>Novedades</h2><div class="notes">' + APP_NOTES.map(function (n) { return '<div><b>' + n[0] + '</b><p>' + esc(n[1]) + '</p></div>'; }).join('') + '</div>';
}
function modalRasgo() {
  var B = B_(); if (!B) return '';
  var T = B.T;
  return '<h2>' + crestImg(T.esc, 'inline') + esc(T.n) + '</h2><p>' + esc(RASGOS[T.rasgo] || '') + '</p>' +
    '<p class="dim small">Portero: ' + PLAYERS[T.gk].n + ' (' + PLAYERS[T.gk].el + '). Estrella: ' + PLAYERS[T.st].n + ' (' + PLAYERS[T.st].el + '). Cada gol que te marquen te quita ' + T.golpe + ' de Moral.</p>';
}
function modalConfirmUp(m) {
  var c = G.run.deck.filter(function (x) { return x.u === m.u; })[0]; if (!c) return '';
  var u = { id: c.id, up: true, u: '' };
  return '<h2>Mejorar carta</h2><div class="cmp">' + cardHTML(c) + '<i class="arrow">' + ICON.up + '</i>' + cardHTML(u, { cls: 'glow' }) + '</div>' +
    '<div class="row"><button class="btn primary" data-a="upok" data-u="' + c.u + '">Mejorar</button><button class="btn ghost" data-a="backdeck">Otra</button></div>';
}
function modalHelp() {
  return '<h2>Cómo se juega</h2><div class="help">' +
    helpRow(ICON.ball, 'El partido', 'Dura 8 turnos, los 90 minutos. Gana quien lleve más goles al final. Si hay empate, gol de oro: el primero que marque gana.') +
    helpRow(ICON.bolt, 'Tu turno', 'Tienes 3 TP y robas 5 cartas. Cada carta cuesta TP. Al pulsar Fin de turno, el rival hace lo que anuncia arriba.') +
    helpRow(ICON.boot, 'Tirar', 'Cada tiro resta aguante al portero rival. Si llega a 0, es gol y vuelve a empezar lleno. Si el rival levanta Muro, tus tiros chocan primero con él.') +
    helpRow(ICON.hand, 'Parar', 'La Parada frena el tiro que anuncia el rival antes de tocar el aguante de tu portero. Se pierde al empezar tu siguiente turno. Si tu portero llega a 0, te marcan.') +
    helpRow(ICON.shield, 'El rival', 'Siempre ves su intención: Tiro, Muro, Avance (su próximo tiro suma más) o Presión (te quita TP o te mete Cansancio).') +
    helpRow(ICON.rest, 'Elementos', 'Fuego gana a Bosque, Bosque a Viento, Viento a Montaña y Montaña a Fuego. Con ventaja el tiro vale x1.5 y con desventaja x0.75.') +
    helpRow(ICON.team, 'Crecer', 'Los rivales se hacen más fuertes en cada casilla del mapa. Tú creces con cartas nuevas, mejoras, fichajes y +1 de aguante para tu portero por cada victoria.') +
    helpRow(ICON.up, 'Efectos', 'Las cartas que ganas traen efectos: Concentración (todos tus tiros suman más), Desorientado (tus tiros x1.5), Próximo tiro, Rival cansado y más.') +
    helpRow(ICON.heart, 'Moral', 'Es tu vida en toda la carrera. Cada gol encajado te quita Moral, y perder un partido te quita 8, o 10 contra una élite. Si llega a 0 o pierdes contra un jefe, quedas eliminado.') +
  '</div>';
}
function helpRow(ic, t, d) { return '<div class="hrow"><i>' + ic + '</i><div><b>' + t + '</b><p>' + d + '</p></div></div>'; }

/* ---------- eventos de entrada ---------- */
document.addEventListener('click', function (ev) {
  var t = ev.target.closest('[data-a]');
  if (G.ui.suppressClick) { G.ui.suppressClick = false; return; }
  // carta de la mano
  var hc = ev.target.closest('.hand .card');
  if (hc && !t) { onHandCard(hc.dataset.u); return; }
  if (!t) return;
  var a = t.dataset.a;
  if (!a) return;
  if (a === 'unsel' && ev.target.closest('[data-stop]')) return;
  act(a, t.dataset, ev);
});

function onHandCard(uid) {
  var B = B_(); if (!B || G.busy) return;
  if (FINE || G.ui.sel === uid) { playCard(uid); return; }
  G.ui.sel = uid; sfx('tap'); render();
}

function act(a, ds) {
  var r = G.run;
  switch (a) {
    case 'new': G.ui.cap = 0; G.screen = 'captain'; G.modal = null; render(); break;
    case 'continue': continueRun(); break;
    case 'menu': G.modal = null; if (G.run) saveRun(); G.run = null; G.screen = 'menu'; render(); break;
    case 'cap': G.ui.cap = +ds.i; sfx('tap'); render(); break;
    case 'start': newRun(G.ui.cap || 0); break;
    case 'help': G.modal = { k: 'help' }; renderModal(); break;
    case 'notes': G.modal = { k: 'notes' }; renderModal(); break;
    case 'opts': G.modal = { k: 'opts' }; renderModal(); break;
    case 'gallery': G.ui.gFilter = 'todas'; G.screen = 'gallery'; render(); break;
    case 'gf': G.ui.gFilter = ds.f; render(); break;
    case 'gup': G.ui.gUp = !G.ui.gUp; render(); break;
    case 'close': G.modal = null; renderModal(); break;
    case 'tsound': G.opts.sound = !G.opts.sound; saveOpts(); renderModal(); sfx('tap'); break;
    case 'tvideo': G.opts.video = !G.opts.video; saveOpts(); renderModal(); break;
    case 'abandon': G.modal = { k: 'abandon' }; renderModal(); break;
    case 'abandonok': G.modal = null; forget(SAVE_KEY); G.run = null; G.screen = 'menu'; render(); break;
    case 'deck': G.modal = { k: 'deck', mode: 'view' }; renderModal(); break;
    case 'team': G.modal = { k: 'team' }; renderModal(); break;
    case 'node': enterNode(ds.k); break;
    // partido
    case 'end': endTurn(); break;
    case 'play': playCard(ds.u); break;
    case 'unsel': G.ui.sel = null; render(); break;
    case 'pile': G.modal = { k: 'pile', p: ds.p }; renderModal(); break;
    case 'rasgo': G.modal = { k: 'rasgo' }; renderModal(); break;
    // recompensas
    case 'take': takeCard(ds.id); break;
    case 'skipcards': skipCards(); break;
    case 'sign':
      sign(ds.p);
      if (G.modal && G.modal.k === 'sign') { G.modal = null; saveRun(); render(); }
      break;
    case 'skipsign': skipSign(); break;
    // descanso, tienda y evento
    case 'restheal': restHeal(); break;
    case 'resttrain': G.modal = { k: 'deck', mode: 'upgrade', from: 'rest' }; renderModal(); break;
    case 'deckpick':
      if (G.modal.mode === 'upgrade') { G.modal = { k: 'confirmUp', u: ds.u, from: G.modal.from }; renderModal(); }
      else if (G.modal.mode === 'remove') {
        removeCard(ds.u); sfx('tap');
        if (G.modal.from === 'shop') { r.coins -= r.removeCost; r.removeCost += 25; r.shop.removed = true; }
        G.modal = null; saveRun(); render();
      }
      break;
    case 'upok':
      upgradeCard(ds.u);
      var from = G.modal.from; G.modal = null;
      if (from === 'rest') goScreen('map'); else { saveRun(); render(); }
      break;
    case 'backdeck': G.modal = { k: 'deck', mode: 'upgrade', from: G.modal.from }; renderModal(); break;
    case 'buy': buyCard(+ds.i); break;
    case 'buysign': buySign(); break;
    case 'shopremove': if (r.coins >= r.removeCost && !r.shop.removed) { G.modal = { k: 'deck', mode: 'remove', from: 'shop' }; renderModal(); } break;
    case 'leave': r.shop = null; r.event = null; goScreen('map'); break;
    case 'evo': eventChoice(+ds.i); break;
  }
}

/* Arrastrar una carta hacia arriba para jugarla (móvil y escritorio) */
var drag = null;
document.addEventListener('pointerdown', function (e) {
  var c = e.target.closest('.hand .card'); if (!c || G.busy) return;
  drag = { el: c, u: c.dataset.u, x: e.clientX, y: e.clientY, moved: false };
});
document.addEventListener('pointermove', function (e) {
  if (drag) {
    var dy = e.clientY - drag.y, dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { drag.moved = true; drag.el.classList.add('dragging'); }
    if (drag.moved) { drag.el.style.setProperty('--dy', Math.min(0, dy) + 'px'); drag.el.style.setProperty('--dx', dx + 'px'); }
  }
  tiltMove(e);
});
function endDrag(e) {
  if (!drag) return;
  var d = drag; drag = null;
  if (!d.moved) return;
  d.el.classList.remove('dragging');
  d.el.style.removeProperty('--dy'); d.el.style.removeProperty('--dx');
  G.ui.suppressClick = true;
  setTimeout(function () { G.ui.suppressClick = false; }, 50);
  if (e.clientY - d.y < -70) playCard(d.u);
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', function () { if (drag) { drag.el.classList.remove('dragging'); drag = null; } });

/* Inclinación 3D y brillo holográfico */
function tiltMove(e) {
  if (!FINE) return;
  var el = e.target.closest && e.target.closest('.tilt');
  document.querySelectorAll('.tilt.tilting').forEach(function (x) { if (x !== el) { x.classList.remove('tilting'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); } });
  if (!el) return;
  var b = el.getBoundingClientRect();
  var px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
  el.classList.add('tilting');
  el.style.setProperty('--rx', ((0.5 - py) * 16).toFixed(1) + 'deg');
  el.style.setProperty('--ry', ((px - 0.5) * 18).toFixed(1) + 'deg');
  el.style.setProperty('--mx', (px * 100).toFixed(0) + '%');
  el.style.setProperty('--my', (py * 100).toFixed(0) + '%');
}

document.addEventListener('keydown', function (e) {
  if (G.screen !== 'battle' || G.modal) return;
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') endTurn();
  var n = parseInt(e.key, 10);
  if (n >= 1 && n <= 9) { var B = B_(); if (B && B.hand[n - 1]) playCard(B.hand[n - 1].u); }
});

/* ---------- efectos ---------- */
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
var fxRunning = false;
function playFx(cb) {
  if (fxRunning) { if (cb) setTimeout(function () { playFx(cb); }, 60); return; }
  fxRunning = true;
  (async function () {
    while (G.fx.length) {
      var f = G.fx.shift();
      try { await runFx(f); } catch (e) { console.error(e); }
    }
    fxRunning = false;
    if (cb) cb();
  })();
}

function fxLayer(html, cls) {
  var d = document.createElement('div');
  d.className = 'fxl ' + (cls || '');
  d.innerHTML = html;
  $fx.appendChild(d);
  return d;
}

async function runFx(f) {
  switch (f.k) {
    case 'banner': {
      var d = fxLayer('<div class="banner ' + (f.c || '') + '"><b>' + esc(f.t) + '</b>' + (f.s ? '<span>' + esc(f.s) + '</span>' : '') + '</div>');
      sfx('whoosh'); await sleep(1500); d.remove(); break;
    }
    case 'toast': {
      var t = fxLayer('<div class="toast">' + esc(f.t) + '</div>'); await sleep(1100); t.remove(); break;
    }
    case 'tech': case 'rtech': await techFx(f, f.k === 'rtech'); break;
    case 'steal': {
      sfx('steal');
      var s = fxLayer('<div class="burst blue"><b>¡Robo!</b></div>'); await sleep(800); s.remove(); break;
    }
    case 'lost': {
      sfx('lost');
      var l = fxLayer('<div class="burst red"><b>Te roban el balón</b></div>'); await sleep(850); l.remove(); break;
    }
    case 'shot': {
      sfx('kick');
      await ballFly(true);
      var k = document.getElementById('rvK');
      if (k) { k.classList.remove('hit'); void k.offsetWidth; k.classList.add('hit'); }
      if (f.absorbed) floatText('rv', 'Muro ' + f.absorbed, 'white');
      floatText('rv', '-' + f.dmg + (f.mult > 1 ? ' ¡Eficaz!' : f.mult < 1 ? ' Poco eficaz' : ''), f.mult > 1 ? 'gold' : 'red');
      await sleep(550); break;
    }
    case 'rshot': {
      sfx('kick');
      await ballFly(false);
      var mk = document.getElementById('meK');
      if (mk) { mk.classList.remove('hit'); void mk.offsetWidth; mk.classList.add('hit'); }
      if (f.blocked) floatText('me', 'Parada ' + f.blocked, 'blue');
      floatText('me', f.dmg ? '-' + f.dmg : '¡Parado!', f.dmg ? 'red' : 'blue');
      await sleep(600); break;
    }
    case 'goal': {
      sfx(f.me ? 'goal' : 'goalrv');
      var g = fxLayer('<div class="goal ' + (f.me ? 'me' : 'rv') + '">' + (f.who ? avatar(f.who, 'xl') : '') + '<b>' + (f.me ? '¡GOL!' : 'Gol rival') + '</b>' + (f.me ? '' : '<span>-' + f.golpe + ' Moral</span>') + '<div class="rays"></div></div>', 'solid');
      await sleep(1700); g.remove(); break;
    }
    case 'float': floatText(f.side, f.t, f.c); await sleep(450); break;
  }
}

function floatText(side, t, c) {
  var el = document.getElementById(side === 'rv' ? 'rvK' : 'meK'); if (!el) return;
  var b = el.getBoundingClientRect();
  var d = document.createElement('div');
  d.className = 'floater ' + (c || '');
  d.textContent = t;
  d.style.left = (b.left + b.width * 0.5) + 'px';
  d.style.top = (b.top + b.height * 0.3) + 'px';
  $fx.appendChild(d);
  setTimeout(function () { d.remove(); }, 1300);
}

async function ballFly(up) {
  var a = document.getElementById(up ? 'meK' : 'rvK'), b = document.getElementById(up ? 'rvK' : 'meK');
  if (!a || !b) return;
  var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  var d = document.createElement('div');
  d.className = 'flyball'; d.innerHTML = ICON.ball;
  d.style.left = (ra.left + 30) + 'px'; d.style.top = (ra.top + ra.height / 2) + 'px';
  $fx.appendChild(d);
  void d.offsetWidth;
  d.style.transform = 'translate(' + (rb.left + 30 - ra.left - 30) + 'px,' + (rb.top + rb.height / 2 - ra.top - ra.height / 2) + 'px) rotate(720deg)';
  await sleep(380);
  d.remove();
}

function techFx(f, rival) {
  return new Promise(function (resolve) {
    var p = PLAYERS[f.who];
    var el = f.el || (p && p.el);
    var col = el ? ELEM_INFO[el].c : '#ffcf3a';
    var vid = f.vid && G.opts.video ? '<video class="tech-vid" playsinline autoplay preload="auto" ' + (G.opts.sound ? '' : 'muted') + '><source src="' + videoUrl(f.vid) + '.webm" type="video/webm"><source src="' + videoUrl(f.vid) + '.mp4" type="video/mp4"></video>' : '';
    var d = fxLayer('<div class="tech ' + (rival ? 'rv' : 'me') + (vid ? ' has-vid' : '') + '" style="--ec:' + col + '">' +
      '<div class="tech-bg"></div><div class="tech-streaks"><i></i><i></i><i></i><i></i></div>' + vid +
      '<div class="tech-who">' + (p ? avatar(f.who, 'xl') : '') + '</div>' +
      '<div class="tech-name"><small>' + (rival ? 'Supertécnica rival' : 'Supertécnica') + '</small><b>' + esc(f.tech) + '</b>' + (p ? '<span>' + esc(p.n) + '</span>' : '') + '</div>' +
      (vid ? '<button class="tech-skip">Saltar</button>' : '') +
    '</div>', 'solid tapable');
    sfx('tech');
    var done = false;
    function finish() { if (done) return; done = true; d.classList.add('out'); setTimeout(function () { d.remove(); resolve(); }, 220); }
    if (vid) {
      var v = d.querySelector('video');
      var maxT = setTimeout(finish, 6500);
      var started = false;
      v.addEventListener('playing', function () { started = true; });
      v.addEventListener('ended', function () { clearTimeout(maxT); finish(); });
      v.addEventListener('error', function () { clearTimeout(maxT); setTimeout(finish, 900); }, true);
      setTimeout(function () { if (!started) { clearTimeout(maxT); finish(); } }, 2500);
      var pr = v.play && v.play(); if (pr && pr.catch) pr.catch(function () { v.muted = true; v.play().catch(function () {}); });
      d.addEventListener('click', function () { clearTimeout(maxT); finish(); });
    } else {
      setTimeout(finish, 1050);
      d.addEventListener('click', finish);
    }
  });
}

/* ---------- sonido ---------- */
var AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } return AC; }
function tone(f, d, type, vol, f2, delay) {
  var a = ac(); if (!a) return;
  var t = a.currentTime + (delay || 0);
  var o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, vol, freq, delay) {
  var a = ac(); if (!a) return;
  var t = a.currentTime + (delay || 0);
  var len = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, len, a.sampleRate), data = buf.getChannelData(0);
  for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var s = a.createBufferSource(); s.buffer = buf;
  var fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = freq || 1200;
  var g = a.createGain(); g.gain.value = vol || 0.15;
  s.connect(fl); fl.connect(g); g.connect(a.destination); s.start(t);
}
function sfx(k) {
  if (!G.opts.sound) return;
  var a = ac(); if (!a) return;
  if (a.state === 'suspended') a.resume();
  switch (k) {
    case 'tap': tone(700, 0.05, 'square', 0.03); break;
    case 'card': tone(520, 0.06, 'triangle', 0.06, 880); break;
    case 'no': tone(200, 0.12, 'square', 0.05, 140); break;
    case 'kick': noise(0.12, 0.35, 500); tone(140, 0.12, 'sine', 0.2, 60); break;
    case 'steal': tone(500, 0.08, 'square', 0.05, 900); tone(900, 0.1, 'square', 0.05, 1300, 0.08); break;
    case 'lost': tone(500, 0.18, 'sawtooth', 0.05, 220); break;
    case 'whistle': tone(2600, 0.14, 'sine', 0.06); tone(2600, 0.35, 'sine', 0.06, 2500, 0.18); break;
    case 'whoosh': noise(0.35, 0.12, 2400); break;
    case 'tech': noise(0.5, 0.18, 3000); tone(180, 0.5, 'sawtooth', 0.06, 900); break;
    case 'goal': [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.35, 'triangle', 0.08, null, i * 0.09); }); noise(1.2, 0.08, 1800, 0.1); break;
    case 'goalrv': [392, 330, 262].forEach(function (f, i) { tone(f, 0.3, 'sawtooth', 0.05, null, i * 0.12); }); break;
    case 'win': [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.07, null, i * 0.08); }); break;
    case 'lose': [330, 294, 262, 196].forEach(function (f, i) { tone(f, 0.4, 'triangle', 0.07, null, i * 0.16); }); break;
    case 'coin': tone(988, 0.08, 'square', 0.04); tone(1319, 0.15, 'square', 0.04, null, 0.07); break;
    case 'heal': tone(440, 0.3, 'sine', 0.07, 880); break;
    case 'up': [660, 880, 1100].forEach(function (f, i) { tone(f, 0.15, 'triangle', 0.06, null, i * 0.06); }); break;
  }
}

/* ---------- arranque ---------- */
loadOpts();
render();
