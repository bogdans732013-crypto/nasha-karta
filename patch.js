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

/* ===== 2.3: мини-игра «Лети» + таблица рекордов ===== */
(function(){try{
var CSS='#gmroot{position:fixed;inset:0;z-index:5000;display:none;background:#10242b;touch-action:none;user-select:none;-webkit-user-select:none}#gmroot canvas{position:absolute;inset:0;width:100%;height:100%}.gmtop{position:absolute;left:0;right:0;top:0;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 0;display:flex;justify-content:space-between;align-items:center;color:#fff;font:600 15px system-ui,sans-serif}.gmtop button{background:#0008;color:#fff;border:1px solid #fff4;border-radius:10px;padding:9px 13px;font:inherit}#gmmsg{position:absolute;left:0;right:0;top:55%;text-align:center;color:#fff;font:600 24px system-ui,sans-serif;pointer-events:none;text-shadow:0 2px 8px #0008}#gmov,#gmlb{position:absolute;inset:0;display:grid;place-items:center;background:#0009}#gmov[hidden],#gmlb[hidden]{display:none}.gmc{width:min(86%,340px);background:#1c2624;border:1px solid #e4eee93a;border-radius:16px;padding:18px;color:#e4eee9;text-align:center;font:15px system-ui,sans-serif}.gmc b{font-size:20px;display:block;margin-bottom:10px}.gmc button{display:block;width:100%;margin-top:10px;padding:12px;border:0;border-radius:10px;background:#4fc3ad;color:#06120f;font:700 16px system-ui,sans-serif}.gmc button+button{background:#2a3734;color:#e4eee9}#gmsc{font-size:34px;font-weight:800}.gmr{display:flex;gap:10px;padding:7px 4px;border-bottom:1px solid #e4eee91f;text-align:left}.gmr span:nth-child(2){flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gmr.me{color:#4fc3ad}.gmi{width:40px;height:40px;border-radius:12px;background:#1c2624;border:2px solid #4fc3ad;color:#4fc3ad;display:grid;place-items:center;box-shadow:0 2px 8px #0006;animation:gmb 2.2s ease-in-out infinite}.gmi svg{width:22px;height:22px}@keyframes gmb{50%{transform:translateY(-4px)}}';
var stl=document.createElement('style');stl.textContent=CSS;document.head.appendChild(stl);

var G=1500,FLAP=-470,SPD=170,PW=64,PR=18,GR=56,SP=240;
var best=0;try{best=+localStorage.getItem('gbest')||0}catch(e){}
var root,cv,ctx,bestEl,msg,ov,scEl,bsEl,lb,list;
var W=0,H=0,PX=0,state='ready',raf=0,last=0,score=0,py=0,pv=0,pipes=[],sinceP=0,img=null,isNew=false;

function el(tag,id,cls,txt,par){var e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(txt)e.textContent=txt;if(par)par.appendChild(e);return e}

function build(){
  root=el('div','gmroot');
  cv=el('canvas','gmcv',0,0,root);ctx=cv.getContext('2d');
  var top=el('div',0,'gmtop',0,root);
  var bL=el('button',0,0,'Таблица',top);bestEl=el('span',0,0,'',top);var bX=el('button',0,0,'✕',top);
  msg=el('div','gmmsg',0,'Нажми, чтобы взлететь',root);
  ov=el('div','gmov',0,0,root);ov.hidden=true;var c1=el('div',0,'gmc',0,ov);
  el('b',0,0,'Игра окончена',c1);scEl=el('div','gmsc',0,'',c1);bsEl=el('div',0,0,'',c1);
  var bA=el('button',0,0,'Играть снова',c1),bT=el('button',0,0,'Таблица',c1);
  lb=el('div','gmlb',0,0,root);lb.hidden=true;var c2=el('div',0,'gmc',0,lb);
  el('b',0,0,'Таблица рекордов',c2);list=el('div',0,0,'',c2);var bB=el('button',0,0,'Назад',c2);
  cv.addEventListener('pointerdown',function(e){if(e.preventDefault)e.preventDefault();tap()});
  bX.onclick=closeGame;bL.onclick=showLb;bT.onclick=showLb;bA.onclick=reset;
  bB.onclick=function(){lb.hidden=true;if(state==='over')ov.hidden=false};
  document.body.appendChild(root);
  window.addEventListener('resize',function(){if(root.style.display==='block')resize()});
}

function resize(){
  W=window.innerWidth;H=window.innerHeight;PX=W*.28;
  var d=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(W*d);cv.height=Math.round(H*d);
  ctx.setTransform(d,0,0,d,0,0);
}

function reset(){
  state='ready';score=0;py=H*.45;pv=0;pipes=[];sinceP=0;isNew=false;
  ov.hidden=true;lb.hidden=true;msg.style.display='';
  bestEl.textContent='Рекорд '+best;
  if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}
}

function tap(){
  if(state==='ready'){state='play';msg.style.display='none';sinceP=SP-110;pv=FLAP}
  else if(state==='play')pv=FLAP;
}

function gapSize(){return Math.max(150,Math.min(200,H*.25))}
function spawn(){
  var g=gapSize(),lo=70+g/2,hi=H-GR-70-g/2;if(hi<lo)hi=lo;
  pipes.push({x:W+10,cy:lo+Math.random()*(hi-lo),g:g,d:0});
}

function hit(){
  var r=PR-3;
  if(py+r>H-GR)return true;
  for(var i=0;i<pipes.length;i++){var p=pipes[i];
    if(PX+r>p.x&&PX-r<p.x+PW&&(py-r<p.cy-p.g/2||py+r>p.cy+p.g/2))return true}
  return false;
}

function step(dt){
  pv+=G*dt;py+=pv*dt;
  if(py-PR<0){py=PR;pv=0}
  sinceP+=SPD*dt;if(sinceP>=SP){sinceP=0;spawn()}
  for(var i=0;i<pipes.length;i++){var p=pipes[i];p.x-=SPD*dt;
    if(!p.d&&p.x+PW<PX){p.d=1;score++}}
  while(pipes.length&&pipes[0].x<-PW-10)pipes.shift();
  if(hit())over();
}

function over(){
  state='over';
  isNew=score>best;
  if(isNew){best=score;try{localStorage.setItem('gbest',String(best))}catch(e){}submit()}
  scEl.textContent='Счёт: '+score;
  bsEl.textContent=isNew?'Новый рекорд!':'Рекорд: '+best;
  bestEl.textContent='Рекорд '+best;
  ov.hidden=false;
}

function submit(){
  try{
    if(typeof db==='undefined'||!db||!base)return;
    db.ref(base+'/g/'+S.uid).set({n:String(S.name||'Без имени').slice(0,30),s:best,t:Date.now()},function(e){if(e)toast('Рекорд не сохранился в общей таблице')});
  }catch(e){}
}

function showLb(){
  ov.hidden=true;lb.hidden=false;
  var online=(typeof db!=='undefined'&&db&&base);
  var render=function(v){
    var rows=Object.keys(v||{}).map(function(k){return{id:k,n:v[k].n||'?',s:+v[k].s||0}});
    var mine=null;rows.forEach(function(r){if(r.id===S.uid)mine=r});
    if(best>0&&(!mine||mine.s<best)){if(mine)mine.s=best;else rows.push({id:S.uid,n:S.name||'Я',s:best})}
    rows.sort(function(a,b){return b.s-a.s});
    if(!rows.length){list.textContent='Пока никого нет. Сыграй первым!';return}
    list.innerHTML=rows.slice(0,10).map(function(r,i){
      return '<div class="gmr'+(r.id===S.uid?' me':'')+'"><span>'+(i+1)+'</span><span>'+esc(r.n)+'</span><b>'+r.s+'</b></div>'}).join('')+
      (online?'':'<div style="margin-top:8px;opacity:.7">Введи код комнаты в профиле, чтобы видеть друзей</div>');
  };
  if(!online){render({});return}
  list.textContent='Загрузка...';
  db.ref(base+'/g').once('value',function(s){render(s.val())},function(){list.textContent='Не удалось загрузить таблицу'});
}

function rr(x,y,w,h){if(h>0)ctx.fillRect(x,y,w,h)}
function pipe(x,y,h,capTop){
  if(h<=0)return;
  ctx.fillStyle='#4fc3ad';ctx.fillRect(x,y,PW,h);
  ctx.fillStyle='#2a8f7c';ctx.fillRect(x+PW-10,y,10,h);
  var ch=Math.min(22,h),cy=capTop?y:y+h-ch;
  ctx.fillStyle='#6fd9c5';ctx.fillRect(x-6,cy,PW+12,ch);
  ctx.fillStyle='#2a8f7c';ctx.fillRect(x-6,capTop?cy+ch-3:cy,PW+12,3);
}

function draw(){
  var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#10242b');g.addColorStop(1,'#2d7f7a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(var i=0;i<pipes.length;i++){var p=pipes[i],t=p.cy-p.g/2,b=p.cy+p.g/2;
    pipe(p.x,0,t,false);pipe(p.x,b,H-GR-b,true)}
  ctx.fillStyle='#0e1513';ctx.fillRect(0,H-GR,W,GR);
  ctx.fillStyle='#4fc3ad';ctx.fillRect(0,H-GR,W,3);
  var R=PR+2;
  ctx.save();ctx.beginPath();ctx.arc(PX,py,R,0,6.2832);ctx.clip();
  if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,PX-R,py-R,R*2,R*2);
  else{ctx.fillStyle='#3b82e6';ctx.fillRect(PX-R,py-R,R*2,R*2)}
  ctx.restore();
  ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(PX,py,R,0,6.2832);ctx.stroke();
  if(state!=='ready'){
    ctx.font='800 60px system-ui,sans-serif';ctx.textAlign='center';
    ctx.lineWidth=6;ctx.strokeStyle='#0a1a1f';ctx.strokeText(String(score),W/2,H*.2);
    ctx.fillStyle='#fff';ctx.fillText(String(score),W/2,H*.2);
  }
}

