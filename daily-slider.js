// Daily Emotion Card only. Fixed-size deck, interruptible damped spring transforms.
(() => {
  const viewport = document.querySelector('.daily-window');
  const track = viewport.querySelector('.daily-track');
  const cards = [...track.querySelectorAll('.daily-card')];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const moods = [
      ['CALM DAY', '잠시 호흡을 고르며 머무는 순간이에요.', '차분하게 에너지를 모으며 다음 순간을 기다리는 상태'],
      ['EXCITED DAY', '새로운 순간을 향해 조금씩 열리고 있어요.', '작은 변화가 피어나며 기대가 서서히 커지는 상태'],
      ['BRIGHT DAY', '표정의 변화가 밝게 피어나는 순간이에요.', '에너지가 퍼지며 자신의 모습을 자유롭게 드러내는 상태'],
      ['GOOD DAY', '꽃이 활짝 펼쳐진 풍성한 순간이에요.', '변화의 흐름이 가장 크게 펼쳐져 만개한 상태'],
      ['LOW DAY', '꽃잎이 내려앉으며 쉬어가는 순간이에요.', '펼쳐진 에너지를 정리하며 천천히 쉬어가는 상태'],
      ['QUIET DAY', '조용히 여운을 남기는 순간이에요.', '변화의 끝에서 잠시 멈추고 휴식을 준비하는 상태']
    ];
  const count = cards.length;
  const wrap = n => (n + count) % count;
  let selected = 0, expanded = false, spacing = 45, raf = 0, previous = 0;
  let pointer = null, drag = 0, navigationUntil = 0, suppressClickUntil = 0;
  const motion = cards.map(() => ({p:[0,0,0],v:[0,0,0],target:[0,0,0]}));
  function offset(i) {
    let d = wrap(i - selected);
    if (d > count / 2) d -= count;
    return d;
  }
  function paint(i) {
    const [x,y,r] = motion[i].p;
    cards[i].style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }
  function tick(now) {
    const dt = previous ? Math.min(.032, (now - previous) / 1000) : 1/60;
    previous = now;
    let moving = false;
    motion.forEach((m,i) => {
      m.p.forEach((p,j) => {
        // Critically damped spring (mass 1, stiffness 100, damping 20): no bounce.
        m.v[j] += ((m.target[j] - p) * 100 - m.v[j] * 20) * dt;
        m.p[j] += m.v[j] * dt;
        if (Math.abs(m.target[j]-m.p[j]) > .025 || Math.abs(m.v[j]) > .025) moving = true;
        else { m.p[j] = m.target[j]; m.v[j] = 0; }
      });
      paint(i);
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) previous = 0;
  }
  function render(instant = false) {
    track.style.setProperty("--deck-spread", `${spacing * 2 + 40}px`);
    cards.forEach((card,i) => {
      const d = offset(i);
      motion[i].target = expanded
        ? [d * spacing + drag, Math.abs(d) * 10, d * 4]
        : [d * 2, Math.abs(d) * 1.5, d * .7];
      card.style.zIndex = String(20 - Math.abs(d));
      card.style.opacity = String(d === 0 ? 1 : Math.max(.35, .7 - (Math.abs(d) - 1) * .15));
      card.setAttribute('aria-pressed', String(i === selected));
      if (instant || reduced.matches) {
        motion[i].p = [...motion[i].target]; motion[i].v = [0,0,0]; paint(i);
      }
    });
    if (instant || reduced.matches) { cancelAnimationFrame(raf); raf = 0; previous = 0; }
    else if (!raf) raf = requestAnimationFrame(tick);
  }
  function step(direction, from = selected, keyboard = false) {
    if (performance.now() < navigationUntil) return;
    selected = wrap(from + Math.sign(direction));
    navigationUntil = performance.now() + 450;
    expanded = true; drag = 0; render(keyboard);
  }
  viewport.addEventListener('pointerenter', () => {
    if (hover.matches) { expanded = true; render(); }
  });
  viewport.addEventListener('pointerleave', () => {
    if (!pointer) { expanded = false; drag = 0; render(); }
  });
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = {id:event.pointerId,x:event.clientX,y:event.clientY,index:selected,axis:null};
    expanded = true; render();
  });
  viewport.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX-pointer.x, dy = event.clientY-pointer.y;
    if (!pointer.axis && Math.hypot(dx,dy)>7) pointer.axis = Math.abs(dx)>Math.abs(dy) ? 'x' : 'y';
    if (pointer.axis !== 'x') return;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    const limit = cards[0].offsetWidth * .45;
    drag = Math.max(-limit, Math.min(limit, dx)); render();
  });
  function release(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const gesture = pointer; pointer = null;
    if (gesture.axis || event.type === 'pointercancel') suppressClickUntil = performance.now() + 400;
    viewport.classList.remove('is-dragging'); drag = 0;
    const delta = event.clientX - gesture.x;
    if (event.type === 'pointerup' && gesture.axis === 'x' && Math.abs(delta)>35)
      step(delta < 0 ? 1 : -1, gesture.index);
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (hover.matches && !viewport.matches(':hover')) expanded = false;
    render();
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      // Side cards move one step toward that side; the front card advances.
      step(offset(i) < 0 ? -1 : 1);
    });
    card.addEventListener('focus', () => {
      if (card.matches(':focus-visible')) { expanded = true; render(true); }
    });
  });
  // A trackpad gesture may deliver many wheel events, including momentum.
  // Unlock only after its tail has stopped; never advance repeatedly in one swipe.
  let wheelTimer = 0, wheelDelta = 0, wheelMoved = false;
  viewport.addEventListener('wheel', event => {
    if (pointer || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelDelta += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    if (!wheelMoved && Math.abs(wheelDelta) > 35) {
      wheelMoved = true;
      step(wheelDelta > 0 ? 1 : -1);
    }
    wheelTimer = setTimeout(() => { wheelDelta = 0; wheelMoved = false; }, 200);
  }, {passive:false});
  viewport.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1, selected, true);
    } else if (event.key === 'Escape') { expanded = false; render(true); }
  });
  viewport.addEventListener('focusout', e => {
    if (!viewport.contains(e.relatedTarget)) { expanded = false; render(); }
  });
  viewport.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('pointerdown', e => {
    if (!viewport.contains(e.target)) { expanded = false; render(); }
  });
  new ResizeObserver(() => {
    const rect = track.getBoundingClientRect();
    const halfRoom = rect.width / 2;
    spacing = Math.max(0, Math.min(70, (halfRoom - cards[0].offsetWidth/2 - 50)/3));
    render();
  }).observe(track);
  // Raster card copy is replaced with crisp text on every card, not just captures.
  const stageNames = ['봉오리', '발아', '개화', '만개', '낙화', '시듦'];
  const stageScores = [3.8, 5.3, 7.8, 9.3, 2.6, 0.7];
  cards.forEach((card, index) => {
    const info = document.createElement('span');
    info.className = 'captured-info daily-readable-details';
    const [day, caption, description] = moods[index];
    info.innerHTML = `<span class="captured-heading">TODAY’S MOOD SCORE</span>
      <span class="captured-score-row"><span class="captured-score">${stageScores[index].toFixed(1)}</span><small>/ 10</small></span>
      <span class="captured-mood"><span class="captured-day">${day}</span><span class="captured-day-copy">${caption}</span><span class="captured-day-bar"><i style="width:${stageScores[index]*10}%"></i></span></span>
      <span class="captured-heading">TODAY’S SPECTRUM</span><span class="captured-state-name">${stageNames[index]}</span><span class="captured-spectrum-copy">${description}</span>
      <span class="captured-spectrum"><span class="captured-spectrum-line"><span class="spectrum-stops" aria-hidden="true"><em style="left:0%"></em><em style="left:20%"></em><em style="left:40%"></em><em style="left:60%"></em><em style="left:80%"></em><em style="left:100%"></em><small style="left:10%"></small><small style="left:30%"></small><small style="left:50%"></small><small style="left:70%"></small><small style="left:90%"></small></span><i style="width:${index*20}%"></i><b style="left:${index*20}%"></b></span><span class="captured-spectrum-labels">${stageNames.map((name,i)=>`<span class="${i===index?'is-current':''}">${name}</span>`).join('')}</span></span>`;
    card.append(info);
  });
  document.addEventListener('trace-moment-captured', event => {
    const index = event.detail?.dailyCardIndex;
    if (!Number.isInteger(index) || index < 0 || index >= count) return;
    if (pointer && viewport.hasPointerCapture(pointer.id)) viewport.releasePointerCapture(pointer.id);
    pointer = null; drag = 0; expanded = false; navigationUntil = 0;
    clearTimeout(wheelTimer); wheelDelta = 0; wheelMoved = false;
    viewport.classList.remove('is-dragging');
    // Keep the captured intermediate frame instead of replacing it with a stage PNG.
    cards.forEach(card => {
      card.querySelector('.daily-captured-moment')?.remove();
      card.classList.remove('has-captured-moment');
      card.querySelector('img').hidden = false;
    });
    const moment = event.detail;
    // Stage anchors follow the actual sequence: full bloom peaks near frame 141.
    const anchors = [1, 40, 80, 141, 260, 351];
    const frame = Math.max(1, Math.min(351, moment.flowerFrame));
    const segment = Math.min(4, Math.max(0, anchors.findLastIndex(value => frame >= value)));
    const progress = (segment + (frame - anchors[segment]) / (anchors[segment + 1] - anchors[segment])) / 5;
    const korean = ['봉오리', '발아', '개화', '만개', '낙화', '시듦'];
    // Interpolate the existing card scores between their six flower stages.
    const scores = [3.8, 5.3, 7.8, 9.3, 2.6, 0.7];
    const position = progress * 5;
    const lower = Math.min(4, Math.floor(position));
    const score = scores[lower] + (scores[lower + 1] - scores[lower]) * (position - lower);
    const content = document.createElement('span');
    content.className = 'daily-captured-moment';
    content.innerHTML = `<span class="captured-flower-window"><img class="captured-flower" alt="촬영 순간의 꽃"></span>
      <span class="captured-info"><span class="captured-heading">TODAY’S MOOD SCORE</span><span class="captured-score-row"><span class="captured-score"></span><small>/ 10</small></span>
      <span class="captured-mood"><span class="captured-day"></span><span class="captured-day-copy"></span><span class="captured-day-bar"><i></i></span></span>
      <span class="captured-heading">TODAY’S SPECTRUM</span><span class="captured-state-name"></span><span class="captured-spectrum-copy"></span>
      <span class="captured-spectrum"><span class="captured-spectrum-line"><span class="spectrum-stops" aria-hidden="true"><em style="left:0%"></em><em style="left:20%"></em><em style="left:40%"></em><em style="left:60%"></em><em style="left:80%"></em><em style="left:100%"></em><small style="left:10%"></small><small style="left:30%"></small><small style="left:50%"></small><small style="left:70%"></small><small style="left:90%"></small></span><i></i><b></b></span><span class="captured-spectrum-labels"></span></span></span>`;
    content.querySelector('.captured-state-name').textContent = korean[index];
    let notice = viewport.querySelector('.daily-capture-notice');
    if (!notice) {
      notice = document.createElement('p');
      notice.className = 'daily-capture-notice';
      notice.setAttribute('role', 'status');
      viewport.prepend(notice);
    }
    notice.replaceChildren();
    const noticeTitle = document.createElement('strong');
    noticeTitle.textContent = 'THIS IS YOUR DAILY EMOTION CARD';
    const noticeDescription = document.createElement('span');
    noticeDescription.textContent = 'Created from the moment you just captured.';
    notice.append(noticeTitle, noticeDescription);
    let portrait = viewport.querySelector('.daily-capture-photo');
    if (!portrait) {
      portrait = document.createElement('figure');
      portrait.className = 'daily-capture-photo';
      const photo = document.createElement('img');
      photo.alt = 'Your just-captured moment';
      photo.draggable = false;
      const caption = document.createElement('figcaption');
      caption.textContent = 'YOUR MOMENT';
      portrait.append(photo, caption);
      viewport.append(portrait);
    }
    portrait.querySelector('img').src = moment.image;

    const flower = content.querySelector('img');
    flower.onload = () => {
      // Measure the subject only; render the untouched source image, without keying.
      const measure = document.createElement('canvas');
      measure.width = flower.naturalWidth; measure.height = flower.naturalHeight;
      const ctx = measure.getContext('2d', {willReadFrequently:true});
      ctx.drawImage(flower, 0, 0);
      const {data} = ctx.getImageData(0, 0, measure.width, measure.height);
      let left=measure.width, top=measure.height, right=0, bottom=0;
      for (let y=0; y<measure.height; y++) for (let x=0; x<measure.width; x++) {
        const i=(y*measure.width+x)*4;
        if (data[i+3]>128 && Math.max(data[i],data[i+1],data[i+2])>45) {
          left=Math.min(left,x); right=Math.max(right,x);
          top=Math.min(top,y); bottom=Math.max(bottom,y);
        }
      }
      if (right<=left || bottom<=top) return;
      const size=Math.max(right-left+1,bottom-top+1)/.86;
      flower.style.width=`${measure.width/size*100}%`;
      flower.style.height=`${measure.height/size*100}%`;
      flower.style.left=`${50-(left+right)/2/size*100}%`;
      flower.style.top=`${50-(top+bottom)/2/size*100}%`;
    };
    flower.src = moment.flowerSrc;
    content.querySelector('.captured-score').textContent = score.toFixed(1);
    content.querySelector('.captured-score').title = '꽃 진행도에 따라 보간한 시각화 점수';

    const [day, caption, description] = moods[index];
    content.querySelector('.captured-day').textContent = `${day}`;
    content.querySelector('.captured-day-copy').textContent = caption;
    content.querySelector('.captured-spectrum-copy').textContent = description;
    content.querySelector('.captured-day-bar i').style.width = `${score * 10}%`;
    content.querySelector('.captured-spectrum-line i').style.width = `${progress * 100}%`;
    content.querySelector('.captured-spectrum-line b').style.left = `${progress * 100}%`;
    const labels = content.querySelector('.captured-spectrum-labels');
    korean.forEach((name, i) => {
      const label = document.createElement('span');
      label.textContent = name;
      if (i === index) label.className = 'is-current';
      labels.append(label);
    });
    cards[index].classList.add('has-captured-moment');
    cards[index].append(content);
    cards[index].setAttribute('aria-label', `촬영 순간 ${korean[index]}, 꽃 진행도 ${(progress * 100).toFixed(1)}퍼센트`);
    selected = index;
    render(true);
  });
  render(true);
})();
