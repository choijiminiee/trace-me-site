(() => {
 const section=document.querySelector('#live-trace-intro');
 const button=section?.querySelector('.booth-enter');
 const target=document.querySelector('#photo-booth');
 if(!button||!target)return;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let x=0,y=0,tx=0,ty=0,raf=0,last=0,active=false,busy=false;
 const clamp=(v,max)=>Math.max(0,Math.min(max,v));
 function tick(time){
  raf=0;const dt=Math.min(last?time-last:16,40);last=time;
  const k=reduce.matches?1:1-Math.exp(-dt/75);
  x+=(tx-x)*k;y+=(ty-y)*k;
  button.style.transform=`translate3d(${x}px,${y}px,0)`;
  if(active&&(Math.abs(tx-x)>.1||Math.abs(ty-y)>.1))raf=requestAnimationFrame(tick);
 }
 function reset(){if(busy)return;active=false;cancelAnimationFrame(raf);raf=0;last=0;section.classList.remove('booth-following');button.style.transform='';}
 section.addEventListener('pointermove',e=>{
  if(!fine.matches||e.pointerType==='touch'||busy)return;
  tx=clamp(e.clientX-28,innerWidth-56);ty=clamp(e.clientY-28,innerHeight-56);
  if(!active){active=true;x=tx;y=ty;section.classList.add('booth-following');}
  if(!raf)raf=requestAnimationFrame(tick);
 });
 section.addEventListener('pointerleave',reset);
 section.addEventListener('focusin',reset);
 window.addEventListener('scroll',reset,{passive:true});
 window.addEventListener('resize',reset);
 async function enter(){
  if(busy)return;
  const rect=button.getBoundingClientRect();reset();busy=true;button.disabled=true;
  const wipe=document.createElement('div');wipe.className='booth-wipe';wipe.setAttribute('aria-hidden','true');
  const message=document.createElement('div');
  message.className='booth-transition-message';
  message.setAttribute('role','dialog');
  message.setAttribute('aria-modal','true');
  message.setAttribute('aria-label','ENTER PHOTO BOOTH');
  message.innerHTML='<button type="button" class="booth-confirm">ENTER PHOTO BOOTH</button><p>THIS BOOTH USES A BUILT-IN CAMERA.<br>PHOTOS ARE SAVED TO VISITOR TRACE ON THIS DEVICE ONLY WITH YOUR PERMISSION.</p>';
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  wipe.style.left=`${cx-28}px`;wipe.style.top=`${cy-28}px`;document.body.append(wipe);
  const scale=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy))/28+1;
  try {
   await wipe.animate([{transform:'scale(1)'},{transform:`scale(${scale})`}],{duration:reduce.matches?0:450,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'}).finished;
   document.body.append(message);
   await message.animate([{opacity:0},{opacity:1}],{duration:reduce.matches?0:200,fill:'forwards'}).finished;
   const confirm=message.querySelector('.booth-confirm');
   confirm.focus({preventScroll:true});
   await new Promise(resolve=>confirm.addEventListener('click',resolve,{once:true}));
   await message.animate([{opacity:1},{opacity:0}],{duration:reduce.matches?0:200,fill:'forwards'}).finished;
   target.hidden=false;
   target.dispatchEvent(new Event('camera-request-start'));
   window.ScrollTrigger?.refresh();
   target.classList.add('is-visible');window.scrollTo({top:target.getBoundingClientRect().top+scrollY,behavior:'instant'});
   target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
   await wipe.animate([{opacity:1},{opacity:0}],{duration:reduce.matches?0:200,fill:'forwards'}).finished;
  } finally {message.remove();wipe.remove();busy=false;button.disabled=false;}
 }
 button.addEventListener('click',e=>{e.stopPropagation();enter();});
 section.addEventListener('click',e=>{if(active&&!e.target.closest('a,button'))enter();});
})();
