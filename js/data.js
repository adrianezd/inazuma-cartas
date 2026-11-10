'use strict';
/* Inazuma Cartas: datos del juego.
   Jugadores, sprites y escudos salen de la plantilla de Inazuma Run
   (roster-data.js) y se cargan desde inazumarun.es/assets. */

var APP_VERSION = '0.4.0';
var APP_NOTES = [
  ['0.4.0', 'Más roguelike: objetos como en Slay the Spire, ventaja al azar al empezar, cofres, nodos misterio, eventos nuevos y 5 cartas de 0 TP. El rival sale con 6 jugadores y el balón sale de quien tira.'],
  ['0.3.0', 'Empiezas con 7 cartas y números pequeños: menos aguante, tiros y paradas para todos. Los rivales se hacen más fuertes en cada casilla del mapa y tu portero gana 1 de aguante por cada victoria.'],
  ['0.2.0', 'Mucho más sencillo: empiezas solo con Chut y Parada, sin posesión, pases ni regates. Los efectos llegan con las cartas nuevas. Los rivales anuncian tiro, muro, avance o presión.'],
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
  defensa: { n: 'Defensa', c: '#38d17a' },
  tactica: { n: 'Táctica', c: '#b583ff' },
  estado:  { n: 'Estado',  c: '#7d8799' }
};
var RARITY_INFO = { B: 'Básica', C: 'Común', U: 'Poco común', R: 'Rara', S: 'Capitán', F: 'Fichaje' };

/* Cartas.
   t: tipo · c: coste en TP · r: rareza · p: jugador (sprite y elemento)
   v: valores base · u: valores mejorados (se mezclan sobre v)
   Claves de v:
     pow: potencia del tiro · hits: veces que tira · pierce: ignora el muro
     ps: suma por cada tiro anterior del turno · axel/jude: combinada si está en tu equipo
     gdraw: roba si es gol · par: Parada · heal: aguante que recupera tu portero
     fat: el próximo tiro rival pierde X · vul: turnos de portero Desorientado (tus tiros x1.5)
     oca: tu próximo tiro suma X · conc: Concentración (suma a todos tus tiros)
     draw: roba cartas · tp: TP ahora · tpn: TP el próximo turno · parT: Parada cada turno
     dbl: tu próximo tiro se repite · agota: sale del partido al jugarla · perm: efecto para todo el partido
   st: es supertécnica (anuncio grande) · vid: vídeo en assets/tecnicas */
