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
