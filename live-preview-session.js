/* One camera, tracker and flower renderer. Chapters only host the same preview. */
(() => {
  const preview = document.querySelector('#shared-live-preview');
  if (!preview) return;
  const hosts = [...document.querySelectorAll('[data-preview-host]')];
  window.tracePreviewRoots = () => [preview];
  let current = null;
  let lastVisibility = null, lastMode = null;

  function mount(host) {
    if (!host || current === host) return;
    current = host;
    const mode = host.dataset.previewHost;
    preview.dataset.mode = mode;
    // moveBefore preserves the media element's playback state where available.
    if (host.moveBefore) host.moveBefore(preview, null);
    else host.append(preview);
    preview.querySelector('.live-label').textContent = mode === 'booth' ? 'LIVE PORTRAIT' : 'LIVE MIRROR';
    preview.querySelector('.bloom-card-label').textContent = mode === 'booth' ? 'TRACE ME / MY BLOOM' : 'TRACE ME / LIVE BLOOM';
    preview.dispatchEvent(new Event('preview-mounted'));
  }
  function sync() {
    const height = window.innerHeight;
    // The mount is reserved even when empty, so moving never shifts a chapter.
    const activePage = window.traceBoothFlow?.activeId;
    const visible = hosts.filter(host => !activePage || (activePage === 'tablet-photo-booth' && host.dataset.previewHost === 'booth')).map(host => {
      const rect = host.getBoundingClientRect();
      return {host, amount: Math.max(0, Math.min(height, rect.bottom) - Math.max(0, rect.top))};
    }).sort((a, b) => b.amount - a.amount)[0];
    if (visible?.amount > 0) mount(visible.host);
    preview.dataset.previewVisible = String(!document.hidden && visible?.amount > 0);
    if (lastVisibility !== preview.dataset.previewVisible || lastMode !== preview.dataset.mode) {
      lastVisibility = preview.dataset.previewVisible;
      lastMode = preview.dataset.mode;
      preview.dispatchEvent(new Event('preview-visibility'));
    }
    document.body.classList.toggle('photo-booth-in-view', visible?.amount > 0 && current?.dataset.previewHost === 'booth');
  }
  mount(hosts.find(host => host.dataset.previewHost === (location.hash === '#tablet-photo-booth' ? 'booth' : 'live')));
  let frame = 0;
  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); });
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('load', schedule);
  window.addEventListener('trace:booth-page', schedule);
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('fullscreenchange', schedule);
  // React to sticky/animated chapter layout changes as well as ordinary scroll.
  const observer = new IntersectionObserver(schedule, {threshold: [0, .25, .5, .75, 1]});
  hosts.forEach(host => observer.observe(host));
  schedule();
})();