var CARDS = {
  // Básicas
  chut:   { n: 'Chut', t: 'tiro', c: 1, r: 'B', p: 'r05', v: { pow: 4 }, u: { pow: 6 } },
  parada: { n: 'Parada', t: 'defensa', c: 1, r: 'B', p: 'r01', v: { par: 3 }, u: { par: 5 } },

  // De capitán
  tornado_fuego: { n: 'Tornado de Fuego', t: 'tiro', c: 2, r: 'S', p: 'r02', v: { pow: 7, vul: 2 }, u: { pow: 9, vul: 3 }, st: 1, vid: 'tornado-de-fuego' },
  espejismo:     { n: 'Espejismo de balón', t: 'tactica', c: 1, r: 'S', p: 'r04', v: { draw: 2, oca: 3 }, u: { draw: 2, oca: 3, c: 0 }, st: 1, vid: 'espejismo-de-balon' },
  ventisca:      { n: 'Ventisca eterna', t: 'tiro', c: 2, r: 'S', p: 'r08', v: { pow: 5, par: 4 }, u: { pow: 7, par: 6 }, st: 1, vid: 'ventisca-eterna' },

  // Recompensas: tiros
  remate_dragon:  { n: 'Remate Dragón', t: 'tiro', c: 1, r: 'C', p: 'r05', v: { pow: 6 }, u: { pow: 8 }, st: 1, vid: 'remate-dragon' },
  rodante:        { n: 'Disparo Rodante', t: 'tiro', c: 1, r: 'C', p: 'r46', v: { pow: 3, hits: 2 }, u: { pow: 4, hits: 2 } },
  kung_fu:        { n: 'Cabezazo Kung Fu', t: 'tiro', c: 1, r: 'C', p: 'r47', v: { pow: 4, par: 3 }, u: { pow: 5, par: 4 }, st: 1, vid: 'cabezazo-kung-fu' },
  zigzag:         { n: 'Zig Zag Explosivo', t: 'tiro', c: 1, r: 'C', p: 'r46', v: { pow: 5, pierce: 1 }, u: { pow: 7, pierce: 1 } },
  entrada_huracan:{ n: 'Entrada huracán', t: 'tiro', c: 1, r: 'C', p: 'r03', v: { pow: 3, fat: 2 }, u: { pow: 5, fat: 3 }, st: 1, vid: 'entrada-huracan' },
  tornado_dragon: { n: 'Tornado dragón', t: 'tiro', c: 2, r: 'U', p: 'r05', v: { pow: 8, axel: 5 }, u: { pow: 10, axel: 7 }, st: 1, vid: 'tornado-dragon' },
  // Recompensas: defensa
  corte_giratorio:{ n: 'Corte Giratorio', t: 'defensa', c: 1, r: 'C', p: 'r12', v: { par: 4, oca: 2 }, u: { par: 5, oca: 3 }, st: 1, vid: 'corte-giratorio' },
  defensa_huracan:{ n: 'Defensa Huracán', t: 'defensa', c: 2, r: 'U', p: 'r03', v: { par: 7, draw: 1 }, u: { par: 9, draw: 1 }, st: 1 },
  el_muro:        { n: 'El Muro', t: 'defensa', c: 2, r: 'U', p: 'r06', v: { par: 10 }, u: { par: 13 }, st: 1, vid: 'el-muro' },
  mano_magica:    { n: 'Mano Mágica', t: 'defensa', c: 2, r: 'U', p: 'r01', v: { par: 8, heal: 2 }, u: { par: 10, heal: 3 }, st: 1 },
  mano_celestial: { n: 'Mano Celestial', t: 'defensa', c: 3, r: 'R', p: 'r01', v: { par: 13, heal: 4, agota: 1 }, u: { par: 13, heal: 4, agota: 1, c: 2 }, st: 1, vid: 'mano-celestial' },
  // Recompensas: efectos
  pase_hueco:     { n: 'Pase al hueco', t: 'tactica', c: 0, r: 'C', p: 'r48', v: { oca: 2, draw: 1 }, u: { oca: 3, draw: 1 } },
  toque:          { n: 'Toque rápido', t: 'tactica', c: 0, r: 'C', p: 'r48', v: { draw: 2, agota: 1 }, u: { draw: 3, agota: 1 } },
  presion_alta:   { n: 'Presión alta', t: 'tactica', c: 1, r: 'C', p: 'r06', v: { vul: 2, draw: 1 }, u: { vul: 3, draw: 1 } },
  pared:          { n: 'Pared', t: 'tactica', c: 1, r: 'U', p: 'r48', v: { dbl: 1, agota: 1 }, u: { dbl: 1, agota: 1, c: 0 } },
  a_por_todas:    { n: '¡A por todas!', t: 'tactica', c: 1, r: 'U', p: 'r01', v: { conc: 1, perm: 1 }, u: { conc: 2, perm: 1 } },
  coraje:         { n: 'Coraje', t: 'tactica', c: 0, r: 'U', p: 'r02', v: { tp: 2, agota: 1 }, u: { tp: 2, draw: 1, agota: 1 } },
  neumaticos:     { n: 'Entrenamiento con neumáticos', t: 'tactica', c: 1, r: 'R', p: 'r01', v: { parT: 2, perm: 1 }, u: { parT: 3, perm: 1 } },

  // De fichajes
  fenix:        { n: 'Fénix', t: 'tiro', c: 2, r: 'F', p: 'r10', v: { pow: 7, gdraw: 2 }, u: { pow: 9, gdraw: 2 }, st: 1, vid: 'el-fenix' },
  remate_tigre: { n: 'Remate del Tigre', t: 'tiro', c: 1, r: 'F', p: 'r09', v: { pow: 3, ps: 3 }, u: { pow: 4, ps: 4 }, st: 1 },
  barrido:      { n: 'Barrido Defensivo', t: 'defensa', c: 1, r: 'F', p: 'r16', v: { par: 4, fat: 3 }, u: { par: 5, fat: 4 }, st: 1, vid: 'barrido-defensivo' },
  carrera:      { n: 'Carrera relámpago', t: 'tactica', c: 1, r: 'F', p: 'r15', v: { draw: 2, tpn: 1 }, u: { draw: 3, tpn: 1 }, st: 1 },
  pinguino3:    { n: 'Pingüino emperador n.º 3', t: 'tiro', c: 2, r: 'F', p: 'r07', v: { pow: 8, jude: 5 }, u: { pow: 11, jude: 7 }, st: 1, vid: 'pinguino-emperador-n-3' },
  canon:        { n: 'Cañón de Meteoritos', t: 'tiro', c: 3, r: 'F', p: 'r14', v: { pow: 14 }, u: { pow: 18 }, st: 1, vid: 'canon-de-meteoritos' },
  escudo:       { n: 'Escudo de Fuerza', t: 'defensa', c: 1, r: 'F', p: 'r13', v: { par: 5 }, u: { par: 7 }, st: 1 },
  pinguino2:    { n: 'Pingüino emperador n.º 2', t: 'tiro', c: 2, r: 'F', p: 'r22', v: { pow: 5, hits: 2 }, u: { pow: 6, hits: 2 }, st: 1 },
  sabiduria:    { n: 'Sabiduría Divina', t: 'tiro', c: 3, r: 'F', p: 'r20', v: { pow: 13, vul: 1 }, u: { pow: 16, vul: 2 }, st: 1, vid: 'sabiduria-divina' },
  muralla:      { n: 'Muralla Gigante', t: 'defensa', c: 2, r: 'F', p: 'r51', v: { par: 10 }, u: { par: 14 }, st: 1, vid: 'muralla-gigante' },

  // Estado
  cansancio: { n: 'Cansancio', t: 'estado', c: -1, r: 'B', p: null, v: { unplay: 1 }, u: { unplay: 1 } }
};

