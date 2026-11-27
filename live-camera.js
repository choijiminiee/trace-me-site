(() => {
  document.querySelectorAll('.live-trace').forEach(section => {
  const video = section.querySelector('.live-camera-video');
  const button = section.querySelector('.live-camera-start');
  const status = section.querySelector('.live-face-status');
  const stopButton = section.querySelector('.live-camera-stop');
  let stream = null;
  let pending = false;
  let generation = 0;
  let disposed = false;

  function stopCamera(message = 'CAMERA OFF') {
    generation++;
    section.dispatchEvent(new Event('camera-stop'));
    pending = false;
    stopButton.disabled = true;
    const previous = stream;
    stream = null;
    previous?.getTracks().forEach(track => track.stop());
    video.pause();
    video.srcObject = null;
    video.hidden = true;
    button.hidden = false;
    button.disabled = false;
    status.textContent = message;
  }

  async function startCamera() {
    if (pending || stream || disposed) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'CAMERA UNAVAILABLE — 이 브라우저에서는 카메라를 사용할 수 없습니다.';
      return;
    }
    document.querySelectorAll('.live-trace').forEach(other=>{if(other!==section)other.dispatchEvent(new Event('camera-request-stop'));});
    pending = true;
    const request = ++generation;
    button.disabled = true;
    status.textContent = 'CONNECTING...';
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, audio: false
      });
      if (request !== generation || disposed || !section.isConnected) {
        media.getTracks().forEach(track => track.stop());
        return;
      }
      stream = media;
      media.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (stream === media) stopCamera();
      }, { once: true }));
      video.muted = true;
      video.srcObject = media;
      await video.play();
      if (request !== generation) return;
      pending = false;
      video.hidden = false;
      stopButton.disabled = false;
      button.hidden = true;
      status.textContent = '● CAMERA LIVE';
      section.dispatchEvent(new Event('camera-live'));
    } catch (error) {
      if (request !== generation) return;
      const messages = {
        NotAllowedError: 'CAMERA OFF — 카메라 권한을 허용한 뒤 다시 시작해 주세요.',
        NotFoundError: 'CAMERA OFF — 연결된 카메라가 없습니다.',
        NotReadableError: 'CAMERA OFF — 카메라가 사용 중이거나 연결할 수 없습니다.'
      };
      stopCamera(messages[error.name] || 'CAMERA OFF — 연결하지 못했습니다. 다시 시도해 주세요.');
    }
  }
  button.addEventListener('click', startCamera);
  section.addEventListener('camera-request-start',startCamera);
  section.addEventListener('camera-request-stop',()=>stopCamera());
  stopButton.addEventListener('click', () => stopCamera());
  window.addEventListener('pagehide', () => stopCamera());
  // 정적 페이지에서도 Section이 제거되면 스트림과 리스너를 정리합니다.
  const observer = new MutationObserver(() => {
    if (!section.isConnected || !section.contains(video)) {
      disposed = true;
      stopCamera();
      button.removeEventListener('click', startCamera);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  });
})();
