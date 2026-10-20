
document.querySelectorAll('table.sortable').forEach(t=>{
 const ths=[...t.tHead.rows[0].cells];
 ths.forEach((th,i)=>{th.tabIndex=0;const go=()=>{
  const asc=th.getAttribute('aria-sort')!=='ascending';
  ths.forEach(h=>h.removeAttribute('aria-sort'));th.setAttribute('aria-sort',asc?'ascending':'descending');
  const rows=[...t.tBodies[0].rows];
  const key=r=>{const c=r.cells[i];const v=c.dataset.v;if(v!==undefined&&v!==''&&!isNaN(+v))return +v;
   return (c.textContent||'').trim().toLowerCase();};
  rows.sort((a,b)=>{const x=key(a),y=key(b);
   if(typeof x==='number'&&typeof y==='number')return asc?x-y:y-x;
   if(typeof x==='number')return -1;if(typeof y==='number')return 1;
   return asc?String(x).localeCompare(y):String(y).localeCompare(x);});
  rows.forEach(r=>t.tBodies[0].appendChild(r));};
  th.addEventListener('click',go);th.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});
});
