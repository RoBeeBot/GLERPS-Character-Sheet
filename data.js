/* ============================================================
   data.js — Tablas de referencia utilizadas por GLERPS (4ª ed.)
   Fuente: GURPS Lite (March 2020 Edition), Steve Jackson Games.
   ============================================================ */

// Tabla de daño (p.6): ST -> [Thrust, Swing]
const DAMAGE_TABLE = {
  1:['1d-6','1d-5'], 2:['1d-6','1d-5'], 3:['1d-5','1d-4'], 4:['1d-5','1d-4'],
  5:['1d-4','1d-3'], 6:['1d-4','1d-3'], 7:['1d-3','1d-2'], 8:['1d-3','1d-2'],
  9:['1d-2','1d-1'], 10:['1d-2','1d'], 11:['1d-1','1d+1'], 12:['1d-1','1d+2'],
  13:['1d','2d-1'], 14:['1d','2d'], 15:['1d+1','2d+1'], 16:['1d+1','2d+2'],
  17:['1d+2','3d-1'], 18:['1d+2','3d'], 19:['2d-1','3d+1'], 20:['2d-1','3d+2']
};

// Costo por nivel de atributo sobre la base 10 (p.4-5)
const ATTR_COST = { st:10, dx:20, iq:20, ht:10 };

// Armadura (p.18)
const ARMOR_TABLE = [
  { name:'Cloth Armor',    dr:1,  cost:150,  weight:12 },
  { name:'Leather Armor',  dr:2,  cost:340,  weight:19.5 },
  { name:'Light Scale',    dr:3,  cost:610,  weight:49 },
  { name:'Mail',           dr:4,  cost:645,  weight:58 },
  { name:'Steel Laminate', dr:5,  cost:1360, weight:64 },
  { name:'Plate',          dr:6,  cost:4040, weight:89.5 },
  { name:'Flak Jacket',    dr:7,  cost:500,  weight:20 },
  { name:'Ballistic Vest', dr:8,  cost:400,  weight:2 },
  { name:'Tactical Vest',  dr:12, cost:900,  weight:9 }
];

// Escudos (p.19)
const SHIELD_TABLE = [
  { name:'Small Shield',  db:1, cost:40, weight:8 },
  { name:'Medium Shield', db:2, cost:60, weight:15 },
  { name:'Large Shield',  db:3, cost:90, weight:25 }
];

// Armas de melee (p.20-21). ST con † o ‡ indica requerimiento de dos manos (ver GURPS Lite p.20).
const MELEE_WEAPONS = [
  { skill:'Axe/Mace',        weapon:'Axe',                    tl:0, damage:'sw+2 cut', cost:50,  weight:4,   st:11 },
  { skill:'Axe/Mace',        weapon:'Mace',                   tl:2, damage:'sw+3 cr',  cost:50,  weight:5,   st:12 },
  { skill:'Brawling/Karate', weapon:'Punch',                  tl:'–', damage:'thr-1 cr', cost:0, weight:0,  st:'–' },
  { skill:'Brawling/Karate', weapon:'Brass Knuckles',         tl:1, damage:'thr cr',   cost:10,  weight:0.25,st:'–' },
  { skill:'Brawling/Karate', weapon:'Kick',                   tl:'–', damage:'thr cr',   cost:0, weight:0,  st:'–', notes:'-2 skill' },
  { skill:'Broadsword',      weapon:'Broadsword',             tl:2, damage:'sw+1 cut / thr+1 cr', cost:500, weight:3, st:10 },
  { skill:'Broadsword',      weapon:'Thrusting Broadsword',   tl:2, damage:'sw+1 cut / thr+2 imp', cost:600, weight:3, st:10 },
  { skill:'Knife',           weapon:'Large Knife',            tl:0, damage:'sw-2 cut / thr imp', cost:40, weight:1, st:6 },
  { skill:'Polearm',         weapon:'Poleaxe',                tl:3, damage:'sw+4 cut / sw+4 cr', cost:120, weight:10, st:'12‡' },
  { skill:'Rapier',          weapon:'Rapier',                 tl:4, damage:'thr+1 imp', cost:500, weight:2.75, st:9 },
  { skill:'Shortsword',      weapon:'Shortsword',             tl:2, damage:'sw cut / thr imp', cost:400, weight:2, st:8 },
  { skill:'Spear',           weapon:'Spear (1 mano)',         tl:0, damage:'thr+2 imp', cost:40, weight:4, st:9 },
  { skill:'Spear',           weapon:'Spear (2 manos)',        tl:0, damage:'thr+3 imp', cost:40, weight:4, st:'9†' },
  { skill:'Staff',           weapon:'Quarterstaff',           tl:0, damage:'sw+2 cr / thr+2 cr', cost:10, weight:4, st:'7†' },
  { skill:'Two-Handed Sword',weapon:'Quarterstaff',           tl:0, damage:'sw+2 cr / thr+1 cr', cost:10, weight:4, st:'9†' },
  { skill:'Two-Handed Sword',weapon:'Thrusting Greatsword',   tl:3, damage:'sw+3 cut / thr+3 imp', cost:900, weight:7, st:'12†' }
];

