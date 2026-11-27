/* Both experiences use the same input mapping, timing, and bounded frame renderer. */
(() => {
  (window.tracePreviewRoots?.() || document.querySelectorAll('.live-trace')).forEach(section => {
    const image=section.querySelector('.live-flower-stage img');
    const line=section.querySelector('.live-scale-line');
    if(!image || !line)return;
    const analysis=section.querySelector('.live-analysis');
    const number=section.querySelector('.live-analysis-value')?.firstChild;
    const frames=Array.from({length:351},(_,i)=>i===350?'public/flower-videos/hero-final-frame.png':`public/hero-sequence/frame-${String(i+1).padStart(3,'0')}.jpg`);
    const response=new TraceFlowerResponse.Response();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const renderer=new window.TabletFlowerRenderer(image,index=>frames[index]);
    let raf=null,loaded=false,disposed=false;
    function render(){
      const next=Math.round(response.current*350);
      renderer.draw(response.current);
      image.dataset.flowerSrc=frames[next];
      image.dataset.flowerFrame=String(next+1);
      if(number)number.nodeValue=String(Math.round(response.current*100)).padStart(2,'0');
      analysis?.setAttribute('aria-label',`Expression Change ${Math.round(response.current*100)}퍼센트`);
      line.style.setProperty('--flower-progress',`${response.current*100}%`);
    }
    function tick(now){
      raf=null;
      if(disposed || !loaded)return;
      response.advance(now,reduced.matches);
      render();
      if(response.current!==response.target)raf=requestAnimationFrame(tick);
      else response.lastTime=null;
    }
    function follow(event){
      response.input(event.detail,performance.now());
      if(loaded && raf===null)raf=requestAnimationFrame(tick);
      if(!loaded)render();
    }
    section.addEventListener('expression-change',follow);
    render();
    renderer.prepare().then(()=>{
      if(disposed)return;
      loaded=true;
      if(raf===null)raf=requestAnimationFrame(tick);
    }).catch(error=>console.error('Flower preload failed:',error));
    function dispose(){
      disposed=true;renderer.dispose();
      if(raf!==null)cancelAnimationFrame(raf);
      section.removeEventListener('expression-change',follow);
      window.removeEventListener('pagehide',dispose);
      removal.disconnect();
    }
    const removal=new MutationObserver(()=>{if(!section.isConnected)dispose();});
    removal.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('pagehide',dispose);
  });
})();
