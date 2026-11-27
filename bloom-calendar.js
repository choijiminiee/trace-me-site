(() => {
 const section=document.querySelector('#bloom-calendar');
 if(!section)return;
 const grid=section.querySelector('.bloom-calendar-grid');
 const wrap=document.createElement('div');wrap.className='calendar-hit-area';grid.replaceWith(wrap);wrap.append(grid);
 grid.remove();
 const monthArt=section.querySelector('.bloom-calendar-month');
 let month=11;
 const monthControl=document.createElement('div');monthControl.className='calendar-month-control';
 monthControl.innerHTML='<button type="button" class="calendar-month-picker" aria-expanded="false" aria-controls="calendar-month-panel"><span>2026년 11월</span><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button><div id="calendar-month-panel" class="calendar-month-panel" hidden><p>2026 <span>MONTHS</span></p><div class="calendar-month-options" role="group" aria-label="2026년 월 선택"></div><small class="month-panel-legend">● 사진 기록이 있는 달</small></div>';
 monthArt.replaceWith(monthControl);
 const clickHint=document.createElement('p');
 clickHint.className='calendar-click-hint';
 clickHint.textContent='캘린더 안의 꽃을 클릭해 기록된 사진을 확인해 보세요';
 monthControl.append(clickHint);
 const monthPicker=monthControl.querySelector('button'),monthPanel=monthControl.querySelector('.calendar-month-panel'),monthOptions=monthControl.querySelector('.calendar-month-options');
 function closeMonths(restore=false){monthPanel.hidden=true;monthPicker.setAttribute('aria-expanded','false');if(restore)monthPicker.focus({preventScroll:true});}
 for(let m=1;m<=12;m++){
  const button=document.createElement('button');button.type='button';button.textContent=`${m}월`;button.dataset.month=m;button.dataset.recorded=String(m!==12);button.setAttribute('aria-pressed',String(m===month));
  button.addEventListener('click',()=>{month=m;monthPicker.querySelector('span').textContent=`2026년 ${m}월`;monthOptions.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.month)===m)));renderCalendar();closeMonths(true);});monthOptions.append(button);
 }
 monthPicker.addEventListener('click',()=>{const open=monthPanel.hidden;monthPanel.hidden=!open;monthPicker.setAttribute('aria-expanded',String(open));if(open)monthOptions.querySelector('[aria-pressed="true"]').focus({preventScroll:true});});
 document.addEventListener('pointerdown',event=>{if(!monthControl.contains(event.target))closeMonths();});
 monthControl.addEventListener('focusout',event=>{if(!monthControl.contains(event.relatedTarget))closeMonths();});
 monthControl.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMonths(true);return;}
  const buttons=[...monthOptions.children],index=buttons.indexOf(document.activeElement);
  const moves={ArrowRight:1,ArrowLeft:-1,ArrowDown:4,ArrowUp:-4};
  if(index>=0&&event.key in moves){event.preventDefault();buttons[(index+moves[event.key]+12)%12].focus();}
 });
 const autumnAlbums=[[0,1,2],[3],[4,5],[6,7],[8],[],[9],[10,11],[12],[13,14,15],[16],[17],[],[18,19],[20],[21],[22,23],[24,25,26],[27],[],[28],[29],[],[],[],[],[],[],[],[]];
 const autumnPhoto=i=>({src:`public/bloom-calendar/individual/autumn-${i}.png`,alt:['은행나무 아래 코트 셀카','단풍 공원','밤 라테','니트 차림의 카페','낙엽 속 강아지','강아지와 가을 산책','친구들과 가을 거리','군고구마','서점에서','비 내리는 창','집에서 독서','따뜻한 수프','가을 코디 거울 셀카','가을 산','친구들과 전골','목도리 셀카','가을 감','은행나무길','비 오는 거리','젖은 낙엽','책과 조명','집에서 휴식','강가의 갈대','차와 일기','시장 산책','밤 페이스트리','가을 피크닉','해질녘 산책','늦가을 나뭇가지','창가에서 쉬는 오후'][i]});
 const dialog=document.createElement('dialog');dialog.className='calendar-memory';dialog.setAttribute('aria-label','Daily moments');
 dialog.innerHTML='<button class="memory-close" aria-label="Close">×</button><p class="memory-date"></p><div class="memory-carousel"></div><div class="memory-controls"><button data-prev aria-label="Previous photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><span role="status"></span><button data-next aria-label="Next photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div><button class="memory-add">ADD PHOTO</button><input type="file" accept="image/png,image/jpeg,image/webp" hidden>';
 document.body.append(dialog);
 const photoLibrary={
  "a0": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_47-1.png",
    "alt": "카페 앞의 순간"
  },
  "a1": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_40-2.png",
    "alt": "해안 산책"
  },
  "a2": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_55-5.png",
    "alt": "친구들과 식사"
  },
  "a3": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_45-6.png",
    "alt": "점심 식사"
  },
  "a4": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_59-8.png",
    "alt": "강아지와 노을"
  },
  "a5": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_48-2.png",
    "alt": "친구들과 피크닉"
  },
  "a6": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_46-7.png",
    "alt": "함께 나눈 음식"
  },
  "a7": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_41-3.png",
    "alt": "나무 사이 산책길"
  },
  "a8": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_53-4.png",
    "alt": "바다를 바라보는 여행"
  },
  "a9": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_49-9.png",
    "alt": "여행지 시장"
  },
  "a10": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_49-3.png",
    "alt": "강아지와 산책"
  },
  "a11": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_42-4.png",
    "alt": "비 내린 밤거리"
  },
  "a12": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_48-8.png",
    "alt": "카페의 디저트"
  },
  "a13": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_01-9.png",
    "alt": "친구들과 호수 여행"
  },
  "a14": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_39-1.png",
    "alt": "강 너머 도시"
  },
  "a15": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_56-6.png",
    "alt": "함께한 저녁"
  },
  "a16": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_44-5.png",
    "alt": "산과 호수"
  },
  "a17": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_56_57-7.png",
    "alt": "시장에서의 여행"
  },
  "a18": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_50-10.png",
    "alt": "저녁 식사"
  },
  "a19": {
    "src": "public/무제 폴더/ChatGPT 이미지 2026년 10월 10일 오후 09_57_02-10.png",
    "alt": "친구들과 밤거리"
  },
  "selfie": {
    "src": "public/bloom-calendar/selfie.png",
    "alt": "스트라이프 티셔츠를 입고 강변에서 찍은 셀카"
  },
  "mirror": {
    "src": "public/bloom-calendar/mirror.png",
    "alt": "검정 카디건과 데님 코디의 거울 셀카"
  },
  "dog": {
    "src": "public/bloom-calendar/dog.png",
    "alt": "올리브 재킷을 입고 강아지와 산책"
  },
  "friends": {
    "src": "public/bloom-calendar/friends.png",
    "alt": "파란 셔츠를 입고 친구들과 저녁 식사"
  },
  "gallery": {
    "src": "public/bloom-calendar/gallery.png",
    "alt": "분홍 셔츠와 아이보리 팬츠로 전시 관람"
  },
  "reading": {
    "src": "public/bloom-calendar/reading.png",
    "alt": "집에서 책을 읽는 오후"
  },
  "tea": {
    "src": "public/bloom-calendar/tea.png",
    "alt": "Overhead close photo of chamomile tea and open journal at quiet wooden desk, morning solitude"
  },
  "rain": {
    "src": "public/bloom-calendar/rain.png",
    "alt": "Rain droplets on apartment window, soft gray city out of focus, quiet reflective afternoon"
  },
  "bed": {
    "src": "public/bloom-calendar/bed.png",
    "alt": "Unmade linen bed and paperback book, muted blue morning light, peaceful restful day"
  },
  "soup": {
    "src": "public/bloom-calendar/soup.png",
    "alt": "Single bowl of homemade vegetable soup on small kitchen table, gentle low evening light"
  },
  "sea": {
    "src": "public/bloom-calendar/sea.png",
    "alt": "Empty blue gray coast at dusk, distant horizon and ripples, contemplative atmosphere"
  },
  "lamp": {
    "src": "public/bloom-calendar/lamp.png",
    "alt": "Warm bedside lamp and book in otherwise dark bedroom, quiet nighttime rest"
  },
  "shoes": {
    "src": "public/bloom-calendar/shoes.png",
    "alt": "Top-down personal snapshot of white sneakers and fallen leaves after solitary walk"
  },
  "breakfast": {
    "src": "public/bloom-calendar/breakfast.png",
    "alt": "Top-down sunny breakfast toast strawberries and latte on small round table, joyful morning"
  },
  "flowers": {
    "src": "public/bloom-calendar/flowers.png",
    "alt": "Fresh yellow daisies in neighborhood flower shop, spontaneous bright street snapshot"
  },
  "picnic": {
    "src": "public/bloom-calendar/picnic.png",
    "alt": "Top-down picnic blanket with sandwiches fruit sparkling drinks and friends hands, happy afternoon"
  },
  "dogdetail": {
    "src": "public/bloom-calendar/dogdetail.png",
    "alt": "Small curly beige dog sniffing grass, low ground-level candid park photograph"
  },
  "bakery": {
    "src": "public/bloom-calendar/bakery.png",
    "alt": "Close handheld photograph of fresh croissant in paper bag near bakery window, cheerful morning"
  },
  "sunset": {
    "src": "public/bloom-calendar/sunset.png",
    "alt": "Peach pink sunset above river, unposed travel smartphone landscape"
  },
  "plants": {
    "src": "public/bloom-calendar/plants.png",
    "alt": "Window herbs and a half full glass of water, pale early daylight, tranquil home detail"
  },
  "rest": {
    "src": "public/bloom-calendar/rest.png",
    "alt": "Same woman identity reference, oversized gray sweatshirt and comfortable pants sitting sideways on sofa looking outside, relaxed unsmiling restful expression, wide candid photograph"
  },
  "balcony": {
    "src": "public/bloom-calendar/balcony.png",
    "alt": "Same woman identity reference, sage linen shirt and beige trousers watering balcony plants, profile side view, quiet morning"
  },
  "home": {
    "src": "public/bloom-calendar/home.png",
    "alt": "Same woman identity reference, soft navy pajamas reading in bed, nighttime warm bedside light, distant candid photograph, restful neutral expression"
  },
  "rainwalk": {
    "src": "public/bloom-calendar/rainwalk.png",
    "alt": "Same woman identity reference, tan trench coat and black trousers under clear umbrella, rear view crossing quiet rainy street, subdued atmosphere"
  },
  "walk": {
    "src": "public/bloom-calendar/walk.png",
    "alt": "강아지와 조용한 산책"
  }
};
 const dailyAlbums=[["a0", "bakery"], ["gallery"], ["friends", "a6", "a18", "picnic", "a14"], ["a5", "a13", "a16", "flowers"], ["dog", "dogdetail"], ["a2", "a3"], ["mirror"], ["a19"], ["reading", "tea"], ["home", "lamp"], ["rainwalk", "rain"], ["selfie"], ["balcony", "plants"], ["bed"], ["a17", "a9", "sunset"], ["a7"], ["a15"], ["a10"], ["a12"], [], ["a4"], ["a1"], ["a11"], ["shoes"], ["breakfast"], ["soup"], ["sea"], ["rest"], [], ["a8"], ["walk"]];
 const flowerStages=["SPROUT", "BLOOM", "FULL BLOOM", "FULL BLOOM", "BLOOM", "FULL BLOOM", "SPROUT", "FULL BLOOM", "BUD", "FADE", "FALL", "FULL BLOOM", "BUD", "FADE", "SPROUT", "BUD", "BLOOM", "SPROUT", "FULL BLOOM", null, "FULL BLOOM", "BUD", "FALL", "SPROUT", "SPROUT", "BUD", "FALL", "FADE", null, "FALL", "BUD"];
 const days=new Map();let day=1,active=0,items=[],opener,oldOverflow='';
 const carousel=dialog.querySelector('.memory-carousel'),controls=dialog.querySelector('.memory-controls'),add=dialog.querySelector('.memory-add');
 function paint(){
  if(carousel.children.length!==items.length)carousel.replaceChildren();
  items.forEach((item,i)=>{const button=carousel.children[i]||document.createElement('button');let img=button.querySelector('img');if(!img){img=new Image();button.append(img);}img.src=item.src;img.alt=item.alt;img.decoding='async';img.draggable=false;let d=(i-active+items.length)%items.length;if(d>items.length/2)d-=items.length;button.style.setProperty('--offset',d);button.classList.toggle('is-current',d===0);button.setAttribute('aria-label',d===0?(items.length>1?item.alt+' — 다음 사진 보기':item.alt):item.alt);button.tabIndex=d===0?0:-1;button.onclick=()=>{active=(active+(d<0?-1:1)+items.length)%items.length;paint();};if(!button.parentElement)carousel.append(button);});
  controls.querySelectorAll('button').forEach(button=>button.hidden=items.length<2);
  controls.querySelector('span').textContent=`${active+1} / ${items.length}`;
  carousel.hidden=controls.hidden=!items.length;add.hidden=!!items.length;
 }
 const key=()=>`2026-${month}-${day}`;
 // Stable sample records: distinct gaps per month, no repeated photos within a month.
 const emptyDates={1:[4,13,25],2:[2,9,18,26],3:[5,11,17,23,30],4:[3,8,14,19,24,28],5:[7,20,29],6:[1,10,21,27],7:[6,12,18,25,31],8:[2,7,13,19,24,30],9:[4,16,28],10:[3,11,22,29],11:[6,13,20,26,29]};
 const monthRecords=new Map();
 for(let m=1;m<=11;m++){
  const total=new Date(2026,m,0).getDate();
  const occupied=Array.from({length:total},(_,i)=>i+1).filter(n=>!emptyDates[m].includes(n));
  const pool=m===11?Array.from({length:30},(_,i)=>autumnPhoto(i)):Object.values(photoLibrary);
  // Rotate each month's starting photo so its sequence stays consistent on revisits.
  const shift=m===11?0:(m*7)%pool.length;
  const ordered=pool.map((_,i)=>pool[(i+shift)%pool.length]);
  let cursor=0;
  occupied.forEach((n,i)=>{
   const remaining=occupied.length-i-1;
   const count=Math.min(1+(n+m)%3,ordered.length-cursor-remaining);
   monthRecords.set(`2026-${m}-${n}`,ordered.slice(cursor,cursor+count));cursor+=count;
  });
 }
 // Curated November diaries: a coherent outing per album, quiet days remain brief.
 const diaryScenes=['은행나무길 산책','카페와 베이킹','강아지와 가을 외출','친구들과의 만남','전시를 본 하루','집에서 보내는 휴일'];
 const diaryPhoto=i=>({src:`public/bloom-calendar/individual/diary-${i}.png`,alt:`${diaryScenes[Math.floor(i/6)]} — 일상 사진 ${i%6+1}`});
 const outing=(row)=>Array.from({length:6},(_,i)=>diaryPhoto(row*6+i));
 const autumn=(...indices)=>indices.map(autumnPhoto);
 const novemberDiaries={
  1:outing(0),2:autumn(3,2),3:outing(1),4:autumn(6,14,26),5:outing(2),
  7:autumn(18,19),8:outing(3),9:autumn(8,20),10:autumn(12,25),11:autumn(0,1,17),12:autumn(10,11),
  14:autumn(21),15:outing(4),16:autumn(29,23),17:autumn(24,7,16),18:outing(5),19:autumn(5,4),
  21:autumn(27,13),22:[photoLibrary.rainwalk,...autumn(9)],23:autumn(15,28),24:[photoLibrary.mirror],
  25:[photoLibrary.friends],27:[photoLibrary.home],28:[photoLibrary.rest],30:[photoLibrary.reading,...autumn(22)]
 };
 Object.entries(novemberDiaries).forEach(([date,photos])=>monthRecords.set(`2026-11-${date}`,photos));
 // Exhibition records end on November 15; later dates start empty.
 for(let date=16;date<=30;date++)monthRecords.delete(`2026-11-${date}`);
 // Put shared moments first in October, without repeating a photo within the month.
 const candidMoment=(name,alt)=>({src:`public/candid-moments/${name}.jpg`,alt});
 const octoberSocial={
  2:[photoLibrary.a2,photoLibrary.a3],
  4:[candidMoment('friends-picnic','친구들과 피크닉 셀카'),photoLibrary.a5],
  9:[photoLibrary.a13,photoLibrary.a16],
  10:[candidMoment('friends-dinner','친구들과 저녁 식사'),candidMoment('friends-four-cut','친구들과 인생네컷')],
  16:[diaryPhoto(18),diaryPhoto(19)],
  17:[diaryPhoto(20),diaryPhoto(21)],
  18:[diaryPhoto(22),diaryPhoto(23)],
  23:[candidMoment('friends-seaside','친구들과 바닷가 여행'),photoLibrary.a18],
  24:[photoLibrary.a19,photoLibrary.a11]
 };
 const socialSources=new Set(Object.values(octoberSocial).flat().map(photo=>photo.src));
 let octoberExtra=0;
 for(let date=1;date<=31;date++){
  const recordKey=`2026-10-${date}`;
  if(!monthRecords.has(recordKey))continue;
  const remaining=monthRecords.get(recordKey).filter(photo=>!socialSources.has(photo.src));
  const social=octoberSocial[date]||[];
  const photos=[...social,...remaining];
  if(!photos.length)photos.push(autumnPhoto(octoberExtra++));
  monthRecords.set(recordKey,photos);
 }
 const novemberStages={1:3,2:1,3:3,4:3,5:2,7:4,8:3,9:0,10:1,11:3,12:0,14:5,15:2,16:0,17:2,18:1,19:2,21:1,22:4,23:1,24:1,25:3,27:5,28:5,30:0};
 const album=n=>days.get(`2026-${month}-${n}`)||monthRecords.get(`2026-${month}-${n}`)||[];
 const stage=n=>{
  if(month===11)return novemberStages[n]??0;
  if(month===10 && octoberSocial[n])return n%2 ? 2 : 3;
  return (n*7+month*3+Math.floor(n/4))%6;
 };
 const calendarReduce=matchMedia('(prefers-reduced-motion: reduce)');
 const calendarArt=section.querySelector('.bloom-calendar-art');
 let calendarEntrance;
 if(!calendarReduce.matches)calendarArt.classList.add('calendar-awaiting-scroll');
 const calendarReveal=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  calendarReveal.disconnect();
  calendarArt.classList.remove('calendar-awaiting-scroll');
  if(calendarReduce.matches)return;
  calendarEntrance=calendarArt.animate([
   {opacity:0,transform:'translateY(44px)'},
   {opacity:1,transform:'translateY(0)'}
  ],{duration:1100,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
 },{threshold:.12});
 calendarReveal.observe(calendarArt);
 const showCalendar=()=>{calendarArt.classList.remove('calendar-awaiting-scroll');calendarEntrance?.cancel();calendarReveal.disconnect();};
 calendarReduce.addEventListener('change',()=>{if(calendarReduce.matches)showCalendar();});
 calendarArt.addEventListener('focusin',showCalendar);
 function renderCalendar(){

  wrap.replaceChildren();
  section.querySelector('.bloom-calendar-art').setAttribute('aria-label',`2026년 ${month}월 꽃 기록 캘린더`);
  const weekdays=document.createElement('div');weekdays.className='calendar-weekdays';
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach(name=>{const label=document.createElement('span');label.textContent=name;weekdays.append(label);});wrap.append(weekdays);
  const dates=document.createElement('div');dates.className='calendar-dates';wrap.append(dates);
  const offset=new Date(2026,month-1,1).getDay(),total=new Date(2026,month,0).getDate();
  for(let i=0;i<offset;i++)dates.append(document.createElement('span'));
  for(let n=1;n<=total;n++){
   const button=document.createElement('button');button.className='calendar-date';
   const number=document.createElement('span');number.textContent=n;button.append(number);
   const hasPhotos=album(n).length>0;
   if(hasPhotos){const flower=new Image();flower.src=`public/emotion-flowers/Frame ${stage(n)+1}.png`;flower.alt=['봉오리','발아','개화','만개','낙화','시듦'][stage(n)];button.append(flower);}
   else{const plus=document.createElement('i');plus.setAttribute('aria-hidden','true');button.append(plus);}
   button.setAttribute('aria-label',`2026년 ${month}월 ${n}일 ${hasPhotos?'일상 사진 보기':'사진 추가'}`);
   button.onclick=()=>{day=n;opener=button;active=0;items=album(n);dialog.querySelector('.memory-date').textContent=`2026. ${String(month).padStart(2,'0')}. ${String(n).padStart(2,'0')} / ${items.length?'DAILY MOMENTS':'YOUR NEXT MOMENT'}`;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';paint();dialog.showModal();};dates.append(button);
  }
 }
 renderCalendar();
 dialog.querySelector('[data-prev]').onclick=()=>{active=(active-1+items.length)%items.length;paint();};
 dialog.querySelector('[data-next]').onclick=()=>{active=(active+1)%items.length;paint();};
 dialog.querySelector('.memory-close').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',e=>{if(!items.length)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();active=(active+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;paint();}});
 const input=dialog.querySelector('input');add.onclick=()=>input.click();
 input.onchange=()=>{const file=input.files[0];if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type))return;const reader=new FileReader();reader.onload=()=>{items=[{src:reader.result,alt:'추가한 일상 사진'}];days.set(key(),items);renderCalendar();opener=wrap.querySelectorAll(".calendar-date")[day-1];dialog.querySelector('.memory-date').textContent=`2026. ${month}. ${day} / YOUR MOMENT`;active=0;paint();};reader.readAsDataURL(file);input.value='';};
})();
