(function () {
  'use strict';

  const VERSION = '16.0.0';
  const LEVEL_ID = 'levelScreen';
  const FX_ID = 'stageFx';
  const CAMERA_ID = 'sceneCamera';
  const STYLE_ID = 'v16-lushan-pov-style';
  const MODE_CLASSES = [
    'v16-pov-active',
    'v16-pov-walk',
    'v16-pov-boat',
    'v16-pov-flight'
  ];
  const scriptSource = document.currentScript && document.currentScript.src;
  let upstreamRender = null;
  let observer = null;
  let observerQueued = false;
  let renderSerial = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function ensureStylesheet() {
    if (document.getElementById(STYLE_ID) || document.querySelector('link[href*="v16-lushan-pov.css"]')) return;
    const link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = scriptSource ? new URL('v16-lushan-pov.css', scriptSource).href : 'assets/v16-lushan-pov.css';
    document.head.appendChild(link);
  }

  function safeTask(value) {
    return /^lushan-[012]$/.test(String(value || '')) ? String(value) : '';
  }

  function currentTask() {
    const level = byId(LEVEL_ID);
    return safeTask(level && level.dataset.task);
  }

  function supportedScene(task, effect) {
    const key = `${task}:${String(effect || '')}`;
    if (key === 'lushan-0:panorama') return 'walk-run';
    if (key === 'lushan-0:peak') return 'walk-arrive';
    if (key === 'lushan-1:far') return 'boat';
    if (key === 'lushan-2:crane-flight') return 'flight';
    return '';
  }

  function repeat(count, render) {
    return Array.from({ length: count }, (_, index) => render(index)).join('');
  }

  function grassMarkup() {
    const positions = [3, 10, 18, 27, 38, 49, 61, 72, 82, 91, 97];
    return positions.map((left, index) => {
      const side = left < 50 ? -1 : 1;
      const lean = side * (6 + (index % 4) * 3);
      return `<i class="v16-grass-tuft tuft-${index}" style="--v16-x:${left}%;--v16-lean:${lean}deg;--v16-delay:${(index % 3) * -0.07}s"></i>`;
    }).join('');
  }

  function railMarkup() {
    return `
      <div class="v16-rail v16-rail-left"><i></i><i></i><i></i></div>
      <div class="v16-rail v16-rail-right"><i></i><i></i><i></i></div>`;
  }

  function walkMarkup(phase) {
    const phaseClass = phase === 'walk-arrive' ? 'v16-walk-arrive' : 'v16-walk-run';
    return `
      <div class="v16-pov v16-pov-walk ${phaseClass}" data-v16-scene="${phaseClass}">
        <div class="v16-walk-camera">
          <div class="v16-landscape v16-walk-landscape"></div>
          <div class="v16-walk-distance-haze"></div>
          <div class="v16-walk-ground"><i class="v16-ground-shadow"></i></div>
          <div class="v16-pavilion" aria-hidden="true"></div>
        </div>
        <div class="v16-walk-light"></div>
        <div class="v16-grass-layer">${grassMarkup()}</div>
        ${railMarkup()}
        <div class="v16-walk-foreground"></div>
        <div class="v16-step-edge v16-step-edge-left"></div>
        <div class="v16-step-edge v16-step-edge-right"></div>
        <div class="v16-natural-vignette"></div>
      </div>`;
  }

  function splashMarkup() {
    return repeat(8, index => {
      const local = index % 6;
      return `<i class="v16-splash-drop v16-splash-right splash-${local}" style="--v16-splash-delay:${0.42 + index * 0.038}s"></i>`;
    });
  }

  function boatMarkup() {
    return `
      <div class="v16-pov v16-pov-boat" data-v16-scene="boat">
        <div class="v16-boat-camera">
          <div class="v16-landscape v16-boat-landscape"></div>
          <div class="v16-boat-haze"></div>
          <div class="v16-bank v16-bank-left"></div>
          <div class="v16-bank v16-bank-right"></div>
          <div class="v16-water-plane">
            <i class="v16-water-glint glint-1"></i>
            <i class="v16-water-glint glint-2"></i>
            <i class="v16-water-glint glint-3"></i>
            <i class="v16-water-glint glint-4"></i>
          </div>
        </div>
        <div class="v16-bow-wake v16-bow-wake-left"></div>
        <div class="v16-bow-wake v16-bow-wake-right"></div>
        <div class="v16-paddle-water v16-paddle-water-right"><i></i><i></i></div>
        <div class="v16-boat-foreground"></div>
        <div class="v16-right-stroke-surge"><i></i><b></b></div>
        <div class="v16-splashes">${splashMarkup()}</div>
        <div class="v16-natural-vignette"></div>
      </div>`;
  }

  function cloudMarkup(depth, count) {
    return repeat(count, index => `<i class="v16-flight-cloud cloud-${index}" style="--v16-cloud-index:${index}"></i>`);
  }

  function flightMarkup() {
    return `
      <div class="v16-pov v16-pov-flight" data-v16-scene="flight">
        <div class="v16-flight-camera">
          <div class="v16-landscape v16-flight-landscape"></div>
          <div class="v16-flight-sunwash"></div>
          <div class="v16-flight-cliff v16-flight-cliff-left"></div>
          <div class="v16-flight-cliff v16-flight-cliff-right"></div>
          <div class="v16-cloud-stream v16-cloud-stream-far">${cloudMarkup('far', 3)}</div>
          <div class="v16-cloud-stream v16-cloud-stream-mid">${cloudMarkup('mid', 4)}</div>
        </div>
        <div class="v16-flight-shadow"></div>
        <div class="v16-crane-foreground">
          <i class="v16-crane-wing-slice v16-crane-wing-slice-left"></i>
          <i class="v16-crane-wing-slice v16-crane-wing-slice-right"></i>
        </div>
        <div class="v16-cloud-stream v16-cloud-stream-near">${cloudMarkup('near', 5)}</div>
        <div class="v16-flight-air v16-flight-air-left"></div>
        <div class="v16-flight-air v16-flight-air-right"></div>
        <div class="v16-natural-vignette"></div>
      </div>`;
  }

  function clearMode(level) {
    if (!level) return;
    MODE_CLASSES.forEach(className => level.classList.remove(className));
    level.removeAttribute('data-v16-pov');
  }

  function setMode(level, scene) {
    clearMode(level);
    level.classList.add('v16-pov-active');
    if (scene.indexOf('walk') === 0) level.classList.add('v16-pov-walk');
    else level.classList.add(`v16-pov-${scene}`);
    level.dataset.v16Pov = scene;
  }

  function cameraFrames(scene) {
    if (scene === 'walk-run') {
      return [
        { transform: 'translate3d(0,1.2%,0) scale(1.055) rotate(-0.15deg)', offset: 0 },
        { transform: 'translate3d(-0.7%,2.5%,0) scale(1.10) rotate(0.22deg)', offset: 0.22 },
        { transform: 'translate3d(0.8%,1.8%,0) scale(1.16) rotate(-0.18deg)', offset: 0.47 },
        { transform: 'translate3d(-0.45%,3.1%,0) scale(1.22) rotate(0.12deg)', offset: 0.73 },
        { transform: 'translate3d(0,2.2%,0) scale(1.275) rotate(0deg)', offset: 1 }
      ];
    }
    if (scene === 'walk-arrive') {
      return [
        { transform: 'translate3d(0,2.2%,0) scale(1.275)', offset: 0 },
        { transform: 'translate3d(-0.35%,3.2%,0) scale(1.32) rotate(0.12deg)', offset: 0.32 },
        { transform: 'translate3d(0.25%,2.6%,0) scale(1.355) rotate(-0.08deg)', offset: 0.62 },
        { transform: 'translate3d(0,2.1%,0) scale(1.37)', offset: 1 }
      ];
    }
    if (scene === 'boat') {
      return [
        { transform: 'translate3d(0,5.5%,0) scale(1.18) rotate(-0.18deg)', offset: 0 },
        { transform: 'translate3d(-0.6%,3.1%,0) scale(1.125) rotate(0.16deg)', offset: 0.3 },
        { transform: 'translate3d(0.45%,1.1%,0) scale(1.075) rotate(-0.1deg)', offset: 0.64 },
        { transform: 'translate3d(0,-1.2%,0) scale(1.025)', offset: 1 }
      ];
    }
    return [
      { transform: 'translate3d(0,-1%,0) scale(1.07) rotate(-0.1deg)', offset: 0 },
      { transform: 'translate3d(-0.5%,5%,0) scale(1.18) rotate(0.18deg)', offset: 0.3 },
      { transform: 'translate3d(0.7%,12%,0) scale(1.31) rotate(-0.22deg)', offset: 0.58 },
      { transform: 'translate3d(-0.25%,4%,0) scale(1.19) rotate(0.1deg)', offset: 0.79 },
      { transform: 'translate3d(0,-5%,0) scale(1.105)', offset: 1 }
    ];
  }

  function animateCamera(scene, duration) {
    const camera = byId(CAMERA_ID);
    if (!camera || typeof camera.animate !== 'function') return;
    if (typeof camera.getAnimations === 'function') camera.getAnimations().forEach(animation => animation.cancel());
    camera.style.transformOrigin = scene === 'flight' ? '50% 68%' : '50% 58%';
    const animation = camera.animate(cameraFrames(scene), {
      duration,
      easing: scene === 'flight' ? 'cubic-bezier(.34,.02,.22,1)' : 'cubic-bezier(.22,.05,.18,1)',
      fill: 'forwards'
    });
    animation.id = `v16-lushan-${scene}`;
  }

  function effectLabel(scene) {
    if (scene.indexOf('walk') === 0) return '小黑的视角：穿过草地，走近山间小亭';
    if (scene === 'boat') return '小黑的视角：坐在船头，划向湖心远望庐山';
    return '白鹤的视角：展开双翼，飞越云雾和山谷';
  }

  function renderScene(task, effect, source) {
    const level = byId(LEVEL_ID);
    const fx = byId(FX_ID);
    const scene = supportedScene(task, effect);
    if (!level || !fx || !scene) return false;

    ensureStylesheet();
    renderSerial += 1;
    const duration = scene.indexOf('walk') === 0 ? 1320 : 1800;
    setMode(level, scene);
    if (typeof fx.getAnimations === 'function') fx.getAnimations().forEach(animation => animation.cancel());
    fx.className = `stage-fx cinematic-fx v16-pov-host effect-${effect} task-effect-${task}`;
    fx.dataset.v16PovKey = `${task}:${effect}:${renderSerial}`;
    fx.setAttribute('aria-label', effectLabel(scene));
    fx.innerHTML = scene.indexOf('walk') === 0
      ? walkMarkup(scene)
      : scene === 'boat'
        ? boatMarkup()
        : flightMarkup();
    // The opaque POV layer owns the camera motion; avoid compositing the hidden base camera.
    if (!fx.querySelector('.v16-pov')) animateCamera(scene, duration);

    document.dispatchEvent(new CustomEvent('poetry:v16-pov-rendered', {
      detail: { version: VERSION, task, effect, scene, duration, source: source || 'renderRichEffect' }
    }));
    return true;
  }

  function enhancedRender(effect) {
    const task = currentTask();
    if (renderScene(task, effect, 'renderRichEffect')) return;
    clearMode(byId(LEVEL_ID));
    if (typeof upstreamRender === 'function') return upstreamRender.apply(this, arguments);
  }
  Object.defineProperty(enhancedRender, '__v16LushanPovHook', { value: true });

  function installHook() {
    const current = window.renderRichEffect;
    if (current === enhancedRender) return;
    if (typeof current === 'function' && !current.__v16LushanPovHook) upstreamRender = current;
    window.renderRichEffect = enhancedRender;
  }

  function effectFromHost(fx) {
    const match = String(fx.className || '').match(/(?:^|\s)effect-([a-z-]+)(?:\s|$)/);
    return match ? match[1] : '';
  }

  function inspectMutationFallback() {
    observerQueued = false;
    const level = byId(LEVEL_ID);
    const fx = byId(FX_ID);
    if (!level || !fx) return;
    if (!fx.firstElementChild) {
      clearMode(level);
      return;
    }
    if (fx.querySelector('.v16-pov')) return;
    const task = currentTask();
    const effect = effectFromHost(fx);
    if (supportedScene(task, effect)) renderScene(task, effect, 'mutation-observer');
  }

  function queueMutationInspection() {
    if (observerQueued) return;
    observerQueued = true;
    const defer = window.queueMicrotask || (callback => Promise.resolve().then(callback));
    defer(inspectMutationFallback);
  }

  function installObserver() {
    if (observer || typeof MutationObserver !== 'function') return;
    const level = byId(LEVEL_ID);
    const fx = byId(FX_ID);
    if (!level || !fx) return;
    observer = new MutationObserver(queueMutationInspection);
    observer.observe(level, {
      attributes: true,
      attributeFilter: ['class', 'data-task'],
      childList: false,
      subtree: false
    });
    observer.observe(fx, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: false
    });
  }

  function playFromEvent(event) {
    const detail = event && event.detail ? event.detail : {};
    const task = safeTask(detail.task) || currentTask();
    if (task && detail.effect) renderScene(task, detail.effect, event.type);
  }

  function boot() {
    ensureStylesheet();
    installHook();
    installObserver();
    document.dispatchEvent(new CustomEvent('poetry:v16-pov-ready', {
      detail: { version: VERSION }
    }));
  }

  document.addEventListener('poetry:rich-effect', playFromEvent);
  document.addEventListener('v16:lushan-pov:play', playFromEvent);

  window.V16LushanPOV = {
    version: VERSION,
    install: installHook,
    play(effect, task) {
      return renderScene(safeTask(task) || currentTask(), effect, 'public-api');
    },
    destroy() {
      if (observer) observer.disconnect();
      observer = null;
      clearMode(byId(LEVEL_ID));
      if (window.renderRichEffect === enhancedRender && upstreamRender) window.renderRichEffect = upstreamRender;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', installHook, { once: true });
})();
