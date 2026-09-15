(function v20SceneAnimations() {
  'use strict';

  const VERSION = '20.0.0';
  const level = document.getElementById('levelScreen');
  const fx = document.getElementById('stageFx');
  if (!level || !fx) return;

  const ROOT = 'assets/scenes/v20/';
  const BASE = 'assets/scenes/';
  const V19 = 'assets/scenes/v19/';
  const scenes = Object.freeze({
    lushanBase: BASE + 'lushan-bg-clean-v10.jpg',
    lushanBoatStart: BASE + 'lushan-boat-pov-v16.jpg',
    lushanBoatAction: ROOT + 'lushan-boat-stroke-v20.jpg',
    lushanCraneStart: BASE + 'lushan-crane-pov-v16.jpg',
    lushanCraneTakeoff: ROOT + 'lushan-crane-takeoff-v20.jpg',
    lushanCraneGlide: ROOT + 'lushan-crane-glide-v20.jpg',
    plumWide: ROOT + 'xuemei-before-snow-v20.jpg',
    plumBuds: ROOT + 'xuemei-buds-close-v20.jpg',
    plumBloom: ROOT + 'xuemei-blossom-close-v20.jpg',
    flowerBase: BASE + 'flowers-bg-clean-v10.jpg',
    flowerCompost: ROOT + 'flowers-compost-action-v20.jpg',
    flowerCompostSettled: ROOT + 'flowers-compost-settled-v20.jpg',
    flowerFertilizer: ROOT + 'flowers-fertilizer-action-v20.jpg',
    flowerFertilizerSettled: ROOT + 'flowers-fertilizer-settled-v20.jpg',
    flowerWater: ROOT + 'flowers-watering-action-v20.jpg',
    flowerSprout: ROOT + 'flowers-sprout-field-v20.jpg',
    flowerYoung: ROOT + 'flowers-young-field-v20.jpg',
    flowerBloom: ROOT + 'flowers-bloom-field-v20.jpg',
    studyGarden: V19 + 'study-garden-v19.jpg',
    studySeed: ROOT + 'study-seed-action-v20.jpg',
    studySoilAction: ROOT + 'study-soil-cover-action-v20.jpg',
    studyCovered: ROOT + 'study-soil-covered-v20.jpg',
    studyWater: ROOT + 'study-watering-action-v20.jpg',
    studySprout: ROOT + 'study-sprout-final-v20.jpg'
  });

  const durations = Object.freeze({
    panorama: 3000,
    peak: 2400,
    far: 3400,
    'crane-flight': 3700,
    snow: 2850,
    scent: 2750,
    harmony: 3100,
    compost: 2850,
    fertilize: 2850,
    water: 2750,
    sprout: 2850,
    young: 2650,
    bloom: 3200,
    book: 3400,
    seed: 2800,
    'soil-cover': 2550,
    'night-wait': 3150
  });

  let upstreamRender = null;
  let serial = 0;

  function currentTask() {
    return String(level.dataset.task || '');
  }

  function sceneDuration(task, effect) {
    if (effect == null) {
      effect = task;
      task = currentTask();
    }
    task = String(task || '');
    effect = String(effect || '');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 650;
    if (effect === 'water') return task.indexOf('study-') === 0 ? 2900 : 2750;
    if (effect === 'sprout') return task.indexOf('study-') === 0 ? 3050 : 2850;
    return durations[effect] || 2400;
  }

  function supported(task, effect) {
    if (task === 'lushan-1' && effect === 'far') return true;
    if (task === 'lushan-2' && effect === 'crane-flight') return true;
    if (task.indexOf('xuemei-') === 0) return ['snow', 'scent', 'harmony'].indexOf(effect) >= 0;
    if (task.indexOf('flowers-') === 0) return ['compost', 'fertilize', 'water', 'sprout', 'young', 'bloom'].indexOf(effect) >= 0;
    if (task === 'study-1') return ['seed', 'soil-cover'].indexOf(effect) >= 0;
    if (task === 'study-2') return ['water', 'night-wait', 'sprout'].indexOf(effect) >= 0;
    return false;
  }

  function shot(src, className) {
    return '<div class="v20-shot ' + className + '" style="background-image:url(&quot;' + src + '&quot;)"></div>';
  }

  function particles(className, count, seed) {
    let html = '';
    const offset = seed || 0;
    for (let index = 0; index < count; index += 1) {
      const n = index + offset;
      const x = (n * 37 + 9) % 94;
      const y = (n * 53 + 7) % 82;
      const delay = ((n * 17) % 29) / 100;
      const scale = ((72 + ((n * 19) % 68)) / 100).toFixed(2);
      const drift = -34 + ((n * 23) % 69);
      html += '<i class="' + className + '" style="--x:' + x + '%;--y:' + y + '%;--delay:' + delay + 's;--scale:' + scale + ';--drift:' + drift + 'px"></i>';
    }
    return html;
  }

  function phaseShots(before, action, settle) {
    return shot(before, 'v20-before') + shot(action, 'v20-action') + shot(settle, 'v20-settle');
  }

  function lushanMarkup(effect, duration) {
    if (effect === 'far') {
      return '<div class="v20-cinematic-frame v20-world-lushan v20-effect-far" style="--v20-duration:' + duration + 'ms">' +
        phaseShots(scenes.lushanBoatStart, scenes.lushanBoatAction, scenes.lushanBoatAction) +
        '<div class="v20-boat-depth"><i></i><i></i></div><div class="v20-boat-wake"></div>' +
        '<div class="v20-boat-spray">' + particles('v20-boat-drop', 24, 17) + '</div>' +
        '<div class="v20-water-glints">' + particles('v20-water-glint', 18, 47) + '</div><div class="v20-depth-veil"></div></div>';
    }
    return '<div class="v20-cinematic-frame v20-world-lushan v20-effect-crane-flight" style="--v20-duration:' + duration + 'ms">' +
      phaseShots(scenes.lushanCraneStart, scenes.lushanCraneTakeoff, scenes.lushanCraneGlide) +
      '<div class="v20-crane-clouds"><i></i><i></i><i></i></div><div class="v20-crane-sun"></div>' +
      '<div class="v20-crane-feathers">' + particles('v20-feather', 10, 9) + '</div><div class="v20-depth-veil"></div></div>';
  }

  function plumMarkup(effect, duration) {
    let shots;
    if (effect === 'snow') shots = phaseShots(scenes.plumWide, scenes.plumWide, scenes.plumWide);
    else if (effect === 'scent') shots = phaseShots(scenes.plumBuds, scenes.plumBloom, scenes.plumBloom);
    else shots = phaseShots(scenes.plumWide, scenes.plumBloom, scenes.plumBloom);

    const snow = effect === 'snow' || effect === 'harmony'
      ? '<div class="v20-snow-mid">' + particles('v20-snow-particle', 28, 2) + '</div><div class="v20-snow-near">' + particles('v20-snow-near-particle', 11, 31) + '</div><div class="v20-snow-contact">' + particles('v20-snow-touch', 9, 51) + '</div>'
      : '';
    const scent = effect === 'scent' || effect === 'harmony'
      ? '<div class="v20-scent-flow"><b></b><b></b></div><div class="v20-plum-petals">' + particles('v20-plum-petal', 13, 11) + '</div>'
      : '';
    const glints = '<div class="v20-natural-glints">' + particles('v20-natural-glint', effect === 'harmony' ? 14 : 8, 71) + '</div>';
    return '<div class="v20-cinematic-frame v20-world-plum v20-effect-' + effect + '" style="--v20-duration:' + duration + 'ms">' +
      shots + '<div class="v20-plum-light"></div>' + snow + scent + glints + '<div class="v20-depth-veil"></div></div>';
  }

  function flowerShots(effect) {
    if (effect === 'compost') return phaseShots(scenes.flowerBase, scenes.flowerCompost, scenes.flowerCompostSettled);
    if (effect === 'fertilize') return phaseShots(scenes.flowerBase, scenes.flowerFertilizer, scenes.flowerFertilizerSettled);
    if (effect === 'water') return phaseShots(scenes.flowerBase, scenes.flowerWater, scenes.flowerSprout);
    if (effect === 'sprout') return phaseShots(scenes.flowerBase, scenes.flowerSprout, scenes.flowerSprout);
    if (effect === 'young') return phaseShots(scenes.flowerSprout, scenes.flowerYoung, scenes.flowerYoung);
    return phaseShots(scenes.flowerYoung, scenes.flowerBloom, scenes.flowerBloom);
  }

  function flowerMarkup(effect, duration) {
    let action = '';
    if (effect === 'compost') {
      action = '<div class="v20-compost-fall"><div class="v20-compost-petal-zone">' + particles('v20-compost-petal', 17, 3) + '</div><div class="v20-compost-crumb-zone">' + particles('v20-compost-crumb', 18, 37) + '</div></div><div class="v20-compost-breath"><i></i><i></i><i></i></div>';
    } else if (effect === 'fertilize') {
      action = '<div class="v20-fertilizer-cascade">' + particles('v20-fertilizer-grain', 30, 7) + '</div><div class="v20-soil-response"><i></i><i></i><b></b></div>';
    } else if (effect === 'water') {
      action = '<div class="v20-water-sheets"><i></i><i></i><i></i><i></i><i></i></div><div class="v20-water-contact">' + particles('v20-water-splash', 19, 14) + '</div><div class="v20-soil-drink"></div>';
    } else if (effect === 'sprout') {
      action = '<div class="v20-growth-wave v20-growth-wave-one"></div><div class="v20-growth-wave v20-growth-wave-two"></div><div class="v20-leaf-lift">' + particles('v20-leaf-glint', 14, 24) + '</div>';
    } else if (effect === 'young') {
      action = '<div class="v20-green-breath"></div><div class="v20-leaf-lift">' + particles('v20-leaf-glint', 17, 32) + '</div>';
    } else {
      action = '<div class="v20-bloom-ripple"><i></i><i></i><i></i></div><div class="v20-flower-celebration">' + particles('v20-bloom-petal', 22, 19) + particles('v20-natural-glint', 15, 55) + '</div>';
    }
    return '<div class="v20-cinematic-frame v20-world-flowers v20-effect-' + effect + '" style="--v20-duration:' + duration + 'ms">' +
      flowerShots(effect) + action + '<div class="v20-flowers-near">' + particles('v20-near-petal', 7, 82) + '</div><div class="v20-depth-veil"></div></div>';
  }

  function studyShots(effect) {
    if (effect === 'seed') return phaseShots(scenes.studyGarden, scenes.studySeed, scenes.studySeed);
    if (effect === 'soil-cover') return phaseShots(scenes.studySeed, scenes.studySoilAction, scenes.studyCovered);
    if (effect === 'water') return phaseShots(scenes.studyGarden, scenes.studyWater, scenes.studyWater);
    if (effect === 'night-wait') return phaseShots(scenes.studyWater, scenes.studyGarden, scenes.studyGarden);
    return phaseShots(scenes.studyGarden, scenes.studySprout, scenes.studySprout);
  }

  function studyMarkup(effect, duration) {
    let action = '';
    if (effect === 'seed') {
      action = '<div class="v20-seed-contact"><i></i><b></b></div><div class="v20-pot-soil-puff">' + particles('v20-pot-soil-grain', 18, 5) + '</div>';
    } else if (effect === 'soil-cover') {
      action = '<div class="v20-pot-soil-puff v20-cover-puff">' + particles('v20-pot-soil-grain', 26, 9) + '</div><div class="v20-study-glints">' + particles('v20-natural-glint', 7, 76) + '</div>';
    } else if (effect === 'water') {
      action = '<div class="v20-study-water-stream"><i></i><i></i><i></i><i></i></div><div class="v20-study-water-contact">' + particles('v20-water-splash', 17, 29) + '</div><div class="v20-pot-drink"></div>';
    } else if (effect === 'night-wait') {
      action = '<div class="v20-night-cycle"><i class="v20-moon"></i><b class="v20-night-sweep"></b>' + particles('v20-night-star', 17, 43) + '</div><div class="v20-underground-pulse"><i></i><i></i><i></i></div>';
    } else {
      action = '<div class="v20-sprout-reveal"></div><div class="v20-sprout-breath"></div><div class="v20-study-glints">' + particles('v20-natural-glint', 16, 61) + '</div>';
    }
    return '<div class="v20-cinematic-frame v20-world-study v20-effect-' + effect + '" style="--v20-duration:' + duration + 'ms">' +
      studyShots(effect) + action + '<div class="v20-study-foreground"></div><div class="v20-depth-veil"></div></div>';
  }

  function markupFor(task, effect, duration) {
    if (task.indexOf('lushan-') === 0) return lushanMarkup(effect, duration);
    if (task.indexOf('xuemei-') === 0) return plumMarkup(effect, duration);
    if (task.indexOf('flowers-') === 0) return flowerMarkup(effect, duration);
    return studyMarkup(effect, duration);
  }

  function renderV20(effect, source) {
    const task = currentTask();
    effect = String(effect || '');
    if (!supported(task, effect)) return false;
    serial += 1;
    const duration = sceneDuration(task, effect);
    if (!level.classList.contains('v20-cinematic-active')) level.classList.add('v20-cinematic-active');
    fx.className = 'stage-fx cinematic-fx v19-scene-host v20-scene-host effect-' + effect + ' task-effect-' + task;
    fx.dataset.v20SceneKey = task + ':' + effect + ':' + serial;
    fx.setAttribute('aria-label', '正在播放完整场景动画');
    fx.innerHTML = markupFor(task, effect, duration);
    document.dispatchEvent(new CustomEvent('poetry:v20-scene-rendered', {
      detail: { version: VERSION, task: task, effect: effect, duration: duration, source: source || 'renderRichEffect' }
    }));
    return true;
  }

  function enhancedRender(effect) {
    if (renderV20(effect, 'renderRichEffect')) return;
    if (level.classList.contains('v20-cinematic-active')) level.classList.remove('v20-cinematic-active');
    if (typeof upstreamRender === 'function') return upstreamRender.apply(this, arguments);
  }

  Object.defineProperty(enhancedRender, '__v20SceneAnimations', { value: true });
  Object.defineProperty(enhancedRender, '__v19CinematicScenes', { value: true });
  Object.defineProperty(enhancedRender, '__v16LushanPovHook', { value: true });

  function install() {
    const current = window.renderRichEffect;
    if (current === enhancedRender) return;
    if (typeof current === 'function' && !current.__v20SceneAnimations) upstreamRender = current;
    window.renderRichEffect = enhancedRender;
  }

  function preload() {
    const pending = Object.keys(scenes).map(function (key) { return scenes[key]; }).filter(function (src, index, all) {
      return src.indexOf(ROOT) === 0 && all.indexOf(src) === index;
    });
    function loadNext() {
      const src = pending.shift();
      if (!src) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      window.setTimeout(scheduleNext, 90);
    }
    function scheduleNext() {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(loadNext, { timeout: 700 });
      else window.setTimeout(loadNext, 60);
    }
    scheduleNext();
  }

  const fxObserver = new MutationObserver(function () {
    if (!fx.firstElementChild && level.classList.contains('v20-cinematic-active')) level.classList.remove('v20-cinematic-active');
  });
  fxObserver.observe(fx, { childList: true });

  window.V20SceneAnimations = Object.freeze({
    version: VERSION,
    duration: sceneDuration,
    play: function (effect) { return renderV20(effect, 'public-api'); },
    install: install,
    scenes: scenes
  });

  install();
  if (document.readyState === 'complete') window.setTimeout(preload, 0);
  else window.addEventListener('load', preload, { once: true });
  window.addEventListener('load', install, { once: true });
})();
