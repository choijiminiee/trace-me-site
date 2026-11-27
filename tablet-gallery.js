(() => {
 const gallery=document.querySelector('#visitor-trace-screen .visitor-trace-gallery');
 if(!gallery)return;
 const viewer=document.createElement('dialog');
 viewer.className='tablet-photo-viewer';
 viewer.setAttribute('aria-label','사진과 꽃 카드 크게 보기');
 viewer.innerHTML='<button type="button" class="tablet-viewer-close" autofocus>CLOSE ×</button><div class="tablet-viewer-pair"><figure><img class="tablet-viewer-photo" alt="선택한 방문객 사진"><figcaption>PORTRAIT</figcaption></figure><figure><div class="tablet-viewer-flower crisp-card"></div><figcaption>YOUR FLOWER</figcaption></figure></div>';
 document.body.append(viewer);
 let opener=null;
 gallery.addEventListener('click',event=>{
  const card=event.target.closest('.visitor-flip');
  if(!card)return;
  event.preventDefault();event.stopImmediatePropagation();
  opener=card;
  viewer.querySelector('.tablet-viewer-photo').src=card.querySelector('.visitor-card-front img').src;
  const art=card.querySelector('.visitor-card-back img');
  if(art.dataset.dailyCardStage!==undefined){
   renderTabletFlowerCard(viewer.querySelector('.tablet-viewer-flower'),art.src,Number(art.dataset.dailyCardStage));
  }else if(art.dataset.snapshot==='true'){
   const image=new Image();image.src=art.src;image.alt=art.alt;
   viewer.querySelector('.tablet-viewer-flower').replaceChildren(image);
  }else renderTabletFlowerCard(viewer.querySelector('.tablet-viewer-flower'),art.src);
  viewer.showModal();
 },true);
 viewer.querySelector('button').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
 viewer.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 const hint=document.querySelector('.visitor-gallery-hint');
 if(hint)hint.textContent='TAP A PHOTO TO VIEW THE PORTRAIT & FLOWER.';
 const observer=new MutationObserver(()=>{
  gallery.querySelectorAll('.visitor-flip').forEach(card=>{
   card.setAttribute('aria-label','사진과 꽃 카드 크게 보기');
   card.setAttribute('aria-haspopup','dialog');
  });
 });
 observer.observe(gallery,{childList:true});
})();
