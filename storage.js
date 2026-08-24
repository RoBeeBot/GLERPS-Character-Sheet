/* GLERPS — filas dinámicas, persistencia y export/import. */

const FIELD_IDS = [
  'f_name','f_player','f_ht','f_wt','f_sm','f_age','f_startpoints','f_unspent','f_pointtotal','f_appearance',
  'attr_st_base','attr_dx_base','attr_iq_base','attr_ht_base',
  'attr_hp_score','attr_hp_current','attr_will','attr_per','attr_fp_score','attr_fp_current',
  'f_basiclift','f_dmgthr','f_dmgsw','f_basicspeed','f_basicmove',
  'enc_none_move','enc_none_dodge','enc_light_move','enc_med_move','enc_heavy_move','enc_xheavy_move',
  'f_dr','f_tl','f_cultural','f_parry','f_block',
  'f_react_appearance','f_react_status','f_react_reputation'
];

const TABLE_COLS = {
  tbl_advantages: [
    {type:'select', w:'110px', default:'Advantage', options:[
      {value:'Advantage',label:'Ventaja'},{value:'Perk',label:'Perk'}
    ]},
    {ph:'Descripción'},
    {ph:'Pts',w:'55px',numeric:true}
  ],
  tbl_disadvantages: [
    {type:'select', w:'110px', default:'Disadvantage', options:[
      {value:'Disadvantage',label:'Desventaja'},{value:'Quirk',label:'Quirk'}
    ]},
    {ph:'Descripción'},
    {ph:'Pts',w:'55px',numeric:true}
  ],
  tbl_languages: [{ph:'Idioma'},{ph:'Nivel hablado',w:'100px'},{ph:'Nivel escrito',w:'100px'}],
  tbl_skills: [
    {type:'select', w:'105px', default:'Other', options:[
      {value:'Combat',label:'Combate'},{value:'Physical',label:'Física'},{value:'Mental',label:'Mental'},
      {value:'Social',label:'Social'},{value:'Knowledge',label:'Conocimiento'},{value:'Craft',label:'Oficio'},
      {value:'Survival',label:'Supervivencia'},{value:'Other',label:'Otra'}
    ]},
    {ph:'Habilidad'},
    {ph:'Nivel',w:'50px',numeric:true},
    {ph:'Rel.',w:'45px',title:'Nivel relativo al atributo, ej: 1, 0, -2',numeric:true},
    {type:'select',w:'72px',default:'A',options:[
      {value:'E',label:'Fácil'},{value:'A',label:'Media'},{value:'H',label:'Difícil'}
    ]},
    {ph:'Pts',w:'50px',readonly:true,numeric:true}
  ],
  tbl_equipment: [{ph:'Ítem'},{ph:'Costo',w:'75px'},{ph:'Peso',w:'65px'},{ph:'Notas'}]
};
const TABLE_IDS = Object.keys(TABLE_COLS);

let currentCharId = null;
let historyBeforeApply = true;

function defaultRows(tid){
  return tid === 'tbl_equipment' ? 2 : 2;
}

function normalizeRowValues(tbodyId, values){
  if(!values) return values;
  // Compatibility with the previous GLERPS/GORPS format.
  if(tbodyId === 'tbl_advantages' || tbodyId === 'tbl_disadvantages'){
    if(values.length === 2) return [tbodyId === 'tbl_advantages' ? 'Advantage' : 'Disadvantage', values[0], values[1]];
  }
  if(tbodyId === 'tbl_skills' && values.length === 5){
    return ['Other', values[0], values[1], values[2], values[3], values[4]];
  }
  return values;
}

