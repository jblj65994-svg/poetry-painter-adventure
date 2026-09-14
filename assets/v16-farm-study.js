(function () {
  'use strict';

  const previousRenderRichEffect = window.renderRichEffect;
  if (typeof previousRenderRichEffect !== 'function') return;

  const assetRoot = 'assets/objects/v15/';

  function objectImage(name, className) {
    return `<img class="v16-object ${className}" src="${assetRoot}${name}-v15.png" alt="" aria-hidden="true" draggable="false">`;
  }

  function particles(className, count, positions) {
    return Array.from({ length: count }, (_, index) => {
      const position = positions[index % positions.length];
      return `<i class="${className}" style="--v16-delay:${position[0]}ms;--v16-mid-x:${position[1]}px;--v16-mid-y:${position[2]}px;--v16-end-x:${position[3]}px;--v16-end-y:${position[4]}px;--v16-size:${position[5]}px"></i>`;
    }).join('');
  }

  function potAssembly(extraClass, innerMarkup) {
    return `<span class="v16-pot-assembly ${extraClass || ''}">
      <span class="v16-pot-shadow"></span>
      ${objectImage('garden-pot', 'v16-pot-image')}
      ${innerMarkup || ''}
      ${innerMarkup ? objectImage('garden-pot', 'v16-pot-occluder') : ''}
    </span>`;
  }

  function fertilizerMarkup() {
    const feedPositions = [
      [470, -20, 40, -58, 108, 8], [515, -16, 43, -53, 112, 10],
      [560, -24, 47, -64, 115, 7], [605, -13, 41, -51, 110, 9],
      [650, -19, 45, -57, 117, 8], [695, -28, 38, -68, 107, 10],
      [740, -12, 44, -50, 113, 7], [785, -22, 49, -61, 119, 9],
      [830, -17, 42, -55, 109, 8], [875, -27, 46, -67, 116, 9],
      [920, -14, 41, -52, 111, 7], [965, -21, 48, -60, 119, 10],
      [1010, -29, 43, -69, 113, 8], [1055, -15, 46, -54, 118, 9],
      [1100, -20, 42, -59, 111, 7], [1145, -12, 48, -50, 120, 9]
    ];

    return `<span class="v16-action v16-fertilizer-action">
      <span class="v16-farm-ground-shadow"></span>
      ${objectImage('soil-mound', 'v16-farm-soil v16-soil-fed')}
      <span class="v16-fed-patch"></span>
      ${objectImage('compost-sack', 'v16-fertilizer-bag')}
      <span class="v16-fertilizer-cascade"></span>
      <span class="v16-fertilizer-stream">${particles('v16-feed-grain', feedPositions.length, feedPositions)}</span>
      <span class="v16-soil-rebound"><i></i><i></i><i></i></span>
    </span>`;
  }

  function seedMarkup() {
    return `<span class="v16-action v16-study-seed-action">
      ${potAssembly('v16-seed-pot', `
        ${objectImage('seed', 'v16-seed-into-pot')}
        <span class="v16-seed-landing-shadow"></span>
      `)}
    </span>`;
  }

  function soilCoverMarkup() {
    const earthPositions = [
      [520, -22, 8, -11, 31, 8], [565, 20, 11, 9, 33, 10],
      [610, -15, 6, -5, 35, 7], [655, 14, 14, 5, 29, 9],
      [700, -8, 9, -2, 36, 8], [745, 7, 12, 1, 32, 10],
      [790, -19, 7, -8, 34, 7], [835, 17, 13, 7, 35, 9]
    ];

    return `<span class="v16-action v16-study-cover-action">
      ${potAssembly('v16-cover-pot', `
        ${objectImage('seed', 'v16-seed-in-hole')}
        <span class="v16-cover-trowel">
          <i class="v16-trowel-grip"></i>
          <i class="v16-trowel-handle"></i>
          <i class="v16-trowel-collar"></i>
          <i class="v16-trowel-blade"></i>
          <i class="v16-trowel-load"></i>
        </span>
        <span class="v16-covered-soil"></span>
        <span class="v16-cover-grains">${particles('v16-cover-grain', earthPositions.length, earthPositions)}</span>
      `)}
    </span>`;
  }

  function waterMarkup(task) {
    const isStudy = task === 'study-2';
    const waterPositions = isStudy ? [
      [315, 10, 12, 27, 37, 7], [365, 14, 15, 31, 40, 8],
      [415, 9, 11, 26, 39, 6], [465, 16, 17, 34, 42, 8],
      [515, 12, 14, 29, 43, 7], [565, 17, 18, 35, 40, 6],
      [615, 10, 13, 27, 38, 8], [665, 15, 16, 33, 43, 7],
      [715, 11, 12, 29, 41, 6]
    ] : [
      [315, -3, 15, -10, 39, 7], [365, 1, 17, -7, 42, 8],
      [415, -5, 18, -12, 44, 6], [465, 3, 16, -5, 40, 8],
      [515, -2, 19, -9, 45, 7], [565, 4, 17, -4, 42, 6],
      [615, -4, 16, -11, 41, 8], [665, 2, 19, -6, 45, 7],
      [715, -1, 17, -8, 43, 6]
    ];
    const path = isStudy
      ? 'M50 5 C58 11 69 25 80 43'
      : 'M50 5 C48 15 45 29 42 43';

    return `<span class="v16-action v16-water-action ${isStudy ? 'v16-water-study' : 'v16-water-farm'}">
      ${isStudy ? potAssembly('v16-water-pot') : `${objectImage('soil-mound', 'v16-farm-soil v16-watered-soil')}<span class="v16-fed-patch v16-watered-patch"></span>`}
      <span class="v16-watering-rig">
        ${objectImage('watering-can', 'v16-watering-can')}
        <span class="v16-water-nozzle-flow">
          <svg class="v16-water-arc" viewBox="0 0 120 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="v16-water-glow" d="${path}"></path>
            <path class="v16-water-core" d="${path}"></path>
          </svg>
          <span class="v16-water-beads">${particles('v16-water-bead', waterPositions.length, waterPositions)}</span>
          <span class="v16-water-impact"><i></i><i></i><i></i><b></b></span>
        </span>
      </span>
    </span>`;
  }

  function customMarkup(task, effect) {
    if (task === 'flowers-1' && effect === 'fertilize') return fertilizerMarkup();
    if (task === 'study-1' && effect === 'seed') return seedMarkup();
    if (task === 'study-1' && effect === 'soil-cover') return soilCoverMarkup();
    if ((task === 'flowers-2' || task === 'study-2') && effect === 'water') return waterMarkup(task);
    return '';
  }

  window.renderRichEffect = function (effect) {
    const fx = document.getElementById('stageFx');
    const level = document.getElementById('levelScreen');
    const task = level && level.dataset ? level.dataset.task || '' : '';
    const markup = customMarkup(task, effect);

    if (!fx || !level || !markup) {
      return previousRenderRichEffect.apply(this, arguments);
    }

    const safeEffect = String(effect).replace(/[^a-z-]/g, '');
    fx.className = `stage-fx cinematic-fx v15-cinematic-fx v16-cinematic-fx effect-${safeEffect} task-effect-${task}`;
    fx.innerHTML = markup;
  };
})();
