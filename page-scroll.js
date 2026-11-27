(() => {
  const buttons = [...document.querySelectorAll('[data-scroll-target]')];
  const chapters = [...document.querySelectorAll('body > section[id]')];
  const navigation = document.querySelector('.navigation');
  let previousY = Math.max(0, window.scrollY);
  let directionDistance = 0;
  const aboutGroup = new Set(['about', 'about-transition', 'approach']);
  function highlight(id) {
    const active = (id === 'live-trace-intro' || id === 'photo-booth') ? 'ending' : id === 'emotion-states' ? 'system' : aboutGroup.has(id) ? 'about' : id;
    document.querySelectorAll('.navigation [data-scroll-target]').forEach(button => {
      if (button.dataset.scrollTarget === active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const destinations = {system:'emotion-states', ending:'live-trace-intro'};
    const targetId = destinations[button.dataset.scrollTarget] || button.dataset.scrollTarget;
    const target = document.getElementById(targetId);
    if (!target) return;
    target.classList.add('is-visible');
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    previousY = Math.max(0, window.scrollY);
    directionDistance = 0;
    navigation.classList.remove('is-scroll-hidden');
    highlight(target.id);
  }));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.features-scene').forEach(section => observer.observe(section));
  let pending = false, aboutInView = false, systemInView = false;
  function update() {
    pending = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - previousY;
    if (delta !== 0) {
      directionDistance = Math.sign(delta) === Math.sign(directionDistance) ? directionDistance + delta : delta;
      if (directionDistance < -10) navigation.classList.add('is-scroll-hidden');
      else if (directionDistance > 10) navigation.classList.remove('is-scroll-hidden');
    }
    previousY = y;
    const readingLine = innerHeight * .35;
    const inAbout = [...aboutGroup].some(id => {
      const section = document.getElementById(id);
      if (!section || !section.getClientRects().length) return false;
      const bounds = section.getBoundingClientRect();
      return bounds.height > 0 && bounds.top <= readingLine && bounds.bottom > readingLine;
    });
    const inSystem = ['emotion-states', 'system'].some(id => {
      const section = document.getElementById(id);
      if (!section || !section.getClientRects().length) return false;
      const bounds = section.getBoundingClientRect();
      return bounds.height > 0 && bounds.top <= readingLine && bounds.bottom > readingLine;
    });
    if (inSystem) highlight('system');
    else if (inAbout) highlight('about');
    else {
      if (aboutInView) navigation.querySelector('[data-scroll-target="about"]')?.removeAttribute('aria-current');
      if (systemInView) navigation.querySelector('[data-scroll-target="system"]')?.removeAttribute('aria-current');
    }
    aboutInView = inAbout;
    systemInView = inSystem;
  }
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('load', () => requestAnimationFrame(update), {once:true});
  window.addEventListener('resize', update, {passive:true});
  requestAnimationFrame(update);
  // Background clicks advance the same scroll-driven story, without stealing controls.
  const interactive = 'a,button,input,textarea,select,label,video,details,summary,[role="button"],[role="slider"],[role="dialog"],[contenteditable="true"],.daily-slider,.emotion-detail,.original-insight-gallery';
  let press = null, lastAdvance = 0;
  document.addEventListener('pointerdown', event => {
    press = {x:event.clientX, y:event.clientY, scroll:scrollY,
      selected:!!event.target.closest('#emotion-states.has-selection')};
  }, {passive:true});
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (document.body.classList.contains('intro-loading') || document.querySelector('dialog[open], [aria-modal="true"]')) return;
    if (event.target.closest(interactive) || window.getSelection()?.toString()) return;
    if (press && (Math.hypot(event.clientX-press.x,event.clientY-press.y)>8 || Math.abs(scrollY-press.scroll)>8 || press.selected)) return;
    const section = event.target.closest('body > section[id]');
    if (!section || section.id === 'ending' || section.id === 'live-trace-intro') return;
    if (performance.now()-lastAdvance < 350) return;
    lastAdvance = performance.now();
    if (section.id === 'about' && section.classList.contains('is-discovering')) {
      section.querySelector('.about-photo:not([inert])')?.click();
      return;
    }
    const top = section.getBoundingClientRect().top + scrollY;
    const next = chapters[chapters.indexOf(section)+1];
    if (!next) return;
    let destination = next.getBoundingClientRect().top + scrollY;
    const triggers = window.ScrollTrigger?.getAll() || [];
    if (section.id === 'about') {
      const timeline = triggers.find(item => item.trigger === section);
      if (timeline) {
        const stops = [.72/2.16, 1.12/2.16, 1.65/2.16, 1.95/2.16];
        destination = stops.map(value => timeline.start + (timeline.end-timeline.start)*value)
          .find(value => value > scrollY+8) ?? destination;
      }
    } else if (section.id === 'system') {
      const timeline = triggers.find(item => item.trigger === section.querySelector('.process-runway'));
      if (timeline) destination = Array.from({length:6},(_,i)=>timeline.start+(timeline.end-timeline.start)*i/5)
        .find(value=>value>scrollY+8) ?? destination;
    } else if (section.offsetHeight > innerHeight*1.35 && scrollY+innerHeight < top+section.offsetHeight-24) {
      destination = Math.min(scrollY+innerHeight*.85, top+section.offsetHeight-innerHeight);
    }
    next.classList.add('is-visible');
    window.scrollTo({top:destination, behavior:'instant'});
  });
  const previewKey = 'trace-preview-position';
  const localPreview = ['localhost','127.0.0.1','::1'].includes(location.hostname);
  const visibleChapters = () => chapters.filter(section => !section.hidden && section.getClientRects().length && section.getBoundingClientRect().height > 0);
  function savePosition() {
    if (!localPreview || window.traceRestoringPreview) return;
    const current = visibleChapters().filter(section => section.getBoundingClientRect().top <= innerHeight*.3).pop();
    const triggers = window.ScrollTrigger?.getAll() || [];
    const pinned = triggers.findIndex(item => item.pin && window.scrollY >= item.start && window.scrollY < item.end);
    const pin = pinned >= 0 ? {index:pinned, progress:(window.scrollY-triggers[pinned].start)/(triggers[pinned].end-triggers[pinned].start)} : null;
    try {
      sessionStorage.setItem(previewKey, JSON.stringify({
        pin, id:current?.id, offset:current ? -current.getBoundingClientRect().top : 0, y:window.scrollY,
        boothOpen:!document.querySelector('#photo-booth')?.hidden
      }));
    } catch {}
  }
  window.addEventListener('pagehide',savePosition);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)savePosition();});
  if (localPreview && performance.getEntriesByType('navigation')[0]?.type === 'reload') {
    let saved;
    try { saved=JSON.parse(sessionStorage.getItem(previewKey)); } catch {}
    if (saved) {
      window.traceRestoringPreview=true;
      history.scrollRestoration='manual';
      if(saved.boothOpen) document.querySelector('#photo-booth').hidden=false;
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
