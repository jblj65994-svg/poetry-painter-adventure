(function () {
  'use strict';

  const byId = id => document.getElementById(id);
  const assetRoot = 'assets/objects/v15/';

  function objectImage(name, className = '', focus = false) {
    const focusAttribute = focus ? ' data-focus="true"' : '';
    return `<img class="v15-object ${className}" src="${assetRoot}${name}-v15.png" alt="" aria-hidden="true" draggable="false"${focusAttribute}>`;
  }

  function mistLayers(extra = '') {
    return `<span class="v15-natural-mist v15-mist-back ${extra}"></span><span class="v15-natural-mist v15-mist-middle ${extra}"></span><span class="v15-natural-mist v15-mist-front ${extra}"></span>`;
  }

  function softParticles(kind, count) {
    return Array.from({ length: count }, (_, index) => `<i class="v15-soft-particle v15-${kind}-particle particle-${index}"></i>`).join('');
  }

  function lushanMarkup(effect, task) {
    const base = `v15-effect-scene v15-lushan-effect v15-lushan-${effect}`;

    if (effect === 'panorama') {
      return `<span class="${base}"><span class="v15-lushan-backdrop v15-ridge-backdrop"></span>${mistLayers('v15-panorama-mist')}${objectImage('pavilion', 'v15-lushan-pavilion v15-pavilion-wide', true)}${objectImage('crane', 'v15-lushan-crane v15-crane-one')}</span>`;
    }

    if (effect === 'depth' || effect === 'viewpoint') {
      return `<span class="${base}">${mistLayers('v15-depth-mist')}${objectImage('rowboat', 'v15-lushan-boat v15-boat-near', true)}${objectImage('pavilion', 'v15-lushan-pavilion v15-pavilion-middle')}${objectImage('crane', 'v15-lushan-crane v15-crane-far')}</span>`;
    }

    if (effect === 'far') {
      return `<span class="${base}">${mistLayers('v15-far-mist')}${objectImage('rowboat', 'v15-lushan-boat v15-boat-far', true)}${objectImage('crane', 'v15-lushan-crane v15-crane-two')}</span>`;
    }

    if (effect === 'crane-flight') {
      return `<span class="${base}">${mistLayers('v15-flight-mist')}${objectImage('crane', 'v15-lushan-crane v15-crane-flight', true)}</span>`;
    }

    const insideClass = task === 'lushan-2' ? ' v15-peak-inside' : '';
    return `<span class="${base}${insideClass}"><span class="v15-lushan-backdrop v15-peak-backdrop"></span>${mistLayers('v15-peak-mist')}${objectImage('pavilion', 'v15-lushan-pavilion v15-pavilion-peak', true)}${objectImage('crane', 'v15-lushan-crane v15-crane-one')}</span>`;
  }

  function xuemeiMarkup(effect) {
    const base = `v15-effect-scene v15-xuemei-effect v15-xuemei-${effect}`;

    if (effect === 'snow' || effect === 'snow-melt') {
      return `<span class="${base}">${objectImage('snow-cloud', 'v15-snow-cloud', true)}${objectImage('snow-crystals', 'v15-snow-crystals v15-crystals-one')}${objectImage('snow-crystals', 'v15-snow-crystals v15-crystals-two')}${objectImage('snow-mound', 'v15-snow-mound')}${softParticles('snow', 9)}</span>`;
    }

    if (effect === 'scent' || effect === 'blossom') {
      return `<span class="${base}">${objectImage('plum-branch-snow', 'v15-plum-branch', true)}${softParticles('plum-petal', 6)}</span>`;
    }

    return `<span class="${base}">${objectImage('snow-cloud', 'v15-snow-cloud')}${objectImage('snow-crystals', 'v15-snow-crystals v15-crystals-one')}${objectImage('snow-mound', 'v15-snow-mound')}${objectImage('plum-branch-snow', 'v15-plum-branch', true)}${softParticles('plum-petal', 5)}${softParticles('snow', 7)}</span>`;
  }

  function farmMarkup(effect) {
    const base = `v15-effect-scene v15-farm-effect v15-farm-${effect}`;

    if (effect === 'petals') {
      return `<span class="${base}">${objectImage('petal-basket', 'v15-petal-basket', true)}${objectImage('compost-box', 'v15-compost-box')}${softParticles('petal', 7)}</span>`;
    }

    if (effect === 'compost') {
      return `<span class="${base}">${objectImage('petal-basket', 'v15-petal-basket v15-basket-pour', true)}${objectImage('compost-box', 'v15-compost-box v15-box-receive')}${softParticles('petal', 8)}<span class="v15-compost-steam"></span></span>`;
    }

    if (effect === 'fertilize') {
      return `<span class="${base}">${objectImage('compost-sack', 'v15-compost-sack v15-sack-pour', true)}${objectImage('soil-mound', 'v15-soil-mound v15-soil-fed')}${softParticles('earth', 9)}</span>`;
    }

    if (effect === 'soil') {
      return `<span class="${base}">${objectImage('compost-sack', 'v15-compost-sack', true)}${objectImage('compost-box', 'v15-compost-box')}${objectImage('soil-mound', 'v15-soil-mound')}</span>`;
    }

    if (effect === 'cycle') {
      return `<span class="${base}"><span class="v15-natural-sunrise"></span>${objectImage('soil-mound', 'v15-soil-mound')}${objectImage('seed', 'v15-farm-seed v15-growth-phase phase-seed')}${objectImage('sprout', 'v15-farm-sprout v15-growth-phase phase-sprout')}${objectImage('young-plant', 'v15-young-plant v15-growth-phase phase-young', true)}</span>`;
    }

    if (effect === 'sprout') {
      return `<span class="${base}">${objectImage('soil-mound', 'v15-soil-mound')}${objectImage('sprout', 'v15-farm-sprout', true)}${softParticles('earth', 8)}</span>`;
    }

    if (effect === 'young') {
      return `<span class="${base}">${objectImage('soil-mound', 'v15-soil-mound')}${objectImage('young-plant', 'v15-young-plant', true)}${softParticles('earth', 5)}</span>`;
    }

    if (effect === 'bloom' || effect === 'pot-grow') {
      return `<span class="${base}">${objectImage('soil-mound', 'v15-soil-mound')}${objectImage('young-plant', 'v15-young-plant')}${objectImage('flower-cluster', 'v15-flower-cluster', true)}${softParticles('pollen', 8)}</span>`;
    }

    if (effect === 'water') {
      return `<span class="${base}">${objectImage('soil-mound', 'v15-soil-mound')}${objectImage('watering-can', 'v15-watering-can', true)}<span class="v15-water-drops">${softParticles('water', 8)}</span><span class="v15-wet-earth"></span></span>`;
    }

    return `<span class="${base}"><span class="v15-natural-sunrise" data-focus="true"></span>${objectImage('young-plant', 'v15-young-plant')}${objectImage('flower-cluster', 'v15-flower-cluster')}</span>`;
  }

  function studyMarkup(effect) {
    const base = `v15-effect-scene v15-study-effect v15-study-${effect}`;

    if (effect === 'book') {
      return `<span class="${base}">${objectImage('garden-book', 'v15-garden-book', true)}<span class="v15-page-breeze"></span></span>`;
    }

    if (effect === 'seed') {
      return `<span class="${base}">${objectImage('garden-book', 'v15-garden-book')}${objectImage('garden-pot', 'v15-garden-pot')}${objectImage('seed', 'v15-study-seed', true)}</span>`;
    }

    if (effect === 'soil-cover') {
      return `<span class="${base}">${objectImage('garden-pot', 'v15-garden-pot', true)}${objectImage('soil-mound', 'v15-study-soil')}${softParticles('earth', 6)}</span>`;
    }

    if (effect === 'water') {
      return `<span class="${base}">${objectImage('garden-pot', 'v15-garden-pot')}${objectImage('watering-can', 'v15-watering-can v15-study-watering-can', true)}<span class="v15-water-drops">${softParticles('water', 7)}</span></span>`;
    }

    if (effect === 'night-wait' || effect === 'cycle') {
      return `<span class="${base}"><span class="v15-natural-night"></span><span class="v15-natural-moon" data-focus="true"></span>${objectImage('garden-pot', 'v15-garden-pot')}${softParticles('star', 8)}</span>`;
    }

    if (effect === 'sprout' || effect === 'bloom' || effect === 'pot-grow') {
      return `<span class="${base}">${objectImage('garden-pot', 'v15-garden-pot')}${objectImage('sprout', 'v15-study-sprout', true)}${softParticles('earth', 6)}</span>`;
    }

    return `<span class="${base}">${objectImage('garden-book', 'v15-garden-book')}${objectImage('garden-pot', 'v15-garden-pot')}${objectImage('young-plant', 'v15-study-young-plant', true)}${softParticles('pollen', 6)}</span>`;
  }

  function wrongMarkup() {
    return '<span class="v15-effect-scene v15-soft-wrong"><i class="v15-wrong-cloud"></i><b>再试一次</b></span>';
  }

  window.renderRichEffect = function (effect) {
    const fx = byId('stageFx');
    const level = byId('levelScreen');
    if (!fx || !level) return;

    const task = level.dataset.task || '';
    const world = task.split('-')[0];
    const safeEffect = String(effect).replace(/[^a-z-]/g, '');
    fx.className = `stage-fx cinematic-fx v15-cinematic-fx effect-${safeEffect} task-effect-${task}`;

    if (['panorama', 'peak', 'depth', 'viewpoint', 'far', 'crane-flight'].includes(effect)) fx.innerHTML = lushanMarkup(effect, task);
    else if (['snow', 'snow-melt', 'scent', 'blossom', 'harmony'].includes(effect)) fx.innerHTML = xuemeiMarkup(effect);
    else if (['petals', 'soil', 'cycle', 'sprout', 'young', 'bloom', 'pot-grow', 'water', 'sun', 'compost', 'fertilize'].includes(effect)) {
      fx.innerHTML = world === 'study' ? studyMarkup(effect) : farmMarkup(effect);
    } else if (['book', 'seed', 'soil-cover', 'night-wait', 'hands', 'idea'].includes(effect)) fx.innerHTML = studyMarkup(effect);
    else fx.innerHTML = wrongMarkup();
  };

  function farmState(step, progress) {
    if (step === 0) {
      return `<span class="v15-scene-state v15-farm-state v15-farm-compost-state">${progress > 0 ? objectImage('compost-box', 'v15-compost-box', true) : ''}</span>`;
    }

    if (step === 1) {
      return `<span class="v15-scene-state v15-farm-state v15-farm-ready-state">${objectImage('soil-mound', 'v15-soil-mound', progress > 0)}</span>`;
    }

    let crop = objectImage('seed', 'v15-farm-seed', true);
    if (progress === 2) crop = objectImage('sprout', 'v15-farm-sprout', true);
    if (progress >= 3) crop = `${objectImage('young-plant', 'v15-young-plant')}${objectImage('flower-cluster', 'v15-flower-cluster', true)}`;
    return `<span class="v15-scene-state v15-farm-state v15-farm-growing-state">${objectImage('soil-mound', 'v15-soil-mound')}${crop}</span>`;
  }

  function studyState(step, progress) {
    if (step === 0) return '<span class="v15-scene-state v15-study-state v15-study-book-state"></span>';

    let plant = '';
    if (step === 1 && progress >= 1) plant = objectImage('seed', 'v15-study-seed', true);
    if (step === 2 && progress >= 3) plant = objectImage('sprout', 'v15-study-sprout', true);
    return `<span class="v15-scene-state v15-study-state v15-study-pot-state">${step === 2 ? objectImage('garden-pot', 'v15-garden-pot', !plant) : ''}${plant}</span>`;
  }

  function xuemeiState(step, progress) {
    return '<span class="v15-scene-state v15-xuemei-state"></span>';
  }

  function lushanState(step) {
    return `<span class="v15-scene-state v15-lushan-state v15-lushan-state-${step}">${mistLayers('v15-state-mist')}</span>`;
  }

  function stateMarkup(world, step, progress) {
    if (world === 'flowers') return farmState(step, progress);
    if (world === 'study') return studyState(step, progress);
    if (world === 'xuemei') return xuemeiState(step, progress);
    return lushanState(step);
  }

  window.renderPoemState = function (world, step) {
    const state = byId('sceneState');
    if (!state) return;

    const safeWorld = ['lushan', 'xuemei', 'flowers', 'study'].includes(world) ? world : 'lushan';
    const safeStep = Math.max(0, Math.min(2, Number(step) || 0));
    state.className = `scene-state v15-state state-${safeWorld} state-step-${safeStep} state-progress-0`;
    state.dataset.world = safeWorld;
    state.dataset.step = String(safeStep);
    state.dataset.progress = '0';
    state.innerHTML = stateMarkup(safeWorld, safeStep, 0);
  };

  window.updatePoemState = function (task, progress) {
    const state = byId('sceneState');
    if (!state) return;

    const match = String(task).match(/^(lushan|xuemei|flowers|study)-(\d)$/);
    const world = match ? match[1] : (state.dataset.world || 'lushan');
    const step = match ? Number(match[2]) : Number(state.dataset.step || 0);
    const safeProgress = Math.max(0, Math.min(3, Number(progress) || 0));

    state.className = `scene-state v15-state state-${world} state-step-${step} state-progress-${safeProgress}`;
    state.dataset.world = world;
    state.dataset.step = String(step);
    state.dataset.progress = String(safeProgress);
    state.innerHTML = stateMarkup(world, step, safeProgress);

    const focus = state.querySelector('[data-focus="true"]');
    if (focus && typeof focus.animate === 'function') {
      focus.animate([
        { transform: 'translate3d(0,8px,0) scale(.9)', opacity: .25 },
        { transform: 'translate3d(0,-4px,0) scale(1.06)', opacity: 1, offset: .72 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
      ], { duration: 680, easing: 'cubic-bezier(.2,.8,.25,1)' });
    }
  };
})();
