/* The LIVE TRACE pearl-light reveal, followed by an explicit photo + card review. */
window.revealTabletCapture = dialog => {
 const card=dialog.querySelector('.visitor-consent-card');
 const pair=dialog.querySelector('.visitor-consent-pair');
 const explanation=dialog.querySelector('.visitor-bloom-explanation');
 const artwork=dialog.querySelector('.visitor-consent-flower');
 const surface=dialog.querySelector('.visitor-forge-surface');
 const bloom=dialog.querySelector('.visitor-forge-flower');
 const glow=dialog.querySelector('.visitor-forge-glow');
 const rim=dialog.querySelector('.visitor-forge-rim');
 const scan=dialog.querySelector('.visitor-forge-scan');
 const copy=[...explanation.children];
 const heading=dialog.querySelector('h2');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const out='cubic-bezier(.23,1,.32,1)',move='cubic-bezier(.77,0,.175,1)';
 const animations=[];
 let ended=false,resolveFinished,resolveReady;
 const finished=new Promise(resolve=>{resolveFinished=resolve;});
 const ready=new Promise(resolve=>{resolveReady=resolve;});
 heading.textContent='CREATING YOUR FLOWER CARD';
 dialog.setAttribute('aria-busy','true');
 dialog.dataset.revealPhase='forming';
 const pairBox=pair.getBoundingClientRect(),cardBox=card.getBoundingClientRect();
 const centered=`translateX(${pairBox.left+pairBox.width/2-cardBox.left-cardBox.width/2}px)`;
 card.style.transform=reduce.matches?'none':centered;
 function finish(completed=true){
  if(ended)return;
  ended=true;animations.forEach(animation=>animation.cancel());
  dialog.classList.remove('is-forging','is-reading');dialog.removeAttribute('aria-busy');
  delete dialog.dataset.revealPhase;
  card.style.removeProperty('transform');heading.textContent='YOUR FLOWER CARD';
  window.removeEventListener('resize',onResize);
  window.removeEventListener('pagehide',onHide);
  reduce.removeEventListener('change',onReduce);
  resolveReady(completed);resolveFinished(completed);
 }
 function onResize(){finish();}
 function onHide(){finish(false);}
 function onReduce(){if(reduce.matches)finish();}
 window.addEventListener('resize',onResize);
 window.addEventListener('pagehide',onHide,{once:true});
 reduce.addEventListener('change',onReduce);
 async function animate(element,frames,options){
  if(ended)return;
  const animation=element.animate(frames,{fill:'both',easing:out,...options});
  animations.push(animation);await animation.finished;
 }
 (async()=>{
  try {
   // Warm the final artwork as well as the frozen flower before revealing either.
   const print=new Image();print.src=artwork.querySelector('image')?.getAttribute('href') || artwork.querySelector('img')?.src || '';
   await Promise.allSettled([bloom.decode(),print.decode()]);
   if(ended)return;
   if(reduce.matches){
    await Promise.all([
     animate(artwork,[{opacity:0},{opacity:1}],{duration:150}),
     animate(explanation,[{opacity:0},{opacity:1}],{duration:150})
    ]);
   }else{
    await Promise.all([
     animate(surface,[{opacity:0},{opacity:1}],{duration:300}),
     animate(card,[{opacity:0,transform:centered+' scale(.96)'},{opacity:1,transform:centered+' scale(1)'}],{duration:300})
    ]);
    await Promise.all([
     animate(glow,[{opacity:0},{opacity:.85,offset:.45},{opacity:.3}],{duration:700,easing:move}),
     animate(bloom,[{opacity:0,transform:'scale(.94)'},{opacity:1,transform:'scale(1)'}],{duration:500}),
     animate(rim,[{opacity:0},{opacity:1}],{duration:300})
    ]);
    if(ended)return;
    dialog.dataset.revealPhase='printing';
    await Promise.all([
     animate(surface,[{clipPath:'inset(0% 0 0 0)'},{clipPath:'inset(100% 0 0 0)'}],{duration:1000,easing:move}),
     animate(artwork,[{opacity:1,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}],{duration:1000,easing:move}),
     animate(scan,[
      {opacity:0,transform:'translateY(-50%)'},
      {opacity:.8,offset:.15},{opacity:.8,offset:.8},
      {opacity:0,transform:'translateY(50%)'}
     ],{duration:1000,easing:move})
    ]);
    if(ended)return;
    // Hold the complete card briefly, then ease into the slower reading sequence.
    // Ready remains independent of the decorative delays so NEXT stays usable.
    dialog.classList.add('is-reading');dialog.dataset.revealPhase='explaining';
    dialog.removeAttribute('aria-busy');resolveReady(true);
    await Promise.all([
     animate(card,[{transform:centered},{transform:'translateX(0px)'}],{duration:700,delay:450,easing:move}),
     ...copy.map((element,index)=>animate(element,[
      {opacity:0,transform:'translateY(12px)'},
      {opacity:1,transform:'translateY(0px)'}
     ],{duration:500,delay:950+index*140}))
    ]);
    if(ended)return;
   }
   finish();
  }catch{
   // Closing cancels the run; an unsupported animation still leaves a usable review.
   if(!ended)finish();
  }
 })();
 return {ready,finished,cancel:()=>finish(false)};
};
