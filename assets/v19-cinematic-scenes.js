(function v19CinematicScenes() {
  'use strict';

  const VERSION = '19.0.0';
  const level = document.getElementById('levelScreen');
  const fx = document.getElementById('stageFx');
  const camera = document.getElementById('sceneCamera');
  const taskArea = document.getElementById('taskArea');
  if (!level || !fx || !camera || !taskArea) return;

  const sceneRoot = 'assets/scenes/';
  const v19SceneRoot = 'assets/scenes/v19/';
  const objectRoot = 'assets/objects/v15/';
  const v16ObjectRoot = 'assets/objects/v16/';
  const v17ObjectRoot = 'assets/objects/v17/';
  const scenes = {
    lushanBase: sceneRoot + 'lushan-bg-clean-v10.jpg',
    pavilion: v19SceneRoot + 'lushan-pavilion-interior-v19.jpg',
    boat: sceneRoot + 'lushan-boat-pov-v16.jpg',
    craneNear: sceneRoot + 'lushan-crane-pov-v16.jpg',
    craneWhole: v19SceneRoot + 'lushan-whole-massif-v19.jpg',
    xuemei: v19SceneRoot + 'xuemei-plum-tree-v19.jpg',
    flowers: sceneRoot + 'flowers-bg-clean-v10.jpg',
    study: sceneRoot + 'study-bg-clean-v10.jpg',
    studyBookOpen: v19SceneRoot + 'study-book-open-v19.jpg',
    studyGarden: v19SceneRoot + 'study-garden-v19.jpg'
  };

  let upstreamRender = null;
  let serial = 0;
  let timers = [];
  let lastTask = '';

  function removeClasses(node, names) {
    const present = names.filter(function (name) { return node.classList.contains(name); });
    if (present.length) node.classList.remove.apply(node.classList, present);
  }

  function setClass(node, name, enabled) {
    if (node.classList.contains(name) !== enabled) node.classList.toggle(name, enabled);
  }

  function later(callback, delay) {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function currentTask() {
    return String(level.dataset.task || '');
  }

  function preload() {
    Object.keys(scenes).forEach(function (key) {
      const image = new Image();
      image.decoding = 'async';
      image.src = scenes[key];
    });
    [
      objectRoot + 'seed-v15.png',
      objectRoot + 'sprout-v15.png',
      objectRoot + 'young-plant-v15.png',
      objectRoot + 'flower-cluster-v15.png',
      objectRoot + 'watering-can-v15.png',
      objectRoot + 'compost-sack-v15.png',
      v16ObjectRoot + 'lushan-boat-pov-v16.png',
      v16ObjectRoot + 'lushan-crane-wings-v16.png',
      v17ObjectRoot + 'garden-book-clean-v17.png'
    ].forEach(function (src) {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
    });
  }

  function setCamera(src, transition) {
    if (!src) return;
    const url = 'url("' + src + '")';
    if (camera.style.backgroundImage === url) return;
    camera.style.backgroundImage = url;
    camera.dataset.v19Scene = src;
    if (transition && typeof camera.animate === 'function') {
      camera.getAnimations().forEach(function (animation) {
        if (String(animation.id || '').indexOf('v19-scene-') === 0) animation.cancel();
      });
      const animation = camera.animate([
        { opacity: .26, filter: 'brightness(.88) saturate(.92)', transform: 'scale(1.045)' },
        { opacity: 1, filter: 'brightness(1) saturate(1)', transform: 'scale(1)' }
      ], { duration: 680, easing: 'cubic-bezier(.2,.72,.22,1)', fill: 'forwards' });
      animation.id = 'v19-scene-reveal';
    }
  }

  function baseSceneForTask(task) {
    if (task.indexOf('lushan-') === 0) {
      if (task === 'lushan-0' && level.classList.contains('v19-pavilion-entered')) return scenes.pavilion;
      if (task === 'lushan-1' && level.classList.contains('v19-boat-entered')) return scenes.boat;
      if (task === 'lushan-2' && level.classList.contains('v19-flight-entered')) return scenes.craneWhole;
      return scenes.lushanBase;
    }
    if (task.indexOf('xuemei-') === 0) return scenes.xuemei;
    if (task.indexOf('flowers-') === 0) return scenes.flowers;
    if (task === 'study-0' && level.classList.contains('v19-garden-entered')) return scenes.studyGarden;
    if (task === 'study-0' && level.classList.contains('v19-book-opened')) return scenes.studyBookOpen;
    if (task === 'study-0') return scenes.study;
    if (task === 'study-1' || task === 'study-2') return scenes.studyGarden;
    return '';
  }

  function resetWorldClasses(nextTask) {
    const classes = [
      'v19-cinematic-active', 'v19-pavilion-entered', 'v19-boat-entered',
      'v19-flight-entered', 'v19-book-opened', 'v19-garden-entered',
      'v17-farm-active', 'v17-study-active', 'v17-pov-polished',
      'v16-pov-active', 'v16-pov-walk', 'v16-pov-boat', 'v16-pov-flight'
    ];
    if (nextTask !== lastTask) {
      const removable = classes.filter(function (name) {
        if (name === 'v19-pavilion-entered' && nextTask === 'lushan-0' && lastTask === 'lushan-0') return;
        return true;
      });
      removeClasses(level, removable);
    }
  }

  function syncTaskScene(force) {
    if (!level.classList.contains('active')) return;
    if (level.classList.contains('story-paused')) {
      clearTimers();
      removeClasses(level, ['v19-cinematic-active', 'v19-pavilion-entered', 'v19-boat-entered', 'v19-flight-entered', 'v19-book-opened', 'v19-garden-entered']);
      lastTask = '';
      return;
    }
    const task = currentTask();
    if (!task) return;
    if (force || task !== lastTask) {
      clearTimers();
      resetWorldClasses(task);
      const src = baseSceneForTask(task);
      if (src) setCamera(src, Boolean(lastTask && task !== lastTask));
      lastTask = task;
    } else {
      const expected = baseSceneForTask(task);
      if (expected && String(camera.style.backgroundImage || '').indexOf(expected) < 0) setCamera(expected, true);
    }
    setClass(level, 'v19-study-garden-task', task === 'study-1' || task === 'study-2');
    setClass(level, 'v19-xuemei-tree-task', task.indexOf('xuemei-') === 0);
    setClass(level, 'v19-flowers-field-task', task.indexOf('flowers-') === 0);
  }

  function object(filename, className) {
    return '<img class="v19-object ' + className + '" src="' + objectRoot + filename + '" alt="" aria-hidden="true" draggable="false">';
  }

  function particles(className, count) {
    let html = '';
    for (let index = 0; index < count; index += 1) {
      html += '<i class="' + className + ' ' + className + '-' + index + '"></i>';
    }
    return html;
  }

  function pavilionMarkup(effect) {
    const alreadyInside = level.classList.contains('v19-pavilion-entered');
    return '<div class="v16-pov v19-cinematic-frame v19-pavilion-scene ' + (alreadyInside ? 'v19-inside-only' : 'v19-entering') + '">' +
      (alreadyInside ? '' : '<div class="v19-full-layer v19-pavilion-approach"></div><div class="v19-doorway-wash"></div>') +
      '<div class="v19-full-layer v19-pavilion-interior v19-pavilion-' + effect + '"></div>' +
      '<div class="v19-sun-dust">' + particles('v19-dust', 11) + '</div>' +
      '<div class="v19-pavilion-light"></div>' +
      '</div>';
  }

  function boatMarkup() {
    return '<div class="v16-pov v19-cinematic-frame v19-boat-scene">' +
      '<div class="v19-full-layer v19-boat-landscape"></div>' +
      '<div class="v19-water-speed v19-water-speed-a"></div><div class="v19-water-speed v19-water-speed-b"></div>' +
      '<div class="v19-bank-mist v19-bank-mist-left"></div><div class="v19-bank-mist v19-bank-mist-right"></div>' +
      '<img class="v19-boat-foreground" src="' + v16ObjectRoot + 'lushan-boat-pov-v16.png" alt="" aria-hidden="true" draggable="false">' +
      '<div class="v19-bow-wake v19-bow-wake-left"></div><div class="v19-bow-wake v19-bow-wake-right"></div>' +
      '<div class="v19-oar-splash">' + particles('v19-splash', 12) + '</div>' +
      '<div class="v19-lens-vignette"></div>' +
      '</div>';
  }

  function craneMarkup() {
    return '<div class="v16-pov v19-cinematic-frame v19-crane-scene">' +
      '<div class="v19-full-layer v19-crane-near"></div>' +
      '<div class="v19-full-layer v19-crane-whole"></div>' +
      '<div class="v19-cloud-stream v19-cloud-stream-one">' + particles('v19-flight-cloud', 5) + '</div>' +
      '<div class="v19-cloud-stream v19-cloud-stream-two">' + particles('v19-flight-cloud-near', 4) + '</div>' +
      '<img class="v19-crane-wings" src="' + v16ObjectRoot + 'lushan-crane-wings-v16.png" alt="" aria-hidden="true" draggable="false">' +
      '<div class="v19-flight-glow"></div><div class="v19-lens-vignette"></div>' +
      '</div>';
  }

  function plumMarkup(effect) {
    const snow = effect === 'snow' || effect === 'harmony';
    const scent = effect === 'scent' || effect === 'harmony';
    return '<div class="v19-cinematic-frame v19-plum-scene v19-plum-' + effect + '">' +
      '<div class="v19-full-layer v19-plum-landscape"></div>' +
      (snow ? '<div class="v19-natural-snow">' + particles('v19-snow-crystal', 24) + '</div>' : '') +
      (scent ? '<div class="v19-scent-clouds">' + particles('v19-scent-puff', 9) + '</div>' : '') +
      '<div class="v19-blossom-breath"></div>' +
      (effect === 'harmony' ? '<div class="v19-harmony-glints">' + particles('v19-harmony-glint', 8) + '</div>' : '') +
      '</div>';
  }

  function farmGround(state) {
    return '<div class="v19-field-state v19-field-' + state + '"><span class="v19-field-warmth"></span>' +
      (state === 'fed' ? '<span class="v19-soil-smile"><i></i><i></i><b></b></span>' + particles('v19-field-glint', 9) : '') +
      '</div>';
  }

  function waterArc(className) {
    return '<div class="v19-water-arc ' + className + '">' + particles('v19-water-drop', 13) + '<b></b></div>';
  }

  function farmMarkup(effect) {
    let content = farmGround(effect === 'fertilize' ? 'fed' : effect === 'water' ? 'wet' : 'fed');
    if (effect === 'fertilize') {
      content += object('compost-sack-v15.png', 'v19-fertilizer-sack') +
        '<div class="v19-compost-stream">' + particles('v19-compost-grain', 24) + '</div>';
    } else if (effect === 'water') {
      content += object('watering-can-v15.png', 'v19-farm-watering-can') + waterArc('v19-farm-water-arc');
    } else {
      const names = effect === 'sprout'
        ? ['sprout-v15.png', 'sprout-v15.png', 'sprout-v15.png']
        : effect === 'young'
          ? ['young-plant-v15.png', 'young-plant-v15.png', 'young-plant-v15.png']
          : ['flower-cluster-v15.png', 'flower-cluster-v15.png', 'flower-cluster-v15.png'];
      content += '<div class="v19-field-plants v19-field-plants-' + effect + '">' + names.map(function (name, index) {
        return object(name, 'v19-field-plant v19-field-plant-' + index);
      }).join('') + '</div>';
      if (effect === 'bloom') content += '<div class="v19-field-celebrate">' + particles('v19-field-glint', 11) + '</div>';
    }
    return '<div class="v19-cinematic-frame v19-farm-scene v19-farm-' + effect + '"><div class="v19-full-layer v19-farm-landscape"></div>' + content + '</div>';
  }

  function bookMarkup() {
    return '<div class="v16-pov v19-cinematic-frame v19-book-scene">' +
      '<div class="v19-full-layer v19-study-closed"></div>' +
      '<img class="v19-closed-book" src="' + v17ObjectRoot + 'garden-book-clean-v17.png" alt="" aria-hidden="true" draggable="false">' +
      '<div class="v19-full-layer v19-study-open"></div>' +
      '<div class="v19-page-turn v19-page-turn-one"></div><div class="v19-page-turn v19-page-turn-two"></div>' +
      '<div class="v19-book-glints">' + particles('v19-book-glint', 7) + '</div>' +
      '<div class="v19-full-layer v19-study-garden-transition"></div>' +
      '</div>';
  }

  function studyMarkup(effect) {
    let content = '<div class="v19-full-layer v19-study-garden"></div><div class="v19-pot-focus"></div>';
    if (effect === 'seed') {
      content += object('seed-v15.png', 'v19-study-seed-object') + '<span class="v19-seed-shadow"></span>';
    } else if (effect === 'soil-cover') {
      content += '<div class="v19-cover-soil">' + particles('v19-cover-grain', 18) + '</div><span class="v19-hole-covered"></span>';
    } else if (effect === 'water') {
      content += object('watering-can-v15.png', 'v19-study-watering-can') + waterArc('v19-study-water-arc');
    } else if (effect === 'night-wait') {
      content += '<div class="v19-time-lapse"><i></i><b></b>' + particles('v19-star', 12) + '</div>';
    } else if (effect === 'sprout') {
      content += object('sprout-v15.png', 'v19-study-sprout-object') + '<div class="v19-sprout-glints">' + particles('v19-book-glint', 8) + '</div>';
    }
    return '<div class="v19-cinematic-frame v19-study-garden-scene v19-study-' + effect + '">' + content + '</div>';
  }

  function supported(task, effect) {
    if (task === 'lushan-0' && (effect === 'panorama' || effect === 'peak')) return true;
    if (task === 'lushan-1' && effect === 'far') return true;
    if (task === 'lushan-2' && effect === 'crane-flight') return true;
    if (task.indexOf('xuemei-') === 0 && ['snow', 'scent', 'harmony'].indexOf(effect) >= 0) return true;
    if (task.indexOf('flowers-') === 0 && ['fertilize', 'water', 'sprout', 'young', 'bloom'].indexOf(effect) >= 0) return true;
    if (task === 'study-0' && effect === 'book') return true;
    if ((task === 'study-1' || task === 'study-2') && ['seed', 'soil-cover', 'water', 'night-wait', 'sprout'].indexOf(effect) >= 0) return true;
    return false;
  }

  function markupFor(task, effect) {
    if (task === 'lushan-0') return pavilionMarkup(effect);
    if (task === 'lushan-1') return boatMarkup();
    if (task === 'lushan-2') return craneMarkup();
    if (task.indexOf('xuemei-') === 0) return plumMarkup(effect);
    if (task.indexOf('flowers-') === 0) return farmMarkup(effect);
    if (task === 'study-0') return bookMarkup();
    return studyMarkup(effect);
  }

  function commitScene(task, effect) {
    if (task === 'lushan-0') {
      later(function () {
        level.classList.add('v19-pavilion-entered');
        setCamera(scenes.pavilion, false);
      }, 920);
    } else if (task === 'lushan-1') {
      setCamera(scenes.boat, false);
      level.classList.add('v19-boat-entered');
    } else if (task === 'lushan-2') {
      later(function () {
        level.classList.add('v19-flight-entered');
        setCamera(scenes.craneWhole, false);
      }, 1460);
    } else if (task === 'study-0') {
      later(function () { setCamera(scenes.studyBookOpen, false); level.classList.add('v19-book-opened'); }, 820);
      later(function () { setCamera(scenes.studyGarden, false); level.classList.add('v19-garden-entered'); }, 2420);
    } else if (task === 'study-1' || task === 'study-2') {
      setCamera(scenes.studyGarden, false);
      level.classList.add('v19-garden-entered');
    }
  }

  function renderV19(effect, source) {
    const task = currentTask();
    effect = String(effect || '');
    if (!supported(task, effect)) return false;
    clearTimers();
    serial += 1;
    removeClasses(level, ['v17-farm-active', 'v17-study-active', 'v17-pov-polished', 'v16-pov-active', 'v16-pov-walk', 'v16-pov-boat', 'v16-pov-flight']);
    if (!level.classList.contains('v19-cinematic-active')) level.classList.add('v19-cinematic-active');
    fx.className = 'stage-fx cinematic-fx v19-scene-host effect-' + effect + ' task-effect-' + task;
    fx.dataset.v19SceneKey = task + ':' + effect + ':' + serial;
    fx.setAttribute('aria-label', task.indexOf('lushan-') === 0 ? '正在播放第一视角庐山镜头' : '画面中的操作正在发生');
    fx.innerHTML = markupFor(task, effect);
    commitScene(task, effect);
    document.dispatchEvent(new CustomEvent('poetry:v19-scene-rendered', {
      detail: { version: VERSION, task: task, effect: effect, source: source || 'renderRichEffect' }
    }));
    return true;
  }

  function enhancedRender(effect) {
    if (renderV19(effect, 'renderRichEffect')) return;
    removeClasses(level, ['v19-cinematic-active']);
    if (typeof upstreamRender === 'function') return upstreamRender.apply(this, arguments);
  }

  Object.defineProperty(enhancedRender, '__v19CinematicScenes', { value: true });
  Object.defineProperty(enhancedRender, '__v16LushanPovHook', { value: true });

  function install() {
    const current = window.renderRichEffect;
    if (current === enhancedRender) return;
    if (typeof current === 'function' && !current.__v19CinematicScenes) upstreamRender = current;
    window.renderRichEffect = enhancedRender;
  }

  let syncQueued = false;
  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    (window.queueMicrotask || function (callback) { Promise.resolve().then(callback); })(function () {
      syncQueued = false;
      syncTaskScene(false);
    });
  }

  const observer = new MutationObserver(queueSync);
  observer.observe(level, { attributes: true, attributeFilter: ['class', 'data-task', 'data-world'] });
  observer.observe(taskArea, { childList: true });

  const fxObserver = new MutationObserver(function () {
    if (!fx.firstElementChild) removeClasses(level, ['v19-cinematic-active']);
  });
  fxObserver.observe(fx, { childList: true });

  document.addEventListener('pointerdown', function (event) {
    if (event.target && event.target.closest && event.target.closest('[data-level]')) preload();
  }, { capture: true, once: true });

  window.V19CinematicScenes = {
    version: VERSION,
    play: function (effect) { return renderV19(effect, 'public-api'); },
    sync: function () { syncTaskScene(true); },
    install: install
  };

  preload();
  install();
  window.addEventListener('load', function () { install(); syncTaskScene(true); }, { once: true });
})();
