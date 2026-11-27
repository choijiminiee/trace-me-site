(() => {
  const showLandmarks = false; // 개발용 점 표시만 끄려면 false.
  document.querySelectorAll('.live-trace').forEach(section => {
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
  let lastTime = -1, lastSent = -Infinity, points = [];
  let stable = false, candidate = false, candidateSince = 0;

  function draw() {
    const rect = video.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!showLandmarks || !video.videoWidth || !video.videoHeight) return;
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
    if (found || !stable) status.textContent = result.status;
    renderExpression(result);
  }
  function schedule() {
    callback = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
  }
  async function tick(now) {
    callback = null;
    if (!worker) return;
    schedule();
    if (!ready || busy || document.hidden || video.readyState < 2 || video.currentTime === lastTime || now - lastSent < 50) return;
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
    if (callback !== null) {
      if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(callback);
      else cancelAnimationFrame(callback);
    }
    callback = null;
    if (worker) { worker.postMessage({ type: 'close' }); worker.terminate(); }
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
    status.textContent = 'SEARCHING FOR FACE...';
    const owner = worker = new Worker('face-worker.js');
    owner.onmessage = ({ data }) => {
      if (worker !== owner) return;
      if (data.type === 'ready') ready = true;
      else if (data.type === 'error') fail(data.message);
      else if (data.type === 'result') {
        busy = false;
        points = data.points;
        // 다음 단계용 normalized x/y/z. 현재 세션 메모리에만 유지합니다.
        section.faceLandmarks = { timestamp: data.timestamp, points };
        section.dispatchEvent(new CustomEvent('face-landmarks', { detail: section.faceLandmarks }));
        updatePresence(points.length > 0, data.timestamp);
        draw();
      }
    };
    owner.onerror = event => { if (worker === owner) fail(event.message); };
    owner.postMessage({ type: 'init' });
    schedule();
  }
  section.addEventListener('camera-live', start);
  section.addEventListener('camera-stop', stop);
  window.addEventListener('pagehide', stop);
  const resize = new ResizeObserver(draw);
  resize.observe(video.parentElement);
  const removal = new MutationObserver(() => {
    if (!section.isConnected || !section.contains(video)) {
      stop(); resize.disconnect(); removal.disconnect();
      section.removeEventListener('camera-live', start);
      section.removeEventListener('camera-stop', stop);
      window.removeEventListener('pagehide', stop);
    }
  });
  removal.observe(document.body, { childList: true, subtree: true });
  });
})();
