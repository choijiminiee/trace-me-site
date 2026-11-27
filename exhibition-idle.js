/* Return an unattended exhibition to its opening loop without reloading the site. */
(() => {
  const intro = document.querySelector('.intro-loader');
  if (!intro) return;
  const idleDelay = 50_000;
  const booth = document.querySelector('#tablet-photo-booth iframe');
  let timer = 0, lastActivity = performance.now(), idle = false;

  function arm() {
    clearTimeout(timer);
    if (!document.hidden && !idle) {
      timer = setTimeout(check, Math.max(0, idleDelay - (performance.now() - lastActivity)));
    }
  }
  function activity(event) {
    if (event && !event.isTrusted) return;
    lastActivity = performance.now();
    if (idle) {
      idle = false;
      document.body.classList.remove('is-exhibition-idle');
    }
    arm();
  }
  function reset() {
    idle = true;
    clearTimeout(timer);
    document.body.classList.add('is-exhibition-idle');
    window.traceRestoringPreview = false;
    window.dispatchEvent(new Event('trace:navigate'));
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    (document.querySelector('#shared-live-preview') || document.querySelector('#live-trace'))?.dispatchEvent(new Event('camera-request-stop'));
    document.activeElement?.blur();
    window.traceBoothFlow?.close();
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    history.replaceState(history.state, '', '#intro');
    // Settle scroll-linked motion before clearing retained reveal progress.
    // Otherwise a previous scrub tween can paint over the freshly reset state.
    window.ScrollTrigger?.update();
    window.ScrollTrigger?.getAll().forEach(trigger => trigger.getTween?.()?.progress?.(1));
    window.dispatchEvent(new Event('trace:idle-reset'));
  }
  function check() {
    if (document.hidden || idle) return;
    // The separately running photo booth is outside the website's idle cycle.
    // Do not reset, reload, or send control messages to its camera/gallery.
    if (booth && document.activeElement === booth) {
      lastActivity = performance.now();
      arm();
      return;
    }
    if (performance.now() - lastActivity >= idleDelay) reset();
    else arm();
  }
  ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'touchmove', 'input'].forEach(type => {
    document.addEventListener(type, activity, {capture: true, passive: true});
  });
  // A validated booth boundary gesture is still activity on this website.
  window.addEventListener('trace:embedded-scroll', () => activity());
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (!document.hidden) check();
  });
  window.addEventListener('focus', () => { if (!idle) activity(); });
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', arm);

  arm();
})();
