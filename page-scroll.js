(() => {
  const buttons = [...document.querySelectorAll('[data-scroll-target]')];
  const chapters = [...document.querySelectorAll('body > section[id]')];
  const navigation = document.querySelector('.navigation');
  let previousY = Math.max(0, window.scrollY);
  let directionDistance = 0;
  const aboutGroup = new Set(['about', 'about-transition', 'approach']);
  const featureGroup = new Set(['features', 'bloom-calendar', 'monthly-overview', 'monthly-insight', 'me', 'ending']);
  function highlight(id) {
    const active = (['live-trace-intro','photo-booth-entry','tablet-photo-booth','photo-booth'].includes(id)) ? 'photo-booth-entry' : id === 'emotion-states' ? 'system' : aboutGroup.has(id) ? 'about' : featureGroup.has(id) ? 'features' : id;
    document.querySelectorAll('.navigation [data-scroll-target]').forEach(button => {
      if (button.dataset.scrollTarget === active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  buttons.forEach(button => button.addEventListener('click', event => {
    const destinations = {system:'emotion-states'};
    const targetId = destinations[button.dataset.scrollTarget] || button.dataset.scrollTarget;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    if (window.traceBoothFlow?.navigate(targetId, {
      pointer: event.detail > 0,
      origin: {x: event.clientX, y: event.clientY}
    })) return;
    window.traceBoothFlow?.close();
    window.traceRestoringPreview=false;
    window.dispatchEvent(new Event('trace:navigate'));
    target.classList.add('is-visible');
    const trigger=window.ScrollTrigger?.getAll().find(item=>item.trigger===target);
    const top=targetId==='about'&&trigger
      ? trigger.start+(trigger.end-trigger.start)*1.12/3.66
      : trigger?.pin ? trigger.start+2 : target.getBoundingClientRect().top+window.scrollY;
    window.scrollTo({top:Math.max(0,top),behavior:'instant'});
    history.replaceState(null,'',`#${targetId}`);
    window.ScrollTrigger?.update();
    previousY = Math.max(0, window.scrollY);
    directionDistance = 0;
    navigation.classList.remove('is-scroll-hidden');
    highlight(target.id);
  }));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.features-scene').forEach(section => observer.observe(section));
  window.addEventListener('trace:idle-reset', () => {
    document.querySelectorAll('.features-scene').forEach(section => {
      section.classList.remove('is-visible');
      observer.observe(section);
    });
  });
  let pending = false;
  function update() {
    pending = false;
    if (window.traceBoothFlow?.activeId) {
      highlight(window.traceBoothFlow.activeId);
      document.body.classList.remove('live-navigation-active');
      return;
    }
    const y = Math.max(0, window.scrollY);
    const delta = y - previousY;
    if (delta !== 0) {
      directionDistance = Math.sign(delta) === Math.sign(directionDistance) ? directionDistance + delta : delta;
      if (directionDistance < -10) navigation.classList.add('is-scroll-hidden');
      else if (directionDistance > 10) navigation.classList.remove('is-scroll-hidden');
    }
    previousY = y;
    const readingLine = innerHeight * .35;
    const current = chapters.filter(section => {
      if (section.hidden || !section.getClientRects().length) return false;
      const bounds = section.getBoundingClientRect();
      return bounds.height > 0 && bounds.top <= readingLine;
    }).pop();
    highlight(current?.id || 'hero');
    document.body.classList.toggle('live-navigation-active',current?.id === 'live-trace');
    if (current?.id === 'live-trace' || featureGroup.has(current?.id)) {
      navigation.classList.remove('is-scroll-hidden');
    }
  }
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('load', () => requestAnimationFrame(update), {once:true});
  window.addEventListener('resize', update, {passive:true});
  requestAnimationFrame(update);
  const previewKey = 'trace-preview-position';
  const localPreview = ['localhost','127.0.0.1','::1'].includes(location.hostname);
  const visibleChapters = () => chapters.filter(section => !section.hidden && section.getClientRects().length && section.getBoundingClientRect().height > 0);
  function savePosition() {
    if (!localPreview || window.traceRestoringPreview || window.traceBoothFlow?.activeId) return;
    const current = visibleChapters().filter(section => section.getBoundingClientRect().top <= innerHeight*.3).pop();
    const triggers = window.ScrollTrigger?.getAll() || [];
    const pinned = triggers.findIndex(item => item.pin && window.scrollY >= item.start && window.scrollY < item.end);
    const pin = pinned >= 0 ? {index:pinned, progress:(window.scrollY-triggers[pinned].start)/(triggers[pinned].end-triggers[pinned].start)} : null;
    try {
      sessionStorage.setItem(previewKey, JSON.stringify({
        pin, id:current?.id, offset:current ? -current.getBoundingClientRect().top : 0, y:window.scrollY,
        boothOpen:document.querySelector('#photo-booth')?.hidden===false
      }));
    } catch {}
  }
  window.addEventListener('pagehide',savePosition);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)savePosition();});
  if (localPreview && !window.traceBoothFlow?.isFlowTarget(location.hash.slice(1)) && performance.getEntriesByType('navigation')[0]?.type === 'reload') {
    let saved;
    try { saved=JSON.parse(sessionStorage.getItem(previewKey)); } catch {}
    if (saved) {
      window.traceRestoringPreview=true;
      history.scrollRestoration='manual';
      const booth=document.querySelector('#photo-booth');
      if(saved.boothOpen && booth) booth.hidden=false;
      window.addEventListener('load',async()=>{
        await document.fonts.ready;
        requestAnimationFrame(()=>{
          window.ScrollTrigger?.refresh();
          const section=document.getElementById(saved.id);
          const pinned = saved.pin && window.ScrollTrigger?.getAll()[saved.pin.index];
          const top = pinned?.pin ? pinned.start+(pinned.end-pinned.start)*saved.pin.progress
            : section && !section.hidden ? section.getBoundingClientRect().top+scrollY+saved.offset : saved.y;
          window.scrollTo({top:Math.max(0,top || 0),behavior:'instant'});
          navigation.classList.remove('is-scroll-hidden');
          previousY=window.scrollY;
          requestAnimationFrame(()=>{ window.traceRestoringPreview=false; update(); });
        });
      },{once:true});
    }
  }
  highlight('hero');
  update();
})();