var POOL = ['remate_dragon', 'rodante', 'kung_fu', 'zigzag', 'entrada_huracan', 'tornado_dragon',
  'corte_giratorio', 'defensa_huracan', 'el_muro', 'mano_magica', 'mano_celestial',
  'pase_hueco', 'toque', 'presion_alta', 'pared', 'a_por_todas', 'coraje', 'neumaticos'];

var STARTER = ['chut', 'chut', 'chut', 'parada', 'parada', 'parada'];
var BASE_TEAM = ['r01', 'r06', 'r03', 'r48', 'r05'];

var CAPTAINS = [
  { id: 'r02', titulo: 'El goleador', card: 'tornado_fuego', pas: 'Goleador', pasTxt: 'Tu primer tiro de cada turno suma 2.' },
  { id: 'r04', titulo: 'El estratega', card: 'espejismo', pas: 'Visión de juego', pasTxt: 'Robas 1 carta más cada turno.' },
  { id: 'r08', titulo: 'El defensa', card: 'ventisca', pas: 'Doble alma', pasTxt: 'Empiezas cada turno con 2 de Parada.' }
];

/* Fichajes: el jugador entra en tu equipo, da una pasiva y mete su carta en el mazo. */
var SIGNINGS = {
  r10: { card: 'fenix', pas: 'Resurgir', txt: 'La primera vez que te marcan en un partido, tu siguiente turno tiene 2 TP y 2 cartas más.' },
  r09: { card: 'remate_tigre', pas: 'Instinto', txt: 'Cada gol que marcas te da 1 de Concentración para el resto del partido.' },
  r16: { card: 'barrido', pas: 'Marcaje', txt: 'Todos los tiros rivales pierden 1.' },
  r15: { card: 'carrera', pas: 'Pulmón', txt: 'Robas 2 cartas más en el primer turno de cada partido.' },
  r07: { card: 'pinguino3', pas: 'Provocador', txt: 'Cada partido empieza con el portero rival Desorientado 2 turnos.' },
  r14: { card: 'canon', pas: 'Estrella fugaz', txt: 'Empiezas cada partido con 1 de Concentración y 1 TP más en el primer turno.' },
  r13: { card: 'escudo', pas: 'Guardameta', txt: 'Tu portero gana 4 de aguante máximo.' },
  r22: { card: 'pinguino2', pas: 'Táctica imperial', txt: 'La primera carta que juegas cada turno cuesta 1 TP menos.' },
  r20: { card: 'sabiduria', pas: 'Néctar divino', txt: 'Empiezas cada partido con 1 de Concentración y tu primer turno roba 1 carta más.' },
  r51: { card: 'muralla', pas: 'Muralla', txt: 'Tu portero gana 6 de aguante máximo.' }
};
var SIGN_POOL = ['r10', 'r09', 'r16', 'r15', 'r07', 'r14'];

