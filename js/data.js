'use strict';
/* Inazuma Cartas: datos del juego.
   Jugadores, sprites y escudos salen de la plantilla de Inazuma Run
   (roster-data.js) y se cargan desde inazumarun.es/assets. */

var APP_VERSION = '0.1.0';
var APP_NOTES = [
  ['0.1.0', 'Primera prueba: 3 capitanes, 3 actos con jefe, 30 cartas, fichajes, eventos, tienda y vídeos de supertécnicas.']
];

var ASSET = 'https://inazumarun.es/assets/';

// Rueda real de elementos: Fuego > Bosque > Viento > Montaña > Fuego
var ELEMS = ['Fuego', 'Bosque', 'Viento', 'Montaña'];
var ELEM_INFO = {
  'Fuego':   { c: '#ff5a3c', img: 'fuego.png' },
  'Bosque':  { c: '#3ddc84', img: 'bosque.png' },
  'Viento':  { c: '#43c6ff', img: 'viento.png' },
  'Montaña': { c: '#e0a24e', img: 'montaña.png' }
};
function elemBeats(a, b) { return ELEMS.indexOf(b) === (ELEMS.indexOf(a) + 1) % 4; }
function elemMult(atk, def) {
  if (!atk || !def) return 1;
  if (elemBeats(atk, def)) return 1.5;
  if (elemBeats(def, atk)) return 0.75;
  return 1;
}

var PLAYERS = {"r01":{"n":"Mark Evans","pos":"PR","el":"Montaña","s":"r01.png"},
"r02":{"n":"Axel Blaze","pos":"DL","el":"Fuego","s":"r02.png"},
"r03":{"n":"Nathan Swift","pos":"DF","el":"Viento","s":"r03.png"},
"r04":{"n":"Jude Sharp","pos":"MC","el":"Viento","s":"r04.png"},
"r05":{"n":"Kevin Dragonfly","pos":"DL","el":"Bosque","s":"r05.png"},
"r06":{"n":"Jack Wallside","pos":"DF","el":"Montaña","s":"r06.png"},
"r07":{"n":"Caleb Stonewall","pos":"MC","el":"Fuego","s":"r07.png"},
"r08":{"n":"Shawn Froste","pos":"DF","el":"Viento","s":"r08.png"},
"r09":{"n":"Austin Hobbs","pos":"DL","el":"Bosque","s":"r09.png"},
"r10":{"n":"Erik Eagle","pos":"MC","el":"Viento","s":"r10.png"},
"r12":{"n":"Todd Ironside","pos":"DF","el":"Montaña","s":"r12.png"},
"r13":{"n":"Joseph King","pos":"PR","el":"Fuego","s":"r13.png"},
"r14":{"n":"Xavier Foster","pos":"DL","el":"Fuego","s":"r14.png"},
"r15":{"n":"Jordan Greenway","pos":"MC","el":"Bosque","s":"r15.png"},
"r16":{"n":"Bobby Shearer","pos":"DF","el":"Bosque","s":"r16.png"},
"r46":{"n":"Steve Grim","pos":"MC","el":"Bosque","s":"r46.png"},
"r47":{"n":"Timmy Saunders","pos":"MC","el":"Montaña","s":"r47.png"},
"r48":{"n":"Maxwell Carson","pos":"MC","el":"Viento","s":"r48.png"},
"r20":{"n":"Byron Love","pos":"MC","el":"Bosque","s":"r20.png"},
"r22":{"n":"David Samford","pos":"DL","el":"Bosque","s":"r22.png"},
"r51":{"n":"Paul Siddon","pos":"PR","el":"Montaña","s":"r51.png"},
"r80":{"n":"Mask","pos":"PR","el":"Viento","s":"r80.png"},
"r82":{"n":"Talisman","pos":"DL","el":"Bosque","s":"r82.png"},
"r83":{"n":"Boar","pos":"PR","el":"Fuego","s":"r83.png"},
"r91":{"n":"Gorilla","pos":"DL","el":"Montaña","s":"r91.webp"},
"r381":{"n":"Sam Idol","pos":"PR","el":"Montaña","s":"r381.webp"},
"r385":{"n":"Mark Gambling","pos":"DL","el":"Viento","s":"r385.webp"},
"r164":{"n":"Albert Green","pos":"PR","el":"Fuego","s":"r164.webp"},
"r566":{"n":"Stuart Racoonfur","pos":"DL","el":"Bosque","s":"r566.webp"},
"r557":{"n":"Morgan Sanders","pos":"PR","el":"Bosque","s":"r557.webp"},
"r163":{"n":"Sail Bluesea","pos":"DL","el":"Viento","s":"r163.webp"},
"r151":{"n":"Feldt","pos":"PR","el":"Bosque","s":"r151.png"},
"r157":{"n":"Neil Turner","pos":"DL","el":"Fuego","s":"r157.png"},
"r543":{"n":"John Neville","pos":"PR","el":"Fuego","s":"r543.webp"},
"r238":{"n":"Bradford Ash","pos":"DL","el":"Montaña","s":"r238.webp"},
"r184":{"n":"Gordon Star","pos":"PR","el":"Bosque","s":"r184.webp"},
"r409":{"n":"Janus","pos":"MC","el":"Bosque","s":"r409.webp"},
"r182":{"n":"Ben North","pos":"PR","el":"Montaña","s":"r182.webp"},
"r17":{"n":"Bryce Withingale","pos":"DL","el":"Viento","s":"r17.png"},
"r179":{"n":"Grant Cook","pos":"PR","el":"Fuego","s":"r179.webp"},
"r19":{"n":"Claude Beacons","pos":"DL","el":"Fuego","s":"r19.png"},
"r54":{"n":"Dvalin","pos":"PR","el":"Viento","s":"r54.png"},
"r455":{"n":"Metron","pos":"DL","el":"Fuego","s":"r455.webp"},
"r110":{"n":"Nero","pos":"PR","el":"Bosque","s":"r110.png"},
"r150":{"n":"Xene","pos":"DL","el":"Fuego","s":"r150.png"}};

