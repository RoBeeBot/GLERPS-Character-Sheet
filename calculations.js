/* ============================================================
   calculations.js — Cálculo de características secundarias y
   de puntos gastados, siguiendo las reglas de GURPS Lite.
   Depende de data.js (DAMAGE_TABLE, ATTR_COST, getDamage).
   ============================================================ */

function calcSecondary(){
  const num = id => parseFloat(document.getElementById(id).value);
  const st = num('attr_st_base'), dx = num('attr_dx_base'), iq = num('attr_iq_base'), ht = num('attr_ht_base');

  if(isNaN(st) || isNaN(dx) || isNaN(iq) || isNaN(ht)){
    setStatus('Completá ST, DX, IQ y HT primero');
    return;
  }

  // Secundarias básicas (p.6)
  document.getElementById('attr_hp_score').value = st;
  document.getElementById('attr_will').value = iq;
  document.getElementById('attr_per').value = iq;
  document.getElementById('attr_fp_score').value = ht;
  if(!document.getElementById('attr_hp_current').value) document.getElementById('attr_hp_current').value = st;
  if(!document.getElementById('attr_fp_current').value) document.getElementById('attr_fp_current').value = ht;

  // Basic Lift = (ST x ST) / 5 (p.5)
  let bl = (st*st)/5;
  bl = bl >= 10 ? Math.round(bl) : Math.round(bl*10)/10;
  document.getElementById('f_basiclift').value = bl + ' lbs';

  // Daño (p.6)
  const dmg = getDamage(st);
  document.getElementById('f_dmgthr').value = dmg[0];
  document.getElementById('f_dmgsw').value = dmg[1];

  // Basic Speed = (HT + DX) / 4, sin redondear (p.6)
  const speed = (ht + dx) / 4;
  document.getElementById('f_basicspeed').value = speed;

  // Basic Move = Basic Speed sin la parte fraccionaria
  const move = Math.floor(speed);
  document.getElementById('f_basicmove').value = move;

  // Dodge = Basic Speed + 3, sin fracciones
  const dodge = Math.floor(speed) + 3;
  document.getElementById('enc_none_dodge').value = dodge;

  // Movimiento por nivel de encumbrance (p.22)
  const encFactors = {enc_none_move:1, enc_light_move:0.8, enc_med_move:0.6, enc_heavy_move:0.4, enc_xheavy_move:0.2};
  Object.keys(encFactors).forEach(id=>{
    const val = Math.max(1, Math.floor(move * encFactors[id]));
    document.getElementById(id).value = val;
  });

  setStatus('Secundarios calculados ✓ (podés editarlos a mano si querés)');
}

function sumPtsColumn(tbodyId){
  const tbody = document.getElementById(tbodyId);
  let total = 0;
  let count = 0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const inputs = tr.querySelectorAll('input');
    if(inputs.length >= 2){
      const v = parseFloat(inputs[1].value);
      if(!isNaN(v)){ total += v; count++; }
    }
  });
  return {total, count};
}

// Recorre la tabla de Skills, calcula el costo de cada fila con skillCost()
// (usa Rel. + Dificultad) y opcionalmente escribe el resultado en la columna Pts.
function calcSkillsTotal(fillPtsColumn){
  const tbody = document.getElementById('tbl_skills');
  let total = 0, count = 0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const cells = tr.querySelectorAll('input, select');
    if(cells.length < 5) return; // Nombre, Nivel, Rel., Dificultad, Pts
    const relRaw = cells[2].value;
    const diff = cells[3].value;
    const rel = parseFloat(relRaw);
    if(relRaw === '' || isNaN(rel) || !diff) return;
    const cost = skillCost(rel, diff);
    if(cost === null || cost === undefined) return;
    if(fillPtsColumn) cells[4].value = cost;
    total += cost;
    count++;
  });
  return {total, count};
}

function calcSkillPoints(){
  const {total, count} = calcSkillsTotal(true);
  setStatus(`Puntos de habilidades calculados ✓ (${count} habilidades, ${total} pts)`);
}

function calcPoints(){
  const num = id => parseFloat(document.getElementById(id).value);
  const st = num('attr_st_base'), dx = num('attr_dx_base'), iq = num('attr_iq_base'), ht = num('attr_ht_base');

  if(isNaN(st) || isNaN(dx) || isNaN(iq) || isNaN(ht)){
    setStatus('Completá ST, DX, IQ y HT primero');
    return;
  }

  const stCost = (st - 10) * ATTR_COST.st;
  const dxCost = (dx - 10) * ATTR_COST.dx;
  const iqCost = (iq - 10) * ATTR_COST.iq;
  const htCost = (ht - 10) * ATTR_COST.ht;
  const attrTotal = stCost + dxCost + iqCost + htCost;

  const adv = sumPtsColumn('tbl_advantages');
  const disadv = sumPtsColumn('tbl_disadvantages');
  const skills = calcSkillsTotal(true);

  const total = attrTotal + adv.total + disadv.total + skills.total;
  document.getElementById('f_pointtotal').value = total;

  const startPts = num('f_startpoints');
  if(!isNaN(startPts)){
    document.getElementById('f_unspent').value = startPts - total;
  }

  const breakdown = document.getElementById('pointsBreakdown');
  breakdown.innerHTML =
    `ST ${stCost>=0?'+':''}${stCost} · DX ${dxCost>=0?'+':''}${dxCost} · IQ ${iqCost>=0?'+':''}${iqCost} · HT ${htCost>=0?'+':''}${htCost} (atributos: <b>${attrTotal}</b>)<br>`
    + `Ventajas/Perks (${adv.count} filas): <b>${adv.total>=0?'+':''}${adv.total}</b><br>`
    + `Desventajas/Quirks (${disadv.count} filas): <b>${disadv.total}</b><br>`
    + `Habilidades (${skills.count} con Rel.+Dificultad cargadas): <b>${skills.total}</b><br>`
    + `Total gastado: <b>${total}</b>`
    + (!isNaN(startPts) ? ` · Sin gastar: <b>${startPts-total}</b>` : ' · (completá "Pts iniciales" para ver el remanente)');

  setStatus('Puntos calculados ✓');
}
