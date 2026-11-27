(() => {
 const root=document.querySelector('#visitor-trace-screen');
 if(!root)return;
 const gallery=root.querySelector('.visitor-trace-gallery');
 const status=root.querySelector('.visitor-trace-status');
 const empty=root.querySelector('.visitor-trace-empty');
 const opener=document.querySelector('.visitor-trace-open');
 let previousOverflow='';
 opener.addEventListener('click',()=>{ previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';root.showModal(); });
 root.querySelector('.visitor-trace-back').addEventListener('click',()=>root.close());
 root.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener.focus({preventScroll:true});});
 const names=['BUD','SPROUT','BLOOM','FULL BLOOM','FALL','FADE'];
 const dbReady=new Promise((resolve,reject)=>{
  const request=indexedDB.open('trace-me-visitor-traces',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('moments',{keyPath:'timestamp'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
 dbReady.catch(()=>{status.textContent='Device storage unavailable. New captures are shown for this session only.';});
 async function write(mode,action) {
  const db=await dbReady;
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('moments',mode);action(tx.objectStore('moments'));
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }
 const shown=new Set();
 function show(moment,prepend=false) {
  if(shown.has(moment.timestamp))return;shown.add(moment.timestamp);empty.hidden=true;
  const figure=document.createElement('figure');
  const stage=Math.max(0,Math.min(5,Number(moment.dailyCardIndex)||0));
  const flip=document.createElement('button');flip.type='button';flip.className='visitor-flip';
  flip.setAttribute('aria-pressed','false');flip.setAttribute('aria-label','꽃 카드로 뒤집기');
  const inner=document.createElement('span');inner.className='visitor-flip-inner';
  const front=document.createElement('span');front.className='visitor-card-front';
  const image=new Image();image.src=moment.portraitImage || moment.image;image.alt='방문객 사진';image.loading='lazy';
  const date=document.createElement('span');date.className='visitor-card-date';date.textContent=['봉오리','발아','개화','만개','낙화','시듦'][stage];
  const brand=document.createElement('span');brand.className='visitor-card-brand';brand.textContent='TRACE ME';
  const footer=document.createElement('span');footer.className='visitor-card-foot';footer.append(brand,date);
  front.append(image,footer);
  if(!moment.portraitImage) image.addEventListener('load',()=>{
   const crop=document.createElement('canvas');crop.width=crop.height=900;
   crop.getContext('2d').drawImage(image,image.naturalWidth*.05,image.naturalHeight*.04,image.naturalWidth*.9,image.naturalWidth*.9,0,0,900,900);
   image.src=crop.toDataURL('image/jpeg',.92);
  },{once:true});
  const back=document.createElement('span');back.className='visitor-card-back';back.setAttribute('aria-hidden','true');
  const cardArt=new Image();
  cardArt.src=`public/flower-cards/card${String(stage+1).padStart(2,'0')}.png`;
  cardArt.alt=`TODAY’S FLOWER · ${names[stage]} 꽃 카드`;cardArt.loading='lazy';
  back.append(cardArt);inner.append(front,back);flip.append(inner);
  const caption=document.createElement('figcaption');caption.textContent='눌러서 꽃 카드 보기 ↻';
  flip.addEventListener('click',event=>{
   const turned=flip.getAttribute('aria-pressed')!=='true';
   flip.classList.toggle('is-instant',event.detail===0);
   flip.setAttribute('aria-pressed',String(turned));
   flip.setAttribute('aria-label',turned?'사진으로 뒤집기':'꽃 카드로 뒤집기');
   front.setAttribute('aria-hidden',String(turned));back.setAttribute('aria-hidden',String(!turned));
   remove.hidden=turned;
   caption.textContent=turned?'눌러서 사진 보기 ↻':'눌러서 꽃 카드 보기 ↻';
  });
  const remove=document.createElement('button');remove.type='button';remove.textContent='DELETE';remove.setAttribute('aria-label','Delete this captured photo');
  remove.addEventListener('click',async()=>{
   try {await write('readwrite',store=>store.delete(moment.timestamp));figure.remove();shown.delete(moment.timestamp);empty.hidden=shown.size>0;status.textContent='Photo deleted from this device.';}
   catch {status.textContent='Could not delete from device storage. Please try again.';}
  });
  remove.className='visitor-frame-delete';
  figure.append(flip,caption,remove);if(prepend)gallery.prepend(figure);else gallery.append(figure);
 }
 dbReady.then(db=>{
  const request=db.transaction('moments').objectStore('moments').getAll();
  request.onsuccess=()=>request.result.sort((a,b)=>b.timestamp-a.timestamp).filter(moment=>moment.visitorConsent === true).forEach(moment=>show(moment));
 }).catch(()=>{});
 const consent=document.createElement('dialog');
 consent.className='visitor-consent';
 consent.setAttribute('aria-labelledby','visitor-consent-title');
 consent.innerHTML=`<h2 id="visitor-consent-title">ADD TO VISITOR TRACE?</h2>
  <img alt="Photo awaiting your permission">
  <p>이 사진을 VISITOR TRACE에 남길까요?<br>허용한 사진만 이 브라우저에 저장됩니다. 서버에는 업로드되지 않습니다.</p>
  <div><a data-download download="my-trace.png">사진 저장하기</a><button type="button" data-decline autofocus>닫기</button><button type="button" data-allow>ALLOW & SAVE</button></div>`;
 document.body.append(consent);
 let pending=null;
 const allow=consent.querySelector('[data-allow]');
 consent.querySelector('[data-decline]').addEventListener('click',()=>consent.close());
 consent.addEventListener('close',()=>{pending=null;consent.querySelector('img').removeAttribute('src');});
 document.addEventListener('photo-booth-captured',event=>{
  const moment=event.detail;
  setTimeout(()=>{
   pending=moment;allow.disabled=false;
   consent.querySelector('img').src=moment.image;
   consent.querySelector('[data-download]').href=moment.image;
   if(!consent.open)consent.showModal();
  },0);
 });
 allow.addEventListener('click',async()=>{
  if(!pending || allow.disabled)return;
  allow.disabled=true;
  const moment={...pending,visitorConsent:true,consentedAt:Date.now()};
  consent.close();show(moment,true);status.textContent='Saving your moment…';
  if (!root.open) opener.click();
  root.scrollTop=0;
  try {await write('readwrite',store=>store.put(moment));status.textContent='Saved with your permission on this device. Nothing uploaded.';}
  catch {status.textContent='Photo shown, but could not be saved. Keep this page open.';}
 });
})();
