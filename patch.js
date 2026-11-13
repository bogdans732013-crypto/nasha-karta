const frMk={};
const frIcon=(i,u,fresh)=>L.divIcon({className:'',iconSize:[48,48],iconAnchor:[24,24],html:'<div class="dot me" style="border-color:#e8a33a;color:#e8a33a;opacity:'+(fresh?1:.55)+';'+(i.a?'background-image:url('+i.a+')':'')+'">'+(i.a?'':svg(IC.user))+'</div><span class="lb">'+esc(i.n||'Друг')+' · '+ago(u.t)+'</span>'});
function drawFr(){
  const seen=new Set();
  Object.entries(fr).forEach(([id,u])=>{
    if(id===S.uid||!u.la)return;
    seen.add(id);
    const i=frI[id]||{},fresh=Date.now()-u.t<ONLINE;
    const a=i.a||'',key=a.length+a.slice(-24)+'|'+(i.n||'')+'|'+fresh+'|'+ago(u.t);
    let m=frMk[id];
    if(!m){
      m=L.marker([u.la,u.lo],{icon:frIcon(i,u,fresh),zIndexOffset:800}).on('click',()=>{const o=others().find(q=>q.id===id);if(o)openPerson(o)}).addTo(frL);
      m._k=key;frMk[id]=m;
    }else{
      m.setLatLng([u.la,u.lo]);
      if(m._k!==key){m.setIcon(frIcon(i,u,fresh));m._k=key}
    }
  });
  Object.keys(frMk).forEach(id=>{if(!seen.has(id)){frL.removeLayer(frMk[id]);delete frMk[id]}});
  if(typeof ps!=='undefined'&&!ps.hidden)drawPeople();
}
frL.clearLayers();drawFr();
/* ===== скретч-карта (туман) + спутник прячется при сильном отдалении ===== */
(function(){try{
const LAT=0.00018,LNG=0.00028,R=35;
const keys=new Set(),pts=[];
let dirty=false,on=true,lastP=null,raf=0;
const addKey=(i,j)=>{const k=i+','+j;if(keys.has(k))return false;keys.add(k);pts.push([i*LAT,j*LNG]);return true};
try{JSON.parse(localStorage.getItem('scratch1')||'[]').forEach(k=>{const a=k.split(',');addKey(+a[0],+a[1])})}catch(e){}
try{on=localStorage.getItem('scratchOn')!=='0'}catch(e){}
const add=(la,lo)=>{if(addKey(Math.round(la/LAT),Math.round(lo/LNG)))dirty=true};
const save=()=>{try{localStorage.setItem('scratch1',JSON.stringify([...keys]))}catch(e){}};
const pane=map.createPane('fog');pane.style.zIndex=450;pane.style.pointerEvents='none';
const cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;pointer-events:none';pane.appendChild(cv);
const ctx=cv.getContext('2d');
function sched(){if(!raf)raf=requestAnimationFrame(draw)}
function draw(){
  raf=0;
  if(!on){cv.style.display='none';return}
  cv.style.display='block';
  const sz=map.getSize();
  if(cv.width!==sz.x||cv.height!==sz.y){cv.width=sz.x;cv.height=sz.y}
  L.DomUtil.setPosition(cv,map.containerPointToLayerPoint([0,0]));
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='rgba(12,16,26,.78)';
  ctx.fillRect(0,0,cv.width,cv.height);
  const c=map.getCenter(),mpp=40075016.686*Math.cos(c.lat*Math.PI/180)/(256*Math.pow(2,map.getZoom()));
  const rp=Math.max(R/mpp,3),pad=rp*1.6*mpp/111320,b=map.getBounds();
  const s=b.getSouth()-pad,n=b.getNorth()+pad,w=b.getWest()-pad*2,e=b.getEast()+pad*2;
  const xy=[];
  for(let i=0;i<pts.length;i++){const p=pts[i];if(p[0]<s||p[0]>n||p[1]<w||p[1]>e)continue;const q=map.latLngToContainerPoint(p);xy.push(q.x,q.y)}
  ctx.globalCompositeOperation='destination-out';
  [[1.4,.4],[1,1]].forEach(([k,a])=>{
    ctx.globalAlpha=a;ctx.beginPath();const r=rp*k;
    for(let i=0;i<xy.length;i+=2){ctx.moveTo(xy[i]+r,xy[i+1]);ctx.arc(xy[i],xy[i+1],r,0,6.2832)}
    ctx.fill()});
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function point(){
  if(!me||(me.acc&&me.acc>60))return;
  const la=me[0],lo=me[1];
  if(lastP){const d=hav(lastP,[la,lo]);
    if(d>8&&d<300){const n=Math.min(40,Math.ceil(d/10));
      for(let s=1;s<n;s++)add(lastP[0]+(la-lastP[0])*s/n,lastP[1]+(lo-lastP[1])*s/n)}}
  add(la,lo);lastP=[la,lo];
  if(dirty)sched();
}
const _dm=drawMe;drawMe=function(){_dm();try{point()}catch(e){}};
map.on('move zoom zoomend moveend resize',sched);
setInterval(()=>{if(dirty){dirty=false;save()}},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&dirty){dirty=false;save()}});
const bt=document.createElement('button');bt.className='ib';bt.textContent='🌫️';bt.style.fontSize='20px';
const paintBt=()=>bt.classList.toggle('sel',on);
bt.onclick=()=>{on=!on;try{localStorage.setItem('scratchOn',on?'1':'0')}catch(e){}paintBt();sched();toast(on?'Туман включён':'Туман выключен')};
paintBt();$('#side').append(bt);
sched();
}catch(e){}
try{
const hideSat=()=>{const c=sat.getContainer&&sat.getContainer();if(c)c.style.visibility=map.getZoom()<11?'hidden':''};
map.on('zoom zoomend layeradd',hideSat);hideSat();
}catch(e){}
})();
try{[...document.querySelectorAll('#side button')].forEach(function(b){if(b.textContent.charCodeAt(0)===55356){b.style.fontSize='';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" stroke-dasharray="2 3"/><circle cx="10" cy="14" r="3.5"/><path d="M12.6 11.4C14.2 9.8 15.4 8.6 17 7"/></svg>'}})}catch(e){}

/* ===== 2.2: люди рядом сливаются в один значок ===== */
function drawFr(){
  var TH=52;
  var seen=new Set(),items=[],k=0;
  Object.keys(fr).sort().forEach(function(id){
    var u=fr[id];
    if(id===S.uid||!u||!u.la)return;
    var p;try{p=map.latLngToContainerPoint([u.la,u.lo])}catch(e){p={x:k*1000,y:0}}
    k++;items.push({id:id,u:u,x:p.x,y:p.y});
  });
  var groups=[];
  items.forEach(function(it){
    var g=null;
    for(var j=0;j<groups.length;j++){if(Math.hypot(groups[j].x-it.x,groups[j].y-it.y)<TH){g=groups[j];break}}
    if(!g){groups.push({m:[it],x:it.x,y:it.y,la:it.u.la,lo:it.u.lo});return}
    g.m.push(it);var n=g.m.length;
    g.x+=(it.x-g.x)/n;g.y+=(it.y-g.y)/n;g.la+=(it.u.la-g.la)/n;g.lo+=(it.u.lo-g.lo)/n;
  });
  function av(m,left){
    var i=frI[m.id]||{},fresh=Date.now()-m.u.t<ONLINE;
    return '<div class="gpa" style="left:'+left+'px;opacity:'+(fresh?1:.55)+';'+(i.a?'background-image:url('+i.a+')':'')+'">'+(i.a?'':svg(IC.user))+'</div>';
  }
  function grIcon(ms){
    var n=ms.length;
    return L.divIcon({className:'',iconSize:[64,48],iconAnchor:[32,24],html:'<div class="gp">'+av(ms[0],0)+av(ms[1],24)+(n>2?'<span class="gn">+'+(n-2)+'</span>':'')+'</div><span class="lb">'+n+' чел.</span>'});
  }
  function openGroup(ms,ll){
    var box=document.createElement('div');
    ms.forEach(function(m){
      var i=frI[m.id]||{},fresh=Date.now()-m.u.t<ONLINE;
      var r=document.createElement('div');r.className='gr';
      r.innerHTML='<div class="gpa" style="opacity:'+(fresh?1:.55)+';'+(i.a?'background-image:url('+i.a+')':'')+'">'+(i.a?'':svg(IC.user))+'</div><div><b>'+esc(i.n||'Друг')+'</b><br><small>'+(fresh?'в сети':ago(m.u.t))+'</small></div>';
      r.onclick=function(){map.closePopup();var o=others().find(function(q){return q.id===m.id});if(o)openPerson(o)};
      box.appendChild(r);
    });
    L.popup({className:'grp',closeButton:false,offset:[0,-22]}).setLatLng(ll).setContent(box).openOn(map);
  }
  groups.forEach(function(g){
    var key,sig,mkIcon,onClick,zi;
    if(g.m.length===1){
      var id=g.m[0].id,u=g.m[0].u,i=frI[id]||{},fresh=Date.now()-u.t<ONLINE,a=i.a||'';
      key=id;
      sig=a.length+a.slice(-24)+'|'+(i.n||'')+'|'+fresh+'|'+ago(u.t);
      mkIcon=function(){return frIcon(i,u,fresh)};
      onClick=function(){var o=others().find(function(q){return q.id===id});if(o)openPerson(o)};
      zi=800;
    }else{
      key='g:'+g.m.map(function(m){return m.id}).join(',');
      sig=g.m.map(function(m){var a=(frI[m.id]||{}).a||'';return a.length+a.slice(-12)+(Date.now()-m.u.t<ONLINE?1:0)}).join('|');
      mkIcon=function(){return grIcon(g.m)};
      onClick=function(){openGroup(g.m,[g.la,g.lo])};
      zi=850;
    }
    seen.add(key);
    var mk=frMk[key];
    if(!mk){
      mk=L.marker([g.la,g.lo],{icon:mkIcon(),zIndexOffset:zi}).addTo(frL);
      mk._k=sig;mk._c=onClick;
      mk.on('click',function(){mk._c()});
      frMk[key]=mk;
    }else{
      mk.setLatLng([g.la,g.lo]);mk._c=onClick;
      if(mk._k!==sig){mk.setIcon(mkIcon());mk._k=sig}
    }
  });
  Object.keys(frMk).forEach(function(k2){if(!seen.has(k2)){frL.removeLayer(frMk[k2]);delete frMk[k2]}});
  if(typeof ps!=='undefined'&&!ps.hidden)drawPeople();
}
try{
  var grStyle=document.createElement('style');
  grStyle.textContent='.gp{position:relative;width:64px;height:48px}.gpa{position:absolute;top:4px;width:40px;height:40px;border-radius:50%;box-sizing:border-box;border:3px solid #e8a33a;background:#1b2230 center/cover no-repeat;color:#e8a33a;display:flex;align-items:center;justify-content:center}.gpa svg{width:20px;height:20px}.gn{position:absolute;right:-6px;top:-2px;background:#e8a33a;color:#111;font:700 12px/1 sans-serif;border-radius:10px;padding:3px 6px}.grp .leaflet-popup-content-wrapper{background:#141a26;color:#fff;border-radius:14px}.grp .leaflet-popup-content{margin:6px;min-width:180px}.grp .leaflet-popup-tip{background:#141a26}.gr{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;cursor:pointer}.gr:active{background:rgba(255,255,255,.12)}.gr .gpa{position:static;flex:none}.gr small{opacity:.7}';
  document.head.appendChild(grStyle);
  map.on('zoomstart',function(){map.closePopup()});
  map.on('zoomend',function(){try{drawFr()}catch(e){}});
  drawFr();
}catch(e){}
