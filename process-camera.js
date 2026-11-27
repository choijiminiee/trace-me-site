// PROCESS: sticky viewport; no snapping or wheel interception.
(() => {
  const runway = document.querySelector('.process-runway');
  if (!runway || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const camera = runway.querySelector('.process-camera');
  const world = camera.querySelector('.process-world');
  const steps = [...world.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, stride = 0;
  const clamp = gsap.utils.clamp(0,1);
  const measure = () => {
    width = camera.clientWidth;
    stride = Math.max(260, width * (width < 650 ? .85 : .62));
    camera.style.setProperty('--step-width', `${stride}px`);
    runway.style.height = `${innerHeight * 1.55 + stride * (steps.length-1)}px`;
  };
  window.traceProcessStops = () => {
    const start = runway.getBoundingClientRect().top + scrollY;
    return steps.map((_, i) => start + (i === 0 ? 0 : innerHeight * .35 + stride * i));
  };
  function reveal(progress) {
    world.style.setProperty('--process-progress', progress);
    const position = progress * (steps.length-1);
    const current = Math.round(position);
    steps.forEach((step,i) => {
      const entry = i === 0 ? 1 : clamp((position-i+1)*1.8);
      const title = clamp((entry-.22)/.55);
      const description = clamp((entry-.45)/.55);
      gsap.set(step,{opacity:i===current ? 1 : .55});
      gsap.set(step.querySelector('.process-stem'),{scaleY:entry});
      gsap.set(step.querySelector('.process-dot'),{opacity:clamp(entry*3)});
      const targets = step.querySelectorAll('h3,.process-action');
      gsap.set(targets,{y:reduced.matches?0:18*(1-title),clipPath:`inset(${100*(1-title)}% 0 0 0)`});
      gsap.set(step.querySelector('.process-description'),{y:reduced.matches?0:12*(1-description),opacity:description});
      if(i===current) step.setAttribute('aria-current','step'); else step.removeAttribute('aria-current');
    });
  }
  // Read the runway's current position rather than a cached document offset.
  // Earlier pinned chapters and fullscreen resizing can move this section.
  let pending = false;
  function update() {
    pending = false;
    const hold = innerHeight * .35;
    const travel = stride * (steps.length - 1);
    const progress = clamp((-runway.getBoundingClientRect().top - hold) / Math.max(1, travel));
    gsap.set(world, {x:(width-stride)/2-travel*progress});
    reveal(progress);
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  function resize() { measure(); update(); }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', resize, {passive:true});
  reduced.addEventListener('change', update);
  ScrollTrigger.addEventListener('refresh', resize);
  document.fonts.ready.then(resize);
  resize();
})();
