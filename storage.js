/* ============================================================
   storage.js — Filas dinámicas de tablas + persistencia de
   personajes (window.storage) + exportar/importar JSON.
   ============================================================ */

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
  tbl_advantages: [{ph:'Descripción'},{ph:'Pts',w:'40px'}],
  tbl_disadvantages: [{ph:'Descripción'},{ph:'Pts',w:'40px'}],
  tbl_languages: [{ph:'Idioma'},{ph:'nivel',w:'70px'},{ph:'nivel',w:'70px'}],
  tbl_skills: [
    {ph:'Habilidad'},
    {ph:'Nivel', w:'46px'},
    {ph:'Rel.', w:'42px', title:'Nivel relativo al atributo, ej: 1, 0, -2'},
    {type:'select', w:'62px', default:'A', options:[
      {value:'E', label:'Fácil'},
      {value:'A', label:'Media'},
      {value:'H', label:'Difícil'}
    ]},
    {ph:'Pts', w:'40px', readonly:true}
  ],
  tbl_equipment: [{ph:'Ítem'},{ph:'Costo',w:'70px'},{ph:'Peso',w:'60px'},{ph:'Notas'}]
};
const TABLE_IDS = Object.keys(TABLE_COLS);

let currentCharId = null;

function addRow(tbodyId, cols, values){
  const tbody = document.getElementById(tbodyId);
  const tr = document.createElement('tr');
  cols.forEach((c,i)=>{
    const td = document.createElement('td');
    if(c.w) td.style.width = c.w;
    let el;
    if(c.type === 'select'){
      el = document.createElement('select');
      el.style.width = '100%';
      el.style.fontFamily = 'inherit';
      el.style.fontSize = '12px';
      (c.options || []).forEach(opt=>{
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        el.appendChild(o);
      });
      el.value = (values && values[i] !== undefined) ? values[i] : (c.default || (c.options[0] && c.options[0].value) || '');
    } else {
      el = document.createElement('input');
      el.placeholder = c.ph || '';
      if(c.title) el.title = c.title;
      if(c.readonly) el.readOnly = true;
      if(values && values[i] !== undefined) el.value = values[i];
    }
    td.appendChild(el);
    tr.appendChild(td);
  });
  const tdAction = document.createElement('td');
  tdAction.className = 'row-actions';
  const btn = document.createElement('button');
  btn.innerHTML = '✕';
  btn.onclick = ()=> tr.remove();
  tdAction.appendChild(btn);
  tr.appendChild(tdAction);
  tbody.appendChild(tr);
  return tr;
}

function collectData(){
  const data = { fields:{}, tables:{} };
  FIELD_IDS.forEach(id=>{
    const el = document.getElementById(id);
    data.fields[id] = el ? el.value : '';
  });
  TABLE_IDS.forEach(tid=>{
    const tbody = document.getElementById(tid);
    const rows = [];
    tbody.querySelectorAll('tr').forEach(tr=>{
      const vals = [];
      tr.querySelectorAll('input, select').forEach(el=>vals.push(el.value));
      rows.push(vals);
    });
    data.tables[tid] = rows;
  });
  return data;
}

function applyData(data){
  FIELD_IDS.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = (data.fields && data.fields[id]) || '';
  });
  TABLE_IDS.forEach(tid=>{
    const tbody = document.getElementById(tid);
    tbody.innerHTML = '';
    const rows = (data.tables && data.tables[tid]) || [];
    if(rows.length === 0){
      for(let i=0;i<3;i++) addRow(tid, TABLE_COLS[tid]);
    } else {
      rows.forEach(vals => addRow(tid, TABLE_COLS[tid], vals));
    }
  });
  const breakdown = document.getElementById('pointsBreakdown');
  if(breakdown) breakdown.innerHTML = '';
}

function setStatus(msg){
  const el = document.getElementById('statusMsg');
  if(!el) return;
  el.textContent = msg;
  setTimeout(()=>{ if(el.textContent===msg) el.textContent=''; }, 3000);
}

function slugify(str){
  return (str||'sin_nombre').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'sin_nombre';
}

async function refreshCharList(){
  const select = document.getElementById('charSelect');
  select.innerHTML = '<option value="">-- personajes guardados --</option>';
  try{
    const listResult = await window.storage.get('characters_index', false);
    const index = listResult ? JSON.parse(listResult.value) : [];
    index.forEach(entry=>{
      const opt = document.createElement('option');
      opt.value = entry.id;
      opt.textContent = entry.name;
      if(entry.id === currentCharId) opt.selected = true;
      select.appendChild(opt);
    });
  }catch(e){
    // todavía no hay índice guardado
  }
}

async function saveCharacter(){
  const data = collectData();
  const name = data.fields['f_name'] || 'Sin nombre';
  if(!currentCharId){
    currentCharId = 'char_' + slugify(name) + '_' + Date.now();
  }
  try{
    await window.storage.set('character:' + currentCharId, JSON.stringify(data), false);
    let index = [];
    try{
      const idxRes = await window.storage.get('characters_index', false);
      index = idxRes ? JSON.parse(idxRes.value) : [];
    }catch(e){ index = []; }
    const existing = index.find(e=>e.id===currentCharId);
    if(existing){ existing.name = name; }
    else{ index.push({id: currentCharId, name: name}); }
    await window.storage.set('characters_index', JSON.stringify(index), false);
    await refreshCharList();
    setStatus('Personaje guardado ✓');
  }catch(e){
    setStatus('Error al guardar');
    console.error(e);
  }
}

async function loadSelected(){
  const select = document.getElementById('charSelect');
  const id = select.value;
  if(!id) return;
  try{
    const res = await window.storage.get('character:' + id, false);
    if(res){
      applyData(JSON.parse(res.value));
      currentCharId = id;
      setStatus('Personaje cargado ✓');
    }
  }catch(e){
    setStatus('No se pudo cargar');
    console.error(e);
  }
}

async function deleteCharacter(){
  const select = document.getElementById('charSelect');
  const id = select.value;
  if(!id){ setStatus('Elegí un personaje para borrar'); return; }
  if(!confirm('¿Borrar este personaje guardado? Esta acción no se puede deshacer.')) return;
  try{
    await window.storage.delete('character:' + id, false);
    let index = [];
    try{
      const idxRes = await window.storage.get('characters_index', false);
      index = idxRes ? JSON.parse(idxRes.value) : [];
    }catch(e){ index = []; }
    index = index.filter(e=>e.id!==id);
    await window.storage.set('characters_index', JSON.stringify(index), false);
    if(currentCharId === id) currentCharId = null;
    await refreshCharList();
    setStatus('Personaje borrado');
  }catch(e){
    setStatus('Error al borrar');
    console.error(e);
  }
}

function newCharacter(){
  if(!confirm('¿Crear un personaje nuevo? Se limpiará la hoja actual (guardá antes si no querés perder cambios).')) return;
  applyData({fields:{}, tables:{}});
  currentCharId = null;
  document.getElementById('charSelect').value = '';
  setStatus('Hoja limpia, lista para un nuevo personaje');
}

function exportJSON(){
  const data = collectData();
  const name = data.fields['f_name'] || 'personaje';
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = slugify(name) + '_gurps.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus('JSON exportado ✓');
}

function importJSON(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      applyData(data);
      currentCharId = null;
      setStatus('JSON importado ✓ (guardá para agregarlo a la lista)');
    }catch(err){
      setStatus('Archivo inválido');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
