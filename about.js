(() => {
  // Scene navigation keeps the existing artwork and camera DOM mounted.
  const scenes = { about: document.querySelector('#about-scene'), process: document.querySelector('#process-scene'), features: document.querySelector('#features-scene') };
  const home = document.querySelector('.scene-home');
  const background = [...document.querySelector('.hero').children].filter(e => !e.classList.contains('navigation'));
  const sections = [...document.querySelectorAll('.live-trace, .your-trace')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = null, timer = null, animations = [];
  function change(next) {
    if (next === current) return;
    clearTimeout(timer);
    animations.forEach(a => a.cancel()); animations = [];
    const previous = current;
    current = next;
    Object.entries(scenes).forEach(([name, scene]) => {
      scene.classList.remove('is-visible');
      scene.inert = true;
      document.querySelectorAll(`.scene-${name}`).forEach(button => button.setAttribute('aria-expanded', String(name === next)));
    });
    document.querySelectorAll('.navigation nav [aria-controls]').forEach(button => {
      if (button.getAttribute('aria-controls') === `${next}-scene`) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (next) {
      document.body.classList.add('about-open');
      [...background, ...sections].forEach(e => e.inert = true);
      animations = background.map(e => e.animate([{ opacity: previous ? 0 : 1 }, { opacity: 0 }], { duration: reduced.matches ? 0 : 180, fill: 'forwards' }));
      timer = setTimeout(() => {
        Object.entries(scenes).forEach(([name, scene]) => scene.hidden = name !== next);
        const scene = scenes[next];
        scene.inert = false;
        scene.scrollTop = 0;
        // Commit the initial opacity before starting the scene's entrance.
        void scene.offsetWidth;
        scene.classList.add('is-visible');
        scene.querySelector('h2').focus({ preventScroll: true });
      }, reduced.matches ? 0 : previous ? 240 : 160);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      home.focus({ preventScroll: true });
      timer = setTimeout(() => {
        Object.values(scenes).forEach(scene => scene.hidden = true);
        document.body.classList.remove('about-open');
        [...background, ...sections].forEach(e => e.inert = false);
      }, reduced.matches ? 0 : 240);
    }
  }
  Object.keys(scenes).forEach(name => document.querySelectorAll(`.scene-${name}`).forEach(button => button.addEventListener('click', () => change(name))));
  home.addEventListener('click', () => { if (current) change(null); else window.scrollTo({ top: 0, behavior: 'smooth' }); });
  Object.values(scenes).forEach(scene => scene.addEventListener('keydown', event => { if (event.key === 'Escape') change(null); }));
})();
