(() => {
  const loader = document.querySelector('.intro-loader');
  const video = loader.querySelector('video');
  const wordmark = loader.querySelector('.intro-loader-wordmark');
  const trace = loader.querySelector('.intro-loader-trace');
  const me = loader.querySelector('.intro-loader-me');
  let maskCenter = 0;
  let traceWidth = 0;
  function alignFlower() {
    const text = trace.getBoundingClientRect();
    const whole = wordmark.getBoundingClientRect();
    const end = me.getBoundingClientRect();
    maskCenter = whole.width / 2;
    const center = whole.left + maskCenter;
    traceWidth = Math.max(center - text.left, end.right - center) * 1.2;
    video.style.left = "50%";
  }
  alignFlower();
  document.fonts.ready.then(() => { if (!done) alignFlower(); });
  window.addEventListener('resize', alignFlower);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let done = false;
  let safety, scrollReplay = false;
  function resetPreview() {
    video.currentTime = 0;
    video.style.opacity = '1';
    wordmark.style.opacity = '1';
    wordmark.style.maskImage = 'none';
    wordmark.style.webkitMaskImage = 'none';
  }
  function consumeType() {
    if (done) return;
    const p = Math.min(1, video.currentTime / (video.duration || 4));
    const fade = Math.max(0, Math.min(1, (p - .5) / .48));
    video.style.opacity = String(1 - fade * fade * (3 - 2 * fade));
    // Keep the wordmark visible a little longer; let its reveal finish with the clip.
    const t = Math.max(0, Math.min(1, (p - .12) / .88));
    const eased = t * t * (3 - 2 * t);
    if (reduced.matches) {
      wordmark.style.opacity = String(1 - eased);
    } else {
      const radius = eased * traceWidth;
      const mask = `radial-gradient(circle ${Math.max(.1, radius)}px at ${maskCenter}px 50%, transparent 92%, #000 100%)`;
      wordmark.style.maskImage = mask;
      wordmark.style.webkitMaskImage = mask;
    }
    if (!video.paused && !video.ended) frame = requestAnimationFrame(consumeType);
  }
  video.addEventListener('playing', () => { done=false; clearTimeout(safety); safety=setTimeout(finish,8000); cancelAnimationFrame(frame); consumeType(); });
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(safety);
    cancelAnimationFrame(frame);
    video.pause();
    video.style.opacity = '0';
    wordmark.style.opacity = '0';
    safety = setTimeout(() => {
      const bounds = loader.getBoundingClientRect();
      if (document.hidden || bounds.bottom <= innerHeight * .18 || bounds.top >= innerHeight * .82) return;
      done = false;
      resetPreview();
      alignFlower();
      safety = setTimeout(finish, 8000);
      video.play().catch(finish);
    }, 3000);

  };
  let wasVisible = false;
  window.addEventListener('scroll', () => {
    if (!loader.classList.contains('is-scroll-chapter')) return;
    const bounds = loader.getBoundingClientRect();
    const visible = bounds.bottom > innerHeight * .18 && bounds.top < innerHeight * .82;
    if (visible && !wasVisible) {
      scrollReplay = true;
      done = false;
      resetPreview();
      alignFlower();
      clearTimeout(safety);
      safety = setTimeout(finish, 8000);
      video.play().catch(finish);
    } else if (!visible && wasVisible) {
      done = true;
      clearTimeout(safety);
      cancelAnimationFrame(frame);
      video.pause();
      resetPreview();
    }
    wasVisible = visible;
  }, {passive:true});
  loader.classList.add('is-scroll-chapter');
  document.body.classList.remove('intro-loading');
  video.loop = false;
  video.addEventListener('ended', finish);
  video.addEventListener('error', finish);
  video.defaultPlaybackRate = 1.1;
  video.playbackRate = 1.1;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { done = true; clearTimeout(safety); cancelAnimationFrame(frame); video.pause(); }
    else {
      const bounds = loader.getBoundingClientRect();
      if (bounds.bottom > innerHeight * .18 && bounds.top < innerHeight * .82) {
        done = false; resetPreview(); safety = setTimeout(finish, 8000); video.play().catch(finish);
      }
    }
  });
  // Visibility, including restored scroll positions, owns playback.
  // Do not leave the opening frame paused after a reload.
  const visibility = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!entry.isIntersecting || entry.intersectionRatio < .2 || document.hidden) {
      done = true;
      clearTimeout(safety);
      cancelAnimationFrame(frame);
      video.pause();
      return;
    }
    done = false;
    resetPreview();
    alignFlower();
    clearTimeout(safety);
    video.play().catch(() => {
      // A blocked autoplay is not a completed animation: retain visible content.
      done = true;
      resetPreview();
    });
  }, {threshold:.2});
  visibility.observe(loader);
  window.addEventListener('trace:idle-reset', () => {
    clearTimeout(safety);
    cancelAnimationFrame(frame);
    done = false;
    wasVisible = true;
    resetPreview();
    alignFlower();
    safety = setTimeout(finish, 8000);
    video.play().catch(() => { done = true; clearTimeout(safety); resetPreview(); });
  });
})();