function spriteUrl(pid) { var p = PLAYERS[pid]; return p ? ASSET + 'sprites/' + p.s : ''; }
function crestUrl(file) { return ASSET + 'escudos/' + file; }
function elemUrl(el) { return ASSET + 'elementos/' + ELEM_INFO[el].img; }
function videoUrl(slug) { return ASSET + 'tecnicas/' + slug; }

var TYPE_INFO = {
  tiro:    { n: 'Tiro',    c: '#ff5a3c' },
  jugada:  { n: 'Jugada',  c: '#3fb2ff' },
  defensa: { n: 'Defensa', c: '#38d17a' },
  portero: { n: 'Portero', c: '#ffc93c' },
  tactica: { n: 'Táctica', c: '#b583ff' },
  estado:  { n: 'Estado',  c: '#7d8799' }
};
var RARITY_INFO = { B: 'Básica', C: 'Común', U: 'Poco común', R: 'Rara', S: 'Capitán', F: 'Fichaje' };

/* Cartas.
   t: tipo · c: coste en TP · r: rareza · p: jugador (sprite y elemento)
   v: valores base · u: valores mejorados (se mezclan sobre v)
   Claves de v: pow (tiro), k (lo que suma cada punto de Jugada, por defecto 2),
   jug, ctl, par, draw, tp, conc, heal, reb (rebote), robo, axel, caleb, j3,
   jc (por carta de Jugada del turno), cj (Jugada si roba), fat, tpn, parT.
   st: es supertécnica (anuncio grande) · vid: vídeo en assets/tecnicas */
