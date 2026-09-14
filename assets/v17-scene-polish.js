(function () {
  'use strict';

  var VERSION = '17.0.0';
  var level = document.getElementById('levelScreen');
  var fx = document.getElementById('stageFx');
  var previousRender = window.renderRichEffect;
  var objectRoot = 'assets/objects/v15/';
  var v17Root = 'assets/objects/v17/';
  var preloadedWorlds = Object.create(null);
  var preloadPlans = {
    lushan: [
      'assets/scenes/lushan-boat-pov-v16.jpg',
      'assets/scenes/lushan-crane-pov-v16.jpg',
      'assets/objects/v16/lushan-walk-pov-v16.png',
      'assets/objects/v16/lushan-boat-pov-v16.png',
      'assets/objects/v16/lushan-crane-wings-v16.png'
    ],
    flowers: [
      'assets/objects/v17/farm-bed-ready-v17.png',
      'assets/objects/v17/farm-bed-fed-v17.png',
      'assets/objects/v17/farm-bed-sprout-v17.png',
      'assets/objects/v17/farm-bed-young-v17.png',
      'assets/objects/v17/farm-bed-bloom-v17.png'
    ],
    study: [
      'assets/objects/v17/garden-book-clean-v17.png',
      'assets/objects/v17/garden-pot-empty-v17.png',
      'assets/objects/v17/garden-pot-covered-v17.png',
      'assets/objects/v17/garden-pot-sprout-v17.png'
    ]
  };

  if (!level || !fx || typeof previousRender !== 'function') return;

  function preloadWorld(world) {
    if (!preloadPlans[world] || preloadedWorlds[world]) return;
    preloadedWorlds[world] = true;
    preloadPlans[world].forEach(function (src) {
      var preloadImage = new Image();
      preloadImage.decoding = 'async';
      preloadImage.src = src;
    });
  }

  function image(name, className) {
    return '<img class="v17-object ' + className + '" src="' + objectRoot + name + '-v15.png" alt="" aria-hidden="true" draggable="false">';
  }

  function v17Image(filename, className) {
    return '<img class="v17-object ' + className + '" src="' + v17Root + filename + '" alt="" aria-hidden="true" draggable="false">';
  }

  function sparkles(count) {
    var html = '';
    for (var i = 0; i < count; i += 1) {
      html += '<i class="v17-sparkle v17-sparkle-' + i + '"></i>';
    }
    return html;
  }

  function soilFace() {
    return '<span class="v17-soil-face" aria-hidden="true"><i></i><i></i><b></b></span>';
  }

  function gardenBed(state) {
    var plateState = state === 'fed' || state === 'water'
      ? 'fed'
      : state === 'young'
        ? 'young'
        : state === 'sprout'
          ? 'sprout'
          : state === 'bloom'
            ? 'bloom'
            : 'ready';
    return '<span class="v17-bed v17-bed-' + state + '">' +
      '<span class="v17-bed-shadow"></span>' +
      v17Image('farm-bed-' + plateState + '-v17.png', 'v17-bed-plate') +
      '<span class="v17-bed-wetness"></span>' +
      (state === 'fed' ? soilFace() + sparkles(7) : '') +
      (state === 'bloom' ? sparkles(8) : '') +
      '</span>';
  }

  function compostScene() {
    var petals = '';
    for (var i = 0; i < 12; i += 1) petals += '<i class="v17-compost-petal v17-petal-' + i + '"></i>';
    return '<span class="v17-scene v17-compost-scene">' +
      '<span class="v17-scene-ground"></span>' +
      image('petal-basket', 'v17-compost-basket') +
      image('compost-box', 'v17-compost-box') +
      '<span class="v17-compost-stream">' + petals + '</span>' +
      '<span class="v17-compost-warmth"></span>' + sparkles(5) +
      '</span>';
  }

  function fertilizerScene() {
    var grains = '';
    for (var i = 0; i < 20; i += 1) grains += '<i class="v17-fertilizer-grain v17-grain-' + i + '"></i>';
    return '<span class="v17-scene v17-fertilizer-scene">' +
      '<span class="v17-scene-ground"></span>' + gardenBed('fed') +
      image('compost-sack', 'v17-fertilizer-bag') +
      '<span class="v17-fertilizer-mouth"></span><span class="v17-fertilizer-flow">' + grains + '</span>' +
      '</span>';
  }

  function waterRig(mode) {
    return '<span class="v17-water-rig v17-water-' + mode + '">' +
      image('watering-can', 'v17-watering-can') +
      '<span class="v17-water-stream"><i></i><i></i><i></i><i></i><i></i><i></i><b></b></span>' +
      '</span>';
  }

  function flowerScene(state) {
    return '<span class="v17-scene v17-flower-scene v17-flower-' + state + '">' +
      '<span class="v17-scene-ground"></span>' + gardenBed(state) +
      (state === 'water' ? waterRig('garden') : '') +
      '<span class="v17-soft-sun"></span>' + (state === 'bloom' ? sparkles(9) : '') +
      '</span>';
  }

  function potStack(content, className, state) {
    var safeState = state === 'sprout' ? 'sprout' : state === 'covered' ? 'covered' : 'hole';
    var filename = safeState === 'sprout' ? 'garden-pot-sprout-v17.png' : safeState === 'covered' ? 'garden-pot-covered-v17.png' : 'garden-pot-empty-v17.png';
    return '<span class="v17-pot-stack ' + (className || '') + '">' +
      '<span class="v17-pot-shadow"></span>' +
      v17Image(filename, 'v17-pot-state v17-pot-state-' + safeState) +
      (content || '') +
      v17Image(filename, 'v17-pot-rim-mask v17-pot-state-' + safeState) +
      '</span>';
  }

  function bookScene() {
    return '<span class="v17-scene v17-book-scene">' +
      '<span class="v17-table-light"></span>' +
      v17Image('garden-book-clean-v17.png', 'v17-book-image') +
      '<span class="v17-page-sheen"></span>' + sparkles(4) +
      '</span>';
  }

  function seedScene(covered) {
    var inside = covered
      ? '<span class="v17-cover-soil"></span>'
      : image('seed', 'v17-seed v17-seed-drop') + '<span class="v17-seed-shadow"></span>';
    return '<span class="v17-scene v17-pot-scene ' + (covered ? 'v17-pot-covered' : 'v17-pot-seeding') + '">' +
      '<span class="v17-table-light"></span>' + potStack(inside, '', covered ? 'covered' : 'hole') + (covered ? sparkles(5) : '') +
      '</span>';
  }

  function studyScene(state) {
    var content = '';
    if (state === 'sprout') content = image('sprout', 'v17-pot-plant v17-pot-sprout');
    var scene = '<span class="v17-scene v17-study-scene v17-study-' + state + '">' +
      '<span class="v17-table-light"></span>' + potStack(content, 'v17-study-pot', state === 'sprout' ? 'sprout' : 'covered') +
      (state === 'water' ? waterRig('pot') : '') +
      (state === 'night' ? '<span class="v17-night-wash"><i></i></span>' : '') +
      (state === 'sprout' ? '<span class="v17-morning-light"></span>' + sparkles(7) : '') +
      '</span>';
    return scene;
  }

  function customScene(task, effect) {
    if (task === 'flowers-0' && effect === 'compost') return compostScene();
    if (task === 'flowers-1' && effect === 'fertilize') return fertilizerScene();
    if (task === 'flowers-2') {
      if (effect === 'water') return flowerScene('water');
      if (effect === 'sprout') return flowerScene('sprout');
      if (effect === 'young') return flowerScene('young');
      if (effect === 'bloom') return flowerScene('bloom');
    }
    if (task === 'study-0' && effect === 'book') return bookScene();
    if (task === 'study-1' && effect === 'seed') return seedScene(false);
    if (task === 'study-1' && effect === 'soil-cover') return seedScene(true);
    if (task === 'study-2') {
      if (effect === 'water') return studyScene('water');
      if (effect === 'night-wait') return studyScene('night');
      if (effect === 'sprout') return studyScene('sprout');
    }
    return '';
  }

  function finishMarkup(task, effect, markup) {
    level.classList.remove('v17-farm-active', 'v17-study-active');
    level.classList.add(task.indexOf('study-') === 0 ? 'v17-study-active' : 'v17-farm-active');
    fx.className = 'stage-fx cinematic-fx v17-scene-host effect-' + effect + ' task-effect-' + task;
    fx.innerHTML = markup;
    fx.setAttribute('aria-label', '画面中的操作正在发生');
    document.dispatchEvent(new CustomEvent('poetry:v17-scene-rendered', {
      detail: { version: VERSION, task: task, effect: effect }
    }));
  }

  function polishPov(task, effect) {
    if (task.indexOf('lushan-') !== 0) return;
    level.classList.add('v17-pov-polished');
    var pov = fx.querySelector('.v16-pov');
    if (!pov) return;
    pov.classList.add('v17-pov-scene');
    if (effect === 'panorama') pov.classList.add('v17-walk-panorama');
    if (effect === 'peak') pov.classList.add('v17-walk-arrived');
  }

  function enhancedRender(effect) {
    var task = level.getAttribute('data-task') || '';
    var markup = customScene(task, String(effect || ''));
    if (markup) {
      finishMarkup(task, String(effect || ''), markup);
      return;
    }
    level.classList.remove('v17-farm-active', 'v17-study-active');
    var result = previousRender.apply(this, arguments);
    polishPov(task, String(effect || ''));
    return result;
  }

  /* V16 performs one final hook installation on window.load. Mark this wrapper
     as an existing V16 hook so it cannot become V16's upstream, then restore
     V17 immediately after that load listener runs. */
  Object.defineProperty(enhancedRender, '__v17ScenePolish', { value: true });
  Object.defineProperty(enhancedRender, '__v16LushanPovHook', { value: true });
  function install() { window.renderRichEffect = enhancedRender; }
  install();
  window.addEventListener('load', install, { once: true });

  /* The opening story gives these plates time to enter the browser cache, so
     the first child action begins with a complete image instead of a blank pop. */
  document.addEventListener('pointerdown', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('[data-level]') : null;
    if (target) preloadWorld(target.getAttribute('data-level'));
  }, true);

  /* V16 may repaint a POV from its observer after the wrapper returns. */
  document.addEventListener('poetry:v16-pov-rendered', function (event) {
    var detail = event && event.detail ? event.detail : {};
    polishPov(detail.task || '', detail.effect || '');
  });

  document.dispatchEvent(new CustomEvent('poetry:v17-scene-ready', { detail: { version: VERSION } }));
})();
