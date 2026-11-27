// HERO only: decoded frames from one black-background video.
(() => {
  const hero = document.querySelector('#hero');
  const flower = hero.querySelector('.hero-flower');
  const redPanel = hero.querySelector('.hero-red-rectangle');
  const canvas = flower.querySelector('canvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  const hint = hero.querySelector('#bloom-hint');
  const traceCursor = document.createElement('span');
  traceCursor.className = 'hero-trace-cursor';
  traceCursor.textContent = 'TRACE';
  traceCursor.setAttribute('aria-hidden', 'true');
  document.body.append(traceCursor);
  function hideTraceCursor() { traceCursor.classList.remove('is-visible'); }
  hero.addEventListener('pointermove', event => {
    const show = event.pointerType !== 'touch' &&
      !document.body.classList.contains('intro-loading') &&
      !event.target.closest('.navigation');
    traceCursor.classList.toggle('is-visible', show);
    traceCursor.style.left = `${event.clientX}px`;
    traceCursor.style.top = `${event.clientY}px`;
  }, {capture:true});
  hero.addEventListener('pointerleave', hideTraceCursor);
  window.addEventListener('scroll', hideTraceCursor, {passive:true});
  window.addEventListener('blur', hideTraceCursor);
  // Original hero video and cursor-driven lifecycle.
  const video = document.createElement('video');
  video.src = 'public/flower-videos/hero-contour-refined.mp4?v=1';
  video.preload = 'auto'; video.muted = true; video.playsInline = true;
  video.setAttribute('playsinline','');
  video.setAttribute('aria-hidden','true');
  video.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
  flower.append(video);
  let requestedTime = 0;
  function paintVideo() {
    if(video.readyState < 2) return;
    resizeCanvas();
    ctx.drawImage(video,0,0,canvas.width,canvas.height);
  }
  function seekVideo() {
    if(!ready || video.seeking) return;
    if(Math.abs(video.currentTime-requestedTime) > 1/120) video.currentTime=requestedTime;
  }
  video.addEventListener('seeked',()=>{ paintVideo(); seekVideo(); });
  function resizeCanvas() {
    const size = Math.min(2048, Math.max(960, Math.ceil(flower.getBoundingClientRect().width * (devicePixelRatio || 1))));
    if (canvas.width !== size) { canvas.width = canvas.height = size; previousFrame = -1; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  let target = 0, progress = 0, ready = false, raf = 0, lastTime = 0;
  let previousFrame = -1, inView = true;
  let backgroundProgress = 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 960);
  flower.setAttribute('aria-busy', 'true');
  const clamp = n => Math.max(0, Math.min(1, n));
  function draw() {
    resizeCanvas();
    requestedTime = progress * (350 / 60);
    seekVideo();
    if (redPanel) redPanel.style.setProperty('--red-middle', `${100 * (1 - backgroundProgress)}%`);
    const shift = progress * (innerWidth <= 700 ? 4 : 8);
    flower.style.transform = `translate(calc(-50% - ${shift}vw), -50%) scale(.85)`;
    flower.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  function tick(time) {
    raf = 0;
    const dt = Math.min(32, lastTime ? time - lastTime : 16.67);
    lastTime = time;
    const change = (target - progress) * (1 - Math.exp(-dt / 400));
    const maxChange = dt / 5000;
    progress += Math.max(-maxChange, Math.min(maxChange, change));
    if (Math.abs(target - progress) < .0005) progress = target;
    const backgroundTarget = 1 - Math.pow(1 - Math.min(1, target / .18), 2);
    backgroundProgress += (backgroundTarget - backgroundProgress) * (1 - Math.exp(-dt / 500));
    if (Math.abs(backgroundTarget - backgroundProgress) < .001) backgroundProgress = backgroundTarget;
    draw();
    if (inView && (progress !== target || backgroundProgress !== backgroundTarget)) raf = requestAnimationFrame(tick);
  }
  function wake() {
    if (ready && inView && !raf) { lastTime = 0; raf = requestAnimationFrame(tick); }
  }
  function followCursor(event) {
    if (document.body.classList.contains('intro-loading') || event.target.closest('.navigation')) return;
    const bounds = hint.getBoundingClientRect();
    const range = Math.min(220, bounds.width * .65);
    const start = bounds.left + (bounds.width - range) / 2;
    target = clamp((event.clientX - start) / range);
    wake();
  }
  hero.addEventListener('pointermove', followCursor);
  hint.addEventListener('pointermove', event => { event.stopPropagation(); followCursor(event); });
  flower.addEventListener('keydown', event => {
    const values = {ArrowRight:target + .1, ArrowLeft:target - .1, Home:0, End:1};
    if (!(event.key in values)) return;
    event.preventDefault(); target = clamp(values[event.key]); wake();
  });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) { cancelAnimationFrame(raf); raf = 0; } else wake();
  }).observe(hero);
  window.addEventListener('resize', () => { previousFrame = -1; paintVideo(); draw(); }, {passive:true});
  video.addEventListener('loadeddata',()=>{
    ready=true;
    flower.setAttribute('aria-busy','false');
    paintVideo(); wake();
  },{once:true});
  video.addEventListener('error',()=>{
    flower.setAttribute('aria-busy','false');
    hint.textContent='Refresh to load flower';
  });
  video.load();
})();