var CARDS = {
  // Básicas
  chut:    { n: 'Chut', t: 'tiro', c: 1, r: 'B', p: 'r05', v: { pow: 6 }, u: { pow: 9 } },
  pase:    { n: 'Pase', t: 'jugada', c: 1, r: 'B', p: 'r48', v: { jug: 1, ctl: 3 }, u: { jug: 2, ctl: 4 } },
  regate:  { n: 'Regate', t: 'jugada', c: 1, r: 'B', p: 'r03', v: { jug: 2, ctl: 2 }, u: { jug: 3, ctl: 3 } },
  entrada: { n: 'Entrada', t: 'defensa', c: 1, r: 'B', p: 'r06', v: { ctl: 6 }, u: { ctl: 9 } },
  parada:  { n: 'Parada', t: 'portero', c: 1, r: 'B', p: 'r01', v: { par: 5 }, u: { par: 8 } },

  // De capitán
  tornado_fuego: { n: 'Tornado de Fuego', t: 'tiro', c: 2, r: 'S', p: 'r02', v: { pow: 11, k: 3 }, u: { pow: 15, k: 3 }, st: 1, vid: 'tornado-de-fuego' },
  espejismo:     { n: 'Espejismo de balón', t: 'jugada', c: 1, r: 'S', p: 'r04', v: { jug: 3, ctl: 4 }, u: { jug: 4, ctl: 5, draw: 1 }, st: 1, vid: 'espejismo-de-balon' },
  ventisca:      { n: 'Ventisca eterna', t: 'tiro', c: 2, r: 'S', p: 'r08', v: { pow: 10, robo: 8 }, u: { pow: 13, robo: 10 }, st: 1, vid: 'ventisca-eterna' },

  // Recompensas
  remate_dragon:  { n: 'Remate Dragón', t: 'tiro', c: 1, r: 'C', p: 'r05', v: { pow: 9 }, u: { pow: 12 }, st: 1, vid: 'remate-dragon' },
  tornado_dragon: { n: 'Tornado dragón', t: 'tiro', c: 2, r: 'U', p: 'r05', v: { pow: 12, axel: 8 }, u: { pow: 15, axel: 10 }, st: 1, vid: 'tornado-dragon' },
  rodante:        { n: 'Disparo Rodante', t: 'tiro', c: 1, r: 'C', p: 'r46', v: { pow: 6, reb: 1 }, u: { pow: 9, reb: 1 } },
  kung_fu:        { n: 'Cabezazo Kung Fu', t: 'tiro', c: 1, r: 'C', p: 'r47', v: { pow: 7, j3: 5 }, u: { pow: 9, j3: 7 }, st: 1, vid: 'cabezazo-kung-fu' },
  zigzag:         { n: 'Zig Zag Explosivo', t: 'jugada', c: 1, r: 'C', p: 'r46', v: { jug: 3, ctl: 1 }, u: { jug: 4, ctl: 2 } },
  pase_hueco:     { n: 'Pase al hueco', t: 'jugada', c: 0, r: 'C', p: 'r48', v: { jug: 1, draw: 1 }, u: { jug: 2, draw: 1 } },
  pared:          { n: 'Pared', t: 'jugada', c: 1, r: 'U', p: 'r48', v: { dbl: 1, agota: 1 }, u: { dbl: 1, agota: 1, c: 0 } },
  entrada_huracan:{ n: 'Entrada huracán', t: 'defensa', c: 1, r: 'C', p: 'r03', v: { ctl: 5, par: 3 }, u: { ctl: 7, par: 4 }, st: 1, vid: 'entrada-huracan' },
  defensa_huracan:{ n: 'Defensa Huracán', t: 'defensa', c: 2, r: 'U', p: 'r03', v: { ctl: 9, par: 7 }, u: { ctl: 12, par: 9 }, st: 1 },
  el_muro:        { n: 'El Muro', t: 'defensa', c: 2, r: 'U', p: 'r06', v: { par: 15 }, u: { par: 20 }, st: 1, vid: 'el-muro' },
  corte_giratorio:{ n: 'Corte Giratorio', t: 'defensa', c: 1, r: 'C', p: 'r12', v: { ctl: 7, cj: 2 }, u: { ctl: 9, cj: 3 }, st: 1, vid: 'corte-giratorio' },
  mano_magica:    { n: 'Mano Mágica', t: 'portero', c: 2, r: 'U', p: 'r01', v: { par: 12, heal: 3 }, u: { par: 15, heal: 4 }, st: 1 },
  mano_celestial: { n: 'Mano Celestial', t: 'portero', c: 3, r: 'R', p: 'r01', v: { par: 20, heal: 6, agota: 1 }, u: { par: 20, heal: 6, agota: 1, c: 2 }, st: 1, vid: 'mano-celestial' },
  a_por_todas:    { n: '¡A por todas!', t: 'tactica', c: 1, r: 'U', p: 'r01', v: { conc: 2, agota: 1 }, u: { conc: 3, agota: 1 } },
  toque:          { n: 'Toque rápido', t: 'tactica', c: 0, r: 'C', p: 'r48', v: { draw: 1, ctl: 2 }, u: { draw: 2, ctl: 2 } },
  coraje:         { n: 'Coraje', t: 'tactica', c: 0, r: 'U', p: 'r02', v: { tp: 2, agota: 1 }, u: { tp: 2, draw: 1, agota: 1 } },
  neumaticos:     { n: 'Entrenamiento con neumáticos', t: 'tactica', c: 1, r: 'R', p: 'r01', v: { parT: 3, perm: 1 }, u: { parT: 5, perm: 1 } },

  // De fichajes
  fenix:        { n: 'Fénix', t: 'tiro', c: 2, r: 'F', p: 'r10', v: { pow: 11, reb: 1 }, u: { pow: 14, reb: 1 }, st: 1, vid: 'el-fenix' },
  remate_tigre: { n: 'Remate del Tigre', t: 'tiro', c: 1, r: 'F', p: 'r09', v: { pow: 5, k: 3 }, u: { pow: 8, k: 3 }, st: 1 },
  barrido:      { n: 'Barrido Defensivo', t: 'defensa', c: 1, r: 'F', p: 'r16', v: { ctl: 5, fat: 3 }, u: { ctl: 7, fat: 4 }, st: 1, vid: 'barrido-defensivo' },
  carrera:      { n: 'Carrera relámpago', t: 'jugada', c: 1, r: 'F', p: 'r15', v: { jug: 2, tpn: 1 }, u: { jug: 3, tpn: 1 }, st: 1 },
  pinguino3:    { n: 'Pingüino emperador n.º 3', t: 'tiro', c: 2, r: 'F', p: 'r07', v: { pow: 13, jude: 8 }, u: { pow: 17, jude: 10 }, st: 1, vid: 'pinguino-emperador-n-3' },
  canon:        { n: 'Cañón de Meteoritos', t: 'tiro', c: 3, r: 'F', p: 'r14', v: { pow: 22 }, u: { pow: 28 }, st: 1, vid: 'canon-de-meteoritos' },
  escudo:       { n: 'Escudo de Fuerza', t: 'portero', c: 1, r: 'F', p: 'r13', v: { par: 8 }, u: { par: 11 }, st: 1 },
  pinguino2:    { n: 'Pingüino emperador n.º 2', t: 'tiro', c: 2, r: 'F', p: 'r22', v: { pow: 9, jc: 3 }, u: { pow: 12, jc: 4 }, st: 1 },
  sabiduria:    { n: 'Sabiduría Divina', t: 'tiro', c: 3, r: 'F', p: 'r20', v: { pow: 20, k: 3 }, u: { pow: 26, k: 3 }, st: 1, vid: 'sabiduria-divina' },
  muralla:      { n: 'Muralla Gigante', t: 'portero', c: 2, r: 'F', p: 'r51', v: { par: 16 }, u: { par: 21 }, st: 1, vid: 'muralla-gigante' },

  // Estado
  cansancio: { n: 'Cansancio', t: 'estado', c: -1, r: 'B', p: null, v: { unplay: 1 }, u: { unplay: 1 } }
};

