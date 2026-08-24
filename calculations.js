/* GLERPS — cálculos de características secundarias y puntos. */

function calcSecondary(announce=true){
  const num=id=>parseFloat(document.getElementById(id).value);
  const st=num('attr_st_base'),dx=num('attr_dx_base'),iq=num('attr_iq_base'),ht=num('attr_ht_base');
  if([st,dx,iq,ht].some(isNaN)){ updatePointsUI(); return false; }

  document.getElementById('attr_hp_score').value=st;
  document.getElementById('attr_will').value=iq;
  document.getElementById('attr_per').value=iq;
  document.getElementById('attr_fp_score').value=ht;
  if(!document.getElementById('attr_hp_current').value) document.getElementById('attr_hp_current').value=st;
  if(!document.getElementById('attr_fp_current').value) document.getElementById('attr_fp_current').value=ht;

  let bl=(st*st)/5;
  bl=bl>=10?Math.round(bl):Math.round(bl*10)/10;
  document.getElementById('f_basiclift').value=bl+' lbs';

  const dmg=getDamage(st);
  document.getElementById('f_dmgthr').value=dmg[0];
  document.getElementById('f_dmgsw').value=dmg[1];

  const speed=(ht+dx)/4;
  const move=Math.floor(speed);
  document.getElementById('f_basicspeed').value=speed;
  document.getElementById('f_basicmove').value=move;
  document.getElementById('enc_none_dodge').value=Math.floor(speed)+3;

  const factors={enc_none_move:1,enc_light_move:.8,enc_med_move:.6,enc_heavy_move:.4,enc_xheavy_move:.2};
  Object.keys(factors).forEach(id=>document.getElementById(id).value=Math.max(1,Math.floor(move*factors[id])));
  if(announce)setStatus('Características secundarias actualizadas ✓','success');
  return true;
}

function sumPtsColumn(tbodyId){
  const tbody=document.getElementById(tbodyId);let total=0,count=0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const inputs=tbodyId==='tbl_advantages'||tbodyId==='tbl_disadvantages'
      ? tr.querySelectorAll('input,select') : tr.querySelectorAll('input');
    const v=parseFloat(inputs[inputs.length-1]?.value);
    if(!isNaN(v)){total+=v;count++;}
  });
  return {total,count};
}

function calcSkillsTotal(fillPtsColumn=true){
  const tbody=document.getElementById('tbl_skills');let total=0,count=0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const cells=tr.querySelectorAll('input,select');
    if(cells.length<6)return;
    const relRaw=cells[3].value,diff=cells[4].value,rel=parseFloat(relRaw);
    if(relRaw===''||isNaN(rel)||!diff)return;
    const cost=skillCost(rel,diff);
    if(cost===null||cost===undefined)return;
    if(fillPtsColumn)cells[5].value=cost;
    total+=cost;count++;
  });
  return {total,count};
}

function calcSkillPoints(){
  const result=calcSkillsTotal(true);
  updatePointsUI();
  markDirty();
  setStatus(`Puntos de habilidades calculados ✓ (${result.count} habilidades, ${result.total} pts)`,'success');
}

function calcPoints(announce=true){
  const num=id=>parseFloat(document.getElementById(id).value);
  const st=num('attr_st_base'),dx=num('attr_dx_base'),iq=num('attr_iq_base'),ht=num('attr_ht_base');
  if([st,dx,iq,ht].some(isNaN)){updatePointsUI();return false;}

  const stCost=(st-10)*ATTR_COST.st,dxCost=(dx-10)*ATTR_COST.dx,iqCost=(iq-10)*ATTR_COST.iq,htCost=(ht-10)*ATTR_COST.ht;
  const attrTotal=stCost+dxCost+iqCost+htCost;
  const adv=sumPtsColumn('tbl_advantages'),disadv=sumPtsColumn('tbl_disadvantages'),skills=calcSkillsTotal(true);
  const total=attrTotal+adv.total+disadv.total+skills.total;
  document.getElementById('f_pointtotal').value=total;

  const startPts=num('f_startpoints');
  if(!isNaN(startPts))document.getElementById('f_unspent').value=startPts-total;

  const breakdown=document.getElementById('pointsBreakdown');
  breakdown.innerHTML=`
    <div class="breakdown-grid">
      <span>ST <small>10 pts/nivel</small></span><b>${formatPts(stCost)}</b>
      <span>DX <small>20 pts/nivel</small></span><b>${formatPts(dxCost)}</b>
      <span>IQ <small>20 pts/nivel</small></span><b>${formatPts(iqCost)}</b>
      <span>HT <small>10 pts/nivel</small></span><b>${formatPts(htCost)}</b>
      <span>Ventajas / Perks <small>${adv.count} filas</small></span><b>${formatPts(adv.total)}</b>
      <span>Desventajas / Quirks <small>${disadv.count} filas</small></span><b>${formatPts(disadv.total)}</b>
      <span>Skills <small>${skills.count} calculadas</small></span><b>${formatPts(skills.total)}</b>
      <strong>Total gastado</strong><strong>${total} pts</strong>
    </div>`;
  updatePointsUI();
  if(announce)setStatus('Puntos calculados ✓','success');
  return true;
}

function formatPts(n){return `${n>=0?'+':''}${n} pts`;}