// Armas de proyectil de músculo (arcos, ballestas, arrojadizas) (p.21)
const RANGED_MUSCLE = [
  { skill:'Bow', weapon:'Longbow',   tl:0, damage:'thr+2 imp', acc:3, range:'×15/×20', weight:'3/0.1', rof:1, shots:'1(2)', cost:200, st:'11†' },
  { skill:'Bow', weapon:'Short Bow', tl:0, damage:'thr imp',   acc:1, range:'×10/×15', weight:'2/0.1', rof:1, shots:'1(2)', cost:50,  st:'7†' },
  { skill:'Crossbow', weapon:'Crossbow', tl:2, damage:'thr+4 imp', acc:4, range:'×20/×25', weight:'6/0.06', rof:1, shots:'1(4)', cost:150, st:'7†' },
  { skill:'Thrown (Axe/Mace)', weapon:'Throwing Axe', tl:0, damage:'sw+2 cut', acc:2, range:'×1/×1.5', weight:4, rof:1, shots:'T(1)', cost:60, st:11 },
  { skill:'Thrown (Knife)', weapon:'Large Knife', tl:0, damage:'thr imp', acc:0, range:'×0.8/×1.5', weight:1, rof:1, shots:'T(1)', cost:40, st:6 },
  { skill:'Thrown (Spear)', weapon:'Spear', tl:0, damage:'thr+3 imp', acc:2, range:'×1/×1.5', weight:4, rof:1, shots:'T(1)', cost:40, st:9 }
];

// Armas de fuego (p.21-22)
const FIREARMS = [
  { skill:'Guns (Pistol)', weapon:'Derringer, .41',    tl:5, damage:'1d pi+',   acc:1, range:'80/650',      weight:'0.5/0.1', rof:1, shots:'2(3i)',  st:9,  cost:100 },
  { skill:'Guns (Pistol)', weapon:'Auto Pistol, 9mm',  tl:6, damage:'2d+2 pi',  acc:2, range:'150/1,850',   weight:'2.4/0.4', rof:3, shots:'8+1(3)',st:9,  cost:350 },
  { skill:'Guns (Pistol)', weapon:'Revolver, .357',    tl:7, damage:'3d-1 pi',  acc:2, range:'185/2,000',   weight:'3/0.21',  rof:3, shots:'6(3i)', st:10, cost:500 },
  { skill:'Guns (Pistol)', weapon:'Auto Pistol, .44M', tl:8, damage:'3d pi+',   acc:2, range:'230/2,500',   weight:'4.5/0.6', rof:3, shots:'9+1(3)',st:12, cost:750 },
  { skill:'Guns (Rifle)',  weapon:'Lever-Action Carbine, .30', tl:5, damage:'5d pi', acc:4, range:'450/3,000', weight:'7/0.3', rof:1, shots:'6+1(3i)', st:'10†', cost:300 },
  { skill:'Guns (Rifle)',  weapon:'Self-Loading Rifle, 7.62mm', tl:6, damage:'7d pi', acc:5, range:'1,000/4,200', weight:'10/0.5', rof:3, shots:'8(3)', st:'10†', cost:600 },
  { skill:'Guns (Rifle)',  weapon:'Sniper Rifle, .338', tl:8, damage:'9d+1 pi', acc:'6+3', range:'1,500/5,500', weight:'17.5/0.8', rof:1, shots:'4+1(3)', st:'11B†', cost:5600 },
  { skill:'Guns (Shotgun)', weapon:'Pump Shotgun, 12G', tl:6, damage:'1d+1 pi', acc:3, range:'50/125', weight:'8/0.7', rof:'2×9', shots:'5(3i)', st:'10†', cost:240 }
];

function getDamage(st){
  const clamped = Math.max(1, Math.min(20, Math.round(st)));
  return DAMAGE_TABLE[clamped];
}

// Skill Cost Table (p.13): nivel relativo al atributo -> costo por dificultad
const SKILL_COST_TABLE = {
  '-3': { E:null, A:null, H:null },
  '-2': { E:null, A:null, H:1 },
  '-1': { E:null, A:1,    H:2 },
  '0':  { E:1,    A:2,    H:4 },
  '1':  { E:2,    A:4,    H:8 },
  '2':  { E:4,    A:8,    H:12 },
  '3':  { E:8,    A:12,   H:16 }
};

// Costo de una habilidad según su nivel relativo al atributo y su dificultad (E/A/H).
// Más allá de Attribute+3, cada nivel extra cuesta +4 pts sin importar la dificultad.
function skillCost(relLevel, difficulty){
  const rel = Math.round(relLevel);
  if(rel > 3){
    const base = SKILL_COST_TABLE['3'][difficulty];
    if(base === null || base === undefined) return null;
    return base + 4 * (rel - 3);
  }
  if(rel < -3) return null;
  const row = SKILL_COST_TABLE[String(rel)];
  return row ? row[difficulty] : null;
}
