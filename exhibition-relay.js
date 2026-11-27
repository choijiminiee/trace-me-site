/* ALLOW is the only trigger for sending a new capture. No automatic capture upload. */
(() => {
 const $=s=>document.querySelector(s);
 const requested=new URLSearchParams(location.search).get('room')||localStorage.getItem('trace-display-room');
 const room=/^[A-Fa-f0-9]{16}$/.test(requested||'')?requested.toUpperCase():'D072515AE6014993';
 localStorage.setItem('trace-display-room',room);
 sessionStorage.removeItem('trace-auto-upload');
 let busy=false;const ids=new Map();
 const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='position:fixed;bottom:66px;left:24px;z-index:130;background:#17121f;color:white;padding:10px;max-width:440px;font:14px/1.6 Arial';status.hidden=true;
 document.body.append(status);
 const db=new Promise((resolve,reject)=>{const r=indexedDB.open('trace-upload-queue',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 async function pending(action,value){const d=await db;return new Promise((resolve,reject)=>{const tx=d.transaction('pending',action==='getAll'?'readonly':'readwrite');const req=tx.objectStore('pending')[action](value);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 function say(text){status.textContent=text;status.hidden=false;const local=$('.visitor-trace-status');if(local)local.textContent=text;}
 const galleryOrigin=location.origin==='https://trace-me-jimin.civil-fig-0955.chatgpt.site'?'https://trace-me-tablet-booth.civil-fig-0955.chatgpt.site':'';
 async function api(path,options){const r=await fetch(galleryOrigin+'/api/rooms'+path,options);let d;try{d=await r.json();}catch{throw Error('전시 서버 연결을 확인해 주세요.');}if(!r.ok)throw Error(d.error||'전송 실패');return d;}
 async function jpeg(src,maxEdge=1000,quality=.85){const img=new Image();img.src=src;await img.decode();const scale=Math.min(1,maxEdge/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);const ctx=c.getContext('2d');ctx.fillStyle='#211d28';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',quality);}
 async function enqueue(moment){const target=room,key=String(moment.timestamp||moment.id||'');if(key&&ids.has(key))return;const id=crypto.randomUUID();if(key)ids.set(key,id);try{let flower=moment.flowerCardImage;if(!flower&&window.createBloomSnapshotCard)flower=(await window.createBloomSnapshotCard(moment)).image;if(!flower)flower='public/flower-cards/card'+String((Number(moment.dailyCardIndex)||0)+1).padStart(2,'0')+'.png';const photo={consent:true,portrait:await jpeg(moment.portraitImage||moment.image),flower:await jpeg(flower,2298,.94)};await pending('put',{id,room:target,photo});say('전송 중…');await flush();}catch(e){if(key)ids.delete(key);say('전송 준비 실패 · '+e.message);}}
 async function flush(){if(busy)return;busy=true;try{for(const item of await pending('getAll')){await api('/'+item.room+'/photos/'+item.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(item.photo)});await pending('delete',item.id);say('전송 완료 · 아이패드 갤러리에 반영됩니다.');}}catch(e){say('전송 대기 중 · '+e.message+' 연결이 돌아오면 다시 보냅니다.');}finally{busy=false;}}

 document.addEventListener('visitor-trace-approved',e=>enqueue(e.detail));
 document.addEventListener('visitor-trace-send-request',e=>{if(confirm('이 사진과 꽃 카드를 전시 갤러리에 전송할까요?'))enqueue(e.detail);});
 addEventListener('online',flush);setInterval(flush,5000);flush();
})();