var POOL = ['remate_dragon', 'tornado_dragon', 'rodante', 'kung_fu', 'zigzag', 'pase_hueco', 'pared',
  'entrada_huracan', 'defensa_huracan', 'el_muro', 'corte_giratorio', 'mano_magica', 'mano_celestial',
  'a_por_todas', 'toque', 'coraje', 'neumaticos'];

var STARTER = ['chut', 'chut', 'chut', 'pase', 'pase', 'regate', 'entrada', 'parada', 'parada', 'parada'];
var BASE_TEAM = ['r01', 'r06', 'r03', 'r48', 'r05'];

var CAPTAINS = [
  { id: 'r02', titulo: 'El goleador', card: 'tornado_fuego', pas: 'Goleador', pasTxt: 'Tu primer tiro de cada turno suma 3 de potencia.' },
  { id: 'r04', titulo: 'El estratega', card: 'espejismo', pas: 'Visión de juego', pasTxt: 'Cuando robas el balón ganas 2 de Jugada y robas 1 carta.' },
  { id: 'r08', titulo: 'El contraataque', card: 'ventisca', pas: 'Doble alma', pasTxt: 'Empiezas cada turno sin balón con 3 de Control.' }
];

/* Fichajes: el jugador entra en tu equipo, da una pasiva y mete su carta en el mazo. */
var SIGNINGS = {
  r10: { card: 'fenix', pas: 'Resurgir', txt: 'La primera vez que te marcan en un partido, tu siguiente turno empieza con 2 TP y 2 cartas más.' },
  r09: { card: 'remate_tigre', pas: 'Instinto', txt: 'Tus tiros con 4 o más de Jugada suman 4.' },
  r16: { card: 'barrido', pas: 'Marcaje', txt: 'La Posesión del rival baja 2: le robas el balón antes.' },
  r15: { card: 'carrera', pas: 'Pulmón', txt: 'Robas 2 cartas más en el primer turno de cada partido.' },
  r07: { card: 'pinguino3', pas: 'Provocador', txt: 'Cada vez que robas el balón, el próximo tiro rival pierde 3.' },
  r14: { card: 'canon', pas: 'Estrella fugaz', txt: 'Empiezas cada partido con 1 de Concentración y 1 TP más en el primer turno.' },
  r13: { card: 'escudo', pas: 'Guardameta', txt: 'Tu portero gana 6 de aguante máximo.' },
  r22: { card: 'pinguino2', pas: 'Táctica imperial', txt: 'La primera carta de Jugada de cada turno da 1 de Jugada más.' },
  r20: { card: 'sabiduria', pas: 'Néctar divino', txt: 'Empiezas cada partido con 2 de Concentración.' },
  r51: { card: 'muralla', pas: 'Muralla', txt: 'Tu portero gana 10 de aguante máximo.' }
};
var SIGN_POOL = ['r10', 'r09', 'r16', 'r15', 'r07', 'r14'];