/* Equipos rivales. Valores del acto 1; ver scaleTeam en game.js.
   res: aguante del portero · shot: potencia de tiro · muro: bloqueo de su portero */
var TEAMS = {
  occult:   { n: 'Occult', esc: 'occult.png', gk: 'r80', st: 'r82', tech: 'Tiro Fantasma', vid: 'tiro-fantasma', res: 14, shot: [4, 5], muro: [2, 3], rasgo: 'maldicion' },
  wild:     { n: 'Wild', esc: 'wild.webp', gk: 'r83', st: 'r91', tech: 'Remate Tarzán', res: 13, shot: [5, 6], muro: [1, 2], rasgo: 'salvaje' },
  otaku:    { n: 'Otaku', esc: 'otaku.png', gk: 'r381', st: 'r385', tech: 'Combo Perfecto', res: 12, shot: [3, 5], muro: [2, 3], rasgo: 'bolafalsa' },
  farm:     { n: 'Farm', esc: 'farm.png', gk: 'r164', st: 'r566', tech: 'Tiro cegador', res: 17, shot: [3, 5], muro: [2, 4], rasgo: 'aguante' },
  shuriken: { n: 'Shuriken', esc: 'shuriken.png', gk: 'r557', st: 'r163', tech: 'Bola de Fango', res: 16, shot: [4, 6], muro: [3, 4], rasgo: 'ninja' },
  brain:    { n: 'Brain', esc: 'brain.webp', gk: 'r151', st: 'r157', tech: 'Remate Misil', res: 15, shot: [4, 6], muro: [3, 5], rasgo: 'escaner' },
  kirkwood: { n: 'Kirkwood', esc: 'kirkwood.png', gk: 'r543', st: 'r238', tech: 'Tiro Balista', res: 15, shot: [4, 6], muro: [2, 3], rasgo: 'murdock' },
  geminis:  { n: 'Tormenta de Géminis', esc: 'tormenta-de-geminis.png', gk: 'r184', st: 'r409', tech: 'Astro remate', vid: 'astrorremate', res: 16, shot: [5, 6], muro: [2, 4], rasgo: 'alius' },
  polvo:    { n: 'Polvo de Diamante', esc: 'polvo-de-diamantes.png', gk: 'r182', st: 'r17', tech: 'Balón Iceberg', vid: 'balon-iceberg', res: 15, shot: [4, 6], muro: [3, 4], rasgo: 'hielo' },
  prominence:{ n: 'Prominence', esc: 'prominence.png', gk: 'r179', st: 'r19', tech: 'Llamarada Atómica', vid: 'llamarada-atomica', res: 13, shot: [5, 7], muro: [1, 3], rasgo: 'llamas' },
  epsilon:  { n: 'Épsilon', esc: 'epsilon.png', gk: 'r54', st: 'r455', tech: 'Remate de Gaia', res: 16, shot: [5, 6], muro: [3, 4], rasgo: 'alius' },
  // Jefes (valores fijos, no se escalan)
  royal:    { n: 'Royal Academy', esc: 'royal-academy.png', gk: 'r13', st: 'r22', tech: 'Tiro', res: 19, shot: [4, 6], muro: [3, 4], rasgo: 'kageyama', boss: 1,
              stech: 'Pingüino emperador n.º 2', spow: 10, muroTech: 'Escudo de Fuerza' },
  zeus:     { n: 'Zeus', esc: 'zeus.png', gk: 'r51', st: 'r20', tech: 'Tiro', res: 24, shot: [5, 7], muro: [3, 5], rasgo: 'nectar', boss: 1,
              stech: 'Sabiduría Divina', spow: 10, vid: 'sabiduria-divina', muroTech: 'Muralla Gigante', muroVid: 'muralla-gigante' },
  genesis:  { n: 'Genesis', esc: 'genesis.png', gk: 'r110', st: 'r150', tech: 'Tiro', res: 27, shot: [6, 8], muro: [4, 6], rasgo: 'genesis', boss: 1,
              stech: 'Supernova', spow: 11, vid: 'supernova', muroTech: 'Muro Dimensional' }
};

