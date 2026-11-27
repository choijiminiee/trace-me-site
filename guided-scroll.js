/* Continuous website scrolling: soften large wheel input without chapter gates. */
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let settleTimer=0, aligning=false;
 const visible=e=>e && !e.hidden && e.getClientRects().length;
 // The sticky process camera uses vertical distance to move its horizontal track.
 function processRange(){
  const runway=document.querySelector('.process-runway');
  if(!visible(runway))return null;
  const start=runway.getBoundingClientRect().top+scrollY;
  return {start,end:start+Math.max(0,runway.offsetHeight-innerHeight)};
 }
 function inProcess(){
  const range=processRange();
  return range&&scrollY>=range.start-2&&scrollY<range.end;
 }
 function stops(){
  const points=[0];
  const max=document.documentElement.scrollHeight-innerHeight;
  document.querySelectorAll('section[id]').forEach(section=>{
   if(section.parentElement.closest('section'))return;
   if(!visible(section))return;
   const pin=window.ScrollTrigger?.getAll().find(t=>t.trigger===section&&t.pin);
   const top=pin?pin.start:section.getBoundingClientRect().top+scrollY;
   if(pin&&section.id==='about-transition'){points.push(pin.start+2);return;}
   const height=section.offsetHeight;
   if(height<=innerHeight*1.15){points.push(top+(height-innerHeight)/2);return;}
   points.push(top);
   // Long chapters retain all their content instead of jumping to their end.
   const end=top+height-innerHeight;
   const steps=Math.ceil((end-top)/(innerHeight*.8));
   for(let i=1;i<=steps;i++)points.push(top+(end-top)*i/steps);
  });
  const about=document.querySelector('#about');
  const trigger=window.ScrollTrigger?.getAll().find(t=>t.trigger===about);
  if(trigger){
   const start=trigger.start,end=trigger.end;
   for(let i=points.length-1;i>=0;i--)if(points[i]>start&&points[i]<end)points.splice(i,1);
   [.72,1.12,1.65,2.21,2.79,3.37].forEach(p=>points.push(start+(end-start)*p/3.66));
  }
  const process=processRange();
  if(process){
   for(let i=points.length-1;i>=0;i--)if(points[i]>=process.start&&points[i]<=process.end)points.splice(i,1);
   points.push(...(window.traceProcessStops?.() || [process.start]),process.end);
  }
  return [...new Set(points.map(p=>Math.round(Math.max(0,Math.min(max,p)))))].sort((a,b)=>a-b);
 }

 let frame=0, direction=0, target=scrollY, lastFrame=null, embeddedGesture=false;
 function cancel(){clearTimeout(settleTimer);aligning=false;cancelAnimationFrame(frame);frame=0;target=scrollY;lastFrame=null;embeddedGesture=false;}
 function tick(now){
  if(excluded(document.body)){cancel();return;}
  const dt=lastFrame===null?16.67:Math.min(50,now-lastFrame);
  lastFrame=now;
  const difference=target-scrollY;
  const next=reduce.matches||Math.abs(difference)<.5?target:scrollY+difference*(1-Math.exp(-dt/(aligning?160:95)));
  scrollTo({top:next,behavior:'instant'});
  if(Math.abs(target-scrollY)>.5)frame=requestAnimationFrame(tick);
  else {scrollTo({top:target,behavior:'instant'});frame=0;lastFrame=null;if(!aligning)scheduleAlign();else aligning=false;}
 }
 function scheduleAlign(){
  clearTimeout(settleTimer);
  // A short upward gesture must not snap back into the iframe it just left.
  if(embeddedGesture)return;
  settleTimer=setTimeout(()=>{
   if(frame||excluded(document.body))return;
   const points=stops();
   const nearest=points.reduce((best,p)=>Math.abs(p-scrollY)<Math.abs(best-scrollY)?p:best,Infinity);
   if(!Number.isFinite(nearest)||Math.abs(nearest-scrollY)<2)return;
   // All chapters settle, including the longer scroll-driven story intervals.
   target=nearest;aligning=true;lastFrame=null;
   frame=requestAnimationFrame(tick);
  },300);
 }
 function excluded(target){
  if(window.traceBoothFlow?.activeId)return true;
  if(document.body.classList.contains('is-exhibition-idle'))return true;
  if(document.querySelector('dialog[open],[aria-modal="true"],[data-motion-locked]')||document.body.style.overflow==='hidden'||window.traceRestoringPreview)return true;
  for(let el=target;el&&el!==document.body;el=el.parentElement){
   if(el.matches('input,textarea,select,[contenteditable="true"]'))return true;
   if(/auto|scroll/.test(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+2)return true;
  }
  return false;
 }
 function moveBy(delta,fromEmbed=false){
  clearTimeout(settleTimer);
  if(aligning)cancel();
  const nextDirection=Math.sign(delta);
  if(nextDirection!==direction)cancel();
  embeddedGesture=fromEmbed;
  direction=nextDirection;
  if(!frame)target=scrollY;
  const amount=Math.abs(delta);
  // Ordinary gestures retain their distance; large spikes taper without being discarded.
  const softened=amount<=80?amount:80+Math.sqrt((amount-80)*40);
  const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  target=Math.max(0,Math.min(max,target+direction*softened));
  if(!frame)frame=requestAnimationFrame(tick);
 }
 window.addEventListener('wheel',event=>{
  if(event.defaultPrevented||event.ctrlKey||!event.deltaY||Math.abs(event.deltaX)>Math.abs(event.deltaY)||excluded(event.target))return;
  event.preventDefault();
  const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
  moveBy(event.deltaY*unit);
 },{passive:false});
 // The booth relays only gestures that cannot scroll its own page.
 window.addEventListener('trace:embedded-scroll',event=>{
  const delta=event.detail?.deltaY;
  if(!Number.isFinite(delta)||!delta||excluded(document.body))return;
  moveBy(delta,true);
 });
 // Use the same reading positions as scrolling, including long animated chapters.
 window.addEventListener('trace:next-page',event=>{
  if(excluded(document.body))return;
  const next=stops().find(point=>point>scrollY+4);
  if(next===undefined)return;
  window.dispatchEvent(new Event('trace:navigate'));
  target=next;
  if(reduce.matches||event.detail?.instant){
   scrollTo({top:target,behavior:'instant'});
   return;
  }
  aligning=true;
  frame=requestAnimationFrame(tick);
 });
 // Explicit navigation and keyboard scrolling always take precedence.
 window.addEventListener('trace:navigate',cancel);
 window.addEventListener('keydown',cancel);
 window.addEventListener('pointerdown',cancel);
 window.addEventListener('resize',cancel);
 window.addEventListener('scroll',()=>{if(!frame&&!aligning)scheduleAlign();},{passive:true});
 window.addEventListener('pagehide',cancel);
})();
