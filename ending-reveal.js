(() => {
 const section=document.querySelector('#ending');
 if(!section)return;
 const stage=document.createElement('div');stage.className='ending-stage';
 const panel=document.createElement('div');panel.className='ending-black-panel';panel.setAttribute('aria-hidden','true');
 const content=document.createElement('div');content.className='ending-content';
 content.append(...section.childNodes);stage.append(panel,content);section.append(stage);
 const darkContent=content.cloneNode(true);
 darkContent.classList.add('ending-dark-content');
 darkContent.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
 darkContent.inert=true;panel.append(darkContent);
 const ns='http://www.w3.org/2000/svg';
 const defs=document.createElementNS(ns,'svg');
 defs.setAttribute('width','0');defs.setAttribute('height','0');
 defs.style.position='absolute';defs.setAttribute('aria-hidden','true');
 const clip=document.createElementNS(ns,'clipPath');
 clip.id='ending-block-mask';clip.setAttribute('clipPathUnits','objectBoundingBox');
 defs.append(clip);stage.append(defs);
 panel.style.clipPath='url(#ending-block-mask)';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pending=false, rows=0, blocks=[];
 function update(){
  pending=false;
  const top=section.getBoundingClientRect().top;
  document.body.classList.toggle('ending-in-view',top<=1);
  // Complete the blocks as this final screen enters, not after scrolling past it.
  const spread=Math.max(0,Math.min(1,(innerHeight*.8-top)/Math.max(1,innerHeight*.68)));
  const count=Math.max(4,Math.round(stage.clientHeight/(stage.clientWidth/16)));
  if(rows!==count){
   rows=count;clip.replaceChildren();
   blocks=Array.from({length:rows},(_,row)=>[0,1].map(side=>{
    const rect=document.createElementNS(ns,'rect');
    rect.setAttribute('y',row/rows);rect.setAttribute('height',1/rows+.001);
    clip.append(rect);return rect;
   }));
  }
  blocks.forEach((pair,row)=>pair.forEach((rect,side)=>{
   const offset=((row*7+side*3)%5)*.045;
   const amount=Math.max(0,Math.min(1,(spread-offset)/.8));
   const width=spread===1?.5:Math.floor(amount*8)/16;
   rect.setAttribute('x',side?1-width:0);rect.setAttribute('width',width);
  }));
  panel.style.clipPath=reduced.matches?'none':'url(#ending-block-mask)';
  panel.style.opacity=reduced.matches?spread:1;
 }
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 window.addEventListener('resize',update);reduced.addEventListener('change',update);
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const words=[...section.querySelectorAll('.ending-word')];
 function resetWords(){words.forEach(word=>word.style.transform='translateX(0px)');}
 stage.addEventListener('pointermove',event=>{
  if(reduced.matches || !finePointer.matches || event.pointerType==='touch')return;
  const rect=stage.getBoundingClientRect();
  const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
  const travel=Math.min(rect.width*.045,70);
  words.forEach((word,index)=>word.style.transform=`translateX(${x*travel*(index%2===0?1:-1)}px)`);
 });
 stage.addEventListener('pointerleave',resetWords);
 reduced.addEventListener('change',resetWords);
 finePointer.addEventListener('change',resetWords);
 section.addEventListener('focusin',resetWords);
 window.addEventListener('trace:idle-reset',()=>{resetWords();update();});
 update();
})();