function addRow(tbodyId, cols, values){
  const tbody = document.getElementById(tbodyId);
  if(!tbody) return null;
  const normalized = normalizeRowValues(tbodyId, values);
  const tr = document.createElement('tr');
  cols.forEach((c,i)=>{
    const td = document.createElement('td');
    if(c.w) td.style.width = c.w;
    let el;
    if(c.type === 'select'){
      el = document.createElement('select');
      el.setAttribute('aria-label', c.ariaLabel || 'Tipo');
      (c.options || []).forEach(opt=>{
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        el.appendChild(o);
      });
      el.value = normalized && normalized[i] !== undefined ? normalized[i] : (c.default || c.options[0]?.value || '');
    } else {
      el = document.createElement('input');
      el.placeholder = c.ph || '';
      if(c.title) el.title = c.title;
      if(c.readonly) el.readOnly = true;
      if(c.numeric) { el.type='number'; el.step='1'; }
      if(normalized && normalized[i] !== undefined) el.value = normalized[i];
    }
    if(c.readonly) el.classList.add('calculated-input');
    td.appendChild(el);
    tr.appendChild(td);
  });

  const tdAction = document.createElement('td');
  tdAction.className = 'row-actions';
  const btn = document.createElement('button');
  btn.type='button';
  btn.className='icon-btn delete-row';
  btn.textContent='×';
  btn.setAttribute('aria-label','Eliminar fila');
  btn.title='Eliminar';
  btn.onclick=()=>{
    const snapshot = typeof collectData === 'function' ? collectData() : null;
    tr.remove();
    if(typeof pushHistory === 'function' && snapshot) pushHistory(snapshot);
    markDirty();
    updatePointsUI();
  };
  tdAction.appendChild(btn);
  tr.appendChild(tdAction);
  tbody.appendChild(tr);
  attachRowListeners(tr);
  return tr;
}

function attachRowListeners(tr){
  // Los cambios se capturan mediante delegación en #sheet.
}

function collectData(){
  const data = {version:2, app:'GLERPS', fields:{}, tables:{}};
  FIELD_IDS.forEach(id=>{
    const el=document.getElementById(id);
    data.fields[id]=el ? el.value : '';
  });
  TABLE_IDS.forEach(tid=>{
    const tbody=document.getElementById(tid);
    data.tables[tid]=[];
    if(!tbody) return;
    tbody.querySelectorAll('tr').forEach(tr=>{
      data.tables[tid].push([...tr.querySelectorAll('input, select')].map(el=>el.value));
    });
  });
  return data;
}

function applyData(data){
  const safe = data && typeof data === 'object' ? data : {};
  FIELD_IDS.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value=safe.fields && safe.fields[id] !== undefined ? safe.fields[id] : '';
  });
  TABLE_IDS.forEach(tid=>{
    const tbody=document.getElementById(tid);
    tbody.innerHTML='';
    const rows=(safe.tables && Array.isArray(safe.tables[tid])) ? safe.tables[tid] : [];
    if(rows.length===0){
      for(let i=0;i<defaultRows(tid);i++) addRow(tid,TABLE_COLS[tid]);
    } else {
      rows.forEach(vals=>addRow(tid,TABLE_COLS[tid],vals));
    }
  });
  if(typeof calcSecondary === 'function') calcSecondary(false);
  if(typeof calcPoints === 'function') calcPoints(false);
  updatePointsUI();
}

function setStatus(msg, type='info'){
  const el=document.getElementById('statusMsg');
  if(!el) return;
  el.textContent=msg;
  el.className='status ' + type;
  clearTimeout(window.__statusTimer);
  window.__statusTimer=setTimeout(()=>{el.textContent='';el.className='status';},3000);
}

function slugify(str){
  return (str||'sin_nombre').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'sin_nombre';
}

function hasMeaningfulData(){
  const d=collectData();
  return Object.values(d.fields).some(v=>String(v).trim()!=='') ||
    Object.values(d.tables).some(rows=>rows.some(row=>row.some(v=>String(v).trim()!=='')));
}

async function getIndex(){
  try{
    const res=await window.storage.get('characters_index',false);
    const parsed=res ? JSON.parse(res.value) : [];
    return Array.isArray(parsed) ? parsed : [];
  }catch(e){ return []; }
}

async function refreshCharList(){
  const select=document.getElementById('charSelect');
  if(!select) return;
  select.innerHTML='<option value="">— personajes guardados —</option>';
  const index=(await getIndex()).sort((a,b)=>String(a.name).localeCompare(String(b.name),'es'));
  index.forEach(entry=>{
    const opt=document.createElement('option');
    opt.value=entry.id; opt.textContent=entry.name || 'Sin nombre';
    if(entry.id===currentCharId) opt.selected=true;
    select.appendChild(opt);
  });
}

