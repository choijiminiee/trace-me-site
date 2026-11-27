(() => {
  const transition = document.querySelector('#about-transition');
  const section = document.querySelector('#about');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (transition) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accent = transition.querySelector('h2 span:last-child .about-question-accent');
    if (accent && !accent.querySelector('.question-letter')) {
      const text = accent.textContent;
      accent.setAttribute('aria-label', text);
      accent.replaceChildren(...Array.from(text, (character, index) => {
        const letter = document.createElement('i');
        letter.className = 'question-letter';
        letter.style.setProperty('--letter-index', index);
        letter.style.fontStyle = 'normal';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character;
        return letter;
      }));
    }
    transition.classList.add('is-reveal-ready');
    // Reveal the question only after the section fills the viewport.
    ScrollTrigger.create({
      trigger:transition, start:'top top',
      onEnter:()=>transition.classList.add('is-type-visible'),
      onLeaveBack:()=>transition.classList.remove('is-type-visible'),
      onRefresh:self=>transition.classList.toggle('is-type-visible',self.scroll() >= self.start)
    });
    // Switch surfaces once two thirds of the question viewport has entered.
    ScrollTrigger.create({
      trigger:transition, start:'top 33.333%',
      onEnter:()=>transition.classList.add('is-light-surface'),
      onLeaveBack:()=>transition.classList.remove('is-light-surface'),
      onRefresh:self=>transition.classList.toggle('is-light-surface',self.scroll() >= self.start)
    });
    // Let the pale sheet enter through ordinary scrolling before its copy appears.
    ScrollTrigger.create({
      trigger:transition, start:'top 8%', end:()=>`+=${innerHeight * .7}`,
      onEnter:()=>transition.classList.add('is-revealed'),
      onLeaveBack:()=>transition.classList.remove('is-revealed'),
      invalidateOnRefresh:true
    });
    if (!reduce) ScrollTrigger.create({
      trigger:transition,start:'top top',end:()=>`+=${innerHeight * .6}`,
      pin:true,anticipatePin:1,invalidateOnRefresh:true
    });
  }

  const approach = document.querySelector('#approach');
  if (transition && approach) {
    approach.classList.add('from-about-transition');
    const words = approach.querySelectorAll('.approach-word');
    if (words.length === 3) {
      const emphasis = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:{trigger:approach,start:'top 20%',end:'bottom 30%',scrub:matchMedia('(prefers-reduced-motion: reduce)').matches ? true : .6,invalidateOnRefresh:true}
      });
      words.forEach((word,index) => {
        emphasis.fromTo(word,{'--word-red':'0%'},{'--word-red':'100%',duration:.15},index * .3);
      });
      [...words].reverse().forEach((word,index) => {
        emphasis.to(word,{'--word-red':'0%',duration:.15},1.35 + index * .3);
      });
    }

    const darkSurface = {
      '--approach-surface':'#090910', '--approach-ink':'#f4f2f7',
      '--approach-muted':'#a49bab', '--approach-accent':'#c4b2e8', '--approach-line':'#28242c'
    };
    // Keep surfaces distinct: the dark chapter scrolls in without a grey blend.
    gsap.set(approach, darkSurface);
    const system = document.querySelector('#system');
    if (system) {
      system.classList.add('from-about-transition');
      gsap.set(system, darkSurface);
    }
  }

  const matrix = section.querySelector('.about-matrix');
  // ABOUT archive: add/replace original PNG, JPG, JPEG or WebP filenames here.
  // Entries are distributed in five-photo groups across the four columns.
  const archiveImages = [
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_47-1.png",
    "src": "/public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_47-1.png",
    "alt": "카페 앞의 순간"
  },
  {
    "file": "selfie.png",
    "src": "/public/bloom-calendar/selfie.png",
    "alt": "스트라이프 티셔츠를 입고 강변에서 찍은 셀카"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_40-2.png",
    "alt": "해안 산책"
  },
  {
    "file": "mirror.png",
    "src": "/public/bloom-calendar/mirror.png",
    "alt": "검정 카디건과 데님 코디의 거울 셀카"
  },
  {
    "file": "friends-dinner.jpg",
    "src": "/public/candid-moments/friends-dinner.jpg",
    "alt": "친구들과 식사하며 웃는 순간"
  },
  {
    "file": "dog.png",
    "src": "/public/bloom-calendar/dog.png",
    "alt": "올리브 재킷을 입고 강아지와 산책"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_45-6.png",
    "alt": "점심 식사"
  },
  {
    "file": "friends-four-cut.jpg",
    "src": "/public/candid-moments/friends-four-cut.jpg",
    "alt": "친구 셋이 함께 찍은 인생네컷"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_59-8.png",
    "alt": "강아지와 노을"
  },
  {
    "file": "gallery.png",
    "src": "/public/bloom-calendar/gallery.png",
    "alt": "분홍 셔츠와 아이보리 팬츠로 전시 관람"
  },
  {
    "file": "friends-picnic.jpg",
    "src": "/public/candid-moments/friends-picnic.jpg",
    "alt": "친구들과 피크닉 셀카"
  },
  {
    "file": "reading.png",
    "src": "/public/bloom-calendar/reading.png",
    "alt": "집에서 책을 읽는 오후"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_46-7.png",
    "alt": "함께 나눈 음식"
  },
  {
    "file": "tea.png",
    "src": "/public/bloom-calendar/tea.png",
    "alt": "Overhead close photo of chamomile tea and open journal at quiet wooden desk, morning solitude"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_41-3.png",
    "alt": "나무 사이 산책길"
  },
  {
    "file": "rain.png",
    "src": "/public/bloom-calendar/rain.png",
    "alt": "Rain droplets on apartment window, soft gray city out of focus, quiet reflective afternoon"
  },
  {
    "file": "friends-seaside.jpg",
    "src": "/public/candid-moments/friends-seaside.jpg",
    "alt": "친구들과 바닷가 여행"
  },
  {
    "file": "bed.png",
    "src": "/public/bloom-calendar/bed.png",
    "alt": "Unmade linen bed and paperback book, muted blue morning light, peaceful restful day"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_49-9.png",
    "alt": "여행지 시장"
  },
  {
    "file": "soup.png",
    "src": "/public/bloom-calendar/soup.png",
    "alt": "Single bowl of homemade vegetable soup on small kitchen table, gentle low evening light"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_49-3.png",
    "alt": "강아지와 산책"
  },
  {
    "file": "sea.png",
    "src": "/public/bloom-calendar/sea.png",
    "alt": "Empty blue gray coast at dusk, distant horizon and ripples, contemplative atmosphere"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_42-4.png",
    "alt": "비 내린 밤거리"
  },
  {
    "file": "lamp.png",
    "src": "/public/bloom-calendar/lamp.png",
    "alt": "Warm bedside lamp and book in otherwise dark bedroom, quiet nighttime rest"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_48-8.png",
    "alt": "카페의 디저트"
  },
  {
    "file": "shoes.png",
    "src": "/public/bloom-calendar/shoes.png",
    "alt": "Top-down personal snapshot of white sneakers and fallen leaves after solitary walk"
  },
  {
    "file": "friends-walk-v2.jpg",
    "src": "/public/candid-moments/friends-walk-v2.jpg",
    "alt": "친구들과 산책하다 웃는 순간"
  },
  {
    "file": "breakfast.png",
    "src": "/public/bloom-calendar/breakfast.png",
    "alt": "Top-down sunny breakfast toast strawberries and latte on small round table, joyful morning"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_39-1.png",
    "alt": "강 너머 도시"
  },
  {
    "file": "flowers.png",
    "src": "/public/bloom-calendar/flowers.png",
    "alt": "Fresh yellow daisies in neighborhood flower shop, spontaneous bright street snapshot"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_56-6.png",
    "alt": "함께한 저녁"
  },
  {
    "file": "picnic.png",
    "src": "/public/bloom-calendar/picnic.png",
    "alt": "Top-down picnic blanket with sandwiches fruit sparkling drinks and friends hands, happy afternoon"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_44-5.png",
    "alt": "산과 호수"
  },
  {
    "file": "dogdetail.png",
    "src": "/public/bloom-calendar/dogdetail.png",
    "alt": "Small curly beige dog sniffing grass, low ground-level candid park photograph"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_57-7.png",
    "alt": "시장에서의 여행"
  },
  {
    "file": "bakery.png",
    "src": "/public/bloom-calendar/bakery.png",
    "alt": "Close handheld photograph of fresh croissant in paper bag near bakery window, cheerful morning"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_50-10.png",
    "alt": "저녁 식사"
  },
  {
    "file": "sunset.png",
    "src": "/public/bloom-calendar/sunset.png",
    "alt": "Peach pink sunset above river, unposed travel smartphone landscape"
  },
  {
    "file": "friends-night-v2.jpg",
    "src": "/public/candid-moments/friends-night-v2.jpg",
    "alt": "편의점 앞에서 친구들과 나눈 대화"
  },
  {
    "file": "plants.png",
    "src": "/public/bloom-calendar/plants.png",
    "alt": "Window herbs and a half full glass of water, pale early daylight, tranquil home detail"
  },
  {
    "file": "rest.png",
    "src": "/public/bloom-calendar/rest.png",
    "alt": "Same woman identity reference, oversized gray sweatshirt and comfortable pants sitting sideways on sofa looking outside, relaxed unsmiling restful expression, wide candid photograph"
  },
  {
    "file": "balcony.png",
    "src": "/public/bloom-calendar/balcony.png",
    "alt": "Same woman identity reference, sage linen shirt and beige trousers watering balcony plants, profile side view, quiet morning"
  },
  {
    "file": "home.png",
    "src": "/public/bloom-calendar/home.png",
    "alt": "Same woman identity reference, soft navy pajamas reading in bed, nighttime warm bedside light, distant candid photograph, restful neutral expression"
  },
  {
    "file": "rainwalk.png",
    "src": "/public/bloom-calendar/rainwalk.png",
    "alt": "Same woman identity reference, tan trench coat and black trousers under clear umbrella, rear view crossing quiet rainy street, subdued atmosphere"
  },
  {
    "file": "walk.png",
    "src": "/public/bloom-calendar/walk.png",
    "alt": "강아지와 조용한 산책"
  }
];
  const archiveColumns = Array.from({length:4}, () => {
    const column = document.createElement('div');
    column.className = 'about-column';
    const strip = document.createElement('div');
    strip.className = 'about-column-drift';
    column.append(strip);
    matrix.append(column);
    return strip;
  });
  archiveImages.filter(item => /\.(png|jpe?g|webp)$/i.test(item.file)).forEach((item,i) => {
    const photo = document.createElement('button');
    photo.type = 'button';
    photo.className = 'about-photo';
    photo.setAttribute('aria-pressed','false');
    const image = document.createElement('img');
    image.src = item.src || '/public/'+['무제 폴더', item.file].map(encodeURIComponent).join('/');
    image.alt = item.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 600;
    image.height = 800;
    const caption = document.createElement('span');
    caption.textContent = 'RECORD ' + String(i+1).padStart(2,'0');
    photo.append(image,caption);
    archiveColumns[Math.floor(i / Math.ceil(archiveImages.length / 4))].append(photo);
  });
  const columns = [...section.querySelectorAll('.about-column')];
  const photos = [...section.querySelectorAll('.about-photo')];
  const intro = section.querySelector('.about-intro');
  const question = section.querySelector('.about-question');
  const discovery = section.querySelector('.about-discovery');
  const final = section.querySelector('.about-final');
  const guide = section.querySelector('.about-guide-text');
  const count = section.querySelector('.about-discovered');
  const next = section.querySelector('.about-continue');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new Set();
  const camera = section.querySelector('.about-camera');
  let active = -1, unlocked = false, isFinal = false, revealing = false, reveal;
  const hidePhotoCursor = () => {};
  const problems = [
    ['RECORDS WITHOUT<br>PATTERNS','우리는 매일 수많은 사진을 남기지만,<br>각 기록이 서로 어떤 감정의 패턴으로<br>연결되는지는 알기 어렵습니다.'],
    ['MOMENTS WITHOUT<br>CONTEXT','사진은 순간을 기록하지만,<br>왜 그런 감정을 느꼈고<br>어떤 경험이 반복되었는지는 설명해주지 않습니다.'],
    ['DATA WITHOUT<br>SELF-REFLECTION','수많은 기록을 가지고 있어도,<br>그 기록을 통해 나를 객관적으로<br>이해하기는 어렵습니다.']
  ];
  function updateGuide() {
    guide.textContent = seen.size === 3 ? '' : '사진을 눌러 이야기를 살펴보세요';
    count.textContent = `${seen.size} / 3`;
    next.hidden = seen.size !== 3 || revealing;
    next.textContent = '계속 보기 ↓';
  }
  photos.forEach((photo, i) => {
    photo.setAttribute('aria-label', `사진 ${i + 1} 클릭하여 이야기 보기`);
    photo.addEventListener('click', () => showPhoto(photo));
  });
  function setPhase(progress) {
    progress *= 2.16;
    if (isFinal && progress < 1.86) {
      isFinal = false;
      section.classList.remove('is-final');
      gsap.set(final, {autoAlpha:0});
      final.inert = true;
      final.setAttribute('aria-hidden', 'true');
      gsap.set(discovery, {autoAlpha:1, y:0});
    }
    unlocked = progress >= 1.92;
    if (!unlocked || isFinal) hidePhotoCursor();
    section.classList.toggle('is-discovering', unlocked);
    photos.forEach(photo => { photo.inert = !unlocked || isFinal; });
    if (unlocked) updateGuide();
    if (!unlocked) guide.textContent = progress < .90 ? 'SCROLL THROUGH YOUR MOMENTS ↓' : 'SCROLL TO ENTER THE ARCHIVE ↓';
    question.setAttribute('aria-hidden', String(progress < 1.40 || progress > 1.92));
    intro.setAttribute('aria-hidden', String(progress < .90 || progress > 1.40));
    discovery.style.visibility = unlocked && !isFinal ? 'visible' : 'hidden';
  }
  const mm = gsap.matchMedia();
  mm.add({motion:'(prefers-reduced-motion: no-preference)', reduced:'(prefers-reduced-motion: reduce)'}, context => {
    const motion = context.conditions.motion;
    const onScroll = self => setPhase(self.progress);
    const tl = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,onUpdate:onScroll}});
    // First travel through the clear archive, then return to the original text/discovery sequence.
    tl.fromTo(matrix,{scale:motion?.7:1,rotationX:motion?23:0,rotationZ:motion?-5:0},{scale:motion?1.08:1,rotationX:0,rotationZ:0,duration:1.92},0);
    tl.fromTo(matrix,{'--about-photo-opacity':.95},{'--about-photo-opacity':.12,duration:.18},.76);
    columns.forEach((column,i)=>tl.fromTo(column,{y:motion?[0,-160,0,-200][i]:0},{y:motion?[-340,140,-420,190][i]:0,duration:2.16},0));
    tl.fromTo(intro,{autoAlpha:0,y:motion?30:0},{autoAlpha:1,y:0,duration:.12},.90);
    tl.to(intro,{autoAlpha:0,y:motion?-45:0,duration:.14},1.26);
    tl.set(question,{autoAlpha:1},1.40);
    tl.fromTo(section.querySelectorAll('.about-reveal > *'),{yPercent:motion?110:0,clipPath:'inset(100% 0 0 0)'},{yPercent:0,clipPath:'inset(0% 0 0 0)',duration:.16,stagger:.025},1.40);
    tl.to(question,{autoAlpha:0,y:motion?-35:0,duration:.14},1.78);
    tl.to(matrix,{'--about-photo-opacity':.12,duration:.14},1.78);
    setPhase(tl.scrollTrigger.progress);


  });
  function showPhoto(photo) {
    if (!unlocked || isFinal || revealing) return;

    const id = (active + 1) % problems.length;
    revealing = true;
    photos.forEach(other => other.setAttribute('aria-pressed',String(other===photo)));
    section.classList.add('has-selection');

    seen.add(id); count.textContent = `${String(seen.size).padStart(2,'0')} / 03`;
    next.hidden = true;
    reveal?.kill();
    gsap.killTweensOf(discovery);
    const render = () => {
      discovery.dataset.position = String(id);
      discovery.innerHTML = `<p class="about-eyebrow"><span class="about-problem-number">0${id+1}</span> / THE MISSING CONNECTION</p><h3>${problems[id][0]}</h3><p class="about-korean">${problems[id][1]}</p>`;
      active = id;
      gsap.fromTo(discovery,{x:reduced.matches?0:(id===1?35:-25),y:reduced.matches?0:25,clipPath:'inset(100% 0 0 0)'},{x:0,y:0,clipPath:'inset(0% 0 0 0)',duration:reduced.matches?0:.5,ease:'power3.out',onComplete:()=>{revealing=false; updateGuide();}});
      active = id;
      updateGuide();
    };
    if (active < 0 || reduced.matches) render();
    else reveal = gsap.to(discovery,{y:-25,clipPath:'inset(0 0 100% 0)',duration:.2,ease:'power2.in',onComplete:render});
  }
  next.addEventListener('click', () => {
    if (seen.size !== 3 || revealing) return;
    section.nextElementSibling?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  });
  new IntersectionObserver(([entry])=>section.classList.toggle('is-in-view',entry.isIntersecting)).observe(section);
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
