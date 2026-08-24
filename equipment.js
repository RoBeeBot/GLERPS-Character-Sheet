/* ============================================================
   equipment.js — Panel de referencia rápida de armas y armaduras
   (datos de data.js) con pestañas, buscador y botón para
   agregar el ítem elegido a la tabla de Equipment del personaje.
   ============================================================ */

const REF_CATEGORIES = [
  {
    id: 'armor', label: 'Armadura', data: ARMOR_TABLE,
    headers: ['Nombre','DR','Costo','Peso'],
    row: it => [it.name, it.dr, '$'+it.cost, it.weight+' lb'],
    addValues: it => [it.name, '$'+it.cost, it.weight+' lb', 'DR '+it.dr]
  },
  {
    id: 'shields', label: 'Escudos', data: SHIELD_TABLE,
    headers: ['Nombre','DB','Costo','Peso'],
    row: it => [it.name, it.db, '$'+it.cost, it.weight+' lb'],
    addValues: it => [it.name, '$'+it.cost, it.weight+' lb', 'DB '+it.db]
  },
  {
    id: 'melee', label: 'Cuerpo a cuerpo', data: MELEE_WEAPONS,
    headers: ['Arma','Habilidad','Daño','ST','Costo','Peso'],
    row: it => [it.weapon, it.skill, it.damage, it.st, '$'+it.cost, it.weight+' lb'],
    addValues: it => [it.weapon, '$'+it.cost, it.weight+' lb', it.damage+' · ST '+it.st]
  },
  {
    id: 'ranged', label: 'Arcos / Arrojadizas', data: RANGED_MUSCLE,
    headers: ['Arma','Habilidad','Daño','Alcance','ST','Costo'],
    row: it => [it.weapon, it.skill, it.damage, it.range, it.st, '$'+it.cost],
    addValues: it => [it.weapon, '$'+it.cost, (it.weight||'')+' lb', it.damage+' · Alcance '+it.range]
  },
  {
    id: 'firearms', label: 'Armas de fuego', data: FIREARMS,
    headers: ['Arma','Daño','Alcance','RoF','Disparos','Costo'],
    row: it => [it.weapon, it.damage, it.range, it.rof, it.shots, '$'+it.cost],
    addValues: it => [it.weapon, '$'+it.cost, (it.weight||'')+' lb', it.damage+' · RoF '+it.rof]
  }
];

let currentRefCategory = 'armor';

function escapeHTML(value){
  return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function initEquipmentReference(){
  const tabsEl = document.getElementById('refTabs');
  tabsEl.innerHTML = '';
  REF_CATEGORIES.forEach(cat=>{
    const btn = document.createElement('button');
    btn.textContent = cat.label;
    btn.className = cat.id === currentRefCategory ? 'active' : '';
    btn.onclick = ()=>{
      currentRefCategory = cat.id;
      document.getElementById('refSearch').value = '';
      renderRefTabs();
      renderRefTable();
    };
    tabsEl.appendChild(btn);
  });
  document.getElementById('refSearch').addEventListener('input', renderRefTable);
  renderRefTable();
}

function renderRefTabs(){
  document.querySelectorAll('#refTabs button').forEach((btn, i)=>{
    btn.className = REF_CATEGORIES[i].id === currentRefCategory ? 'active' : '';
  });
}

function renderRefTable(){
  const cat = REF_CATEGORIES.find(c=>c.id===currentRefCategory);
  const filter = (document.getElementById('refSearch').value || '').toLowerCase().trim();
  const container = document.getElementById('refTableContainer');
  const countEl = document.getElementById('refCount');

  const items = [...cat.data].sort((a,b)=>String(a.weapon||a.name).localeCompare(String(b.weapon||b.name),'es')).filter(it=>{
    if(!filter) return true;
    return JSON.stringify(it).toLowerCase().includes(filter);
  });

  if(countEl) countEl.textContent = `${items.length} resultado${items.length===1?'':'s'}`;

  if(items.length === 0){
    container.innerHTML = '<div class="ref-empty">Sin resultados para esa búsqueda.</div>';
    return;
  }

  let html = '<div class="table-scroll"><table class="ref-table"><tr>';
  cat.headers.forEach(h=> html += `<th>${h}</th>`);
  html += '<th></th></tr>';

  items.forEach((it, idx)=>{
    const cells = cat.row(it);
    html += '<tr>';
    cells.forEach(c=> html += `<td>${escapeHTML(c)}</td>`);
    html += `<td><button type="button" class="add-btn" data-idx="${idx}">+ agregar</button></td>`;
    html += '</tr>';
  });
  html += '</table></div>';
  container.innerHTML = html;

  container.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const it = items[parseInt(btn.dataset.idx, 10)];
      addRow('tbl_equipment', TABLE_COLS.tbl_equipment, cat.addValues(it));
      setStatus(`"${it.weapon || it.name}" agregado al equipo ✓`);
    });
  });
}
