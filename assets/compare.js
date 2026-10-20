
(function(){
const D=window.GALLERY_DATA, arms=Object.keys(D.arms).sort();
const selA=document.getElementById('armA'), selB=document.getElementById('armB');
const rowsEl=document.getElementById('figs'), tbl=document.getElementById('diff');
const head=document.getElementById('pairhead');
let mode='side';
arms.forEach(a=>{[selA,selB].forEach(s=>{const o=document.createElement('option');o.value=a;o.textContent=a;s.appendChild(o);});});
const q=new URLSearchParams(location.hash.slice(1));
let b=q.get('b')||arms.find(a=>a!==(D.reference||''))||arms[0];
let a=q.get('a')||(D.arms[b]&&D.arms[b].reference_arm)||D.reference||arms[0];
if(!D.arms[a])a=arms[0]; if(!D.arms[b])b=arms[Math.min(1,arms.length-1)];
selA.value=a; selB.value=b;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,f)=>{if(v==null||v===''||(typeof v==='number'&&!isFinite(v)))return '—';
 if(typeof v!=='number')return esc(v);
 if(f==='d')return String(Math.round(v)); if(f.endsWith(',.0f'))return (f[0]==='+'&&v>=0?'+':'')+Math.round(v).toLocaleString('en-US'); if(f==='.0%')return (100*v).toFixed(0)+'%';
 if(f===',.0f')return Math.round(v).toLocaleString('en-US');
 const m=f.match(/(\+?)\.(\d)f/); if(m){const s=v.toFixed(+m[2]);return (m[1]&&v>=0?'+':'')+s;} return String(v);};
function badges(fl){return (fl||[]).map(f=>`<span class="badge ${f.level}" title="${esc(f.text)}">${f.level==='serious'?'!! ':f.level==='caution'?'! ':'i '}${esc(f.code)}</span>`).join('');}
function render(){
 a=selA.value;b=selB.value;history.replaceState(null,'','#a='+encodeURIComponent(a)+'&b='+encodeURIComponent(b));
 const A=D.arms[a],B=D.arms[b];
 const fa=(A.card.fingerprint||{}).sha,fb=(B.card.fingerprint||{}).sha;
 head.innerHTML=`<p class="note">A <b>${esc(a)}</b> ${badges(A.flags)}<br>B <b>${esc(b)}</b> ${badges(B.flags)}</p>`+
  `<p class="note">${fa&&fa===fb?'Same domain fingerprint ('+esc(fa)+') — the two are on one mesh and bed.':'⚠️ Different fingerprints ('+esc(fa)+' vs '+esc(fb)+') — not the same model; do not difference.'}`+
  ` HWM numbers: estimator ${esc(A.metrics.hwm_estimator)} / ${esc(B.metrics.hwm_estimator)}, radius ${esc(A.metrics.hwm_radius_m)} / ${esc(B.metrics.hwm_radius_m)} m. A pooled difference is not a paired test — use scripts/paired_hwm_bootstrap.py.</p>`;
 let h='<thead><tr><th>metric</th><th class="num">A</th><th class="num">B</th><th class="num">B − A</th></tr></thead><tbody>';
 D.headline.forEach(([k,l,f,better])=>{const x=A.metrics[k],y=B.metrics[k];
  let d='',cls='';if(typeof x==='number'&&typeof y==='number'&&isFinite(x)&&isFinite(y)){const dv=y-x;
   d=fmt(dv,f==='.0%'?'.0%':(f==='d'?'d':'+'+f.replace('+','')));
   if(better==='low')cls=dv<0?'better':dv>0?'worse':''; else if(better==='high')cls=dv>0?'better':dv<0?'worse':'';
   else if(better==='zero')cls=Math.abs(y)<Math.abs(x)?'better':Math.abs(y)>Math.abs(x)?'worse':'';}
  h+=`<tr><td>${esc(l)} <span class="note">${esc(k)}</span></td><td class="num">${fmt(x,f)}</td><td class="num">${fmt(y,f)}</td><td class="num diff ${cls}">${d}</td></tr>`;});
 D.labels.forEach(k=>{const x=(A.card.labels||{})[k],y=(B.card.labels||{})[k];
  h+=`<tr><td>${esc(k)}</td><td class="lbl">${esc(x)}</td><td class="lbl">${esc(y)}</td><td class="lbl">${String(x)===String(y)?'':'differs'}</td></tr>`;});
 tbl.innerHTML=h+'</tbody>';
 const fA=Object.fromEntries((A.figures||[]).map(f=>[f.key,f])),fB=Object.fromEntries((B.figures||[]).map(f=>[f.key,f]));
 let out='';
 D.fig_order.forEach(k=>{const x=fA[k],y=fB[k];if(!x&&!y)return;const t=(x||y).title;
  const side=(f,arm,lab)=>{if(!f)return `<div class="side"><h4>${lab} · ${esc(arm)}</h4><div class="skip">not drawn</div></div>`;
   if(!f.file)return `<div class="side"><h4>${lab} · ${esc(arm)}</h4><div class="skip">${esc(f.skipped||f.error||'not drawn')}</div></div>`;
   return `<div class="side"><h4>${lab} · ${esc(arm)}</h4><a href="${esc(D.arms[arm].slug)}/${esc(f.file)}"><img loading="lazy" src="${esc(D.arms[arm].slug)}/${esc(f.file)}" alt="${esc(t)} — ${esc(arm)}"></a></div>`;};
  if(mode==='side'||!(x&&x.file&&y&&y.file)){
   out+=`<figure><h3>${esc(t)}</h3><div class="pair">${side(x,a,'A')}${side(y,b,'B')}</div><figcaption>${esc((y||x).caption||'')}</figcaption></figure>`;
  }else{
   out+=`<figure><h3>${esc(t)}</h3><div class="pair one"><div class="side"><h4 class="swaplab">A · ${esc(a)} — click the image to swap</h4><img class="swap" data-a="${esc(D.arms[a].slug)}/${esc(x.file)}" data-b="${esc(D.arms[b].slug)}/${esc(y.file)}" data-la="A · ${esc(a)}" data-lb="B · ${esc(b)}" src="${esc(D.arms[a].slug)}/${esc(x.file)}" alt="${esc(t)}" tabindex="0"></div></div><figcaption>${esc(y.caption||'')}</figcaption></figure>`;}
 });
 rowsEl.innerHTML=out;
 rowsEl.querySelectorAll('img.swap').forEach(im=>{const sw=()=>{const onA=im.getAttribute('src')===im.dataset.a;
  im.src=onA?im.dataset.b:im.dataset.a;im.parentNode.querySelector('.swaplab').textContent=(onA?im.dataset.lb:im.dataset.la)+' — click the image to swap';};
  im.addEventListener('click',sw);im.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sw();}});});
}
selA.addEventListener('change',render);selB.addEventListener('change',render);
document.getElementById('swapAB').addEventListener('click',()=>{const t=selA.value;selA.value=selB.value;selB.value=t;render();});
document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;
 document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',x===btn));render();}));
render();
})();
