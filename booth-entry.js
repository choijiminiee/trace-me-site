/* A short, interruptible entrance; ambient stars pause outside the booth. */
(() => {
  const entry = document.querySelector('#photo-booth-entry');
  if (!entry) return;
  let visible = false;
  const gallery = document.querySelector('#visitor-trace-screen');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const easeOut = 'cubic-bezier(.23,1,.32,1)';
  let animations = [];
  function cancelEntrance() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function animate(element, frames, duration, delay = 0) {
    if (!element) return;
    const animation = element.animate(frames, {duration, delay, easing: easeOut, fill:'backwards'});
    animations.push(animation);
    animation.finished.then(() => {
      animations = animations.filter(item => item !== animation);
    }, () => {});
  }
  window.addEventListener('trace:booth-page', event => {
    cancelEntrance();
    const origin = event.detail?.origin;
    // Keyboard, deep links, and the camera's BACK button open immediately.
    if (entry.hidden || !origin || !entry.animate) return;
    if (reduce.matches) {
      animate(entry, [{opacity:0}, {opacity:1}], 150);
      return;
    }
    const bounds = entry.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, origin.x - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, origin.y - bounds.top));
    const radius = Math.ceil(Math.hypot(Math.max(x, bounds.width-x), Math.max(y, bounds.height-y)));
    const circle = document.querySelector('#live-trace-intro .booth-enter');
    const startRadius = (circle?.offsetWidth || 76) / 2;
    animate(entry, [
      {clipPath:`circle(${startRadius}px at ${x}px ${y}px)`},
      {clipPath:`circle(${radius}px at ${x}px ${y}px)`}
    ], 500);
    // The stars move gently towards the viewer while the text settles in.
    entry.querySelectorAll('.booth-entry-depth, .tablet-bright-stars').forEach(layer => {
      animate(layer, [{transform:'scale(.95)',opacity:.5}, {transform:'scale(1)',opacity:1}], 500);
    });
    animate(entry.querySelector('h2'), [
      {transform:'translateY(12px) scale(.97)',opacity:0},
      {transform:'translateY(0) scale(1)',opacity:1}
    ], 250, 80);
    animate(entry.querySelector(':scope > p'), [{opacity:0}, {opacity:1}], 200, 140);
    animate(entry.querySelector('.booth-entry-back'), [{opacity:0}, {opacity:1}], 200, 140);
  });
  window.addEventListener('resize', cancelEntrance);
  window.addEventListener('trace:idle-reset', cancelEntrance);
  reduce.addEventListener('change', cancelEntrance);
  function sync() {
    if (document.hidden || gallery?.open) cancelEntrance();
    entry.classList.toggle('is-paused', !visible || document.hidden || Boolean(gallery?.open));
    document.body.classList.toggle('booth-entry-in-view', visible);
  }
  new IntersectionObserver(([item]) => {
    visible = item.isIntersecting && item.intersectionRatio >= .5;
    sync();
  }, {threshold: [0,.5]}).observe(entry);
  document.addEventListener('visibilitychange', sync);
  if (gallery) new MutationObserver(sync).observe(gallery, {attributes:true,attributeFilter:['open']});
})();
