(() => {
  const showLandmarks = false; // 개발용 점 표시만 끄려면 false.
  (window.tracePreviewRoots?.() || document.querySelectorAll('.live-trace')).forEach(section => {
  const video = section.querySelector('.live-camera-video');
  const status = section.querySelector('.live-face-status');
  const expression = new TraceExpression.Tracker();
  function renderExpression(result) {
    section.expressionChange = result;
    section.dispatchEvent(new CustomEvent('expression-change', { detail: result }));
  }
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = !showLandmarks;
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
  video.parentElement.append(canvas);
  const ctx = canvas.getContext('2d');
  let worker = null, callback = null, busy = false, ready = false, session = 0;
  let startupTimeout = null;
  let lastTime = -1, lastSent = -Infinity, points = [];
  let stable = false, candidate = false, candidateSince = 0;
  let pausedAt = null, pausedDuration = 0, resumedAt = -Infinity;

  function syncVisibility() {
    const now = performance.now();
    const hidden = document.hidden || section.dataset?.previewVisible === 'false';
    if (hidden && pausedAt === null) pausedAt = now;
    else if (!hidden && pausedAt !== null) {
      // Navigation pauses inference, not the person's neutral baseline. Keep
      // the same active tracking clock when the shared preview enters the booth.
      pausedDuration += now - pausedAt;
      pausedAt = null;
      resumedAt = now;
      lastTime = -1; lastSent = -Infinity;
    }
  }

  function draw() {
    // Hidden debug landmarks need neither layout reads nor a full-size canvas
    // allocation on every inference result (especially costly in fullscreen).
    if (!showLandmarks) return;
    const rect = video.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!video.videoWidth || !video.videoHeight) return;
    // object-fit: cover + 기본 중앙 정렬과 같은 배율/오프셋.
    const scale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
    const offsetX = (rect.width - video.videoWidth * scale) / 2;
    const offsetY = (rect.height - video.videoHeight * scale) / 2;
    ctx.fillStyle = 'rgba(213, 204, 226, .8)';
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x * video.videoWidth * scale + offsetX, point.y * video.videoHeight * scale + offsetY, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function updatePresence(found, now) {
    if (found !== candidate) { candidate = found; candidateSince = now; }
    if (candidate !== stable && now - candidateSince >= (candidate ? 180 : 400)) stable = candidate;
    const result = expression.update(points, video.videoHeight / video.videoWidth, now, stable);
    // Keep the existing short presence debounce, without collecting missing samples.
    if (found || !stable) status.textContent = (section.id === 'live-trace' || section.id === 'shared-live-preview')
      ? result.status === 'CALIBRATING...' ? 'CAMERA LIVE' : result.status.replace(/^●\s*/, '')
      : result.status;
    renderExpression(result);
  }
  function schedule() {
    callback = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
  }
  async function tick(now) {
    callback = null;
    if (!worker) return;
    schedule();
    syncVisibility();
    if (!ready || busy || pausedAt !== null || video.readyState < 2 || video.currentTime === lastTime || now - lastSent < 50) return;
    busy = true;
    lastSent = now; lastTime = video.currentTime;
    const token = session, owner = worker;
    try {
      const width = Math.min(640, video.videoWidth);
      const bitmap = await createImageBitmap(video, { resizeWidth: width, resizeHeight: Math.round(width * video.videoHeight / video.videoWidth) });
      if (token !== session) { bitmap.close(); return; }
      owner.postMessage({ type: 'frame', bitmap, timestamp: now }, [bitmap]);
    } catch (error) {
      if (token === session) fail(error.message);
    }
  }
  function stop() {
    session++;
    clearTimeout(startupTimeout); startupTimeout = null;
    if (callback !== null) {
      if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(callback);
      else cancelAnimationFrame(callback);
    }
    callback = null;
    if (worker) worker.terminate();
    worker = null; ready = false; busy = false; points = [];
    section.faceLandmarks = null;
    expression.reset();
    renderExpression(expression.result('CAMERA OFF'));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  function fail(message) {
    stop();
    status.textContent = 'FACE TRACKING UNAVAILABLE';
    console.error('Face tracking:', message);
  }
  function start() {
    stop();
    stable = candidate = false; candidateSince = performance.now();
    lastTime = -1; lastSent = -Infinity;
    pausedAt = null; pausedDuration = 0; resumedAt = -Infinity;
    syncVisibility();
    status.textContent = 'LOADING FACE TRACKER...';
    try {
      const owner = worker = new Worker('face-worker.js');
      owner.onmessage = ({ data }) => {
        if (worker !== owner) return;
        if (data.type === 'ready') {
          clearTimeout(startupTimeout); startupTimeout = null;
          ready = true;
          status.textContent = 'SEARCHING FOR FACE...';
        }
        else if (data.type === 'error') fail(data.message);
        else if (data.type === 'result') {
          busy = false;
          syncVisibility();
          if (pausedAt !== null || data.timestamp < resumedAt) return;
          points = data.points;
          // 다음 단계용 normalized x/y/z. 현재 세션 메모리에만 유지합니다.
          section.faceLandmarks = { timestamp: data.timestamp, points };
          section.dispatchEvent(new CustomEvent('face-landmarks', { detail: section.faceLandmarks }));
          updatePresence(points.length > 0, data.timestamp - pausedDuration);
          draw();
        }
      };
      owner.onerror = event => { if (worker === owner) fail(event.message); };
      startupTimeout = setTimeout(() => {
        if (worker === owner && !ready) fail('Face tracker did not finish loading.');
      }, 20000);
      owner.postMessage({ type: 'init' });
      schedule();
    } catch (error) {
      fail(error.message);
    }
  }
  section.addEventListener('camera-live', start);
  section.addEventListener('camera-stop', stop);
  section.addEventListener('preview-visibility', syncVisibility);
  document.addEventListener('visibilitychange', syncVisibility);
  window.addEventListener('pagehide', stop);
  const resize = new ResizeObserver(draw);
  resize.observe(video.parentElement);
  const removal = new MutationObserver(() => {
    if (!section.isConnected || !section.contains(video)) {
      stop(); resize.disconnect(); removal.disconnect();
      section.removeEventListener('camera-live', start);
      section.removeEventListener('camera-stop', stop);
      section.removeEventListener('preview-visibility', syncVisibility);
      document.removeEventListener('visibilitychange', syncVisibility);
      window.removeEventListener('pagehide', stop);
    }
  });
  removal.observe(document.body, { childList: true, subtree: true });
  });
})();