/* Equipos rivales. Valores del acto 1; ver scaleTeam en game.js.
   shot: potencia de tiro · pos: Control que necesitas para robarles ·
   pres: Control que necesitas para que no te roben · muro: bloqueo de su portero */
var TEAMS = {
  occult:   { n: 'Occult', esc: 'occult.png', gk: 'r80', st: 'r82', tech: 'Tiro Fantasma', vid: 'tiro-fantasma', res: 15, shot: [7, 10], pos: [6, 8], pres: [5, 7], muro: [4, 6], rasgo: 'maldicion' },
  wild:     { n: 'Wild', esc: 'wild.webp', gk: 'r83', st: 'r91', tech: 'Remate Tarzán', res: 14, shot: [9, 11], pos: [5, 6], pres: [4, 6], muro: [3, 5], rasgo: 'salvaje' },
  otaku:    { n: 'Otaku', esc: 'otaku.png', gk: 'r381', st: 'r385', tech: 'Combo Perfecto', res: 13, shot: [6, 8], pos: [6, 8], pres: [6, 8], muro: [3, 5], rasgo: 'bolafalsa' },
  farm:     { n: 'Farm', esc: 'farm.png', gk: 'r164', st: 'r566', tech: 'Tiro cegador', res: 19, shot: [7, 9], pos: [6, 8], pres: [5, 7], muro: [5, 7], rasgo: 'aguante' },
  shuriken: { n: 'Shuriken', esc: 'shuriken.png', gk: 'r557', st: 'r163', tech: 'Bola de Fango', res: 20, shot: [9, 12], pos: [8, 10], pres: [6, 8], muro: [5, 7], rasgo: 'ninja' },
  brain:    { n: 'Brain', esc: 'brain.webp', gk: 'r151', st: 'r157', tech: 'Remate Misil', res: 16, shot: [8, 10], pos: [6, 8], pres: [5, 7], muro: [6, 9], rasgo: 'escaner' },
  kirkwood: { n: 'Kirkwood', esc: 'kirkwood.png', gk: 'r543', st: 'r238', tech: 'Tiro Balista', res: 16, shot: [8, 11], pos: [6, 8], pres: [6, 8], muro: [4, 6], rasgo: 'murdock' },
  geminis:  { n: 'Tormenta de Géminis', esc: 'tormenta-de-geminis.png', gk: 'r184', st: 'r409', tech: 'Astro remate', vid: 'astrorremate', res: 20, shot: [10, 12], pos: [8, 10], pres: [7, 9], muro: [5, 7], rasgo: 'alius' },
  polvo:    { n: 'Polvo de Diamante', esc: 'polvo-de-diamantes.png', gk: 'r182', st: 'r17', tech: 'Balón Iceberg', vid: 'balon-iceberg', res: 16, shot: [8, 10], pos: [7, 9], pres: [6, 8], muro: [5, 7], rasgo: 'hielo' },
  prominence:{ n: 'Prominence', esc: 'prominence.png', gk: 'r179', st: 'r19', tech: 'Llamarada Atómica', vid: 'llamarada-atomica', res: 14, shot: [10, 12], pos: [6, 8], pres: [5, 7], muro: [3, 5], rasgo: 'llamas' },
  epsilon:  { n: 'Épsilon', esc: 'epsilon.png', gk: 'r54', st: 'r455', tech: 'Remate de Gaia', res: 20, shot: [10, 12], pos: [8, 10], pres: [7, 9], muro: [6, 8], rasgo: 'contra' },
  // Jefes
  royal:    { n: 'Royal Academy', esc: 'royal-academy.png', gk: 'r13', st: 'r22', tech: 'Pingüino emperador n.º 2', res: 26, shot: [11, 13], pos: [8, 10], pres: [7, 9], muro: [5, 8], rasgo: 'kageyama', boss: 1,
              stech: 'Pingüino emperador n.º 2', spow: 19, muroTech: 'Escudo de Fuerza' },
  zeus:     { n: 'Zeus', esc: 'zeus.png', gk: 'r51', st: 'r20', tech: 'Sabiduría Divina', vid: 'sabiduria-divina', res: 31, shot: [12, 14], pos: [9, 11], pres: [7, 9], muro: [8, 10], rasgo: 'nectar', boss: 1,
              stech: 'Sabiduría Divina', spow: 23, muroTech: 'Muralla Gigante', muroVid: 'muralla-gigante' },
  genesis:  { n: 'Genesis', esc: 'genesis.png', gk: 'r110', st: 'r150', tech: 'Supernova', vid: 'supernova', res: 36, shot: [13, 16], pos: [10, 12], pres: [8, 10], muro: [9, 12], rasgo: 'genesis', boss: 1,
              stech: 'Supernova', spow: 28, muroTech: 'Muro Dimensional' }
};