function frame(t){
  if(state==='over'){raf=0;draw();return}
  raf=requestAnimationFrame(frame);
  var dt=Math.min((t-last)/1000,.033);last=t;
  if(state==='play')step(dt);else py=H*.45+Math.sin(t/300)*8;
  draw();
}
/* звуки */
var AC=null,muted=false;
try{muted=localStorage.getItem('gmute')==='1'}catch(e){}
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
function tone(f,d,type,vol,when){
  if(muted)return;var a=ac();if(!a)return;
  var t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||'square';o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(vol||.07,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);
}
function sndScore(){tone(880,.07,'square',.07);tone(1320,.12,'square',.07,.07)}
function sndOver(){tone(300,.15,'sawtooth',.08);tone(220,.15,'sawtooth',.08,.15);tone(150,.3,'sawtooth',.08,.3)}var _tap=tap;tap=function(){ac();_tap()};
var _step=step;step=function(dt){var s=score;_step(dt);if(score>s)sndScore()};
var _over=over;over=function(){_over();sndOver()};
var gm=null;
function openGame(){
  if(!root)build();
  root.style.display='block';resize();
  img=null;if(S.avatar){img=new Image();img.src=S.avatar}
  reset();
}
function closeGame(){
  if(raf){cancelAnimationFrame(raf);raf=0}
  root.style.display='none';placeGame();
}

function placeGame(){
  var c;try{c=(me&&me.length)?L.latLng(me[0],me[1]):map.getCenter()}catch(e){return}
  var d=300+Math.random()*700,a=Math.random()*6.2832;
  var la=c.lat+d*Math.cos(a)/111320,lo=c.lng+d*Math.sin(a)/(111320*Math.cos(c.lat*Math.PI/180));
  if(gm){gm.setLatLng([la,lo]);return}
  var ic=L.divIcon({className:'',iconSize:[40,40],iconAnchor:[20,20],html:'<div class="gmi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18.5" cy="13.5" r=".8"/></svg></div>'});
  gm=L.marker([la,lo],{icon:ic,zIndexOffset:300}).on('click',openGame).addTo(map);
  try{if(!localStorage.getItem('gseen')){localStorage.setItem('gseen','1');toast('Рядом на карте появилась мини-игра')}}catch(e){}
}
placeGame();
}catch(e){}})();
                                            
