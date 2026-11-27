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
      const colorStates = [...words].map(() => ({fill:0, reached:0}));
      gsap.set(words, {'--word-red':'0%'});
      const emphasis = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:{trigger:approach,start:'top 20%',end:'bottom 30%',scrub:matchMedia('(prefers-reduced-motion: reduce)').matches ? true : .6,invalidateOnRefresh:true},
        onUpdate() {
          colorStates.forEach((state,index) => {
            state.reached = Math.max(state.reached, state.fill);
            gsap.set(words[index], {'--word-red':`${state.reached}%`});
          });
        }
      });
      colorStates.forEach((state,index) => {
        emphasis.to(state,{fill:100,duration:.15},index * .3);
      });
      // Keep the original scroll duration, while retaining completed purple fills.
      emphasis.to({}, {duration:1.35});
      window.addEventListener('trace:idle-reset', () => {
        colorStates.forEach(state => { state.fill = state.reached = 0; });
        emphasis.progress(0);
        gsap.set(words, {'--word-red':'0%'});
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
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_47-1.png",
    "alt": "카페 앞의 순간"
  },
  {
    "file": "selfie.png",
    "src": "public/bloom-calendar/selfie.jpg",
    "alt": "스트라이프 티셔츠를 입고 강변에서 찍은 셀카"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_40-2.png",
    "alt": "해안 산책"
  },
  {
    "file": "mirror.png",
    "src": "public/bloom-calendar/mirror.jpg",
    "alt": "검정 카디건과 데님 코디의 거울 셀카"
  },
  {
    "file": "friends-dinner.jpg",
    "src": "public/candid-moments/friends-dinner.jpg",
    "alt": "친구들과 식사하며 웃는 순간"
  },
  {
    "file": "dog.png",
    "src": "public/bloom-calendar/dog.jpg",
    "alt": "올리브 재킷을 입고 강아지와 산책"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_45-6.png",
    "alt": "점심 식사"
  },
  {
    "file": "friends-four-cut.jpg",
    "src": "public/candid-moments/friends-four-cut.jpg",
    "alt": "친구 셋이 함께 찍은 인생네컷"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_59-8.png",
    "alt": "강아지와 노을"
  },
  {
    "file": "gallery.png",
    "src": "public/bloom-calendar/gallery.jpg",
    "alt": "분홍 셔츠와 아이보리 팬츠로 전시 관람"
  },
  {
    "file": "friends-picnic.jpg",
    "src": "public/candid-moments/friends-picnic.jpg",
    "alt": "친구들과 피크닉 셀카"
  },
  {
    "file": "reading.png",
    "src": "public/bloom-calendar/reading.jpg",
    "alt": "집에서 책을 읽는 오후"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_46-7.png",
    "alt": "함께 나눈 음식"
  },
  {
    "file": "tea.png",
    "src": "public/bloom-calendar/tea.jpg",
    "alt": "Overhead close photo of chamomile tea and open journal at quiet wooden desk, morning solitude"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_41-3.png",
    "alt": "나무 사이 산책길"
  },
  {
    "file": "rain.png",
    "src": "public/bloom-calendar/rain.jpg",
    "alt": "Rain droplets on apartment window, soft gray city out of focus, quiet reflective afternoon"
  },
  {
    "file": "friends-seaside.jpg",
    "src": "public/candid-moments/friends-seaside.jpg",
    "alt": "친구들과 바닷가 여행"
  },
  {
    "file": "bed.png",
    "src": "public/bloom-calendar/bed.jpg",
    "alt": "Unmade linen bed and paperback book, muted blue morning light, peaceful restful day"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_49-9.png",
    "alt": "여행지 시장"
  },
  {
    "file": "soup.png",
    "src": "public/bloom-calendar/soup.jpg",
    "alt": "Single bowl of homemade vegetable soup on small kitchen table, gentle low evening light"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_49-3.png",
    "alt": "강아지와 산책"
  },
  {
    "file": "sea.png",
    "src": "public/bloom-calendar/sea.jpg",
    "alt": "Empty blue gray coast at dusk, distant horizon and ripples, contemplative atmosphere"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_42-4.png",
    "alt": "비 내린 밤거리"
  },
  {
    "file": "lamp.png",
    "src": "public/bloom-calendar/lamp.jpg",
    "alt": "Warm bedside lamp and book in otherwise dark bedroom, quiet nighttime rest"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_48-8.png",
    "alt": "카페의 디저트"
  },
  {
    "file": "shoes.png",
    "src": "public/bloom-calendar/shoes.jpg",
    "alt": "Top-down personal snapshot of white sneakers and fallen leaves after solitary walk"
  },
  {
    "file": "friends-walk-long-hair.png",
    "src": "public/candid-moments/friends-walk-long-hair.png",
    "alt": "친구들과 산책하다 웃는 순간"
  },
  {
    "file": "breakfast.png",
    "src": "public/bloom-calendar/breakfast.jpg",
    "alt": "Top-down sunny breakfast toast strawberries and latte on small round table, joyful morning"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_39-1.png",
    "alt": "강 너머 도시"
  },
  {
    "file": "flowers.png",
    "src": "public/bloom-calendar/flowers.jpg",
    "alt": "Fresh yellow daisies in neighborhood flower shop, spontaneous bright street snapshot"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_56-6.png",
    "alt": "함께한 저녁"
  },
  {
    "file": "picnic.png",
    "src": "public/bloom-calendar/picnic.jpg",
    "alt": "Top-down picnic blanket with sandwiches fruit sparkling drinks and friends hands, happy afternoon"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_44-5.png",
    "alt": "산과 호수"
  },
  {
    "file": "dogdetail.png",
    "src": "public/bloom-calendar/dogdetail.jpg",
    "alt": "Small curly beige dog sniffing grass, low ground-level candid park photograph"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_56_57-7.png",
    "alt": "시장에서의 여행"
  },
  {
    "file": "bakery.png",
    "src": "public/bloom-calendar/bakery.jpg",
    "alt": "Close handheld photograph of fresh croissant in paper bag near bakery window, cheerful morning"
  },
  {
    "file": "ChatGPT 이미지 2026년 10월 10일 오후 09_57_50-10.png",
    "alt": "저녁 식사"
  },
  {
    "file": "sunset.png",
    "src": "public/bloom-calendar/sunset.jpg",
    "alt": "Peach pink sunset above river, unposed travel smartphone landscape"
  },
  {
    "file": "friends-night-v2.jpg",
    "src": "public/candid-moments/friends-night-v2.jpg",
    "alt": "편의점 앞에서 친구들과 나눈 대화"
  },
  {
    "file": "plants.png",
    "src": "public/bloom-calendar/plants.jpg",
    "alt": "Window herbs and a half full glass of water, pale early daylight, tranquil home detail"
  },
  {
    "file": "rest.png",
    "src": "public/bloom-calendar/rest.jpg",
    "alt": "Same woman identity reference, oversized gray sweatshirt and comfortable pants sitting sideways on sofa looking outside, relaxed unsmiling restful expression, wide candid photograph"
  },
  {
    "file": "balcony.png",
    "src": "public/bloom-calendar/balcony.jpg",
    "alt": "Same woman identity reference, sage linen shirt and beige trousers watering balcony plants, profile side view, quiet morning"
  },
  {
    "file": "home.png",
    "src": "public/bloom-calendar/home.jpg",
    "alt": "Same woman identity reference, soft navy pajamas reading in bed, nighttime warm bedside light, distant candid photograph, restful neutral expression"
  },
  {
    "file": "rainwalk.png",
    "src": "public/bloom-calendar/rainwalk.jpg",
    "alt": "Same woman identity reference, tan trench coat and black trousers under clear umbrella, rear view crossing quiet rainy street, subdued atmosphere"
  },
  {
    "file": "walk.png",
    "src": "public/bloom-calendar/walk.jpg",
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
    image.src = item.src || 'public/'+['무제 폴더', item.file].map(encodeURIComponent).join('/');
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
  const problems = [
    ['RECORDS WITHOUT<br>PATTERNS','우리는 매일 수많은 사진을 남기지만,<br>각 기록이 서로 어떤 감정의 패턴으로<br>연결되는지는 알기 어렵습니다.'],
    ['MOMENTS WITHOUT<br>CONTEXT','사진은 순간을 기록하지만,<br>왜 그런 감정을 느꼈고<br>어떤 경험이 반복되었는지는 설명해주지 않습니다.'],
    ['DATA WITHOUT<br>SELF-REFLECTION','수많은 기록을 가지고 있어도,<br>그 기록을 통해 나를 객관적으로<br>이해하기는 어렵습니다.']
  ];

  const phaseEnd = 3.66;
  let active = -1;
  let storyPhotos = [];
  let storyStops = [];
  const columnBase = [-340,140,-420,190];
  const originalPhotos = new Map(photos.map(photo => {
    const img=photo.querySelector('img');
    return [photo, {src:img.getAttribute('src'), alt:img.alt}];
  }));
  const thirdStoryImage = new Image();
  thirdStoryImage.src = 'public/bloom-calendar/home.jpg';
  guide.textContent = '';
  section.querySelector('.about-guide').hidden = true;
  section.classList.add('scroll-stories');
  photos.forEach(photo => { photo.inert = true; photo.tabIndex = -1; });
  function choosePhotos(){
    const candidates = photos.filter(photo=>photo.querySelector('span')?.textContent!=='RECORD 38')
      .map(photo=>{
        const r=photo.getBoundingClientRect();
        const width=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0));
        const height=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));
        return {photo,r,coverage:width*height/Math.max(1,r.width*r.height)};
      }).filter(({coverage})=>coverage>.5);
    const chosen=[];
    [true,false,true].forEach((right,index)=>{
      const unused=candidates.filter(({photo})=>!chosen.includes(photo));
      // For the third story use an inner-column photo with its full width visible.
      const centered=unused.filter(({r})=>r.left>=0 && r.right<=innerWidth &&
        r.left+r.width/2>innerWidth*.25 && r.left+r.width/2<innerWidth*.75);
      const pool=index===2 && centered.length ? centered : unused;
      const ranked=pool.sort((a,b)=>{
        const score=({r,coverage})=>coverage*10
          -(index===2?Math.abs(r.left+r.width/2-innerWidth*.62)/innerWidth*4:0)
          -Math.abs(r.top+r.height/2-innerHeight/2)/innerHeight
          +(right?r.left+r.width/2>innerWidth*.5:r.left+r.width/2<innerWidth*.5)*.5;
        return score(b)-score(a);
      });
      if(ranked[0])chosen.push(ranked[0].photo);
    });
    return chosen;
  }
  function prepareStories(){
    if(storyStops.length)return;
    const scale=reduced.matches?1:1.08;
    const cameraTop=section.querySelector('.about-camera').getBoundingClientRect().top;
    storyPhotos=[];storyStops=[];
    [2,1,2].forEach((columnIndex,id)=>{
      const desired=innerHeight*(.5+id*.7);
      const column=columns[columnIndex];
      // Measure from the archive's base position, not its current story offset.
      // Fullscreen refreshes can run while a previous story is still translated.
      const baseY=reduced.matches?0:columnBase[columnIndex];
      const offset=(Number(gsap.getProperty(column,'y'))-baseY)*scale;
      const candidates=[...column.querySelectorAll('.about-photo')]
        .filter(photo=>!storyPhotos.includes(photo))
        .map(photo=>{
          const r=photo.getBoundingClientRect();
          return {photo,center:r.top+r.height/2-cameraTop-offset};
        });
      const chosen=candidates.sort((a,b)=>Math.abs(a.center-desired)-Math.abs(b.center-desired))[0];
      storyPhotos.push(chosen.photo);
      storyStops.push((innerHeight*.5-chosen.center)/scale);
      chosen.photo.querySelector('img').loading='eager';
    });
  }
  function renderStory(phase,id){
    if(id<0)return;
    const local=Math.max(0,Math.min(1,(phase-1.92-id*.58)/.58));
    const enter=Math.min(1,local/.26);
    const leave=Math.max(0,(local-.76)/.24);
    // Follow scroll position in both directions, rather than launching a timed reveal.
    const visibility=Math.min(enter,1-leave);
    const travel=reduced.matches?0:innerHeight*((1-enter)*.55-leave*.45);
    gsap.set(discovery,{autoAlpha:visibility,x:0,y:travel,clipPath:'none'});
    const previous=id===0?0:storyStops[id-1]-innerHeight*.18;
    const offset=previous+(storyStops[id]-previous)*enter-innerHeight*.18*leave;
    columns.forEach((column,i)=>gsap.set(column,{y:reduced.matches?0:columnBase[i]+offset}));
    const photo=storyPhotos[id] || storyPhotos[0];
    // Smooth the zoom at both ends so it settles and recedes without a sharp change.
    const zoomIn=Math.min(1,local/.34);
    const zoomOut=Math.max(0,Math.min(1,(local-.66)/.34));
    const smooth=t=>t*t*(3-2*t);
    const zoom=smooth(zoomIn)*(1-smooth(zoomOut));
    if(photo)gsap.set(photo,{opacity:.09+.73*visibility,scale:reduced.matches?1:1+.14*zoom,transformOrigin:'center center'});
  }
  function setPhase(progress){
    const phase=progress*phaseEnd;
    const id=phase<1.92?-1:Math.min(2,Math.floor((phase-1.92)/.58));
    section.classList.toggle('is-discovering',id>=0);
    section.classList.toggle('has-selection',id>=0);
    question.setAttribute('aria-hidden',String(phase<1.40||phase>=1.92));
    intro.setAttribute('aria-hidden',String(phase<.90||phase>1.40));
    final.inert=true;
    if(id===active){renderStory(phase,id);return;}
    active=id;
    gsap.killTweensOf(discovery);
    photos.forEach(photo=>{
      photo.setAttribute('aria-pressed','false');
      gsap.set(photo,{clearProps:'transform,opacity'});
      const img=photo.querySelector('img'), original=originalPhotos.get(photo);
      if(img.getAttribute('src')!==original.src) { img.src=original.src; img.alt=original.alt; }
    });
    if(id<0){gsap.set(discovery,{autoAlpha:0});return;}
    prepareStories();
    const selectedPhoto = storyPhotos[id] || storyPhotos[0];
    if(id===2 && selectedPhoto) {
      const img=selectedPhoto.querySelector('img');
      img.src=thirdStoryImage.src;
      img.alt='침대에서 책을 읽으며 하루를 돌아보는 순간';
    }
    selectedPhoto?.setAttribute('aria-pressed','true');
    discovery.dataset.position=String(id);
    discovery.innerHTML=`<p class="about-eyebrow"><span class="about-problem-number">0${id+1}</span> / THE PROBLEM</p><h3>${problems[id][0]}</h3><p class="about-korean">${problems[id][1]}</p>`;
    renderStory(phase,id);
  }
  const mm=gsap.matchMedia();
  mm.add({motion:'(prefers-reduced-motion: no-preference)',reduced:'(prefers-reduced-motion: reduce)'},context=>{
    const motion=context.conditions.motion;
    active=-2;storyStops=[];storyPhotos=[];
    const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
      trigger:section,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,
      onUpdate:self=>setPhase(self.progress),
      onRefresh(self){
        // Photo sizes and column positions change with the fullscreen viewport.
        storyStops=[];
        active=-2;
        setPhase(self.progress);
      }
    }});
    // First travel through the clear archive, then return to the original text/discovery sequence.
    tl.fromTo(matrix,{scale:motion?.7:1,rotationX:motion?23:0,rotationZ:motion?-5:0},{scale:motion?1.08:1,rotationX:0,rotationZ:0,duration:1.92},0);
    tl.fromTo(matrix,{'--about-photo-opacity':.95},{'--about-photo-opacity':.12,duration:.18},.76);
    columns.forEach((column,i)=>tl.fromTo(column,{y:motion?[0,-160,0,-200][i]:0},{y:motion?[-340,140,-420,190][i]:0,duration:1.92},0));
    tl.fromTo(intro,{autoAlpha:0,y:motion?30:0},{autoAlpha:1,y:0,duration:.12},.90);
    tl.to(intro,{autoAlpha:0,y:motion?-45:0,duration:.14},1.26);
    tl.set(question,{autoAlpha:1},1.40);
    tl.fromTo(section.querySelectorAll('.about-reveal > *'),{yPercent:motion?110:0,clipPath:'inset(100% 0 0 0)'},{yPercent:0,clipPath:'inset(0% 0 0 0)',duration:.16,stagger:.025},1.40);
    tl.to(question,{autoAlpha:0,y:motion?-35:0,duration:.14},1.78);
    tl.to(matrix,{'--about-photo-opacity':.12,duration:.14},1.78);

    // Each problem has its own scroll interval; no click gate or timed advance.
    tl.to({}, {duration:1.74}, 1.92);
    setPhase(tl.scrollTrigger.progress);
  });
  new IntersectionObserver(([entry])=>section.classList.toggle('is-in-view',entry.isIntersecting)).observe(section);
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
