(() => {
 const button=document.querySelector('#site-fullscreen');
 button.addEventListener('click',async()=>{
  try {
   if(document.fullscreenElement)await document.exitFullscreen();
   else await document.documentElement.requestFullscreen();
  } catch { button.title='브라우저 전체 화면 단축키 Control + Command + F를 사용해 주세요'; }
 });
 let refreshTimer;
 function refreshLayout(){
  clearTimeout(refreshTimer);
  // Wait until the viewport has settled before measuring pinned sections.
  refreshTimer=setTimeout(()=>requestAnimationFrame(()=>{
   window.ScrollTrigger?.refresh();
   window.ScrollTrigger?.update();
   window.dispatchEvent(new Event('scroll'));
  }),180);
 }
 window.addEventListener('resize',refreshLayout,{passive:true});
 window.visualViewport?.addEventListener('resize',refreshLayout,{passive:true});
 document.addEventListener('fullscreenchange',()=>{
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   window.dispatchEvent(new Event('resize'));
   refreshLayout();
  }));
  const label=document.fullscreenElement?'전체 화면 종료':'전체 화면으로 보기';
  button.setAttribute('aria-label',label);button.title=label;
 });
})();