var RASGOS = {
  maldicion: 'Maldición: su presión mete Cansancio en tu mazo.',
  salvaje:   'Salvajes: tiran fuerte, pero sueltan el balón con facilidad.',
  bolafalsa: 'Bola falsa: presionan mucho y tiran flojo.',
  aguante:   'Granjeros: su portero aguanta más que nadie.',
  ninja:     'Ninjas: cuesta mucho robarles el balón.',
  escaner:   'Escáner: su portero levanta muros altos.',
  murdock:   'Hermanos Murdock: sus avances cargan mucho el tiro.',
  alius:     'Velocidad Alius: si te roban, contraatacan al momento.',
  hielo:     'Hielo: si te roban el balón, tu siguiente turno tiene 1 TP menos.',
  llamas:    'Llamas: tiros muy potentes y defensa floja.',
  contra:    'Épsilon: si te roban, contraatacan al momento.',
  kageyama:  'Trampa de Kageyama: al descanso mete 2 Cansancio en tu mazo. Cada tercer ataque tiran el Pingüino emperador.',
  nectar:    'Néctar de los dioses: sus tiros suben 1 cada turno. Cada tercer ataque, Sabiduría Divina.',
  genesis:   'Genesis: contraatacan al robarte y cargan la Supernova antes de tirarla.'
};

