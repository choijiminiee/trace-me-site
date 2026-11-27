/* Section 02 presentation only. Analysis and Section 01 are independent. */
(() => {
  document.querySelectorAll('.live-trace').forEach(section => {
  const image = section.querySelector('.live-flower-stage img');
  const line = section.querySelector('.live-scale-line');
  const analysis = section.querySelector('.live-analysis');
  const number = section.querySelector('.live-analysis-value').firstChild;
  const frames = Array.from({ length: 351 }, (_, i) => i === 350 ? 'public/flower-videos/hero-final-frame.png' : `public/hero-sequence/frame-${String(i+1).padStart(3,'0')}.jpg`);
  const FOLLOW_MS = 50;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let targetFlowerProgress = 0, currentFlowerProgress = 0;
  let lastInput = null;
  let frame = 0, raf = null, lastTime = null, loaded = false, disposed = false;
  const preloaded = frames.map(src => { const img = new Image(); img.src = src; return img; });
  function render() {
    const next = Math.round(currentFlowerProgress * (frames.length-1));
    if (next !== frame || image.getAttribute('src') !== frames[next]) { image.src = frames[next]; frame = next; }
    image.dataset.flowerFrame = String(next + 1);
    const percentage = Math.round(currentFlowerProgress*100);
    number.nodeValue = String(percentage).padStart(2,'0');
    analysis.setAttribute('aria-label', `Expression Change ${percentage}퍼센트`);
    line.style.setProperty('--flower-progress', `${currentFlowerProgress*100}%`);
  }
  function reset() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null; lastTime = null;
    targetFlowerProgress = currentFlowerProgress = 0;
    lastInput = null;
    render();
  }
  function tick(now) {
    raf = null;
    if (disposed || !loaded) return;
    const dt = lastTime === null ? 1000/60 : Math.min(33.34, Math.max(0, now-lastTime));
    lastTime = now;
    const difference = targetFlowerProgress-currentFlowerProgress;
    // Follow continuously from the visible frame, with a speed cap for abrupt input.
    const step = difference * (1 - Math.exp(-dt / FOLLOW_MS));
    const maxStep = dt / (reducedMotion.matches ? 4000 : 1050);
    currentFlowerProgress += Math.max(-maxStep, Math.min(maxStep, step));
    if (Math.abs(targetFlowerProgress-currentFlowerProgress)<0.0001) currentFlowerProgress=targetFlowerProgress;
    render();
    if (currentFlowerProgress !== targetFlowerProgress) raf=requestAnimationFrame(tick);
    else lastTime=null;
  }
  function follow(event) {
    const result = event.detail;
    if (result.status !== '● TRACE READY') {
      // Brief face loss holds the last output; calibration/reset always starts at BUD.
      if (result.status === 'SEARCHING FOR FACE...') {
        targetFlowerProgress=currentFlowerProgress; lastInput=null;
      } else reset();
      return;
    }
    // Use fresh measurements, not the tracker's delayed display value.
    const input = result.rawExpressionChange ?? result.displayExpressionChange;
    if (!Number.isFinite(input)) return;
    const nextInput=Math.max(0,Math.min(1,input/100));
    if (lastInput !== null && Math.abs(nextInput-lastInput) < .02) return;
    lastInput=nextInput;
    // Map the current expression to an absolute pose, never accumulate deltas.
    // Strong expression reaches full bloom, rather than continuing into wilt.
    const fullBloomFrame = 240;
    targetFlowerProgress = Math.min(1, nextInput / .6) * (fullBloomFrame-1)/(frames.length-1);
    if (loaded && raf === null) raf=requestAnimationFrame(tick);
  }
  section.addEventListener('expression-change',follow);
  render();
  Promise.all(preloaded.map(img=>img.decode())).then(()=>{
    if (disposed) return;
    loaded=true;
    if (raf === null) raf=requestAnimationFrame(tick);
  }).catch(error=>console.error('Flower preload failed:',error));
  function dispose() {
    disposed=true;
    if (raf !== null) cancelAnimationFrame(raf);
    section.removeEventListener('expression-change',follow);
    window.removeEventListener('pagehide',dispose);
    removal.disconnect();
  }
  const removal=new MutationObserver(()=>{if(!section.isConnected) dispose();});
  removal.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pagehide',dispose);
  });
})();
