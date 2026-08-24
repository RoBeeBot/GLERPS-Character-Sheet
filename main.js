/* GLERPS — interacción de la hoja. */
window.__dirty=false;
window.__history=[];
window.__future=[];
window.__historyLock=false;
window.__lastSnapshot=null;

function snapshotKey(data){return JSON.stringify(data);}
function pushHistory(data){
  if(!data || window.__historyLock)return;
  const key=snapshotKey(data);
  const last=window.__history[window.__history.length-1];
  if(last && snapshotKey(last)===key)return;
  window.__history.push(JSON.parse(key));
  if(window.__history.length>50)window.__history.shift();
  window.__future=[];
  updateHistoryButtons();
}
function undo(){
  if(!window.__history.length)return;
  const current=collectData();
  const previous=window.__history.pop();
  window.__future.push(current);
  window.__historyLock=true;
  applyData(previous);
  window.__historyLock=false;
  markDirty(); updateHistoryButtons();
  setStatus('Cambio deshecho ↶','success');
}
function redo(){
  if(!window.__future.length)return;
  const current=collectData();
  const next=window.__future.pop();
  window.__history.push(current);
  window.__historyLock=true;
  applyData(next);
  window.__historyLock=false;
  markDirty(); updateHistoryButtons();
  setStatus('Cambio rehecho ↷','success');
}
function updateHistoryButtons(){
  const u=document.getElementById('undoBtn'),r=document.getElementById('redoBtn');
  if(u)u.disabled=!window.__history.length;
  if(r)r.disabled=!window.__future.length;
}
function markDirty(){
  window.__dirty=true;
  updateDirtyIndicator();
  updatePointsUI();
}
function updateDirtyIndicator(){
  const el=document.getElementById('statusMsg');
  if(window.__dirty && el && !el.textContent) {
    el.textContent='Cambios sin guardar';
    el.className='status dirty';
  }
}
function handleDataInput(event){
  if(window.__historyLock)return;
  const target=event?.target;
  if(!target || !target.matches('input, select'))return;
  const current=collectData();
  if(window.__lastSnapshot && snapshotKey(window.__lastSnapshot)!==snapshotKey(current)){
    pushHistory(window.__lastSnapshot);
  }
  window.__lastSnapshot=current;
  markDirty();
  if(['attr_st_base','attr_dx_base','attr_iq_base','attr_ht_base'].includes(target.id)){
    calcSecondary(false);
    calcPoints(false);
  } else if(target.id==='f_startpoints'){
    calcPoints(false);
  } else if(target.closest('#tbl_advantages,#tbl_disadvantages,#tbl_skills')){
    calcPoints(false);
  }
}
function attachGlobalListeners(){
  const sheet=document.getElementById('sheet');
  sheet?.addEventListener('input',handleDataInput);
  sheet?.addEventListener('change',handleDataInput);
  window.addEventListener('keydown',e=>{
    const mod=e.ctrlKey||e.metaKey;
    if(mod && e.key.toLowerCase()==='s'){
      e.preventDefault(); saveCharacter();
    } else if(mod && e.key.toLowerCase()==='z' && !e.shiftKey){
      e.preventDefault(); undo();
    } else if(mod && ((e.key.toLowerCase()==='z'&&e.shiftKey)||e.key.toLowerCase()==='y')){
      e.preventDefault(); redo();
    } else if(e.key==='Escape'){
      closeGuide(); closeDice();
    }
  });
}
function updatePointsUI(){
  const budget=parseFloat(document.getElementById('f_startpoints')?.value);
  const spent=parseFloat(document.getElementById('f_pointtotal')?.value);
  const remaining=!isNaN(budget)&&!isNaN(spent)?budget-spent:NaN;
  document.getElementById('pointsBudget').textContent=isNaN(budget)?'—':budget;
  document.getElementById('pointsSpent').textContent=isNaN(spent)?'0':spent;
  document.getElementById('pointsRemaining').textContent=isNaN(remaining)?'—':remaining;
  const status=document.getElementById('pointsStatus');
  if(isNaN(budget)){status.textContent='Definí un presupuesto';status.className='points-status neutral';}
  else if(isNaN(spent)){status.textContent='Completá los atributos';status.className='points-status neutral';}
  else if(remaining<0){status.textContent=`⚠ ${Math.abs(remaining)} pts excedidos`;status.className='points-status invalid';}
  else{status.textContent='✓ Dentro del presupuesto';status.className='points-status valid';}
  if(!isNaN(remaining))document.getElementById('pointsRemaining').classList.toggle('negative',remaining<0);
}
function openGuide(){document.getElementById('guideModal').hidden=false;}
function closeGuide(){document.getElementById('guideModal').hidden=true;}
function openDice(){document.getElementById('diceModal').hidden=false;document.getElementById('diceCount').focus();}
function closeDice(){document.getElementById('diceModal').hidden=true;}
const diceHistory=[];
function rollDice(){
  const count=Math.min(20,Math.max(1,parseInt(document.getElementById('diceCount').value)||1));
  const sides=parseInt(document.getElementById('diceSides').value)||6;
  const modifier=parseInt(document.getElementById('diceModifier').value)||0;
  const rolls=Array.from({length:count},()=>Math.floor(Math.random()*sides)+1);
  const total=rolls.reduce((a,b)=>a+b,0)+modifier;
  document.getElementById('diceResult').textContent=total;
  diceHistory.unshift({label:`${count}d${sides}${modifier?` ${modifier>0?'+':''}${modifier}`:''}`,rolls,total});
  if(diceHistory.length>10)diceHistory.pop();
  document.getElementById('diceHistory').innerHTML=diceHistory.map(x=>
    `<div><b>${x.label}</b> → ${x.total} <small>(${x.rolls.join(', ')})</small></div>`).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  TABLE_IDS.forEach(id=>{
    for(let i=0;i<defaultRows(id);i++)addRow(id,TABLE_COLS[id]);
  });
  attachGlobalListeners();
  initEquipmentReference();
  refreshCharList();
  window.__lastSnapshot=collectData();
  updateHistoryButtons();
  updatePointsUI();
  // Recovery snapshot from the current session when available.
  try{
    const recovered=localStorage.getItem('glerps_session_draft');
    if(recovered){
      const data=JSON.parse(recovered);
      if(validateImportedData(data) && Object.values(data.fields||{}).some(Boolean)){
        applyData(data);
        window.__dirty=true;
        setStatus('Se recuperó un borrador de la sesión ✓','success');
      }
    }
  }catch(e){}
  setInterval(()=>{
    try{
      localStorage.setItem('glerps_session_draft',JSON.stringify(collectData()));
    }catch(e){}
  },3000);
  document.addEventListener('click',e=>{
    if(e.target.classList.contains('modal-backdrop')){
      e.target.hidden=true;
    }
  });
});
