/* Keep a bounded, display-size sequence ready; playback never fetches or decodes. */
window.TabletFlowerRenderer = class {
 constructor(image, source) {
  this.image=image; this.source=source; this.frames=[]; this.disposed=false; this.ready=false;
  this.indices=Array.from({length:351},(_,i)=>i);
  this.canvas=document.createElement('canvas');
  this.canvas.width=this.canvas.height=384;
  this.canvas.className='tablet-flower-canvas';
  this.canvas.setAttribute('aria-hidden','true');
  this.canvas.hidden=true;
  image.parentElement.append(this.canvas);
  this.ctx=this.canvas.getContext('2d');
 }
 prepare() {
  if(this.preparing)return this.preparing;
  let next=0;
  const worker=async()=>{
   while(!this.disposed && next<this.indices.length){
    const slot=next++, asset=new Image();
    asset.src=this.source(this.indices[slot]);
    try {
     await asset.decode();
     if(this.disposed)return;
     const frame=document.createElement('canvas');frame.width=frame.height=384;
     frame.getContext('2d').drawImage(asset,0,0,384,384);
     this.frames[slot]=frame;
    } finally {asset.src='';}
   }
  };
  this.preparing=Promise.all([worker(),worker(),worker()]).then(()=>{
   if(this.disposed)return;
   this.ready=true;
   this.draw(0);
   this.canvas.hidden=false;
   this.image.style.visibility='hidden';
  });
  return this.preparing;
 }
 draw(progress) {
  if(!this.ready || this.disposed)return;
  const slot=Math.max(0,Math.min(350,Math.round(progress*350)));
  if(this.lastDraw===slot)return slot/350;
  this.lastDraw=slot;
  this.ctx.clearRect(0,0,384,384);
  this.ctx.globalCompositeOperation='source-over';this.ctx.globalAlpha=1;
  this.ctx.drawImage(this.frames[slot],0,0);
  // Capture metadata belongs to the frame actually painted, not the next target.
  this.canvas.dataset.flowerFrame=String(slot+1);
  this.canvas.dataset.flowerSrc=this.source(slot);
  return slot/350;
 }
 dispose(){
  this.disposed=true;
  for(const frame of this.frames){if(frame)frame.width=frame.height=0;}
  this.frames=[];this.canvas.remove();this.image.style.visibility='';
 }
};