async function saveCharacter(silent=false){
  const data=collectData();
  const name=(data.fields.f_name||'Sin nombre').trim()||'Sin nombre';
  if(!currentCharId) currentCharId='char_'+slugify(name)+'_'+Date.now();
  try{
    await window.storage.set('character:'+currentCharId,JSON.stringify(data),false);
    let index=await getIndex();
    const existing=index.find(e=>e.id===currentCharId);
    if(existing) existing.name=name; else index.push({id:currentCharId,name});
    await window.storage.set('characters_index',JSON.stringify(index),false);
    await refreshCharList();
    window.__dirty=false;
    try{ localStorage.removeItem('glerps_session_draft'); }catch(e){}
    updateDirtyIndicator();
    if(!silent) setStatus('Personaje guardado ✓','success');
  }catch(e){
    setStatus('No se pudo guardar','error');
    console.error(e);
  }
}

async function loadSelected(){
  const id=document.getElementById('charSelect').value;
  if(!id) return;
  try{
    const res=await window.storage.get('character:'+id,false);
    if(!res) throw new Error('Personaje no encontrado');
    if(window.__dirty && !confirm('Tenés cambios sin guardar. ¿Cargar el personaje de todas formas?')) {
      document.getElementById('charSelect').value=currentCharId||'';
      return;
    }
    pushHistory(collectData());
    applyData(JSON.parse(res.value));
    currentCharId=id;
    window.__dirty=false;
    updateDirtyIndicator();
    setStatus('Personaje cargado ✓','success');
  }catch(e){setStatus('No se pudo cargar','error');console.error(e);}
}

async function deleteCharacter(){
  const id=document.getElementById('charSelect').value;
  if(!id){setStatus('Elegí un personaje para borrar');return;}
  const index=await getIndex();
  const item=index.find(e=>e.id===id);
  if(!confirm(`¿Borrar "${item?.name||'este personaje'}"? Esta acción no se puede deshacer.`)) return;
  try{
    await window.storage.delete('character:'+id,false);
    await window.storage.set('characters_index',JSON.stringify(index.filter(e=>e.id!==id)),false);
    if(currentCharId===id){currentCharId=null;applyData({fields:{},tables:{}});}
    await refreshCharList();
    setStatus('Personaje borrado','success');
  }catch(e){setStatus('Error al borrar','error');console.error(e);}
}

function newCharacter(){
  if(hasMeaningfulData() && !confirm('¿Crear un personaje nuevo? Los cambios no guardados de la hoja actual se perderán.')) return;
  pushHistory(collectData());
  applyData({fields:{},tables:{}});
  currentCharId=null;
  document.getElementById('charSelect').value='';
  window.__dirty=false;
  updateDirtyIndicator();
  setStatus('Hoja limpia, lista para un nuevo personaje','success');
}

function duplicateCharacter(){
  const data=collectData();
  if(!hasMeaningfulData()){setStatus('No hay un personaje para duplicar');return;}
  const name=(data.fields.f_name||'Sin nombre').trim()||'Sin nombre';
  data.fields.f_name=name+' Copy';
  currentCharId=null;
  applyData(data);
  window.__dirty=true;
  updateDirtyIndicator();
  setStatus('Copia creada. Guardala para conservarla.','success');
}

function exportJSON(){
  const data=collectData();
  const name=data.fields.f_name||'personaje';
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=slugify(name)+'_glerps.json';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  setStatus('JSON GLERPS exportado ✓','success');
}

function validateImportedData(data){
  if(!data || typeof data!=='object') return false;
  if(data.fields && typeof data.fields!=='object') return false;
  if(data.tables && typeof data.tables!=='object') return false;
  return true;
}

function importJSON(event){
  const file=event.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!validateImportedData(data)) throw new Error('Estructura inválida');
      if(window.__dirty && !confirm('Tenés cambios sin guardar. ¿Reemplazar la hoja actual?')) return;
      pushHistory(collectData());
      applyData(data);
      currentCharId=null;
      window.__dirty=true;
      updateDirtyIndicator();
      setStatus('JSON importado ✓ — guardá para conservarlo','success');
    }catch(err){setStatus('El archivo no contiene un personaje GLERPS válido','error');}
  };
  reader.readAsText(file);
  event.target.value='';
}

window.addEventListener('beforeunload',e=>{
  if(window.__dirty){e.preventDefault();e.returnValue='';}
});
