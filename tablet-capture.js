/* Snapshot only: the live camera, analysis and flower continue uninterrupted. */
(() => {
  const section = document.querySelector('#shared-live-preview') || document.querySelector('#photo-booth');
  if (!section) return;
  const video = section.querySelector('.live-camera-video');
  const capture = section.querySelector('.portrait-capture');
  const liveTrace = section.querySelector('.live-flower-area');
  const canvas = document.createElement('canvas'); // Offscreen; never covers the live video.
  let feedbackTimer = null, flashTimer = null, navigationTimer = null;
  const timers = [...section.querySelectorAll('[data-capture-delay]')];
  const countdown = section.querySelector('.portrait-countdown');
  let delay = 0, counting = false, countdownTimer = null;
  function cancelCountdown() {
    clearTimeout(countdownTimer); counting = false; countdown.hidden = true;
    timers.forEach(button => button.disabled = false);
  }
  timers.forEach(button => button.addEventListener('click', () => {
    if (counting) return;
    const value = Number(button.dataset.captureDelay);
    delay = delay === value ? 0 : value;
    timers.forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.captureDelay) === delay)));
  }));
  function beginCapture() {
    availability();
    if (capture.disabled) return;
    if (!delay) { shoot(); return; }
    counting = true; availability();
    timers.forEach(button => button.disabled = true);
    const end = performance.now() + delay * 1000;
    function updateCountdown() {
      if (video.hidden || video.readyState < 2 || document.hidden) { cancelCountdown(); availability(); return; }
      const remaining = Math.ceil((end-performance.now())/1000);
      if (remaining <= 0) { cancelCountdown(); shoot(); return; }
      countdown.hidden = false; countdown.textContent = String(remaining);
      countdownTimer = setTimeout(updateCountdown,100);
    }
    updateCountdown();
  }
  function cameraStopped() { cancelCountdown(); availability(); }
  window.currentTraceMoment = null;

  function availability() {
    capture.disabled = (section.dataset.mode && section.dataset.mode !== 'booth') || counting || video.hidden || video.readyState < 2 || !video.videoWidth;
  }
  function shoot() {
    availability();
    if (capture.disabled) return;
    const rect = video.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Read the displayed state in the same synchronous task as the video snapshot.
    const flowerImage = liveTrace.querySelector('.live-flower-stage img');
    const flowerCanvas = liveTrace.querySelector('.tablet-flower-canvas:not([hidden])');
    const flowerSrc = flowerCanvas?.dataset.flowerSrc || flowerImage.getAttribute('src');
    const flowerFrame = Number(flowerCanvas?.dataset.flowerFrame || flowerSrc?.match(/frame-(\d+)\./)?.[1] || (flowerSrc?.includes('hero-final-frame') ? 351 : 1));
    const flowerSnapshot = flowerCanvas ? flowerCanvas.toDataURL('image/png') : null;
    const flowerProgress = (flowerFrame - 1) / 350;
    const expressionChange = Math.round(section.expressionChange?.rawExpressionChange ?? (flowerProgress * 100));
    const timestamp = Date.now();
    // Centered object-fit: cover, at source resolution, with the preview's horizontal mirror.
    const scale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
    const sw = rect.width / scale, sh = rect.height / scale;
    canvas.width = Math.round(sw); canvas.height = Math.round(sh);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
    ctx.drawImage(video, (video.videoWidth-sw)/2, (video.videoHeight-sh)/2, sw, sh, 0, 0, canvas.width, canvas.height);
    // Keep the raw portrait for the gallery's reversible flower card.
    const portrait = document.createElement('canvas');
    portrait.width = canvas.width; portrait.height = canvas.height;
    portrait.getContext('2d').drawImage(canvas, 0, 0);
    // Instant-film print: an uninterrupted photo with a quiet paper border.
    // The wider lower margin stays blank; flower data belongs to the reverse.
    canvas.width = 1200; canvas.height = 1440;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#f3f2ee';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    const photoSize = 1040;
    const cropSize = Math.min(portrait.width,portrait.height);
    ctx.drawImage(portrait,
      (portrait.width-cropSize)/2,(portrait.height-cropSize)/2,cropSize,cropSize,
      80,80,photoSize,photoSize);
    counting = false; availability();
    const traceMoment = Object.freeze({
      image: canvas.toDataURL('image/png'), portraitImage: portrait.toDataURL('image/jpeg',.92), expressionChange, flowerProgress, flowerFrame, flowerSrc, flowerSnapshot,
      dailyCardIndex: [25, 60, 115, 195, 300].filter(boundary => flowerFrame >= boundary).length, timestamp
    });
    window.currentTraceMoment = traceMoment;
    document.dispatchEvent(new CustomEvent('visitor-trace-capture', {detail:traceMoment}));
    // Stay at the booth and show the finished photo card.
    document.dispatchEvent(new CustomEvent('photo-booth-captured', {detail:traceMoment}));

    clearTimeout(flashTimer);
    video.parentElement.classList.add('moment-flash');
    flashTimer = setTimeout(() => video.parentElement.classList.remove('moment-flash'), 100);
    clearTimeout(feedbackTimer);
    capture.classList.add('is-captured');
    capture.textContent = 'MOMENT CAPTURED';
    capture.setAttribute('aria-label', 'MOMENT CAPTURED');
    feedbackTimer = setTimeout(() => {
      capture.classList.remove('is-captured');
      capture.textContent = 'CAPTURE MOMENT';
      capture.setAttribute('aria-label', 'CAPTURE MOMENT');
    }, 1000);
  }
  capture.addEventListener('click', beginCapture);
  section.addEventListener('preview-mounted', cameraStopped);
  section.addEventListener('camera-live', availability);
  section.addEventListener('camera-stop', cameraStopped);
  video.addEventListener('loadeddata', availability);
  video.addEventListener('emptied', availability);
  const stateObserver = new MutationObserver(availability);
  stateObserver.observe(video, { attributes: true, attributeFilter: ['hidden'] });
  function dispose() {
    cancelCountdown();
    clearTimeout(navigationTimer);
    clearTimeout(feedbackTimer);
    clearTimeout(flashTimer);
    video.parentElement.classList.remove('moment-flash');
    stateObserver.disconnect(); removal.disconnect();
    capture.removeEventListener('click', beginCapture);
    section.removeEventListener('camera-live', availability);
    section.removeEventListener('camera-stop', cameraStopped);
    video.removeEventListener('loadeddata', availability);
    video.removeEventListener('emptied', availability);
    window.removeEventListener('pagehide', dispose);
    canvas.width = canvas.height = 0;
    window.currentTraceMoment = null;
  }
  const removal = new MutationObserver(() => { if (!section.isConnected) dispose(); });
  removal.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', dispose);
  availability();
})();
