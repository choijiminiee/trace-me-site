/* Scroll through the invitation; entry and camera continue as click-only pages. */
(() => {
  const pages = [...document.querySelectorAll('[data-booth-page]')];
  const ending = document.getElementById('ending');
  const invitation = document.getElementById('live-trace-intro');
  if (!pages.length || !ending) return;
  let activeId = null;
  const inertBefore = new Map();
  const isFlowTarget = id => pages.some(page => page.id === id);

  function notify(detail = {}) {
    window.dispatchEvent(new CustomEvent('trace:booth-page', {detail: {id: activeId, ...detail}}));
  }
  function close() {
    if (!activeId) return;
    activeId = null;
    pages.forEach(page => { page.hidden = true; });
    document.documentElement.classList.remove('booth-flow-open');
    document.body.classList.remove('booth-flow-open');
    inertBefore.forEach((value, element) => { element.inert = value; });
    inertBefore.clear();
    notify();
  }
  function navigate(id, options = {}) {
    const returnPage = id === 'ending' ? ending : id === 'live-trace-intro' ? invitation : null;
    if (returnPage && (activeId || id === 'live-trace-intro')) {
      window.traceRestoringPreview = false;
      window.dispatchEvent(new Event('trace:navigate'));
      close();
      returnPage.classList.add('is-visible');
      window.scrollTo({top: returnPage.getBoundingClientRect().top + window.scrollY, behavior: 'instant'});
      history.replaceState(history.state, '', `#${id}`);
      window.ScrollTrigger?.update();
      document.querySelector(id === 'live-trace-intro' ? '#live-trace-intro .booth-enter' : '.page-scroll-cue')?.focus({preventScroll: true});
      return true;
    }
    const page = pages.find(item => item.id === id);
    if (!page) return false;
    const previousId = activeId;
    window.traceRestoringPreview = false;
    window.dispatchEvent(new Event('trace:navigate'));
    if (!activeId) {
      // Keep background links out of keyboard navigation while a booth page is open.
      document.querySelectorAll('section[id], .navigation, .page-scroll-cue, #site-fullscreen').forEach(element => {
        if (pages.some(item => item === element || item.contains(element))) return;
        inertBefore.set(element, element.inert);
        element.inert = true;
      });
    }
    activeId = id;
    pages.forEach(item => { item.hidden = item !== page; });
    document.documentElement.classList.add('booth-flow-open');
    document.body.classList.add('booth-flow-open');
    page.scrollTop = 0;
    history.replaceState(history.state, '', `#${id}`);
    page.tabIndex = -1;
    page.focus({preventScroll: true});
    notify({previousId, origin: options.pointer && !previousId ? options.origin : null});
    return true;
  }
  window.traceBoothFlow = {get activeId() { return activeId; }, isFlowTarget, navigate, close};
  window.addEventListener('trace:idle-reset', close);
  function syncHash() {
    const id = location.hash.slice(1);
    if (isFlowTarget(id) || id === 'live-trace-intro') navigate(id);
    else if (activeId) {
      if (id === 'ending' || id === 'live-trace-intro') navigate(id);
      else close();
    }
  }
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('load', syncHash, {once: true});
})();
