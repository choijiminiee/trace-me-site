(() => {
  const features = [
    { title: 'DAILY EMOTION', description: ['하루의 순간과 감정을 기록하고', '오늘의 감정 상태를 하나의 꽃으로 확인합니다.'], details: ["TODAY'S FLOWER", 'MOOD SCORE', 'EMOTION SPECTRUM'], image: 'DAILY EMOTION CARD' },
    { title: 'BLOOM CALENDAR', description: ['매일 기록된 감정의 변화를', 'Daily / Weekly / Monthly 흐름으로 확인합니다.'], details: ['DAILY', 'WEEKLY', 'MONTHLY'], image: 'BLOOM CALENDAR' },
    { title: 'PATTERN & INSIGHT', description: ['반복되는 순간과 감정의 관계를 분석하여', '나의 감정 패턴과 변화를 발견합니다.'], details: ['PATTERN & INSIGHT'], image: 'PATTERN & INSIGHT' }
  ];
  const tabs = [...document.querySelectorAll('[data-feature]')];
  const panel = document.querySelector('#feature-panel');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0, timer;
  function lines(element, values) {
    element.replaceChildren(...values.flatMap((value, i) => i ? [document.createElement('br'), document.createTextNode(value)] : [document.createTextNode(value)]));
  }
  function select(index) {
    if (index === selected) return;
    selected = index; clearTimeout(timer);
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panel.classList.add('is-changing');
    timer = setTimeout(() => {
      const feature = features[index], number = String(index + 1).padStart(2, '0');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.querySelector('.feature-number').textContent = number;
      panel.querySelector('h3').textContent = feature.title;
      lines(panel.querySelector('.feature-description'), feature.description);
      lines(panel.querySelector('.feature-details'), feature.details);
      panel.querySelector('.feature-placeholder span').textContent = feature.image;
      panel.querySelector('.feature-image').setAttribute('aria-label', `${feature.image} 실제 UI 이미지가 들어갈 자리`);
      panel.querySelector('figcaption').textContent = `${number} / ${feature.title}`;
      panel.classList.remove('is-changing');
    }, reduced.matches ? 0 : 160);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next); tabs[next].focus(); }
    });
  });
})();
