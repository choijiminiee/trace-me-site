(() => {
  // First-visit reveals bridge chapter changes; controls and live data stay still.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const elements = document.querySelectorAll('#bloom-calendar > header, #bloom-calendar .bloom-calendar-caption, #monthly-overview .month-story-copy, #monthly-overview .month-facts > div, #monthly-insight .insight-data-card, #me .me-moments figure');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (reduce.matches || target.contains(document.activeElement)) return;
      const photo = target.matches('figure');
      const direction = photo ? ([...target.parentElement.children].indexOf(target)%2 ? 1 : -1) : 0;
      const animation = target.animate(photo ? [
        {clipPath:'inset(12% 8% 12% 8%)',opacity:0,transform:`translate(${direction*80}px, 64px) rotate(${direction*6}deg) scale(.94)`},
        {clipPath:'inset(0 0 0 0)',opacity:1,transform:'translateY(0)'}
      ] : [{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}], {
        duration:photo ? 1600 : 1100,
        easing:getComputedStyle(document.documentElement).getPropertyValue('--editorial-ease-out').trim(),
        delay:target.matches('.insight-data-card') ? [...target.parentElement.children].indexOf(target)*160 : photo ? [...target.parentElement.children].indexOf(target)*140 : 0,
        fill:'backwards'
      });
      animations.add(animation);
      animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
    });
  },{threshold:.12});
  elements.forEach(element=>observer.observe(element));
  window.addEventListener('trace:idle-reset', () => {
    animations.forEach(animation=>animation.cancel());
    elements.forEach(element=>observer.observe(element));
  });
  reduce.addEventListener('change',()=>{if(reduce.matches)animations.forEach(animation=>animation.cancel());});
  document.addEventListener('keydown',()=>animations.forEach(animation=>animation.finish()));
})();

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const title = document.querySelector('#me-title');
  if (title) {
    const text = title.textContent;
    title.setAttribute('aria-label',text);
    title.replaceChildren(...text.split(' ').flatMap((word,i)=>{
      const mask=document.createElement('span'); mask.className='title-word-mask'; mask.setAttribute('aria-hidden','true');
      const inner=document.createElement('span');
      if (word.endsWith('.')) {
        const period=document.createElement('span'); period.className='title-period'; period.textContent='.';
        inner.append(document.createTextNode(word.slice(0,-1)),period);
      } else inner.textContent=word;
      mask.append(inner);
      return i ? [document.createTextNode(' '),mask] : [mask];
    }));
    const active=[];
    const observer=new IntersectionObserver(entries=>{
      if (!entries.some(entry=>entry.isIntersecting))return;
      observer.disconnect();
      if(reduce.matches)return;
      title.querySelectorAll('.title-word-mask > span').forEach((word,i)=>{
        active.push(word.animate([{transform:'translateY(100%)',opacity:0},{transform:'translateY(0)',opacity:1}],
          {duration:1200,delay:i*140,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));
      });
    },{threshold:.01,rootMargin:"0px 0px -10% 0px"});
    observer.observe(title);
    window.addEventListener('trace:idle-reset', () => {
      active.splice(0).forEach(animation=>animation.cancel());
      observer.observe(title);
    });
    reduce.addEventListener('change',()=>{if(reduce.matches)active.forEach(a=>a.cancel());});
    document.addEventListener('keydown',()=>active.forEach(a=>{if(a.playState==='running')a.finish();}));
  }
})();

// Bolder first-view choreography for the exhibition, without pinning scroll.
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const running=new Set();
 const groups=[

  ['#monthly-overview .month-flower','bloom'],

 ];
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  if(reduce.matches)return;
  const type=entry.target.dataset.exhibitionMotion;
  const frames=type==='calendar' ? [{clipPath:'inset(0 48% 0 48%)',opacity:.2},{clipPath:'inset(0 0 0 0)',opacity:1}]
   :type==='bloom' ? [{transform:'translateX(100px) rotate(-18deg) scale(.9)',opacity:0},{transform:'translateX(0) rotate(0) scale(1)',opacity:1}]
   :[{transform:'translateY(56px)',opacity:0},{transform:'translateY(0)',opacity:1}];
  const a=entry.target.animate(frames,{duration:type==='calendar' ? 1600 : 1400,easing:'cubic-bezier(.23,1,.32,1)'});
  running.add(a);a.finished.then(()=>running.delete(a)).catch(()=>running.delete(a));
 }),{threshold:.15});
 groups.forEach(([selector,type])=>{const e=document.querySelector(selector);if(e){e.dataset.exhibitionMotion=type;observer.observe(e);}});
 const stop=()=>running.forEach(a=>a.cancel());
 window.addEventListener('trace:idle-reset',()=>{
  stop();
  groups.forEach(([selector])=>{const e=document.querySelector(selector);if(e)observer.observe(e);});
 });
 reduce.addEventListener('change',()=>{if(reduce.matches)stop();});
 document.addEventListener('keydown',stop);
 document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-exhibition-motion]'))stop();},{passive:true});
})();
