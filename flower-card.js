/* Freeze only the flower, then replace the live panel in place with its explanation. */
(() => {
  const section = document.querySelector('#live-trace');
  const video = section.querySelector('video');
  const button = section.querySelector('.flower-card-create');
  const result = document.createElement('section');
  result.id = 'my-bloom'; result.hidden = true;
  result.setAttribute('aria-labelledby','my-bloom-title');
  result.innerHTML = '<figure><p>TRACE ME / MY BLOOM</p><img alt="내 표정으로 만든 꽃 카드"><figcaption><span class="bloom-card-stage"></span><strong class="bloom-card-message"></strong><div class="bloom-card-footer"><span>MY EXPRESSION</span><span class="bloom-card-number"></span></div></figcaption></figure><div><p class="bloom-result-eyebrow">YOUR FLOWER CARD</p><h2 id="my-bloom-title" tabindex="-1">지금의 표정이 담긴 꽃.</h2><h3></h3><p class="bloom-result-description"></p><p class="bloom-result-note">표정의 변화량을 꽃의 개화 과정으로 표현한 카드예요. 지금 화면에 보인 꽃의 모습을 담았어요.</p><button type="button">다시 만들어보기</button><a href="#features">꽃 카드 더 알아보기 ↓</a></div>';
  const experience = section.querySelector('.live-experience');
  section.append(result);
  const names=['봉오리','발아','개화','만개','낙화','시듦'];
  const descriptions=['꽃잎이 오므려진 봉오리의 모습이에요. 작은 표정 변화부터 꽃이 천천히 움직이기 시작해요.','봉오리가 조금씩 열리고 있어요. 표정의 변화가 꽃잎의 움직임으로 드러나는 단계예요.','꽃잎이 펼쳐지는 개화 단계예요. 표정의 변화에 따라 꽃의 형태가 더 풍성해져요.','꽃잎이 활짝 펼쳐진 순간이에요. 개화 과정에서 가장 풍성한 꽃의 모습을 담았어요.','활짝 핀 꽃잎이 아래로 흐르는 단계예요. 꽃이 피고 지는 과정의 다음 모습을 보여줘요.','꽃이 피고 지는 과정의 마지막 모습이에요. 표정을 바꾸면 다시 다른 단계의 꽃을 만나볼 수 있어요.'];
  function decorateCard(stage) {
    const labels=['BUD','SPROUT','BLOOM','FULL BLOOM','FALL','FADE'];
    const messages=['조용히 피어날 준비를 해요.','작은 변화가 시작되는 순간.','나만의 속도로 피어나는 중.','활짝 피어난 지금의 나.','천천히 내려놓는 순간.','여운을 남기고 쉬어가요.'];
    result.querySelector('.bloom-card-stage').textContent=labels[stage]+' / '+names[stage];
    result.querySelector('.bloom-card-message').textContent=messages[stage];
    result.querySelector('.bloom-card-number').textContent=String(stage+1).padStart(2,'0')+' / 06';
  }
  const localPreview=['localhost','127.0.0.1','::1'].includes(location.hostname);
  if(localPreview && performance.getEntriesByType('navigation')[0]?.type==='reload') {
    try {
      const saved=JSON.parse(sessionStorage.getItem('trace-preview-bloom') || 'null');
      if(saved && Number.isInteger(saved.frame) && saved.frame>=1 && saved.frame<=351) {
        const stage=[25,60,115,195,300].filter(n=>saved.frame>=n).length;
        result.querySelector('img').src=saved.frame===351?'public/flower-videos/hero-final-frame.png':`public/hero-sequence/frame-${String(saved.frame).padStart(3,'0')}.jpg`;
        result.dataset.savedFrame=String(saved.frame);
        result.querySelector('h3').textContent=names[stage];
        decorateCard(stage);
        result.querySelector('.bloom-result-description').textContent=descriptions[stage];
        experience.hidden=true; result.hidden=false;
      }
    } catch {}
  }
  window.addEventListener('pagehide',()=>{
    if(localPreview)try {
      if(result.hidden)sessionStorage.removeItem('trace-preview-bloom');
      else sessionStorage.setItem('trace-preview-bloom',JSON.stringify({frame:Number(result.dataset.savedFrame)}));
    }catch{}
  });
  const card=result.querySelector('figure'), artwork=result.querySelector('img');
  const copy=result.querySelector('figure + div');
  const scan=document.createElement('i'); scan.className='bloom-holo-scan'; scan.setAttribute('aria-hidden','true'); card.append(scan);
  const rim=document.createElement('i'); rim.className='bloom-holo-rim'; rim.setAttribute('aria-hidden','true'); card.append(rim);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let creating=false, run=0, animations=[];
  function available() {button.disabled=creating || video.hidden || video.readyState<2;}
  function cancelMotion() { run++; animations.forEach(a=>a.cancel()); animations=[]; }
  async function animate(element,frames,options) {
    const animation=element.animate(frames,{fill:'both',...options}); animations.push(animation);
    await animation.finished;
  }
  function finish() {
    result.classList.remove('is-forging'); copy.inert=false;
    result.removeAttribute('aria-busy'); creating=false;
    result.querySelector('h2').focus({preventScroll:true});
    available();
  }
  section.addEventListener('camera-live',available);section.addEventListener('camera-stop',available);
  video.addEventListener('loadeddata',available);video.addEventListener('emptied',available);
  new MutationObserver(available).observe(video,{attributes:true,attributeFilter:['hidden']});
  async function createCard(replay=false) {
    if(creating || (!replay && button.disabled))return;
    cancelMotion(); const token=run; creating=true; available();
    if(!replay) {
    const flower=section.querySelector('.live-flower-stage img');
    const frame=Number(flower.dataset.flowerFrame || 1);
    const stage=[25,60,115,195,300].filter(boundary=>frame>=boundary).length;
    result.dataset.savedFrame=String(frame);
    result.querySelector('img').src=flower.src;
    result.querySelector('h3').textContent=names[stage];
        decorateCard(stage);
    result.querySelector('.bloom-result-description').textContent=descriptions[stage];
    // Keep the result in the same layout slot; never navigate away.
    result.style.minHeight = '';
    }
    result.classList.add('is-forging'); copy.inert=true; result.setAttribute('aria-busy','true');
    experience.hidden=true;
    result.hidden=false;
    section.dispatchEvent(new Event('camera-request-stop'));
    window.ScrollTrigger?.refresh();
    section.scrollIntoView({block:'start',behavior:'instant'});
    result.setAttribute('tabindex','-1'); result.focus({preventScroll:true});
    const bounds=result.getBoundingClientRect(), box=card.getBoundingClientRect();
    const offset=bounds.left+bounds.width/2-(box.left+box.width/2);
    const centered=`translateX(${offset}px)`;
    card.style.transform=centered;
    try {
      await artwork.decode();
      if(token!==run)return;
      if(reduce.matches) {
        await animate(artwork,[{opacity:0},{opacity:1}],{duration:150});
      } else {
        // Opalescent light gathers softly; the card itself stays at its final size.
        await animate(card,[{transform:centered,opacity:0},{transform:centered,opacity:1}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
        await Promise.all([
          animate(scan,[{opacity:0},{opacity:.65,offset:.45},{opacity:0}],{duration:1200,easing:'ease-in-out'}),
          animate(artwork,[{opacity:0},{opacity:1}],{duration:900,delay:180,easing:'cubic-bezier(.23,1,.32,1)'}),
          animate(card.querySelector('figcaption'),[{opacity:0},{opacity:1}],{duration:300,delay:650}),
          animate(card.querySelector('p'),[{opacity:0},{opacity:1}],{duration:250,delay:650}),
          animate(rim,[{opacity:0},{opacity:.55,offset:.5},{opacity:0}],{duration:500,delay:800,easing:'ease-in-out'})
        ]);
        await animate(card,[{transform:centered},{transform:'translateX(0px)'}],{duration:600,easing:'cubic-bezier(.77,0,.175,1)'});
      }
      card.style.transform='';
      await animate(copy,[{opacity:0,transform:reduce.matches?'none':'translateY(10px)'},{opacity:1,transform:'none'}],{duration:250,easing:'cubic-bezier(.23,1,.32,1)'});
    } catch(error) {
      if(token!==run)return;
      // Image or animation failure still yields a usable result.
    }
    if(token===run) { cancelMotion(); card.style.transform=''; finish(); }
  }
  button.addEventListener('click',()=>createCard());
  // Local review link replays an existing card without requesting camera access.
  function previewSavedCard() {
    if(localPreview && location.hash==='#bloom-motion-preview' && result.dataset.savedFrame) {
      createCard(true);
      history.replaceState(null,'','#live-trace');
    }
  }
  window.addEventListener('hashchange',previewSavedCard);

  window.addEventListener('resize',()=>{ if(creating) { cancelMotion(); card.style.transform=''; finish(); } });
  window.addEventListener('pagehide',cancelMotion);
  result.querySelector('button').addEventListener('click',()=>{
    cancelMotion(); creating=false; card.style.transform='';
    result.classList.remove('is-forging'); copy.inert=false;
    result.hidden=true; experience.hidden=false;
    section.dispatchEvent(new Event('camera-request-start'));
    section.querySelector('.live-camera-start').focus({preventScroll:true});
    window.ScrollTrigger?.refresh();
  });
})();
