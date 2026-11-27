(() => {
  const section = document.querySelector('#emotion-states');
  if (!section) return;
  const states = [
    ['01','BUD','EXCITED DAY','봉오리','감정이 지쳐 잠시 멈춰 있는 상태.','회복과 휴식이 필요한 조용한 순간.','01'],
    ['02','SPROUT','EXCITED DAY','발아','설렘이나 기대처럼 작은 변화가','피어나기 시작한 순간.','03'],
    ['03','BLOOM','BRIGHT DAY','개화','기쁨과 활력이 일상 속으로','퍼져나가는 순간.','05'],
    ['04','FULL BLOOM','GOOD DAY','만개','에너지가 가장 높고','감정이 풍성하게 피어난 상태.','07'],
    ['05','FALL','LOW DAY','낙화','감정의 에너지가 서서히 내려오는 상태.','피로와 감정 소모가 천천히 쌓여가는 순간.','11'],
    ['06','FADE','QUIET DAY','시듦','감정의 에너지가 서서히 내려오는 상태.','피로와 감정 소모가 천천히 쌓여가는 순간.','12']
  ];
  const orbit = section.querySelector('.emotion-orbit');
  const detail = section.querySelector('.emotion-detail');
  const hint = section.querySelector('.emotion-hint');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = -1, angle = -Math.PI / 2, frame = 0, last = 0, visible = false, radius = 0;
  let alignTarget = null;
  const buttons = states.map((state,index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'emotion-flower';
    button.setAttribute('aria-label',`${state[0]} ${state[1]} / ${state[2]} / ${state[3]}`);
    button.setAttribute('aria-pressed','false'); button.setAttribute('aria-controls','emotion-detail');
    button.innerHTML = `<img src="public/emotion-flowers/Frame%20${index + 1}.png" alt="${state[1]}" loading="lazy" draggable="false"><span>${state[0]}</span>`;
    button.addEventListener('click',event => {
      event.stopPropagation(); selected = index; stop(); section.classList.add('has-selection');
      const desired = -Math.PI / 2 - index * Math.PI / 3;
      alignTarget = angle + Math.atan2(Math.sin(desired-angle), Math.cos(desired-angle));
      if (reduce.matches) { angle = alignTarget; alignTarget = null; render(); }
      else start();
      buttons.forEach((item,i) => item.setAttribute('aria-pressed',String(i === index)));
      hint.hidden = true; detail.hidden = false;
      detail.innerHTML = `<div class="emotion-detail-inner"><span class="emotion-number">${state[0]} / ${state[1]}</span><h3>${state[2]}</h3><p class="emotion-korean">${state[3]}</p><p>${state[4]}<br>${state[5]}</p></div>`;
    });
    orbit.append(button); return button;
  });
  function render() {
    buttons.forEach((button,i) => {
      const a = angle + i * Math.PI / 3;
      button.style.transform = `translate(-50%,-50%) translate(${Math.cos(a)*radius}px,${Math.sin(a)*radius}px)`;
    });
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(time) {
    frame = 0;
    const dt = Math.min(last ? time-last : 0,50);
    if (alignTarget !== null) {
      angle += (alignTarget-angle) * (1-Math.exp(-dt/140));
      if (Math.abs(alignTarget-angle) < .0001) { angle = alignTarget; alignTarget = null; }
    } else {
      angle += dt * Math.PI * 2 / 120000;
    }
    last = time; render(); start();
  }
  function start() { if (!frame && visible && (selected < 0 || alignTarget !== null) && !reduce.matches && !document.hidden) frame = requestAnimationFrame(tick); }
  function close() {
    stop(); alignTarget = null; selected = -1; section.classList.remove('has-selection'); detail.hidden = true; hint.hidden = false;
    buttons.forEach(button => button.setAttribute('aria-pressed','false')); start();
  }
  section.addEventListener('click',event => { if (!event.target.closest('.emotion-detail')) close(); });
  section.addEventListener('keydown',event => { if (event.key === 'Escape') close(); });
  new ResizeObserver(() => { radius = orbit.clientWidth * .38; render(); }).observe(orbit);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); }).observe(section);
  document.addEventListener('visibilitychange',() => { stop(); start(); });
  reduce.addEventListener('change',() => {
    stop();
    if (reduce.matches && alignTarget !== null) { angle = alignTarget; alignTarget = null; render(); }
    start();
  });
})();
