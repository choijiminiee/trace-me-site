/* Scroll-linked counterpart to the ending: purple blocks leave to both sides. */
(() => {
 const section=document.querySelector('#live-trace-intro');
 const cover=section?.querySelector('.booth-gradient-cover');
 if(!cover)return;
 const marquee=section.querySelector('.booth-marquee-track');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
 svg.style.position='absolute';
 const mask=document.createElementNS(ns,'clipPath');
 mask.id='booth-invitation-mask';mask.setAttribute('clipPathUnits','objectBoundingBox');
 svg.append(mask);section.append(svg);
 let rows=0,blocks=[],pending=false,lastProgress=-1;
 const clamp=value=>Math.max(0,Math.min(1,value));
 function update(){
  pending=false;
  const bounds=section.getBoundingClientRect();
  if(section.hidden || !bounds.width){
   marquee.style.animationPlayState='paused';
   document.body.classList.remove('booth-invitation-in-view');
   return;
  }
  const progress=clamp((innerHeight*.85-bounds.top)/Math.max(1,innerHeight*.75));
  const count=Math.max(4,Math.round(bounds.height/(bounds.width/16)));
  if(rows!==count){
   rows=count;lastProgress=-1;mask.replaceChildren();
   blocks=Array.from({length:rows*2},(_,i)=>{
    const rect=document.createElementNS(ns,'rect');
    rect.setAttribute('width','.5');rect.setAttribute('y',Math.floor(i/2)/rows);
    rect.setAttribute('height',1/rows+.001);mask.append(rect);return rect;
   });
  }
  if(progress!==lastProgress)blocks.forEach((rect,i)=>{
   const row=Math.floor(i/2),side=i%2;
   const offset=((row*7+side*3)%5)*.045;
   const opened=clamp((progress-offset)/.8);
   const width=progress===1?0:.5-Math.floor(opened*8)/16;
   rect.setAttribute('transform',`translate(${side?1-width:0} 0) scale(${width*2} 1)`);
  });
  lastProgress=progress;
  cover.style.clipPath=reduce.matches?'none':'url(#booth-invitation-mask)';
  cover.style.opacity=reduce.matches?String(1-progress):'1';
  // Tab focus must always uncover its destination, including reverse scrolling.
  if(section.querySelector(':focus-visible'))cover.style.opacity='0';
  const visible=bounds.top<innerHeight && bounds.bottom>0;
  marquee.style.animationPlayState=visible && !document.hidden?'running':'paused';
  document.body.classList.toggle('booth-invitation-in-view',bounds.top<=innerHeight*.5 && bounds.bottom>innerHeight*.5);
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 window.addEventListener('load',schedule,{once:true});
 window.addEventListener('trace:booth-page',schedule);
 document.addEventListener('visibilitychange',schedule);
 section.addEventListener('focusin',schedule);section.addEventListener('focusout',schedule);
 reduce.addEventListener('change',schedule);

 const enter=section.querySelector('.booth-enter');
 const copy=section.querySelector('.booth-invitation-copy');
 const mouse=matchMedia('(hover:hover) and (pointer:fine)');
 let cursorFrame=0,pointer=null;
 function resetCursor(){
  cancelAnimationFrame(cursorFrame);cursorFrame=0;pointer=null;
  section.classList.remove('is-cursor-following');
  enter.style.removeProperty('transform');
 }
 function moveCursor(){
  cursorFrame=0;
  if(!pointer)return;
  const bounds=section.getBoundingClientRect();
  const origin=copy.getBoundingClientRect();
  const radius=enter.offsetWidth/2;
  const x=Math.max(bounds.left+radius+8,Math.min(bounds.right-radius-8,pointer.x));
  const y=Math.max(bounds.top+radius+8,Math.min(bounds.bottom-radius-8,pointer.y));
  const dx=x-origin.left-enter.offsetLeft-radius;
  const dy=y-origin.top-enter.offsetTop-radius;
  section.classList.add('is-cursor-following');
  enter.style.transform=`translate3d(${dx}px,${dy}px,0)`;
 }
 section.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||!mouse.matches||reduce.matches||lastProgress<1||enter.matches(':focus-visible'))return;
  pointer={x:event.clientX,y:event.clientY};
  if(!cursorFrame)cursorFrame=requestAnimationFrame(moveCursor);
 },{passive:true});
 section.addEventListener('pointerleave',resetCursor);
 section.addEventListener('pointercancel',resetCursor);
 section.addEventListener('focusin',resetCursor);
 section.addEventListener('click',event=>{
  if(!section.classList.contains('is-cursor-following')||!event.detail||event.target.closest('button,a,input,select,textarea'))return;
  // Preserve the actual pointer origin for the entrance reveal.
  enter.dispatchEvent(new MouseEvent('click', {
   bubbles:true,cancelable:true,detail:event.detail,clientX:event.clientX,clientY:event.clientY
  }));
  resetCursor();
 });
 document.addEventListener('keydown',event=>{if(event.key==='Tab')resetCursor();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetCursor();});
 window.addEventListener('scroll',resetCursor,{passive:true});
 window.addEventListener('resize',resetCursor,{passive:true});
 window.addEventListener('trace:booth-page',resetCursor);
 mouse.addEventListener('change',resetCursor);
 reduce.addEventListener('change',resetCursor);
 window.addEventListener('trace:idle-reset',()=>{
  resetCursor();
  marquee.getAnimations().forEach(animation=>{animation.currentTime=0;});
  update();
 });
 update();
})();
