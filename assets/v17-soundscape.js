(function () {
  'use strict';

  const VERSION = '17.0.0';
  const LEVEL_ID = 'levelScreen';
  const CONTINUE_ID = 'taskContinue';
  const scriptSource = document.currentScript && document.currentScript.src;
  const audioRoot = scriptSource
    ? new URL('audio/v17/', scriptSource).href
    : 'assets/audio/v17/';

  const clips = Object.freeze({
    footsteps: 'walk-footsteps-v17.wav',
    arrive: 'walk-arrive-v17.wav',
    paddle: 'paddle-water-v17.wav',
    crane: 'crane-wings-wind-v17.wav',
    snow: 'snowfall-v17.wav',
    scent: 'plum-sniff-sparkle-v17.wav',
    harmony: 'snow-plum-harmony-v17.wav',
    compost: 'petals-compost-v17.wav',
    fertilizer: 'fertilizer-pour-v17.wav',
    soilFed: 'soil-fed-sparkle-v17.wav',
    water: 'watering-nozzle-v17.wav',
    sprout: 'sprout-rise-v17.wav',
    young: 'young-plant-unfurl-v17.wav',
    bloom: 'flower-bloom-v17.wav',
    book: 'page-turn-v17.wav',
    seed: 'seed-drop-v17.wav',
    soilCover: 'soil-cover-v17.wav',
    night: 'night-wait-v17.wav',
    touch: 'ui-touch-v17.wav',
    continue: 'ui-continue-v17.wav',
    success: 'ui-success-v17.wav'
  });

  const effectPlan = Object.freeze({
    panorama: [{ clip: 'footsteps', volume: 0.42 }],
    peak: [{ clip: 'arrive', volume: 0.42 }],
    far: [{ clip: 'paddle', volume: 0.38 }],
    'crane-flight': [{ clip: 'crane', volume: 0.34 }],
    snow: [{ clip: 'snow', volume: 0.32 }],
    scent: [{ clip: 'scent', volume: 0.34 }],
    harmony: [{ clip: 'harmony', volume: 0.34 }],
    petals: [{ clip: 'compost', volume: 0.35 }],
    compost: [{ clip: 'compost', volume: 0.35 }],
    fertilize: [
      { clip: 'fertilizer', volume: 0.34 },
      { clip: 'soilFed', volume: 0.32, delay: 610 }
    ],
    water: [{ clip: 'water', volume: 0.34 }],
    sprout: [{ clip: 'sprout', volume: 0.35 }],
    young: [{ clip: 'young', volume: 0.34 }],
    bloom: [{ clip: 'bloom', volume: 0.34 }],
    blossom: [{ clip: 'bloom', volume: 0.34 }],
    book: [{ clip: 'book', volume: 0.38 }],
    seed: [{ clip: 'seed', volume: 0.38 }],
    'soil-cover': [{ clip: 'soilCover', volume: 0.36 }],
    'night-wait': [{ clip: 'night', volume: 0.3 }],
    cycle: [{ clip: 'night', volume: 0.28 }],
    'pot-grow': [{ clip: 'sprout', volume: 0.35 }]
  });

  let upstreamRender = null;
  let upstreamSfx = null;
  let observer = null;
  let players = [];
  let timers = [];
  let continueTimer = null;
  let continueLocked = false;
  let upstreamContinueHandler = null;
  let warmPlayers = [];
  let lastEffectKey = '';
  let lastEffectAt = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function currentTask() {
    const level = byId(LEVEL_ID);
    return level && level.dataset ? String(level.dataset.task || '') : '';
  }

  function soundEnabled() {
    const toggle = document.querySelector('.sound-toggle');
    return !toggle || String(toggle.textContent || '').indexOf('🔇') === -1;
  }

  function stop() {
    timers.forEach(window.clearTimeout);
    timers = [];
    if (continueTimer) {
      window.clearTimeout(continueTimer);
      const continueButton = byId(CONTINUE_ID);
      if (continueButton) continueButton.disabled = false;
    }
    continueTimer = null;
    continueLocked = false;
    players.forEach(player => {
      player.onended = null;
      player.onerror = null;
      player.pause();
      try { player.currentTime = 0; } catch (_) { /* metadata may not be ready */ }
    });
    players = [];
  }

  function startClip(spec) {
    if (!soundEnabled()) return;
    const filename = clips[spec.clip];
    if (!filename) return;
    const player = new Audio(audioRoot + filename);
    player.preload = 'auto';
    player.volume = Math.max(0, Math.min(1, spec.volume == null ? 0.35 : spec.volume));
    const remove = () => { players = players.filter(item => item !== player); };
    player.onended = remove;
    player.onerror = remove;
    players.push(player);
    const playResult = player.play();
    if (playResult && typeof playResult.catch === 'function') playResult.catch(remove);
  }

  function playPlan(plan, options) {
    if (!Array.isArray(plan) || !plan.length || !soundEnabled()) return false;
    if (!options || options.replace !== false) stop();
    plan.forEach(spec => {
      if (spec.delay) {
        timers.push(window.setTimeout(() => startClip(spec), spec.delay));
      } else {
        startClip(spec);
      }
    });
    return true;
  }

  function playEffect(effect, source) {
    const normalized = String(effect || '').toLowerCase();
    const plan = effectPlan[normalized];
    if (!plan) return false;
    const now = Date.now();
    const key = `${currentTask()}:${normalized}`;
    if (key === lastEffectKey && now - lastEffectAt < 100) return true;
    lastEffectKey = key;
    lastEffectAt = now;
    const played = playPlan(plan, { replace: true });
    if (played) {
      document.dispatchEvent(new CustomEvent('poetry:v17-soundscape-played', {
        detail: { version: VERSION, task: currentTask(), effect: normalized, source: source || 'api' }
      }));
    }
    return played;
  }

  function playUi(name) {
    const clip = clips[name] ? name : 'touch';
    return playPlan([{ clip, volume: clip === 'success' ? 0.34 : 0.3 }], { replace: true });
  }

  function enhancedRender(effect) {
    const result = upstreamRender && upstreamRender.apply(this, arguments);
    playEffect(effect, 'renderRichEffect');
    return result;
  }
  Object.defineProperty(enhancedRender, '__v17SoundscapeHook', { value: true });

  function enhancedSfx(effect, correct) {
    if (correct === false || /wrong|wobble/.test(String(effect || ''))) {
      return playUi('touch');
    }
    // renderRichEffect normally arrives immediately before playSfx. The sample
    // has already started, so suppress the older oscillator chirp and duplicates.
    if (playEffect(effect, 'playSfx')) return;
    if (typeof upstreamSfx === 'function') return upstreamSfx.apply(this, arguments);
  }
  Object.defineProperty(enhancedSfx, '__v17SoundscapeHook', { value: true });

  function installContinueCue() {
    const button = byId(CONTINUE_ID);
    if (!button || button.onclick === enhancedContinue) return;
    if (typeof button.onclick === 'function' && !button.onclick.__v17SoundscapeHook) {
      upstreamContinueHandler = button.onclick;
    }
    if (upstreamContinueHandler) button.onclick = enhancedContinue;
  }

  function enhancedContinue(event) {
    const button = byId(CONTINUE_ID);
    if (!button || button.hidden || continueLocked || !upstreamContinueHandler) return;
    continueLocked = true;
    button.disabled = true;
    playUi('continue');
    continueLocked = true;
    continueTimer = window.setTimeout(() => {
      continueTimer = null;
      stop();
      if (!button.isConnected || button.hidden) {
        button.disabled = false;
        return;
      }
      button.disabled = false;
      upstreamContinueHandler.call(button, event);
    }, 285);
  }
  Object.defineProperty(enhancedContinue, '__v17SoundscapeHook', { value: true });

  function install() {
    const render = window.renderRichEffect;
    if (render !== enhancedRender) {
      if (typeof render === 'function' && !render.__v17SoundscapeHook) upstreamRender = render;
      if (upstreamRender) window.renderRichEffect = enhancedRender;
    }
    const sfx = window.playSfx;
    if (sfx !== enhancedSfx) {
      if (typeof sfx === 'function' && !sfx.__v17SoundscapeHook) upstreamSfx = sfx;
      if (upstreamSfx) window.playSfx = enhancedSfx;
    }
    installContinueCue();
  }

  function observeSceneChanges() {
    if (observer || typeof MutationObserver !== 'function') return;
    const level = byId(LEVEL_ID);
    const continueButton = byId(CONTINUE_ID);
    observer = new MutationObserver(records => {
      let taskChanged = false;
      let successReady = false;
      records.forEach(record => {
        if (record.target === level && record.attributeName === 'data-task') taskChanged = true;
        if (record.target === continueButton && record.attributeName === 'hidden' && !continueButton.hidden) successReady = true;
      });
      if (taskChanged) stop();
      if (successReady && level && level.classList.contains('phase-done')) playUi('success');
    });
    if (level) observer.observe(level, { attributes: true, attributeFilter: ['data-task'] });
    if (continueButton) observer.observe(continueButton, { attributes: true, attributeFilter: ['hidden'] });
  }

  function onUiClick(event) {
    const target = event.target && event.target.closest
      ? event.target.closest('.nav-btn, .parent-open, #closeParent, #levelBack, #resultMap, #playAgain, .sound-toggle, #taskSpeak, #storyReplay, #readPoem, .album-speak')
      : null;
    if (!target) return;
    stop();
    if (!target.matches('#levelBack, #resultMap, #playAgain, .sound-toggle, #taskSpeak, #storyReplay, #readPoem, .album-speak')) {
      playUi('touch');
    }
  }

  function onEffectEvent(event) {
    const detail = event && event.detail ? event.detail : {};
    if (detail.effect) playEffect(detail.effect, event.type);
  }

  function onUiEvent(event) {
    const detail = event && event.detail ? event.detail : {};
    playUi(detail.cue || detail.name || 'touch');
  }

  function preload() {
    if (warmPlayers.length) return;
    Object.keys(clips).forEach(key => {
      const player = new Audio(audioRoot + clips[key]);
      player.preload = 'auto';
      warmPlayers.push(player);
      try { player.load(); } catch (_) { /* preload is only a performance hint */ }
    });
  }

  function boot() {
    install();
    observeSceneChanges();
    document.addEventListener('click', onUiClick, true);
    document.dispatchEvent(new CustomEvent('poetry:v17-soundscape-ready', {
      detail: { version: VERSION, clipCount: Object.keys(clips).length }
    }));
  }

  document.addEventListener('poetry:rich-effect', onEffectEvent);
  document.addEventListener('poetry:v17-ui', onUiEvent);
  document.addEventListener('pointerdown', preload, { capture: true, once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);

  window.V17Soundscape = Object.freeze({
    version: VERSION,
    clips,
    effectPlan,
    install,
    preload,
    stop,
    playEffect(effect) { return playEffect(effect, 'public-api'); },
    playUi
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', install, { once: true });
})();