var ACTS = [
  { n: 'Torneo Regional', normal: ['occult', 'wild', 'otaku', 'farm'], elite: ['shuriken', 'brain'], boss: 'royal' },
  { n: 'Fútbol Frontier', normal: ['brain', 'kirkwood', 'farm', 'shuriken'], elite: ['geminis'], boss: 'zeus' },
  { n: 'Academia Alius', normal: ['polvo', 'prominence', 'geminis'], elite: ['epsilon'], boss: 'genesis' }
];

/* Eventos: cada opción tiene texto y una acción que resuelve game.js */
var EVENTS = [
  { id: 'neumaticos', t: 'Entrenamiento en la torre', p: 'r01',
    d: 'Mark está colgado de un neumático en lo alto de la torre Inazuma. Te invita a entrenar con él hasta caer rendido.',
    o: [{ l: 'Entrenar', h: 'Mejora una carta al azar. Pierdes 6 de Moral.', a: 'upRandom' }, { l: 'Descansar', h: 'Recuperas 8 de Moral.', a: 'heal8' }] },
  { id: 'cuaderno', t: 'El cuaderno del abuelo', p: 'r01',
    d: 'Entre papeles viejos aparece el cuaderno de supertécnicas del abuelo de Mark. La letra es casi ilegible.',
    o: [{ l: 'Estudiar', h: 'Ganas una carta rara al azar. Pierdes 7 de Moral.', a: 'rare' }, { l: 'Guardarlo', h: 'Ganas 25 monedas.', a: 'coins25' }] },
  { id: 'ramen', t: 'Ramen de Hibiki', p: null,
    d: 'El ramen de la esquina huele de maravilla después del entrenamiento.',
    o: [{ l: 'Invitar', h: 'Pagas 20 monedas y recuperas 18 de Moral.', a: 'ramen' }, { l: 'Seguir', h: 'No pasa nada.', a: 'none' }] },
  { id: 'callejero', t: 'Partido callejero', p: 'r05',
    d: 'Unos chavales del barrio os retan en la ribera del río. Es un buen sitio para pulir vicios.',
    o: [{ l: 'Pulir', h: 'Quita una carta de tu mazo.', a: 'remove' }, { l: 'Mirar', h: 'Ganas una carta común al azar.', a: 'common' }] },
  { id: 'ojeador', t: 'Un ojeador misterioso', p: null,
    d: 'Un hombre con gafas oscuras dice conocer a un jugador libre que encajaría en tu equipo.',
    o: [{ l: 'Fichar', h: 'Pagas 70 monedas y eliges un fichaje.', a: 'sign70' }, { l: 'Rechazar', h: 'No pasa nada.', a: 'none' }] },
  { id: 'trato', t: 'El trato de Ray Dark', p: null,
    d: 'Ray Dark te ofrece dinero a cambio de un pequeño favor. Nadie sale limpio de un trato con él.',
    o: [{ l: 'Aceptar', h: 'Ganas 70 monedas. Entran 2 Cansancio en tu mazo.', a: 'trato' }, { l: 'Rechazar', h: 'Recuperas 5 de Moral.', a: 'heal5' }] }
];
