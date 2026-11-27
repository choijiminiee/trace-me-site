(() => {
 const group=document.querySelector('#monthly-overview .month-analysis');
 if(!group)return;
 const line=group.querySelector('.month-flow polyline');
 const dots=[...group.querySelectorAll('.month-flow circle')];
 const bars=[...group.querySelectorAll('.month-emotion-track i')];
 const values=[...group.querySelectorAll('.month-emotion-row strong')];
 const targets=values.map(e=>Number.parseInt(e.textContent,10));
 const digits=values.map(e=>e.firstChild);
 let frame;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const length=line.getTotalLength();
 const animations=[];
 const speed=1.5;
 const lineDuration=2400/speed;
 const markerDuration=320/speed;
 const barDuration=1250/speed;
 let finished=false;
 let running=false;
 function unlock(){group.removeAttribute('data-motion-locked');}
 line.style.strokeDasharray=String(length);
 function show(){
  unlock();running=false;finished=true;cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());
  line.style.strokeDashoffset='0';
  dots.forEach(e=>e.style.opacity='1');
  bars.forEach(e=>e.style.transform='scaleX(1)');
  values.forEach((e,i)=>{e.style.opacity='1';digits[i].textContent=String(targets[i]);});
 }
 function reset(){
 unlock();finished=false;running=false;cancelAnimationFrame(frame);
 animations.splice(0).forEach(a=>a.cancel());
 line.style.strokeDashoffset=String(length);
 dots.forEach(e=>e.style.opacity='0');
 bars.forEach(e=>{e.style.transformOrigin='left';e.style.transform='scaleX(0)';});
 values.forEach((e,i)=>{e.style.opacity='1';digits[i].textContent='0';});
 }
 reset();
 function play(){
  if(running||finished)return;
  running=true;
  const animate=(e,frames,duration,delay=0)=>{
   const a=e.animate(frames,{duration,delay,easing:'ease-in-out',fill:'forwards'});animations.push(a);return a;
  };
  animate(line,[{strokeDashoffset:length},{strokeDashoffset:0}],lineDuration);
   // Reveal markers when the drawn line reaches their position.
  const points=[...line.points];
  let travelled=0;
  dots.forEach((e,i)=>{
   if(i)travelled+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
   const fraction=travelled/length;
   // Invert the same CSS ease-in-out curve to align marker timing.
   const bezier=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
   let low=0,high=1;
   for(let n=0;n<20;n++){const mid=(low+high)/2;if(bezier(mid,0,1)<fraction)low=mid;else high=mid;}
   const time=bezier((low+high)/2,.42,.58);
   animate(e,[{opacity:0},{opacity:1}],markerDuration,time*lineDuration);
  });
  // Both charts start together; all balance bars share the same start time.
  const fills=bars.map(e=>animate(e,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],barDuration));
  function count(){
   if(finished)return;
   fills.forEach((animation,i)=>{
    const progress=animation.effect.getComputedTiming().progress??0;
    digits[i].textContent=String(Math.round(targets[i]*progress));
   });
   frame=requestAnimationFrame(count);
  }
  frame=requestAnimationFrame(count);
  Promise.all(animations.map(a=>a.finished)).then(show).catch(()=>{unlock();});
 }
 function visibility(){
  if(reduced.matches){show();return;}
  const rect=group.getBoundingClientRect();
  if(rect.bottom<=0||rect.top>=innerHeight){reset();return;}
  const visible=Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0);
  if(visible>=Math.min(rect.height,innerHeight)*.5)play();
  animations.forEach(a=>{if(visible<80)a.pause();else if(a.playState==='paused')a.play();});
 }
 let pending=false;
 function schedule(){if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;visibility();});}}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 reduced.addEventListener('change',()=>{reset();visibility();});
 window.addEventListener('trace:idle-reset',()=>{reset();visibility();});
 visibility();
})();
