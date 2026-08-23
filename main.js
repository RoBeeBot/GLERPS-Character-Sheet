/* ============================================================
   main.js — Inicialización de la hoja al cargar la página.
   ============================================================ */

document.addEventListener('DOMContentLoaded', ()=>{
  // Filas iniciales vacías en cada tabla dinámica
  TABLE_IDS.forEach(id=>{
    const initialRows = id === 'tbl_equipment' ? 2 : 3;
    for(let i=0;i<initialRows;i++) addRow(id, TABLE_COLS[id]);
  });

  initEquipmentReference();
  refreshCharList();
});
