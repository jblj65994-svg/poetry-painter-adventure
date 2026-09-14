(function () {
  'use strict';

  if (window.V18HomeCover) return;

  const VERSION = '18.0.0';
  const hero = document.getElementById('homeHero');
  const home = document.getElementById('homeScreen');
  if (!hero || !home) return;

  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  function renderShift() {
    frame = 0;
    hero.style.setProperty('--hero-shift-x', `${nextX.toFixed(2)}px`);
    hero.style.setProperty('--hero-shift-y', `${nextY.toFixed(2)}px`);
  }

  function queueShift(x, y) {
    nextX = x;
    nextY = y;
    if (!frame) frame = window.requestAnimationFrame(renderShift);
  }

  function resetShift() {
    queueShift(0, 0);
  }

  function move(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    queueShift(x * -7, y * -5);
  }

  function touch(event) {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5;
    const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5;
    queueShift(x * -4, y * -3);
    hero.classList.add('is-touched');
  }

  function release() {
    hero.classList.remove('is-touched');
    window.setTimeout(resetShift, 120);
  }

  function reveal() {
    hero.classList.remove('v18-ready');
    void hero.offsetWidth;
    hero.classList.add('v18-ready');
  }

  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerleave', resetShift, { passive: true });
  hero.addEventListener('pointerdown', touch, { passive: true });
  hero.addEventListener('pointerup', release, { passive: true });
  hero.addEventListener('pointercancel', release, { passive: true });

  const observer = typeof MutationObserver === 'function'
    ? new MutationObserver(records => {
      if (records.some(record => record.attributeName === 'class') && home.classList.contains('active')) reveal();
    })
    : null;
  if (observer) observer.observe(home, { attributes: true, attributeFilter: ['class'] });

  const background = new Image();
  background.decoding = 'async';
  background.src = 'assets/scenes/home-hero-world-v18.webp';

  window.requestAnimationFrame(() => window.requestAnimationFrame(reveal));

  window.V18HomeCover = Object.freeze({
    version: VERSION,
    reveal,
    reset: resetShift
  });
})();
