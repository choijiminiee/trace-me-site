(() => {
  const reaction = document.createElement('p');
  reaction.className = 'trace-jump-label'; reaction.hidden = true; reaction.setAttribute('aria-live', 'polite');
  document.body.append(reaction);
  let reactionTimer;
  function notify(text, duration = 350) { clearTimeout(reactionTimer); reaction.textContent = text; reaction.hidden = false; reactionTimer = setTimeout(() => reaction.hidden = true, duration); }
  document.querySelectorAll('[data-scroll-target]').forEach(button => button.addEventListener('click', () => notify(`TRACE / ${button.textContent.trim()}`)));
  document.querySelectorAll('[data-problem]').forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('[data-problem]').forEach(other => other.setAttribute('aria-expanded', String(open && other === button)));
  }));
  const systemImage = document.querySelector('#system-flower');
  document.querySelectorAll('[data-bloom]').forEach(button => {
    const asset = new Image(); asset.src = `public/flowers/flower-${button.dataset.bloom.padStart(2, '0')}.png`;
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-bloom]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      systemImage.src = asset.src;
      systemImage.alt = `TRACE ME visual output — ${button.textContent}`;
      document.querySelector('#system-state').textContent = button.textContent;
      document.querySelector('#system-frame').textContent = `FRAME ${button.dataset.bloom.padStart(2,'0')} / 12`;
    });
  });
  const stepNotes = ['CAPTURE / A MOMENT', 'TRANSLATE / EMOTIONAL DATA', 'OBSERVE / RECORDS OVER TIME', 'CONNECT / REPEATING RELATIONS', 'UNDERSTAND / PERSONAL INSIGHT', 'TRACE / CHANGE OVER TIME'];
  document.querySelectorAll('[data-system-step]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-system-step]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('.system-note').textContent = stepNotes[Number(button.dataset.systemStep)];
  }));
  const data = [
    ['Daily Emotion Card','Turn each moment into an emotional record.'],
    ['Bloom Calendar','See your emotions accumulate over time.'],
    ['Monthly Overview','Discover your emotional tendencies.'],
    ['Insight / ME','Find the patterns and moments that define you.']
  ];
  const tabs = [...document.querySelectorAll('[data-archive-feature]')];
  const featureBar = document.querySelector('.features-tabs');
  const ending = document.getElementById('ending');
  const barSlot = document.createElement('div');
  barSlot.className = 'feature-bar-slot';
  featureBar.before(barSlot);
  barSlot.append(featureBar);
  const destinations = ['features', 'bloom-calendar', 'monthly-overview', 'monthly-insight'];
  tabs.forEach((tab, index) => tab.setAttribute('aria-controls', index === 0 ? 'feature-panel' : destinations[index]));
  function highlightFeature(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
  }
  function select(index) {
    highlightFeature(index);
    document.getElementById(destinations[index])?.scrollIntoView({
      behavior:'instant', block:'start'
    });
  }
  let featureFrame = 0;
  function syncFeature() {
    featureFrame = 0;
    const sections = [...destinations, 'me'].map(id => document.getElementById(id)).filter(Boolean);
    const current = sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .3).pop();
    highlightFeature(current ? Math.min(sections.indexOf(current), 3) : 0);
    // Use the main menu's reading line so settling near a section boundary
    // cannot detach the feature tabs for a few fractional pixels.
    const featuresEntered = sections[0].getBoundingClientRect().top <= innerHeight * .35;
    // The TRACE ME closing screen and the booth are outside the feature tour.
    const endingEntered = ending && ending.getBoundingClientRect().top <= innerHeight * .35;
    const pinned = featuresEntered && !endingEntered &&
      sections[sections.length - 1].getBoundingClientRect().bottom > 100;
    // Keep the fixed menu outside section clipping and transformed ancestors.
    if (pinned && featureBar.parentElement !== document.body) {
      barSlot.style.minHeight = `${featureBar.offsetHeight + 32}px`;
      document.body.append(featureBar);
    } else if (!pinned && featureBar.parentElement !== barSlot) {
      barSlot.append(featureBar);
      barSlot.style.minHeight = '';
    }
    featureBar.classList.toggle('is-pinned', pinned);
    document.body.classList.toggle('feature-navigation-active', pinned);
  }
  window.addEventListener('scroll', () => {
    if (!featureFrame) featureFrame = requestAnimationFrame(syncFeature);
  }, {passive:true});
  window.addEventListener('resize', syncFeature);
  window.addEventListener('load', syncFeature);
  window.addEventListener('hashchange', syncFeature);
  const featureVisibility = new IntersectionObserver(syncFeature, {threshold:[0, .1, .3, .6, 1]});
  destinations.forEach(id => featureVisibility.observe(document.getElementById(id)));
  if (ending) featureVisibility.observe(ending);
  syncFeature();
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : (index + (e.key === 'ArrowRight' ? 1 : tabs.length-1)) % tabs.length;
      select(next); tabs[next].focus();
    });
  });
})();