var RASGOS = {
  maldicion: 'Maldición: cuando presionan, meten Cansancio en tu mazo.',
  salvaje:   'Salvajes: tiran fuerte y casi no defienden.',
  bolafalsa: 'Bola falsa: presionan a menudo y tiran flojo.',
  aguante:   'Granjeros: su portero aguanta más que nadie.',
  ninja:     'Ninjas: levantan muro a menudo.',
  escaner:   'Escáner: su portero levanta muros altos.',
  murdock:   'Hermanos Murdock: sus avances cargan mucho el tiro.',
  alius:     'Velocidad Alius: a veces tiran dos veces en el mismo turno.',
  hielo:     'Hielo: su presión te deja con 1 TP menos el turno siguiente.',
  llamas:    'Llamas: tiros muy potentes y defensa floja.',
  kageyama:  'Trampa de Kageyama: al descanso mete 2 Cansancio en tu mazo. Cada tres turnos tiran el Pingüino emperador.',
  nectar:    'Néctar de los dioses: sus tiros suben 1 cada turno. Cada tres turnos, Sabiduría Divina.',
  genesis:   'Genesis: cargan la Supernova un turno y la tiran al siguiente. Prepara la Parada.'
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
var RIVAL_PLAYERS = {"r94":{"n":"Styx","pos":"DF","el":"Bosque","s":"r94.webp"},"r95":{"n":"Creepy","pos":"DF","el":"Viento","s":"r95.webp"},"r81":{"n":"Wolf","pos":"MC","el":"Montaña","s":"r81.png"},"r98":{"n":"Jiangshi","pos":"MC","el":"Viento","s":"r98.webp"},"r85":{"n":"Fishman","pos":"DF","el":"Bosque","s":"r85.webp"},"r86":{"n":"Toad","pos":"DF","el":"Bosque","s":"r86.webp"},"r84":{"n":"Chicken","pos":"MC","el":"Viento","s":"r84.png"},"r92":{"n":"Snake","pos":"DL","el":"Bosque","s":"r92.webp"},"r382":{"n":"Light Nobel","pos":"DF","el":"Bosque","s":"r382.webp"},"r552":{"n":"Marcus Train","pos":"DF","el":"Fuego","s":"r552.webp"},"r383":{"n":"Walter Valiant","pos":"MC","el":"Fuego","s":"r383.webp"},"r384":{"n":"Gus Gamer","pos":"DL","el":"Fuego","s":"r384.webp"},"r165":{"n":"Mark Hillvalley","pos":"DF","el":"Montaña","s":"r165.webp"},"r166":{"n":"Herb Sherman","pos":"DF","el":"Bosque","s":"r166.webp"},"r167":{"n":"Joe Small","pos":"MC","el":"Montaña","s":"r167.webp"},"r168":{"n":"Orville Newman","pos":"MC","el":"Viento","s":"r168.webp"},"r158":{"n":"Jim Hillfort","pos":"DF","el":"Viento","s":"r158.webp"},"r159":{"n":"Phil Wingate","pos":"DF","el":"Montaña","s":"r159.webp"},"r160":{"n":"Jupiter Jumper","pos":"MC","el":"Viento","s":"r160.webp"},"r161":{"n":"Sam Samurai","pos":"MC","el":"Bosque","s":"r161.webp"},"r152":{"n":"Philip Marvel","pos":"DF","el":"Montaña","s":"r152.png"},"r153":{"n":"Stronger","pos":"DF","el":"Fuego","s":"r153.png"},"r154":{"n":"Francis Tell","pos":"MC","el":"Bosque","s":"r154.png"},"r39":{"n":"Shadow Cimmerian","pos":"DL","el":"Bosque","s":"r39.png"},"r394":{"n":"Malcolm Night","pos":"DF","el":"Fuego","s":"r394.webp"},"r395":{"n":"Alfred Meenan","pos":"DF","el":"Bosque","s":"r395.webp"},"r236":{"n":"Bay Laurel","pos":"MC","el":"Montaña","s":"r236.webp"},"r397":{"n":"Marvin Murdock","pos":"DL","el":"Fuego","s":"r397.webp"},"r132":{"n":"Ganymede","pos":"DF","el":"Montaña","s":"r132.png"},"r633":{"n":"Connor Shuttle","pos":"DF","el":"Viento","s":"r633.webp"},"r15":{"n":"Jordan Greenway","pos":"MC","el":"Bosque","s":"r15.png"},"r450":{"n":"Diam","pos":"DL","el":"Fuego","s":"r450.webp"},"r122":{"n":"Gocker","pos":"DF","el":"Montaña","s":"r122.png"},"r183":{"n":"Claire Lesnow","pos":"DF","el":"Viento","s":"r183.webp"},"r595":{"n":"Dawson Foxx","pos":"MC","el":"Viento","s":"r595.webp"},"r181":{"n":"Denzel Freezer","pos":"DL","el":"Montaña","s":"r181.webp"},"r123":{"n":"Bomber","pos":"DF","el":"Fuego","s":"r123.png"},"r180":{"n":"Val Flamewood","pos":"DF","el":"Fuego","s":"r180.webp"},"r125":{"n":"Heat","pos":"MC","el":"Fuego","s":"r125.png"},"r597":{"n":"Nigel August","pos":"DL","el":"Bosque","s":"r597.webp"},"r456":{"n":"Kenville","pos":"DF","el":"Bosque","s":"r456.webp"},"r598":{"n":"Anna Mole","pos":"DF","el":"Bosque","s":"r598.webp"},"r457":{"n":"Fedora","pos":"MC","el":"Bosque","s":"r457.webp"},"r55":{"n":"Zeke Valanche","pos":"DL","el":"Bosque","s":"r55.png"},"r16":{"n":"Bobby Shearer","pos":"DF","el":"Bosque","s":"r16.png"},"r537":{"n":"Peter Drent","pos":"DF","el":"Montaña","s":"r537.webp"},"r131":{"n":"Alan Master","pos":"MC","el":"Bosque","s":"r131.png"},"r185":{"n":"Daniel Hatch","pos":"DL","el":"Bosque","s":"r185.webp"},"r102":{"n":"Apollo","pos":"DF","el":"Bosque","s":"r102.png"},"r103":{"n":"Hephestus","pos":"DF","el":"Fuego","s":"r103.png"},"r106":{"n":"Hermes","pos":"MC","el":"Bosque","s":"r106.png"},"r108":{"n":"Demeter","pos":"DL","el":"Fuego","s":"r108.png"},"r111":{"n":"Gele","pos":"DF","el":"Viento","s":"r111.png"},"r112":{"n":"Kiburn","pos":"DF","el":"Fuego","s":"r112.png"},"r118":{"n":"Wittz","pos":"DL","el":"Bosque","s":"r118.png"}};
var TEAM_XI = {"occult":["r94","r95","r81","r98"],"wild":["r85","r86","r84","r92"],"otaku":["r382","r552","r383","r384"],"farm":["r165","r166","r167","r168"],"shuriken":["r158","r159","r160","r161"],"brain":["r152","r153","r154","r39"],"kirkwood":["r394","r395","r236","r397"],"geminis":["r132","r633","r15","r450"],"polvo":["r122","r183","r595","r181"],"prominence":["r123","r180","r125","r597"],"epsilon":["r456","r598","r457","r55"],"royal":["r16","r537","r131","r185"],"zeus":["r102","r103","r106","r108"],"genesis":["r111","r112","r15","r118"]};

/* ---------- 0.4.0: alineaciones rivales, objetos, ventajas y más cartas de 0 ---------- */
for (var _rp in RIVAL_PLAYERS) if (!PLAYERS[_rp]) PLAYERS[_rp] = RIVAL_PLAYERS[_rp];
for (var _t in TEAM_XI) if (TEAMS[_t]) TEAMS[_t].xi = TEAM_XI[_t];

// Cartas de 0 TP
CARDS.toque_primeras = { n: 'Toque de primeras', t: 'tiro', c: 0, r: 'C', p: 'r46', v: { pow: 2, draw: 1 }, u: { pow: 4, draw: 1 } };
CARDS.despeje = { n: 'Despeje', t: 'defensa', c: 0, r: 'C', p: 'r06', v: { par: 2 }, u: { par: 4 } };
CARDS.grito = { n: 'Grito de ánimo', t: 'tactica', c: 0, r: 'U', p: 'r01', v: { conc: 1, agota: 1 }, u: { conc: 2, agota: 1 } };
CARDS.finta = { n: 'Finta', t: 'tactica', c: 0, r: 'C', p: 'r03', v: { vul: 1 }, u: { vul: 1, draw: 1 } };
CARDS.contragolpe = { n: 'Contragolpe', t: 'tiro', c: 0, r: 'U', p: 'r16', v: { pow: 0, parpow: 1 }, u: { pow: 3, parpow: 1 } };
POOL.push('toque_primeras', 'despeje', 'grito', 'finta', 'contragolpe');

/* Objetos: efecto pasivo para toda la carrera. r: C común, U poco común, B de jefe */
var RELICS = {
  neumatico:  { n: 'Neumático de entrenamiento', i: '🏋️', r: 'C', d: 'Empiezas cada partido con 4 de Parada.' },
  cuaderno:   { n: 'Cuaderno del abuelo', i: '📓', r: 'C', d: 'Robas 2 cartas más en el primer turno de cada partido.' },
  silbato:    { n: 'Megáfono del entrenador', i: '📣', r: 'C', d: 'Tu primer turno de cada partido tiene 1 TP más.' },
  isotonica:  { n: 'Bebida isotónica', i: '🧃', r: 'C', d: 'Al ganar un partido recuperas 4 de Moral.' },
  guantes:    { n: 'Guantes de portero', i: '🧤', r: 'C', d: 'Tu portero gana 4 de aguante máximo.' },
  hucha:      { n: 'Hucha del club', i: '🐷', r: 'C', d: 'Ganas 12 monedas más por cada victoria.' },
  ramen:      { n: 'Vale de ramen', i: '🍜', r: 'C', d: 'Al descansar recuperas 8 de Moral más.' },
  cinta:      { n: 'Cinta de Mark', i: '🎀', r: 'C', d: 'Cada carta que da Parada da 1 más.' },
  banda:      { n: 'Brazalete de capitán', i: '🎗️', r: 'U', d: 'Empiezas cada partido con 1 de Concentración.' },
  botas:      { n: 'Botas nuevas', i: '👟', r: 'U', d: 'Tu primer tiro de cada partido suma 5.' },
  balon:      { n: 'Balón firmado', i: '⚽', r: 'U', d: 'Cada vez que marcas, robas 1 carta.' },
  brazalete:  { n: 'Muñequera del Raimon', i: '💪', r: 'U', d: 'Cuando te marcan, tu siguiente turno tiene 1 TP más.' },
  espinilleras: { n: 'Espinilleras', i: '🛡️', r: 'U', d: 'La primera vez que te iban a marcar en cada partido, tu portero aguanta con 1.' },
  pizarra:    { n: 'Pizarra táctica', i: '📋', r: 'U', d: 'Cada carta de 0 TP que juegas suma 1 a tu próximo tiro.' },
  gafas:      { n: 'Gafas de Jude', i: '🥽', r: 'U', d: 'Tus tiros con ventaja de elemento suman 2.' },
  bufanda:    { n: 'Bufanda de Shawn', i: '🧣', r: 'U', d: 'Cuando desorientas al portero rival, dura 1 turno más.' },
  meteorito:  { n: 'Piedra Alius', i: '☄️', r: 'B', d: 'Tienes 1 TP más cada turno. Cada gol encajado te quita 2 de Moral más.' },
  contrato:   { n: 'Contrato de Ray Dark', i: '📜', r: 'B', d: 'Tienes 1 TP más cada turno. Cada partido empieza con 1 Cansancio en tu mazo.' },
  botas_axel: { n: 'Botas de fuego', i: '🔥', r: 'B', d: 'Tienes 1 TP más cada turno. Descansar ya no te cura.' }
};

/* Ventajas antes de la primera casilla: se ofrecen 3 al azar */
var BOONS = [
  { id: 'relicC', t: 'Un objeto común al azar' },
  { id: 'remove', t: 'Quita una carta de tu mazo' },
  { id: 'rare', t: 'Una carta rara al azar' },
  { id: 'keeper', t: 'Tu portero gana 3 de aguante máximo' },
  { id: 'coins', t: 'Ganas 60 monedas' },
  { id: 'up2', t: 'Mejora 2 cartas al azar' },
  { id: 'relicU', t: 'Un objeto poco común, pero pierdes 8 de Moral' },
  { id: 'cards3', t: 'Elige 1 de 3 cartas poco comunes' }
];

EVENTS.push(
  { id: 'apuesta', t: 'Apuesta en el callejón', p: null,
    d: 'Unos chavales apuestan a que no metes el balón en una papelera desde veinte metros.',
    o: [{ l: 'Apostar', h: 'Mitad y mitad: ganas 50 monedas o pierdes 6 de Moral.', a: 'apuesta' }, { l: 'Pasar', h: 'No pasa nada.', a: 'none' }] },
  { id: 'perdido', t: 'Objeto perdido', p: null,
    d: 'En el vestuario hay una bolsa olvidada. Dentro hay algo que podría servirte.',
    o: [{ l: 'Quedártelo', h: 'Ganas un objeto al azar. Entra 1 Cansancio en tu mazo.', a: 'perdido' }, { l: 'Devolverlo', h: 'Recuperas 6 de Moral.', a: 'heal6' }] },
  { id: 'penaltis', t: 'Tanda de penaltis', p: 'r01',
    d: 'Mark te reta a una tanda de penaltis contra él. Si le marcas, te enseña algo.',
    o: [{ l: 'Tirar', h: 'Mitad y mitad: carta rara al azar o pierdes 5 de Moral.', a: 'penaltis' }, { l: 'Mirar', h: 'Mejora una carta al azar.', a: 'upOne' }] }
);
