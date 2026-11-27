(() => {
 const section=document.querySelector('.month-recommendations');
 if(!section)return;
 const stage=document.createElement('div');stage.className='recommendation-stage';
 stage.append(...section.childNodes);section.append(stage);
 const row=stage.querySelector('.insight-practices');
 const cards=[...row.querySelectorAll('details')];
 function matchCardSizes(){
  const samples=cards.map(card=>{
   const copy=card.cloneNode(true);copy.open=true;
   Object.assign(copy.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',transform:'none',height:'auto',width:`${card.getBoundingClientRect().width}px`});
   copy.querySelectorAll('summary, :scope > p').forEach(e=>e.style.minHeight='0');
   row.append(copy);return copy;
  });
  const summaryHeight=Math.max(...samples.map(c=>c.querySelector('summary').getBoundingClientRect().height));
  const bodyHeight=Math.max(...samples.map(c=>c.querySelector(':scope > p').getBoundingClientRect().height));
  samples.forEach(c=>c.remove());
  cards.forEach(c=>{
   c.querySelector('summary').style.minHeight=`${summaryHeight}px`;
   c.querySelector(':scope > p').style.minHeight=`${bodyHeight}px`;
  });
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pending=false;
 const transitions=new WeakMap();
 function setOpen(card,open,simple){
  const previous=transitions.get(card);
  if((previous?.target??card.open)===open)return;
  const from=card.getBoundingClientRect().height;
  previous?.animation.cancel();
  card.style.height='';
  card.open=open;
  const to=card.getBoundingClientRect().height;
  if(simple)return;
  // Keep disclosure content present during the closing animation.
  if(!open)card.open=true;
  card.style.overflow='hidden';
  const animation=card.animate([{height:`${from}px`},{height:`${to}px`}],{
   duration:850,easing:'cubic-bezier(.23,1,.32,1)',fill:'both'
  });
  const state={animation,target:open};transitions.set(card,state);
  animation.finished.then(()=>{
   if(transitions.get(card)!==state)return;
   card.open=open;animation.cancel();card.style.overflow='';transitions.delete(card);
  }).catch(()=>{});
 }
 const clamp=n=>Math.max(0,Math.min(1,n));
 function update(instant=false){
  pending=false;
  const simple=reduced.matches||innerWidth<700;
  section.classList.toggle('recommendation-story',!simple);
  const distance=section.offsetHeight-stage.offsetHeight;
  const progress=simple?1:clamp((80-section.getBoundingClientRect().top)/Math.max(1,distance));
  const spread=clamp((progress-.14)/.55);
  const eased=spread*spread*(3-2*spread);
  cards.forEach((card,i)=>{
   const x=(row.clientWidth/2-card.offsetLeft-card.offsetWidth/2)*(1-eased);
   card.style.transform=simple?'':`translateX(${x}px)`;
   card.style.opacity=String(i===0?1:eased);
   card.style.zIndex=i===0?'3':'1';
   const enabled=simple||spread>.98;
   card.inert=!enabled;
   card.style.pointerEvents=enabled?'auto':'none';
   setOpen(card,simple||progress>=[.73,.81,.89][i],simple||instant===true);
  });
 }
 cards.forEach(card=>{
  card.querySelector('summary').addEventListener('click',event=>{
   if(section.classList.contains('recommendation-story'))event.preventDefault();
  });
 });
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 window.addEventListener('resize',()=>{matchCardSizes();update();});reduced.addEventListener('change',update);
 window.addEventListener('trace:idle-reset',()=>{
  cards.forEach(card=>{
   transitions.get(card)?.animation.cancel();
   transitions.delete(card);
   card.style.height='';card.style.overflow='';card.open=false;
  });
  update(true);
 });
 matchCardSizes();
 document.fonts.ready.then(()=>{matchCardSizes();update();});
 update();
})();
