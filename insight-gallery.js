(() => {
 const pointer=matchMedia('(hover: hover) and (pointer: fine)');
 document.querySelectorAll('.original-insight-slide').forEach(card=>{
  card.classList.remove('is-current');
  card.removeAttribute('aria-pressed');
  const image=card.querySelector('img');
  const lens=document.createElement('span');
  lens.className='insight-magnifier';
  lens.setAttribute('aria-hidden','true');
  card.append(lens);
  const hide=()=>lens.classList.remove('is-visible');
  const show=event=>{
   if(!pointer.matches || event.pointerType==='touch' || !image.naturalWidth)return hide();
   const box=card.getBoundingClientRect(), rect=image.getBoundingClientRect();
   const fit=Math.min(rect.width/image.naturalWidth,rect.height/image.naturalHeight);
   const width=image.naturalWidth*fit,height=image.naturalHeight*fit;
   const left=rect.left+(rect.width-width)/2,top=rect.top+(rect.height-height)/2;
   const x=event.clientX-left,y=event.clientY-top;
   if(x<0 || y<0 || x>width || y>height)return hide();
   const radius=40,zoom=1.3;
   lens.style.transform=`translate(${event.clientX-box.left-radius}px,${event.clientY-box.top-radius}px)`;
   lens.style.backgroundImage=`url("${image.currentSrc}")`;
   lens.style.backgroundSize=`${width*zoom}px ${height*zoom}px`;
   lens.style.backgroundPosition=`${radius-x*zoom}px ${radius-y*zoom}px`;
   lens.classList.add('is-visible');
  };
  card.addEventListener('pointerenter',show);
  card.addEventListener('pointermove',show);
  card.addEventListener('pointerleave',hide);
  card.addEventListener('pointercancel',hide);
  pointer.addEventListener('change',hide);
 });
})();

(() => {
 const gallery = document.querySelector('#me .me-moments');
 if (!gallery) return;
 const descriptions = ['친구들과 함께한 식사와 모임.', '카페와 베이커리에서 남긴 사진.', '반려견과 함께 걷는 일상.', '집에서 책을 읽으며 보낸 시간.', '창밖과 주변에서 발견한 장면.'];
 const cards = [...gallery.querySelectorAll('figure')];
 const select = selected => {
  gallery.classList.toggle('has-focus', Boolean(selected));
  cards.forEach(card => {
   const active = card === selected;
   card.classList.toggle('is-focused', active);
   card.querySelector('button').setAttribute('aria-pressed', String(active));
   card.querySelector('button span').textContent = active ? '−' : '+';
   card.querySelector('.memory-detail').setAttribute('aria-hidden', String(!active));
  });
 };
 cards.forEach((card, index) => {
  const caption = card.querySelector('figcaption');
  const detail = caption.querySelector('p') || document.createElement('p');
  detail.className = 'memory-detail';
  detail.textContent = descriptions[index];
  detail.id = `memory-detail-${index}`;
  detail.setAttribute('aria-hidden', 'true');
  caption.append(detail);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'memory-toggle';
  button.setAttribute('aria-label', card.querySelector('h3').textContent + ' 자세히 보기');
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-controls', detail.id);
  button.innerHTML = '<span aria-hidden="true">+</span>';
  button.addEventListener('click', () => select(card.classList.contains('is-focused') ? null : card));
  card.append(button);
 });
 gallery.addEventListener('keydown', event => { if (event.key === 'Escape') select(null); });
})();
