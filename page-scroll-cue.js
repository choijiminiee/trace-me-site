(() => {
 const cue=document.querySelector('.page-scroll-cue');
 const lastPage=document.querySelector('#tablet-photo-booth') || document.querySelector('#ending');
 const ending=document.querySelector('#ending');
 const intro=document.querySelector('#intro');
 const invitation=document.querySelector('#live-trace-intro');
 const entrance=document.querySelector('#photo-booth-entry');
 const label=cue?.querySelector('.page-scroll-cue-label');
 if(!cue)return;
 let scheduled=false;
 function update(){
  scheduled=false;
  const remaining=document.documentElement.scrollHeight-window.innerHeight-window.scrollY;
  const reachedLastPage=lastPage && !lastPage.hidden && lastPage.getBoundingClientRect().top<=window.innerHeight*.5;
  const readingLine=window.innerHeight*.5;
  const introBounds=intro?.getBoundingClientRect();
  const atIntro=introBounds && introBounds.top<=readingLine && introBounds.bottom>readingLine;
  const endingBounds=ending?.getBoundingClientRect();
  const inviteBounds=invitation?.getBoundingClientRect();
  const atEnding=endingBounds && endingBounds.top<=readingLine && endingBounds.bottom>readingLine;
  const entranceBounds=entrance?.getBoundingClientRect();
  const atEntrance=entranceBounds && entranceBounds.top<=readingLine && entranceBounds.bottom>readingLine;
  const atInvitation=inviteBounds && inviteBounds.top<=readingLine && inviteBounds.bottom>readingLine;
  cue.hidden=Boolean(window.traceBoothFlow?.activeId) || (remaining<80 && !atEnding) || reachedLastPage || atInvitation || atEntrance;
  const showLabel=Boolean(atIntro||atEnding);
  if(label){label.textContent=atIntro?'SCROLL':'PHOTO BOOTH';label.hidden=!showLabel;}
  cue.classList.toggle('has-label',showLabel);
  cue.setAttribute('aria-label',atIntro?'SCROLL — 다음 페이지로 이동':atEnding?'PHOTO BOOTH — 포토부스로 이동':'다음 페이지로 이동');
  cue.title=atIntro?'SCROLL':atEnding?'PHOTO BOOTH':'다음 페이지로 이동';
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 cue.addEventListener('click',event=>{
  window.dispatchEvent(new CustomEvent('trace:next-page',{detail:{instant:event.detail===0}}));
 });
 window.addEventListener('trace:booth-page',schedule);
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 new ResizeObserver(schedule).observe(document.body);
 update();
})();
