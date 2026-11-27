(() => {
 const button=document.querySelector('#site-fullscreen');
 if(!button)return;
 const fullscreenElement=()=>document.fullscreenElement || document.webkitFullscreenElement;
 function syncButton(){
  const active=!!fullscreenElement();
  button.hidden=active;
  document.body.classList.toggle('is-document-fullscreen',active);
 }
 syncButton();
 function enterFullscreen(){
  if(fullscreenElement())return;
  rememberAboutPosition();
  try {
   const root=document.documentElement;
   if(!root.requestFullscreen&&!root.webkitRequestFullscreen){showFullscreenHelp();return;}
   // Call synchronously in the click gesture, before camera permission or navigation.
   const request=root.requestFullscreen
    ? root.requestFullscreen({navigationUI:'hide'})
    : root.webkitRequestFullscreen?.();
   Promise.resolve(request).catch(showFullscreenHelp);
  } catch { showFullscreenHelp(); }
 }
 function showFullscreenHelp(error){
  if(error)console.warn('Fullscreen request was not accepted:',error.message);
  button.title='브라우저 전체 화면 단축키 Control + Command + F를 사용해 주세요';
 }
 button.addEventListener('click',enterFullscreen);
 document.addEventListener('click',event=>{
  if(event.target.closest?.('.booth-entry-confirm[data-scroll-target="tablet-photo-booth"]'))enterFullscreen();
 },true);
 // Escape restores the normal page layout without rebuilding the live preview.
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&fullscreenElement()){
   rememberAboutPosition();
   const exit=document.exitFullscreen || document.webkitExitFullscreen;
   if(exit)Promise.resolve(exit.call(document)).catch(()=>{});
  }
 },true);
 let refreshTimer;
 let viewportWidth=innerWidth,viewportHeight=innerHeight;
 let aboutProgress=null;
 const aboutTrigger=()=>window.ScrollTrigger?.getAll().find(trigger=>trigger.trigger?.id==='about');
 function rememberAboutPosition(){
  // Keep the last stable reading position while the fullscreen window resizes.
  if(refreshTimer || innerWidth!==viewportWidth || innerHeight!==viewportHeight)return;
  const trigger=aboutTrigger();
  aboutProgress=trigger && scrollY>=trigger.start && scrollY<=trigger.end
   ? (scrollY-trigger.start)/Math.max(1,trigger.end-trigger.start) : null;
 }
 function refreshLayout(){
  clearTimeout(refreshTimer);
  // Wait until the viewport has settled before measuring pinned sections.
  refreshTimer=setTimeout(()=>requestAnimationFrame(()=>{
   window.ScrollTrigger?.refresh();
   const trigger=aboutTrigger();
   if(aboutProgress!==null && trigger){
    window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*aboutProgress,behavior:'instant'});
   }
   window.ScrollTrigger?.update();
   refreshTimer=0;
   viewportWidth=innerWidth;viewportHeight=innerHeight;
   rememberAboutPosition();
   window.dispatchEvent(new Event('scroll'));
  }),180);
 }
 window.addEventListener('resize',refreshLayout,{passive:true});
 window.addEventListener('scroll',rememberAboutPosition,{passive:true});
 requestAnimationFrame(rememberAboutPosition);
 window.visualViewport?.addEventListener('resize',refreshLayout,{passive:true});
 function onFullscreenChange(){
  syncButton();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   window.dispatchEvent(new Event('resize'));
   refreshLayout();
  }));
  button.title='전체 화면으로 보기';
 }
 document.addEventListener('fullscreenchange',onFullscreenChange);
 document.addEventListener('webkitfullscreenchange',onFullscreenChange);
})();
