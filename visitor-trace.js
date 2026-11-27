(() => {
 const root=document.querySelector('#visitor-trace-screen');
 if(!root)return;
 const gallery=root.querySelector('.visitor-trace-gallery');
 const status=root.querySelector('.visitor-trace-status');
 const empty=root.querySelector('.visitor-trace-empty');
 const hint=document.createElement('p');hint.className='visitor-gallery-hint';hint.textContent='CLICK A PHOTO TO SEE ITS FLOWER.';gallery.before(hint);
 const openers=document.querySelectorAll('.visitor-trace-open, .ending-visitor-link');
 let opener=null;
 let previousOverflow='';
 openers.forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
  if(root.open)return;
  opener=button;
  previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  root.showModal();
 }));
 root.querySelector('.visitor-trace-back').addEventListener('click',()=>root.close());
 root.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});});
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
  const footer=document.createElement('span');footer.className='visitor-card-foot';footer.append(brand);
  front.append(image,footer);
  if(!moment.portraitImage) image.addEventListener('load',()=>{
   const crop=document.createElement('canvas');crop.width=crop.height=900;
   crop.getContext('2d').drawImage(image,image.naturalWidth*.05,image.naturalHeight*.04,image.naturalWidth*.9,image.naturalWidth*.9,0,0,900,900);
   image.src=crop.toDataURL('image/jpeg',.92);
  },{once:true});
  const back=document.createElement('span');back.className='visitor-card-back';back.setAttribute('aria-hidden','true');
  const cardArt=new Image();
  cardArt.src=moment.flowerCardImage || `public/flower-cards/card${String(stage+1).padStart(2,'0')}.png`;
  if(moment.flowerCardImage)cardArt.dataset.snapshot='true';
  if(moment.flowerCardDesign==='daily-emotion')cardArt.dataset.dailyCardStage=String(stage);
  cardArt.alt=`${moment.flowerCardDesign==='daily-emotion'?'DAILY EMOTION CARD':moment.flowerCardImage?'MY BLOOM':'TODAY’S FLOWER'} · ${names[stage]} 꽃 카드`;cardArt.loading='lazy';
  back.append(cardArt);inner.append(front,back);flip.append(inner);
  const caption=document.createElement('figcaption');
  const flipAction=document.createElement('button');flipAction.type='button';flipAction.className='visitor-flip-action';
  flipAction.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3M20 8v4M4 16v-4"/></svg>';
  flipAction.title='카드 뒤집기';
  flipAction.setAttribute('aria-label','꽃 카드로 뒤집기');
  flipAction.addEventListener('click',()=>flip.click());
  caption.append(flipAction);
  flip.addEventListener('click',event=>{
   const turned=flip.getAttribute('aria-pressed')!=='true';
   flip.classList.toggle('is-instant',event.detail===0);
   flip.setAttribute('aria-pressed',String(turned));
   flip.setAttribute('aria-label',turned?'사진으로 뒤집기':'꽃 카드로 뒤집기');
   front.setAttribute('aria-hidden',String(turned));back.setAttribute('aria-hidden',String(!turned));
   remove.hidden=turned;
   flipAction.setAttribute('aria-label',turned?'사진으로 뒤집기':'꽃 카드로 뒤집기');
  });
  const remove=document.createElement('button');remove.type='button';remove.textContent='DELETE';remove.setAttribute('aria-label','Delete this captured photo');
  remove.addEventListener('click',async()=>{
   try {await write('readwrite',store=>store.delete(moment.timestamp));figure.remove();shown.delete(moment.timestamp);empty.hidden=shown.size>0;status.textContent='Photo deleted from this device.';}
   catch {status.textContent='Could not delete from device storage. Please try again.';}
  });
  remove.className='visitor-frame-delete';
  remove.title='사진 삭제';
  remove.textContent='삭제';
  figure.append(flip,remove);
  if(prepend)gallery.prepend(figure);else gallery.append(figure);
 }
 dbReady.then(db=>{
  const request=db.transaction('moments').objectStore('moments').getAll();
  request.onsuccess=()=>request.result.sort((a,b)=>b.timestamp-a.timestamp).filter(moment=>moment.visitorConsent === true).forEach(moment=>show(moment));
 }).catch(()=>{});
 const consent=document.createElement('dialog');
 consent.className='visitor-consent';
 consent.setAttribute('aria-labelledby','visitor-consent-title');
 consent.innerHTML=`<h2 id="visitor-consent-title">ADD TO VISITOR TRACE?</h2>
  <button type="button" class="visitor-consent-dismiss" data-dismiss autofocus aria-label="Close card preview">CLOSE ×</button>
  <div class="visitor-consent-pair">
   <figure class="visitor-consent-photo"><div class="visitor-consent-print"><img alt="Photo awaiting your permission"><span class="visitor-card-foot"><span class="visitor-card-brand">TRACE ME</span></span></div><figcaption>YOUR PHOTO</figcaption></figure>
   <figure class="visitor-consent-card"><div class="visitor-forge-art"><div class="visitor-consent-flower crisp-card"></div><div class="visitor-forge-surface" aria-hidden="true"><img class="visitor-forge-flower" alt=""><i class="visitor-forge-glow"></i></div><div class="visitor-forge-light" aria-hidden="true"><i class="visitor-forge-scan"></i></div><i class="visitor-forge-rim" aria-hidden="true"></i></div><figcaption>DAILY EMOTION CARD</figcaption></figure>
   <section class="visitor-bloom-explanation" aria-labelledby="visitor-bloom-title" hidden>
    <span class="visitor-bloom-eyebrow">DAILY EMOTION CARD</span>
    <h3 id="visitor-bloom-title" tabindex="-1">지금의 표정이 담긴 꽃.</h3>
    <h4 class="visitor-bloom-stage"></h4>
    <p class="visitor-bloom-description"></p>
    <p class="visitor-bloom-note">표정의 변화량을 꽃의 개화 과정으로 표현한 카드예요. 촬영한 순간의 꽃 모습을 데일리 이모션 카드로 담았어요.</p>
    <div class="visitor-bloom-actions"><button type="button" data-retake>다시 만들어보기</button><button type="button" data-next disabled>NEXT →</button></div>
   </section>
  </div>
  <p class="visitor-consent-note">ALLOW를 누르면 사진과 꽃 카드가 VISITOR TRACE에 전시됩니다.<br>VISITOR TRACE에 쌓인 다양한 사진들을 구경해보세요.</p>
  <div class="visitor-consent-actions"><button type="button" data-decline>닫기</button><button type="button" data-allow>ALLOW</button></div>`;
 document.body.append(consent);
 let pending=null,previewRun=0,previewMotion=null;
 const allow=consent.querySelector('[data-allow]');
 const portrait=consent.querySelector('.visitor-consent-photo img');
 const flower=consent.querySelector('.visitor-consent-flower');
 const explanation=consent.querySelector('.visitor-bloom-explanation');
 const next=consent.querySelector('[data-next]');
 const photoFigure=consent.querySelector('.visitor-consent-photo');
 const note=consent.querySelector('.visitor-consent-note');
 const actions=consent.querySelector('.visitor-consent-actions');
 consent.querySelectorAll('[data-decline],[data-dismiss],[data-retake]').forEach(button=>button.addEventListener('click',()=>consent.close()));
 next.addEventListener('click',()=>{
  if(!pending||next.disabled)return;
  previewMotion?.cancel();previewMotion=null;
  explanation.hidden=true;photoFigure.hidden=false;note.hidden=false;actions.hidden=false;
  consent.classList.remove('is-explaining');
  consent.querySelector('h2').textContent='ADD TO VISITOR TRACE?';
  consent.querySelector('h2').tabIndex=-1;
  consent.querySelector('h2').focus({preventScroll:true});
  consent.scrollTop=0;allow.disabled=false;
 });
 consent.addEventListener('close',()=>{
  previewRun++;previewMotion?.cancel();previewMotion=null;pending=null;allow.disabled=true;next.disabled=true;
  portrait.removeAttribute('src');flower.replaceChildren();
  consent.querySelector('.visitor-forge-flower').removeAttribute('src');
  document.querySelector('#photo-booth .portrait-capture')?.focus({preventScroll:true});
 });
 document.addEventListener('photo-booth-captured',async event=>{
  const moment=event.detail;
  if(!moment?.image)return;
  const token=++previewRun;
  previewMotion?.cancel();pending=null;allow.disabled=true;next.disabled=true;
  portrait.src=moment.portraitImage || moment.image;
  flower.replaceChildren();explanation.hidden=false;explanation.inert=true;
  photoFigure.hidden=true;note.hidden=true;actions.hidden=true;
  consent.classList.add('is-forging','is-explaining');
  consent.querySelector('h2').textContent='CREATING YOUR FLOWER CARD';
  if(!consent.open)consent.showModal();
  try {
   const snapshot=await window.createBloomSnapshotCard(moment);
   if(token!==previewRun||!consent.open)return;
   window.renderTabletFlowerCard(flower,snapshot.image,snapshot.stage);
   explanation.querySelector('.visitor-bloom-stage').textContent=snapshot.name;
   explanation.querySelector('.visitor-bloom-description').textContent=snapshot.description;
   consent.querySelector('.visitor-forge-flower').src=moment.flowerSnapshot || moment.flowerSrc || '';
   if(window.revealTabletCapture){previewMotion=window.revealTabletCapture(consent);await (previewMotion.ready || previewMotion.finished);}
   else consent.classList.remove('is-forging');
   if(token!==previewRun||!consent.open)return;
   pending={...moment,dailyCardIndex:snapshot.stage,flowerCardImage:snapshot.image,flowerCardDesign:'daily-emotion'};
   explanation.inert=false;next.disabled=false;
   await previewMotion?.finished;
   if(token!==previewRun||!consent.open||!consent.classList.contains('is-explaining'))return;
   previewMotion=null;
   explanation.querySelector('h3').focus({preventScroll:true});
  }catch{
   if(token!==previewRun||!consent.open)return;
   consent.classList.remove('is-forging');explanation.inert=false;
   consent.querySelector('h2').textContent='카드를 만들지 못했어요.';
   explanation.querySelector('.visitor-bloom-stage').textContent='다시 촬영해 주세요.';
   explanation.querySelector('.visitor-bloom-description').textContent='꽃 이미지를 불러오지 못했어요. 다시 만들어보기를 눌러 주세요.';
  }
 });
 allow.addEventListener('click',async()=>{
  if(!pending || allow.disabled)return;
  allow.disabled=true;
  const moment={...pending,visitorConsent:true,consentedAt:Date.now()};
  document.dispatchEvent(new CustomEvent('visitor-trace-approved',{detail:moment}));
  consent.close();show(moment,true);status.textContent='Saving your moment…';
  if (!root.open) {
   opener=document.querySelector('#photo-booth .visitor-trace-open') || openers[0];
   previousOverflow=document.body.style.overflow;
   document.body.style.overflow='hidden';
   root.showModal();
  }
  root.scrollTop=0;
  try {await write('readwrite',store=>store.put(moment));status.textContent='Saved with your permission on this device.';}
  catch {status.textContent='Photo shown, but could not be saved. Keep this page open.';}
 });
})();
