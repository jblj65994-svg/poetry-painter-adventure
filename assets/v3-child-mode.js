(function () {
  'use strict';

  const plan = window.V3_GUIDANCE;
  if (!plan || !plan.worlds) return;

  const PHASE = Object.freeze({
    ASKING: 'asking',
    WAITING: 'waiting',
    PERFORMING: 'performing',
    HELPING: 'helping',
    DONE: 'done',
    EXITED: 'exited'
  });

  function readStoredArray(key) { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (_) { return []; } }
  function persistArray(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  function cancelElementAnimations(node) { if (!node || typeof node.getAnimations !== 'function') return; node.getAnimations().forEach(animation => animation.cancel()); }
  function animateElement(node, frames, options) { if (!node) return null; if (typeof node.animate === 'function') return node.animate(frames, options); const last = frames[frames.length - 1] || {}; if (last.transform != null) node.style.transform = last.transform; if (last.filter != null) node.style.filter = last.filter; return null; }

  const runtime = {
    phase: PHASE.EXITED,
    epoch: 0,
    wrongCount: 0,
    idleLevel: 0,
    idleTimer: null,
    actionTimer: null,
    actionResolve: null,
    assistTimer: null,
    voiceCancel: null,
    voiceGeneration: 0,
    hiddenPhase: null,
    progress: new Set(readStoredArray('poetry-task-progress')),
    dragging: null,
    customCount: 0
  };

  completed.forEach(id => [0, 1, 2].forEach(index => runtime.progress.add(`${id}-${index}`)));

  const effectPlan = {
    'lushan-0': ['panorama', 'peak'],
    'lushan-1': ['far'],
    'lushan-2': ['crane-flight'],
    'xuemei-0': ['snow'],
    'xuemei-1': ['scent'],
    'xuemei-2': ['harmony'],
    'flowers-0': ['compost'],
    'flowers-1': ['fertilize'],
    'flowers-2': ['water', 'sprout', 'young', 'bloom'],
    'study-0': ['book'],
    'study-1': ['seed', 'soil-cover'],
    'study-2': ['water', 'night-wait', 'sprout']
  };

  const storyVoices = {
    'lushan-0': '小黑走到新观景台，先看见长长的山岭，又看见高高的山峰。',
    'lushan-1': '小船划远后，群山、湖水和瀑布一起出现在眼前。',
    'lushan-2': '小黑明白了，人在山里面时，很难一次看见山的全貌。',
    'xuemei-0': '白雪轻轻落下，让整个梅园变得洁白明亮。',
    'xuemei-1': '梅花绽放了，唐韵闭上眼睛闻到了淡淡的花香。',
    'xuemei-2': '白雪落在梅枝上，雪晶闪亮，梅花也开得更美了。',
    'flowers-0': '落花倒进木箱，和泥土混在一起，变成了花圃的新养分。',
    'flowers-1': '花肥铺进土地，花圃变得松软又肥沃。',
    'flowers-2': '春泥、清水和阳光一起照顾种子，新花终于开了。',
    'study-0': '小黑看懂图画书，抱着种子来到花盆边。',
    'study-1': '种子种好了，还要浇水，耐心等待。',
    'study-2': '嫩芽钻出泥土，小黑终于把书本知识变成了本领。'
  };

  const intermediateVoices = {
    'xuemei-2-1': ['teacher', '洁白徽章找到白雪啦！'],
    'flowers-0-1': ['tangyun', '一片花瓣回到泥土啦！'],
    'flowers-0-2': ['tangyun', '再送一片，泥土亮起来了！'],
    'flowers-2-1': ['tangyun', '泥土轻轻鼓起来了！'],
    'flowers-2-2': ['tangyun', '小嫩芽钻出来啦！'],
    'study-2-1': ['scholar', '种子喝到水啦！']
  };

  const conventionalItems = {};

  Object.entries(plan.worlds).forEach(([id, world]) => {
    const target = levels[id];
    if (!target) return;
    target.title = world.title;
    target.summary = world.storyOpening;
    target.poem = world.poem.slice();
    target.steps = world.steps.map((step, index) => ({
      ...step,
      title: step.childPrompt,
      prompt: step.childPrompt,
      done: step.successVoice,
      type: conventionalItems[`${id}-${index}`] ? 'choice' : `v3-${step.gesture}`,
      items: conventionalItems[`${id}-${index}`] || []
    }));
  });

  stories.study = [
    { speaker: '小黑', sprite: 'xiaohei', line: '我只看了一遍种植书，已经全会啦！' },
    { speaker: '小夫子', sprite: 'scholar', line: '光看还不够，要照着方法亲手试一试。' },
    { speaker: '宝贝老师', sprite: 'teacher', line: '我们陪小黑先找办法，再种一颗小种子吧！' }
  ];

  injectInterface();

  function injectInterface() {
    const level = el('levelScreen');
    const guide = level.querySelector('.guide');
    const activity = level.querySelector('.activity');
    guide.id = 'stageArea';
    activity.id = 'activityPanel';
    const camera = document.createElement('div');
    camera.className = 'scene-camera';
    camera.id = 'sceneCamera';
    camera.setAttribute('aria-hidden', 'true');
    guide.insertBefore(camera, guide.firstChild);

    const ambience = document.createElement('div');
    ambience.className = 'world-ambience';
    ambience.id = 'worldAmbience';
    ambience.setAttribute('aria-hidden', 'true');
    ambience.innerHTML = Array.from({ length: 8 }, (_, index) => `<i style="--i:${index}"></i>`).join('');
    guide.insertBefore(ambience, guide.firstChild);

    const sceneState = document.createElement('div');
    sceneState.className = 'scene-state';
    sceneState.id = 'sceneState';
    sceneState.setAttribute('aria-hidden', 'true');
    guide.insertBefore(sceneState, el('stageFx'));
    el('stageFeedback').setAttribute('aria-live', 'polite');
    el('taskFeedback').setAttribute('aria-live', 'polite');
    el('taskSpeak').title = '再听一遍';
    el('taskSpeak').setAttribute('aria-label', '再听一遍问题');
    el('storyReplay').title = '听剧情提示';
    el('storyReplay').setAttribute('aria-label', '听剧情提示');

    const narration = document.createElement('div');
    narration.className = 'narration-status';
    narration.id = 'narrationStatus';
    narration.setAttribute('role', 'status');
    narration.innerHTML = '<span class="narrator-avatar"><img data-guide-src="assets/characters/teacher-guide-v15.png" alt=""></span><span id="narrationLabel">老师正在说</span><span class="bars"><i></i><i></i><i></i></span>';
    activity.querySelector('.activity-head').insertAdjacentElement('afterend', narration);

    const taskArea = el('taskArea');
    const wrap = document.createElement('div');
    wrap.className = 'task-wrap';
    wrap.id = 'taskWrap';
    taskArea.parentNode.insertBefore(wrap, taskArea);
    wrap.appendChild(taskArea);
    const shield = document.createElement('button');
    shield.className = 'input-shield';
    shield.id = 'inputShield';
    shield.setAttribute('aria-label', '请先听老师说完');
    shield.innerHTML = '<span class="shield-avatar"><img data-guide-src="assets/characters/teacher-guide-v15.png" alt=""></span><b>听老师说 · 点一下马上玩</b>';
    shield.onclick = () => {
      if (runtime.phase !== PHASE.ASKING) return;
      const replayFromGesture = shield.classList.contains('needs-tap');
      shield.classList.remove('needs-tap');
      runtime.epoch += 1;
      cancelVoice(replayFromGesture ? 'retry-question' : 'skip-question');
      if (replayFromGesture) {
        void askQuestion(true);
        return;
      }
      showReady();
      setPhase(PHASE.WAITING);
      enableTaskControls();
      armIdleHint();
    };
    wrap.appendChild(shield);

    // The child plays inside the illustrated scene. Keep the compact panel for
    // narration and feedback only, and place every hit target over the artwork.
    guide.appendChild(wrap);
    el('visualText').textContent = '直接在大画面里试一试';

    const coach = document.createElement('div');
    coach.className = 'coach-overlay';
    coach.id = 'coachOverlay';
    coach.hidden = true;
    coach.setAttribute('aria-hidden', 'true');
    coach.innerHTML = '<span class="coach-ring"></span><span class="coach-hand" aria-hidden="true"><svg viewBox="0 0 64 72"><path d="M13 7 54 38l-18 4 12 18-12 8-12-19L9 64Z" fill="#fffdf4" stroke="#f29a38" stroke-width="5" stroke-linejoin="round"/><path d="m30 17 5-10M41 22l9-7M23 25 12-18" fill="none" stroke="#ffe36d" stroke-width="4" stroke-linecap="round"/></svg></span>';
    level.appendChild(coach);

    const ready = document.createElement('div');
    ready.className = 'ready-cue';
    ready.id = 'readyCue';
    ready.hidden = true;
    ready.innerHTML = '<span>✨</span> 可以开始啦';
    guide.appendChild(ready);
  }

  function resetSceneCamera() {
    const camera = el('sceneCamera');
    cancelElementAnimations(camera);
    camera.style.transform = '';
    camera.style.filter = '';
    camera.style.transformOrigin = '50% 50%';
    el('levelScreen').style.removeProperty('--time-progress');
    el('taskArea').style.removeProperty('--journey-progress');
  }

  playCamera = function (effect, correct) {
    const camera = el('sceneCamera');
    cancelElementAnimations(camera);
    if (!correct) {
      camera.style.transformOrigin = '50% 50%';
      animateElement(camera, [
        { transform: 'translate3d(0,0,0) scale(1.035)' },
        { transform: 'translate3d(-7px,0,0) scale(1.035)' },
        { transform: 'translate3d(7px,0,0) scale(1.035)' },
        { transform: 'translate3d(-3px,0,0) scale(1.035)' },
        { transform: 'translate3d(0,0,0) scale(1.035)' }
      ], { duration: 620, easing: 'ease-out' });
      return;
    }
    const normalized = effect === 'snow-melt' ? 'snow'
      : effect === 'blossom' ? 'bloom'
        : effect === 'pot-grow' || effect === 'soil-cover' ? 'seed'
          : effect === 'night-wait' ? 'cycle'
            : effect === 'compost' || effect === 'fertilize' ? 'soil'
              : effect === 'young' ? 'sprout'
                : effect === 'crane-flight' ? 'far'
                  : effect;
    const plans = {
      panorama: { origin: '55% 45%', frames: [
        { transform: 'translate3d(5%,0,0) scale(1.15)' },
        { transform: 'translate3d(0,0,0) scale(1.08)' },
        { transform: 'translate3d(-4%,0,0) scale(1.035)' }
      ] },
      peak: { origin: '73% 33%', frames: [
        { transform: 'translate3d(0,0,0) scale(1.035)' },
        { transform: 'translate3d(-2%,2%,0) scale(1.19)' },
        { transform: 'translate3d(-1%,1%,0) scale(1.11)' }
      ] },
      far: { origin: '52% 58%', frames: [
        { transform: 'translate3d(0,2%,0) scale(1.18)' },
        { transform: 'translate3d(0,0,0) scale(1.08)' },
        { transform: 'translate3d(0,-1%,0) scale(1.02)' }
      ] },
      depth: { origin: '58% 66%', frames: [
        { transform: 'translate3d(0,1%,0) scale(1.04)' },
        { transform: 'translate3d(-3%,-1%,0) scale(1.15)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      snow: { origin: '33% 73%', frames: [
        { transform: 'scale(1.035)', filter: 'brightness(1) saturate(1)' },
        { transform: 'scale(1.09)', filter: 'brightness(1.13) saturate(.92)' },
        { transform: 'scale(1.045)', filter: 'brightness(1.05) saturate(1)' }
      ] },
      scent: { origin: '75% 68%', frames: [
        { transform: 'translate3d(0,0,0) scale(1.035)' },
        { transform: 'translate3d(-2%,-1%,0) scale(1.1)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      harmony: { origin: '55% 68%', frames: [
        { transform: 'scale(1.035)', filter: 'saturate(1)' },
        { transform: 'scale(1.085)', filter: 'saturate(1.2) brightness(1.07)' },
        { transform: 'scale(1.045)', filter: 'saturate(1.08)' }
      ] },
      petals: { origin: '52% 72%', frames: [
        { transform: 'translate3d(0,-1%,0) scale(1.035)' },
        { transform: 'translate3d(0,1%,0) scale(1.1)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      soil: { origin: '52% 75%', frames: [
        { transform: 'scale(1.035)' },
        { transform: 'translate3d(0,-2%,0) scale(1.13)' },
        { transform: 'translate3d(0,0,0) scale(1.05)' }
      ] },
      cycle: { origin: '65% 34%', frames: [
        { transform: 'scale(1.035)', filter: 'brightness(1.05) saturate(1.06)' },
        { transform: 'scale(1.075)', filter: 'brightness(.78) saturate(.88) hue-rotate(8deg)' },
        { transform: 'scale(1.045)', filter: 'brightness(1.08) saturate(1.12)' }
      ] },
      book: { origin: '50% 78%', frames: [
        { transform: 'scale(1.035)' },
        { transform: 'translate3d(0,-2%,0) scale(1.12)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      seed: { origin: '58% 66%', frames: [
        { transform: 'scale(1.035)' },
        { transform: 'translate3d(-1%,-2%,0) scale(1.115)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      water: { origin: '73% 68%', frames: [
        { transform: 'scale(1.035)' },
        { transform: 'translate3d(-2%,-1%,0) scale(1.1)' },
        { transform: 'translate3d(0,0,0) scale(1.045)' }
      ] },
      sprout: { origin: '56% 68%', frames: [
        { transform: 'scale(1.035)', filter: 'brightness(1)' },
        { transform: 'translate3d(0,-2%,0) scale(1.12)', filter: 'brightness(1.08) saturate(1.16)' },
        { transform: 'translate3d(0,0,0) scale(1.045)', filter: 'brightness(1.03)' }
      ] },
      bloom: { origin: '68% 62%', frames: [
        { transform: 'scale(1.035)', filter: 'saturate(1)' },
        { transform: 'scale(1.12)', filter: 'saturate(1.28) brightness(1.1)' },
        { transform: 'scale(1.045)', filter: 'saturate(1.12)' }
      ] }
    };
    const plan = plans[normalized] || plans.sprout;
    camera.style.transformOrigin = plan.origin;
    animateElement(camera, plan.frames, {
      duration: 1450,
      easing: 'cubic-bezier(.2,.78,.25,1)',
      fill: 'forwards'
    });
  };

  function guidance() {
    return plan.worlds[currentLevel].steps[stepIndex];
  }

  function taskKey() {
    return `${currentLevel}-${stepIndex}`;
  }

  function introText() {
    if (stepIndex === 0) return stories[currentLevel][0].line;
    return storyVoices[`${currentLevel}-${stepIndex - 1}`];
  }

  function introSpeaker() {
    if (stepIndex === 0) return stories[currentLevel][0].sprite;
    return 'teacher';
  }

  function setPhase(phase) {
    runtime.phase = phase;
    const level = el('levelScreen');
    level.classList.remove('phase-asking', 'phase-waiting', 'phase-performing', 'phase-helping', 'phase-done');
    level.classList.add(`phase-${phase}`);
    const asking = phase === PHASE.ASKING;
    el('inputShield').hidden = !asking;
    el('taskSpeak').disabled = phase === PHASE.ASKING || phase === PHASE.PERFORMING || phase === PHASE.HELPING;
    el('storyReplay').disabled = phase === PHASE.ASKING || phase === PHASE.PERFORMING || phase === PHASE.HELPING;
    if (phase === PHASE.ASKING) el('narrationLabel').textContent = '先听老师提问';
    if (phase === PHASE.WAITING) el('narrationLabel').textContent = '轮到你来试试';
    if (phase === PHASE.PERFORMING) el('narrationLabel').textContent = '看主画面动起来';
    if (phase === PHASE.DONE) el('narrationLabel').textContent = '做得真棒';
    if (phase !== PHASE.WAITING) el('readyCue').hidden = true;
  }

  function stopTimers() {
    clearTimeout(runtime.idleTimer);
    clearTimeout(runtime.actionTimer);
    clearTimeout(runtime.assistTimer);
    if (runtime.actionResolve) {
      const resolveAction = runtime.actionResolve;
      runtime.actionResolve = null;
      resolveAction();
    }
    runtime.idleTimer = null;
    runtime.actionTimer = null;
    runtime.assistTimer = null;
    hideCoach();
  }

  function cancelVoice(status = 'cancelled') {
    runtime.voiceGeneration += 1;
    clearTimeout(feedbackVoiceTimer);
    feedbackVoiceTimer = null;
    const stopActiveVoice = runtime.voiceCancel;
    runtime.voiceCancel = null;
    if (stopActiveVoice) stopActiveVoice(status);
    if (narrationPlayer) {
      narrationPlayer.onended = null;
      narrationPlayer.onerror = null;
      narrationPlayer.pause();
      narrationPlayer.currentTime = 0;
      narrationPlayer = null;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    return runtime.voiceGeneration;
  }

  function clipFor(value, speaker) {
    const v3 = window.V3_NARRATION_TEXT_MAP || {};
    const stories = window.V3_STORY_VOICE_TEXT_MAP || {};
    const characters = window.V3_CHARACTER_FEEDBACK_TEXT_MAP || {};
    const file = characters[`${speaker}|${value}`] || stories[`${speaker}|${value}`] || v3[value] || stories[value];
    if (file) return file.includes('/') ? file : `assets/audio/v3/${file}`;
    const map = window.VOICE_MAP || {};
    return map[`${speaker}|${value}`] || map[value] || null;
  }

  function speakAsync(value, rate = .87, speaker = 'teacher', epoch = runtime.epoch) {
    if (!soundOn || epoch !== runtime.epoch) return Promise.resolve('silent');
    const voiceToken = cancelVoice('superseded');
    const clip = clipFor(value, speaker);
    return new Promise(resolve => {
      let settled = false;
      let player = null;
      let utterance = null;
      let timeoutId = null;
      let fallbackStarted = false;
      const profiles = {
        teacher: { pitch: 1.04, rate: rate * .94 },
        scholar: { pitch: 1.08, rate: rate * .92 },
        tangyun: { pitch: 1.22, rate: rate },
        xiaohei: { pitch: .92, rate: rate * 1.02 }
      };
      const isCurrent = () => (
        voiceToken === runtime.voiceGeneration &&
        epoch === runtime.epoch &&
        runtime.voiceCancel === stop
      );
      const clearVoiceTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = null;
      };
      const detachPlayer = (reset = false) => {
        if (!player) return;
        player.onended = null;
        player.onerror = null;
        if (reset) {
          player.pause();
          try { player.currentTime = 0; } catch (_) { /* media may not have metadata yet */ }
        }
        if (narrationPlayer === player) narrationPlayer = null;
      };
      const detachUtterance = () => {
        if (!utterance) return;
        utterance.onend = null;
        utterance.onerror = null;
      };
      const finish = status => {
        if (settled) return;
        if (status === 'ended' && !isCurrent()) status = 'cancelled';
        settled = true;
        clearVoiceTimeout();
        detachPlayer(false);
        detachUtterance();
        if (runtime.voiceCancel === stop) runtime.voiceCancel = null;
        resolve(status);
      };
      const stop = (status = 'cancelled') => {
        if (settled) return;
        clearVoiceTimeout();
        detachPlayer(true);
        detachUtterance();
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        finish(status);
      };
      const armTimeout = milliseconds => {
        clearVoiceTimeout();
        timeoutId = setTimeout(() => {
          if (!isCurrent()) return finish('cancelled');
          stop('timeout');
        }, milliseconds);
      };
      const startBrowserVoice = () => {
        if (settled || !isCurrent()) return finish('cancelled');
        detachPlayer(true);
        clearVoiceTimeout();
        if (!('speechSynthesis' in window)) return finish('blocked');
        speechSynthesis.cancel();
        utterance = new SpeechSynthesisUtterance(value);
        const profile = profiles[speaker] || profiles.teacher;
        utterance.lang = 'zh-CN';
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.onend = () => finish(isCurrent() ? 'ended' : 'cancelled');
        utterance.onerror = () => finish(isCurrent() ? 'error' : 'cancelled');
        setTimeout(() => {
          if (!settled && isCurrent()) speechSynthesis.speak(utterance);
        }, 0);
        armTimeout(Math.max(3200, value.length * 420));
      };
      const fallback = () => {
        if (fallbackStarted || settled) return;
        fallbackStarted = true;
        startBrowserVoice();
      };

      runtime.voiceCancel = stop;
      if (!clip) {
        startBrowserVoice();
        return;
      }

      player = new Audio(clip);
      narrationPlayer = player;
      player.onended = () => finish(isCurrent() ? 'ended' : 'cancelled');
      player.onerror = fallback;
      const playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(fallback);
      }
      armTimeout(Math.max(5000, value.length * 520));
    });
  }

  function voiceWasInterrupted(status) {
    return status === 'cancelled' || status === 'superseded';
  }

  speak = function (value, rate = .87, speaker = 'teacher') {
    return speakAsync(value, rate, speaker, runtime.epoch);
  };

  function showReady() {
    const cue = el('readyCue');
    cue.hidden = false;
    playSfx('idea', true);
    setTimeout(() => { cue.hidden = true; }, 900);
  }

  async function askQuestion(fromTap = false) {
    const epoch = runtime.epoch;
    setPhase(PHASE.ASKING);
    el('inputShield').classList.remove('needs-tap');
    el('inputShield').innerHTML = '<span class="shield-avatar"><img src="assets/characters/teacher-guide-v15.png" alt=""></span><b>听老师说 · 点一下马上玩</b>';
    if (!fromTap) await new Promise(resolve => setTimeout(resolve, 160));
    if (epoch !== runtime.epoch) return;
    const status = await speakAsync(guidance().narratorQuestion, .84, 'teacher', epoch);
    if (epoch !== runtime.epoch || runtime.phase === PHASE.EXITED || voiceWasInterrupted(status)) return;
    if (soundOn && ['blocked', 'timeout', 'error'].includes(status)) {
      el('narrationLabel').textContent = '点老师头像再听一次';
      el('inputShield').classList.add('needs-tap');
      el('inputShield').innerHTML = '<span class="shield-avatar"><img src="assets/characters/teacher-guide-v15.png" alt=""></span><b>点一下听题</b>';
      el('inputShield').hidden = false;
      return;
    }
    showReady();
    setPhase(PHASE.WAITING);
    enableTaskControls();
    armIdleHint();
  }

  function enableTaskControls() {
    el('taskArea').querySelectorAll('button,[role="button"]').forEach(node => {
      if (!node.classList.contains('done') && !node.classList.contains('locked')) node.disabled = false;
    });
  }

  function disableTaskControls() {
    el('taskArea').querySelectorAll('button,[role="button"]').forEach(node => { node.disabled = true; });
  }

  function armIdleHint(delay = 4600) {
    clearTimeout(runtime.idleTimer);
    if (runtime.phase !== PHASE.WAITING) return;
    runtime.idleTimer = setTimeout(runIdleHint, delay);
  }

  async function runIdleHint() {
    if (runtime.phase !== PHASE.WAITING) return;
    const epoch = runtime.epoch;
    if (runtime.idleLevel >= 2) {
      assistComplete();
      return;
    }
    runtime.idleLevel = Math.min(2, runtime.idleLevel + 1);
    const g = guidance();
    const text = runtime.idleLevel === 1 ? g.hint1 : g.hint2;
    el('taskFeedback').textContent = text;
    highlightTarget();
    if (runtime.idleLevel >= 2) showCoach(g.gesture);
    const status = await speakAsync(text, .84, 'teacher', epoch);
    if (epoch !== runtime.epoch || voiceWasInterrupted(status)) return;
    if (runtime.phase === PHASE.WAITING) armIdleHint(runtime.idleLevel === 1 ? 5200 : 7000);
  }

  function highlightTarget() {
    const area = el('taskArea');
    area.querySelectorAll('.hint-target').forEach(x => x.classList.remove('hint-target'));
    const target = findCoachTarget(area);
    if (target) target.classList.add('hint-target');
  }

  function findCoachTarget(area = el('taskArea')) {
    const pendingToken = area.querySelector('.drag-token:not(.done)');
    if (pendingToken) return area.querySelector(`[data-drop="${pendingToken.dataset.target}"]`);
    return area.querySelector('[data-correct="true"]:not(.done)') || area.querySelector('.drop-target:not(.done)') || area.querySelector('.gesture-card') || area.querySelector('.tap-target:not(.done)');
  }

  function showCoach(gesture = 'tap') {
    const coach = el('coachOverlay');
    const area = el('taskArea');
    const target = findCoachTarget(area);
    if (!target) return;
    const levelRect = el('levelScreen').getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const pendingToken = gesture === 'drag'
      ? area.querySelector('.drag-token:not(.done):not(.locked)')
      : null;
    const startRect = pendingToken ? pendingToken.getBoundingClientRect() : rect;
    coach.style.setProperty('--coach-start-x', `${startRect.left - levelRect.left + startRect.width / 2 - 17}px`);
    coach.style.setProperty('--coach-start-y', `${startRect.top - levelRect.top + startRect.height / 2 - 13}px`);
    coach.style.setProperty('--coach-x', `${rect.left - levelRect.left + rect.width / 2 - 17}px`);
    coach.style.setProperty('--coach-y', `${rect.top - levelRect.top + rect.height / 2 - 13}px`);
    coach.classList.toggle('swipe', gesture === 'swipe');
    coach.classList.toggle('drag', gesture === 'drag');
    coach.hidden = false;
  }

  function hideCoach() {
    const coach = el('coachOverlay');
    if (!coach) return;
    coach.hidden = true;
    coach.classList.remove('swipe', 'drag');
  }

  resetStep = function () {
    stopTimers();
    cancelVoice();
    runtime.epoch += 1;
    runtime.wrongCount = 0;
    runtime.idleLevel = 0;
    runtime.customCount = 0;
    inputLocked = true;
    stepState = { ready: false, selected: new Set(), position: 0 };
    el('taskContinue').hidden = true;
    el('taskContinue').classList.remove('coach-next');
    el('taskFeedback').textContent = '';
    el('levelScreen').classList.remove('is-performing', 'v3-celebrate');
    resetSceneCamera();
    return levels[currentLevel].steps[stepIndex];
  };

  renderStep = function () {
    window.scrollTo(0, 0);
    const level = levels[currentLevel];
    const step = resetStep();
    el('levelTitle').textContent = level.poemTitle;
    el('levelDots').innerHTML = level.steps.map((_, index) => `<i class="${index <= stepIndex ? 'on' : ''}"></i>`).join('');
    el('guideImage').src = sprites[level.guide];
    el('guideBubble').textContent = introText();
    el('taskTitle').textContent = step.childPrompt;
    el('taskPrompt').textContent = gestureCopy(step.gesture);
    resetVisual();
    el('visualText').textContent = '直接在大画面里试一试';
    renderTaskArea();
    if (window.renderPoemState) window.renderPoemState(currentLevel, stepIndex);
    el('activityPanel').scrollTop = 0;
    disableTaskControls();
    askQuestion();
  };

  function clearStageRuntime() {
    const camera = el('sceneCamera');
    cancelElementAnimations(camera);
    if (camera) { camera.style.transform = ''; camera.style.filter = ''; camera.style.willChange = ''; }
    const fx = el('stageFx');
    cancelElementAnimations(fx);
    if (fx) { fx.innerHTML = ''; fx.className = 'stage-fx'; fx.removeAttribute('data-v16-pov-key'); fx.removeAttribute('aria-label'); }
    const level = el('levelScreen');
    if (level) level.classList.remove('v16-pov-active', 'v16-pov-walk', 'v16-pov-boat', 'v16-pov-flight', 'story-paused');
  }

  function hydrateGuideAvatars() {
    document.querySelectorAll('img[data-guide-src]').forEach(image => {
      const src = image.getAttribute('data-guide-src');
      if (!src) return;
      image.src = src;
      image.removeAttribute('data-guide-src');
    });
  }

  startLevel = function (id) {
    hydrateGuideAvatars();
    window.scrollTo(0, 0);
    runtime.epoch += 1;
    stopTimers();
    cancelVoice();
    clearStageRuntime();
    currentLevel = id;
    const nextStep = [0, 1, 2].find(index => !runtime.progress.has(`${id}-${index}`));
    stepIndex = nextStep == null ? 0 : nextStep;
    el('bottomNav').style.display = 'none';
    Object.values(screenIds).forEach(screenId => el(screenId).classList.remove('active'));
    el('resultScreen').classList.remove('active');
    el('levelScreen').classList.add('active');
    el('levelScreen').style.backgroundImage = 'none';
    el('sceneCamera').style.backgroundImage = `url('${levels[id].bg}')`;
    if (nextStep == null && !completed.has(id)) { stepIndex = 2; showResult(); }
    else if (stepIndex > 0 && !completed.has(id)) renderStep();
    else openStory();
  };

  function gestureCopy(gesture) {
    if (gesture === 'drag') return '按住会动的物件，送到另一边';
    return '点一下画面里正在动的物件';
  }

  function stageArt(kind) {
    const assets = {
      pavilion: 'pavilion-v15.png',
      ridge: 'pavilion-v15.png',
      peak: 'pavilion-v15.png',
      boat: 'rowboat-v15.png',
      footprints: 'rowboat-v15.png',
      crane: 'crane-v15.png',
      snowcloud: 'snow-cloud-v15.png',
      snowmound: 'snow-mound-v15.png',
      snow: 'snow-crystals-v15.png',
      plum: 'plum-branch-snow-v15.png',
      plumbranch: 'plum-branch-snow-v15.png',
      scent: 'scent-puffs-v15.png',
      petalbasket: 'petal-basket-v15.png',
      petal: 'petal-basket-v15.png',
      compostbox: 'compost-box-v15.png',
      compost: 'compost-sack-v15.png',
      soil: 'soil-mound-v15.png',
      cycle: 'soil-mound-v15.png',
      seed: 'seed-v15.png',
      sprout: 'sprout-v15.png',
      young: 'young-plant-v15.png',
      bloom: 'flower-cluster-v15.png',
      water: 'watering-can-v15.png',
      book: 'garden-book-v15.png',
      moon: 'garden-book-v15.png',
      pot: 'garden-pot-v15.png'
    };
    const filename = assets[kind] || assets.sprout;
    return '<span class="stage-art art-' + kind + '"><img src="assets/objects/v15/' + filename + '" alt="" draggable="false"></span>';
  }

  function choiceKind(key, index) {
    const kinds = {
      'lushan-2': ['ridge', 'peak'],
      'xuemei-0': ['snow', 'plum'],
      'xuemei-1': ['plum', 'snow']
    };
    return (kinds[key] || ['sprout'])[index] || 'sprout';
  }

  renderTaskArea = function () {
    const key = taskKey();
    const step = levels[currentLevel].steps[stepIndex];
    el('levelScreen').dataset.world = currentLevel;
    el('levelScreen').dataset.task = key;
    if (conventionalItems[key]) return renderChoice(step);
    if (key === 'lushan-0' || key === 'xuemei-2' || key === 'flowers-0' || key === 'study-1') return renderDrag(key);
    return renderTapSequence(key);
  };

  function renderChoice(step) {
    const area = el('taskArea');
    const key = taskKey();
    area.className = `stage-task direct-choice task-${key}`;
    area.innerHTML = step.items.map((item, index) => {
      const kind = choiceKind(key, index);
      return `<button class="task-btn scene-hotspot item-${index} kind-${kind}" data-item="${index}" data-kind="${kind}" data-correct="${Boolean(item[2])}" aria-label="${item[1]}">${stageArt(kind)}<span class="sr-only">${item[1]}</span></button>`;
    }).join('');
    area.querySelectorAll('.task-btn').forEach(button => {
      button.onclick = () => selectItem(Number(button.dataset.item), button);
    });
  }

  function swipePreview(key) {
    if (key === 'lushan-0') return `
      <span class="v5-gesture-preview v5-mountain-turn" aria-hidden="true">
        <svg class="v5-turn-ridge" viewBox="0 0 180 112"><defs><linearGradient id="ridgeFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#baf0dd"/><stop offset="1" stop-color="#398d72"/></linearGradient></defs><path d="M6 93C22 68 37 77 53 54s32 20 48-6 28 18 42-9 24-14 32-20v74Z" fill="url(#ridgeFill)"/><path d="M8 92C28 68 38 76 54 55s31 18 47-6 29 17 43-10 23-13 30-19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>
        <svg class="v5-turn-peak" viewBox="0 0 180 112"><defs><linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c8f4e3"/><stop offset="1" stop-color="#3d8f74"/></linearGradient></defs><path d="m34 94 57-80 57 80Z" fill="url(#peakFill)"/><path d="m91 14 17 24-12-5-9 10-11-12Z" fill="#f5fff9"/><path d="M34 94h114" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>
        <span class="v5-turn-orbit"><i></i></span>
      </span>`;
    if (key === 'flowers-1') return `
      <span class="v5-gesture-preview v5-time-wheel" aria-hidden="true">
        <span class="v5-time-sun"></span><span class="v5-time-moon"></span><span class="v5-time-ring"></span>
        <span class="v5-time-seed"><i></i></span>
      </span>`;
    return `
      <span class="v5-gesture-preview v5-book-preview" aria-hidden="true">
        <span class="v5-book-cover"></span><span class="v5-book-page"><i class="soil-dot"></i><i class="seed-dot"></i><i class="water-dot"></i></span>
      </span>`;
  }

  function renderSwipe(key) {
    const configs = {
      'lushan-0': ['peak', '左右滑动看山变样'],
      'flowers-1': ['cycle', '转动时间小圆盘'],
      'study-0': ['book', '滑动翻开图画书']
    };
    const [kind, label] = configs[key];
    const area = el('taskArea');
    area.className = `stage-task direct-swipe task-${key}`;
    area.innerHTML = `<button class="gesture-card kind-${kind}" data-correct="true" aria-label="${label}" style="--gesture-progress:0;--view-progress:0">${swipePreview(key)}<span class="swipe-focus">${stageArt(kind)}</span><span class="swipe-trail"><i></i><i></i><i></i></span><span class="sr-only">${label}</span></button>`;
    bindSwipe(area.querySelector('.gesture-card'));
  }

  function bindSwipe(card) {
    let startX = 0;
    let startY = 0;
    let active = false;
    let liveProgress = 0;
    const camera = el('sceneCamera');
    const key = taskKey();
    const paintProgress = progress => {
      liveProgress = Math.max(0, Math.min(1, progress));
      card.style.setProperty('--gesture-progress', liveProgress.toFixed(3));
      if (key === 'lushan-0') {
        const baseView = Number(card.dataset.viewProgress || 0);
        const viewProgress = card.dataset.direction === 'left'
          ? baseView + liveProgress * (1 - baseView)
          : baseView * (1 - liveProgress);
        card.style.setProperty('--view-progress', viewProgress.toFixed(3));
        const panDirection = card.dataset.direction === 'right' ? -1 : 1;
        camera.style.transform = `translate3d(${(liveProgress * panDirection * 5.2).toFixed(2)}%,0,0) scale(${(1.045 + liveProgress * .075).toFixed(3)})`;
      }
      if (key === 'flowers-1') el('levelScreen').style.setProperty('--time-progress', liveProgress.toFixed(3));
    };
    const begin = event => {
      if (runtime.phase !== PHASE.WAITING) return;
      stopTimers();
      const point = event.touches ? event.touches[0] : event;
      startX = point.clientX;
      startY = point.clientY;
      active = true;
      card.classList.add('tracking');
      if (key === 'lushan-0') cancelElementAnimations(camera);
      if (navigator.vibrate) navigator.vibrate(8);
      if (event.pointerId != null) if (typeof card.setPointerCapture === 'function') card.setPointerCapture(event.pointerId);
    };
    const move = event => {
      if (!active || runtime.phase !== PHASE.WAITING) return;
      const point = event.touches ? event.touches[0] : event;
      card.dataset.direction = point.clientX >= startX ? 'right' : 'left';
      paintProgress(Math.abs(point.clientX - startX) / Math.max(96, card.clientWidth * .48));
      event.preventDefault();
    };
    const end = async event => {
      if (runtime.phase !== PHASE.WAITING || !active) return;
      const point = event.changedTouches ? event.changedTouches[0] : event;
      const deltaX = point.clientX - startX;
      const deltaY = point.clientY - startY;
      active = false;
      card.classList.remove('tracking');
      if (Math.abs(deltaX) >= 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
        paintProgress(1);
        card.classList.add('activated');
        if (navigator.vibrate) navigator.vibrate([10, 28, 14]);
        if (key === 'lushan-0') {
          const direction = deltaX >= 0 ? 'right' : 'left';
          const turns = Number(card.dataset.turns || 0);
          if (turns === 0) {
            card.dataset.turns = '1';
            card.dataset.firstDirection = direction;
            card.dataset.viewProgress = direction === 'left' ? '1' : '0';
            card.classList.add('half-turn');
            const firstEffect = direction === 'right' ? 'panorama' : 'peak';
            const firstVoice = direction === 'right' ? '横着看，长长的山岭展开啦！' : '侧过来看，尖尖的山峰出现啦！';
            await runStageEffect(firstEffect, firstVoice, false);
            if (runtime.phase === PHASE.WAITING) {
              card.classList.remove('activated');
              paintProgress(0);
              el('taskFeedback').textContent = '真棒，再向另一边滑一次。';
              const epoch = runtime.epoch;
              const status = await speakAsync('真棒，再向另一边滑一次。', .87, 'teacher', epoch);
              if (epoch === runtime.epoch && !voiceWasInterrupted(status) && runtime.phase === PHASE.WAITING) armIdleHint(4400);
            }
          } else if (card.dataset.firstDirection !== direction) {
            const finalEffect = direction === 'right' ? 'panorama' : 'peak';
            await runStageEffect(finalEffect, guidance().successVoice, true);
          } else {
            card.classList.remove('activated');
            paintProgress(0);
            el('taskFeedback').textContent = '山已经看过这一边啦，换个方向滑一滑。';
            const epoch = runtime.epoch;
            const status = await speakAsync('换个方向滑一滑，再看看另一边。', .87, 'teacher', epoch);
            if (epoch === runtime.epoch && !voiceWasInterrupted(status) && runtime.phase === PHASE.WAITING) armIdleHint(4000);
          }
        } else performCustomAction();
      } else {
        paintProgress(0);
        camera.style.transform = '';
        el('levelScreen').style.removeProperty('--time-progress');
        handleMiss(card);
      }
    };
    card.addEventListener('pointerdown', begin);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', () => {
      active = false;
      card.classList.remove('tracking');
      paintProgress(0);
      camera.style.transform = '';
      el('levelScreen').style.removeProperty('--time-progress');
    });
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') performCustomAction(); });
  }

  function renderDrag(key) {
    const area = el('taskArea');
    const configs = {
      'lushan-0': { tokens: [{ kind: 'xiaohei', icon: `<img src="${sprites.xiaohei}" alt="小黑">`, target: 'pavilion', effect: 'panorama' }], targets: [{ id: 'pavilion', kind: 'pavilion', label: '小亭子' }] },
      'xuemei-2': { tokens: [{ kind: 'snowmound', target: 'plumbranch', effect: 'harmony' }], targets: [{ id: 'plumbranch', kind: 'plumbranch', label: '梅枝' }] },
      'flowers-0': { tokens: [{ kind: 'petalbasket', target: 'compostbox', effect: 'compost' }], targets: [{ id: 'compostbox', kind: 'compostbox', label: '堆肥木箱' }] },
      'study-1': { tokens: [{ kind: 'seed', target: 'pot', effect: 'seed' }], targets: [{ id: 'pot', kind: 'pot', label: '花盆' }] }
    };
    const config = configs[key];
    area.className = `stage-task direct-drag task-${key}`;
    area.innerHTML = (config.decor || '') + config.tokens.map((token, index) => `<button class="drag-token token-${index} kind-${token.kind} ${config.sequential && index > 0 ? 'locked' : ''}" data-token="${index}" data-target="${token.target}" data-effect="${token.effect || ''}" aria-label="拖动${token.kind === 'xiaohei' ? '小黑' : '物件'}">${token.icon || stageArt(token.kind)}</button>`).join('') + config.targets.map((target, index) => `<div class="drop-target target-${target.id} ${index ? 'target-two' : ''}" data-drop="${target.id}" data-correct="true" aria-label="${target.label}">${stageArt(target.kind)}<span class="sr-only">${target.label}</span></div>`).join('');
    area.querySelectorAll('.drag-token').forEach(bindDragToken);
  }

  function bindDragToken(token) {
    let originX = 0;
    let originY = 0;
    let baseRect = null;
    let parentRect = null;
    let offsetX = 0;
    let offsetY = 0;
    let paintFrame = 0;

    const paint = () => {
      paintFrame = 0;
      token.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(1.08)`;
      const area = token.parentElement;
      if (taskKey() === 'lushan-1' && parentRect) {
        const journey = Math.max(0, Math.min(1, offsetX / Math.max(1, parentRect.width * .62)));
        area.style.setProperty('--journey-progress', journey.toFixed(3));
        el('sceneCamera').style.transform = `translate3d(0,${(-journey * .8).toFixed(2)}%,0) scale(${(1.095 - journey * .06).toFixed(3)})`;
      }
    };

    const resetPosition = () => {
      if (paintFrame) cancelAnimationFrame(paintFrame);
      paintFrame = 0;
      token.classList.remove('dragging');
      token.style.transform = '';
      token.style.willChange = '';
      if (taskKey() === 'lushan-1') {
        token.parentElement.style.setProperty('--journey-progress', '0');
        el('sceneCamera').style.transform = '';
      }
    };

    token.addEventListener('pointerdown', event => {
      if (runtime.phase !== PHASE.WAITING || token.classList.contains('done')) return;
      stopTimers();
      token.classList.add('dragging');
      token.style.transform = 'translate3d(0,0,0) scale(1.08)';
      token.style.willChange = 'transform';
      baseRect = token.getBoundingClientRect();
      parentRect = token.parentElement.getBoundingClientRect();
      originX = event.clientX;
      originY = event.clientY;
      offsetX = 0;
      offsetY = 0;
      if (typeof token.setPointerCapture === 'function') token.setPointerCapture(event.pointerId);
      if (navigator.vibrate) navigator.vibrate(8);
      event.preventDefault();
    });
    token.addEventListener('pointermove', event => {
      if (!token.classList.contains('dragging') || !baseRect || !parentRect) return;
      offsetX = Math.max(parentRect.left - baseRect.left, Math.min(parentRect.right - baseRect.right, event.clientX - originX));
      offsetY = Math.max(parentRect.top - baseRect.top, Math.min(parentRect.bottom - baseRect.bottom, event.clientY - originY));
      if (!paintFrame) paintFrame = requestAnimationFrame(paint);
      event.preventDefault();
    });
    token.addEventListener('pointerup', async event => {
      if (!token.classList.contains('dragging')) return;
      if (paintFrame) { cancelAnimationFrame(paintFrame); paintFrame = 0; paint(); }
      token.classList.remove('dragging');
      const expected = token.dataset.target;
      const target = token.parentElement.querySelector(`[data-drop="${expected}"]`);
      const a = token.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const overlap = !(a.right < b.left - 24 || a.left > b.right + 24 || a.bottom < b.top - 24 || a.top > b.bottom + 24);
      if (overlap) {
        offsetX += b.left + b.width / 2 - (a.left + a.width / 2);
        offsetY += b.top + b.height / 2 - (a.top + a.height / 2);
        token.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(.46)`;
        token.style.willChange = '';
        token.classList.add('done');
        target.classList.add('pulse');
        if (navigator.vibrate) navigator.vibrate([10, 24, 14]);
        if (!token.parentElement.querySelector(`.drag-token:not(.done)[data-target="${expected}"]`)) target.classList.add('done');
        runtime.customCount += 1;
        const key = taskKey();
        if (window.updatePoemState && key !== 'study-1') window.updatePoemState(key, runtime.customCount);
        const total = token.parentElement.querySelectorAll('.drag-token').length;
        const effects = effectPlan[key] || ['idea'];
        const isLast = runtime.customCount >= total;
        const tokenEffect = token.dataset.effect || effects[Math.min(runtime.customCount - 1, effects.length - 1)];
        let finalEffects = [tokenEffect];
        if (total === 1) finalEffects = effects;
        else if (isLast && effects[effects.length - 1] !== tokenEffect) finalEffects.push(effects[effects.length - 1]);
        if (isLast && finalEffects.length > 1) await runStageSequence(finalEffects, guidance().successVoice, key === 'study-1' ? [0, 1] : null);
        else await runStageEffect(isLast ? finalEffects[0] : tokenEffect, isLast ? guidance().successVoice : `${runtime.customCount}/${total} 送到啦`, isLast);
        if (!isLast && runtime.phase === PHASE.WAITING) {
          await playIntermediate(runtime.customCount);
          const nextToken = token.parentElement.querySelector('.drag-token.locked');
          if (nextToken) { nextToken.classList.remove('locked'); nextToken.disabled = false; }
          if (runtime.phase === PHASE.WAITING) armIdleHint();
        }
      } else {
        resetPosition();
        handleMiss(token);
      }
    });
    token.addEventListener('pointercancel', () => {
      resetPosition();
      if (runtime.phase === PHASE.WAITING && !document.hidden) armIdleHint();
    });
    token.addEventListener('keydown', async event => {
      if ((event.key === 'Enter' || event.key === ' ') && runtime.phase === PHASE.WAITING) {
        event.preventDefault();
        stopTimers();
        token.classList.add('done');
        runtime.customCount += 1;
        const key = taskKey();
        const total = token.parentElement.querySelectorAll('.drag-token').length;
        const isLast = runtime.customCount >= total;
        if (window.updatePoemState && key !== 'study-1') window.updatePoemState(key, runtime.customCount);
        const effects = effectPlan[key] || ['idea'];
        const tokenEffect = token.dataset.effect || effects[Math.min(runtime.customCount - 1, effects.length - 1)];
        let finalEffects = [tokenEffect];
        if (total === 1) finalEffects = effects;
        else if (isLast && effects[effects.length - 1] !== tokenEffect) finalEffects.push(effects[effects.length - 1]);
        if (isLast && finalEffects.length > 1) await runStageSequence(finalEffects, guidance().successVoice, key === 'study-1' ? [0, 1] : null);
        else await runStageEffect(tokenEffect, isLast ? guidance().successVoice : `${runtime.customCount}/${total} 送到啦`, isLast);
        if (!isLast && runtime.phase === PHASE.WAITING) {
          await playIntermediate(runtime.customCount);
          const nextToken = token.parentElement.querySelector('.drag-token.locked');
          if (nextToken) { nextToken.classList.remove('locked'); nextToken.disabled = false; }
          if (runtime.phase === PHASE.WAITING) armIdleHint();
        }
      }
    });
  }

  function renderTapSequence(key) {
    const configs = {
      'lushan-1': [['boat', '点小船去远处']],
      'lushan-2': [['crane', '点白鹤飞出群山']],
      'xuemei-0': [['snowcloud', '点雪云请雪落下']],
      'xuemei-1': [['plumbranch', '点花苞闻闻梅香']],
      'flowers-1': [['compost', '点花肥喂饱土地']],
      'flowers-2': [['water', '点水壶浇开新花']],
      'study-0': [['book', '点图画书找办法']],
      'study-2': [['water', '点水壶照顾种子']]
    };
    const items = configs[key] || [['sprout', '点一点']];
    const area = el('taskArea');
    area.className = `stage-task direct-tap task-${key}`;
    area.innerHTML = items.map((item, index) => `<button class="tap-target target-${item[0]} seq-${index} ${index ? 'locked' : ''}" data-seq="${index}" data-correct="${index === 0}" aria-label="${item[1]}">${stageArt(item[0])}<span class="sr-only">${item[1]}</span></button>`).join('');
    area.querySelectorAll('.tap-target').forEach(button => { button.onclick = async () => {
      if (runtime.phase !== PHASE.WAITING) return;
      const requested = Number(button.dataset.seq);
      if (requested !== runtime.customCount) return handleMiss(button);
      const index = runtime.customCount;
      stopTimers();
      button.classList.add('done');
      button.dataset.correct = 'false';
      runtime.customCount += 1;
      if (navigator.vibrate) navigator.vibrate([9, 22, 12]);
      if (window.updatePoemState) window.updatePoemState(key, runtime.customCount);
      const effects = effectPlan[key] || ['idea'];
      const isLast = runtime.customCount >= items.length;
      const remainingEffects = effects.slice(Math.min(index, effects.length - 1));
      const sequenceProgress = {
        'flowers-2': [1, 2, 2, 3],
        'study-2': [1, 2, 3]
      };
      if (isLast && remainingEffects.length > 1) await runStageSequence(remainingEffects, guidance().successVoice, sequenceProgress[key] || null);
      else await runStageEffect(isLast ? effects[effects.length - 1] : effects[Math.min(index, effects.length - 1)], isLast ? guidance().successVoice : `${itemLabel(items[index])}，动起来啦`, isLast);
      if (!isLast && runtime.phase === PHASE.WAITING) {
        await playIntermediate(runtime.customCount);
        if (runtime.phase !== PHASE.WAITING) return;
        const nextButton = area.querySelector(`[data-seq="${runtime.customCount}"]`);
        nextButton.classList.remove('locked');
        nextButton.disabled = false;
        nextButton.dataset.correct = 'true';
        nextButton.classList.add('next-beat');
        armIdleHint();
      }
    }; });
  }

  function itemLabel(item) { return item ? item[1] : '画面'; }

  async function playIntermediate(count) {
    const voice = intermediateVoices[`${taskKey()}-${count}`];
    if (!voice) return;
    const epoch = runtime.epoch;
    setPhase(PHASE.PERFORMING);
    disableTaskControls();
    el('taskFeedback').textContent = voice[1];
    const status = await speakAsync(voice[1], .86, voice[0], epoch);
    if (epoch !== runtime.epoch || voiceWasInterrupted(status)) return;
    setPhase(PHASE.WAITING);
    enableTaskControls();
  }

  selectItem = function (index, button) {
    if (runtime.phase !== PHASE.WAITING) return;
    stopTimers();
    const step = levels[currentLevel].steps[stepIndex];
    const correct = Boolean(step.items[index][2]);
    if (!correct) return handleMiss(button);
    button.classList.add('pressed', 'selected');
    runStageEffect((effectPlan[taskKey()] || ['idea'])[0], step.items[index][1], true);
  };

  function handleMiss(button) {
    if (runtime.phase !== PHASE.WAITING) return;
    stopTimers();
    runtime.wrongCount += 1;
    button.classList.remove('wrong');
    void button.offsetWidth;
    button.classList.add('wrong');
    playSfx('wrong', false);
    renderRichEffect('wrong');
    const hint = runtime.wrongCount === 1 ? guidance().hint1 : guidance().hint2;
    el('taskFeedback').textContent = hint;
    highlightTarget();
    if (runtime.wrongCount >= 2) showCoach(guidance().gesture);
    const epoch = runtime.epoch;
    speakAsync(hint, .84, 'teacher', epoch).then(status => {
      if (epoch !== runtime.epoch || voiceWasInterrupted(status)) return;
      if (runtime.wrongCount >= 3 && runtime.phase === PHASE.WAITING) assistComplete();
      else if (runtime.phase === PHASE.WAITING) armIdleHint(4200);
    });
  }

  function assistComplete() {
    const epoch = runtime.epoch;
    setPhase(PHASE.HELPING);
    showCoach(guidance().gesture);
    el('taskFeedback').textContent = '没关系，我们一起做。';
    runtime.assistTimer = setTimeout(() => {
      runtime.assistTimer = null;
      if (runtime.phase !== PHASE.HELPING || epoch !== runtime.epoch) return;
      hideCoach();
      const correct = el('taskArea').querySelector('[data-correct="true"]:not(.done)');
      if (correct && conventionalItems[taskKey()]) { setPhase(PHASE.WAITING); selectItem(Number(correct.dataset.item), correct); }
      else performCustomAction();
    }, 900);
  }

  async function runStageEffect(effect, caption, finalAction) {
    const epoch = runtime.epoch;
    cancelVoice();
    setPhase(PHASE.PERFORMING);
    disableTaskControls();
    el('levelScreen').classList.add('is-performing');
    el('visualIcon').innerHTML = stageArt(effectKind(effect));
    el('visualText').textContent = caption;
    if (!finalAction) el('taskFeedback').textContent = caption;
    el('stageFeedback').classList.remove('pop');
    void el('stageFeedback').offsetWidth;
    el('stageFeedback').classList.add('pop');
    playCamera(effect, true);
    renderRichEffect(effect);
    playSfx(effect, true);
    const guide = el('guideImage');
    guide.classList.remove('react-cheer', 'react-hop', 'react-nod', 'react-surprise');
    void guide.offsetWidth;
    guide.classList.add(effect === 'snow' || effect === 'scent' ? 'react-surprise' : 'react-cheer');
    await new Promise(resolve => {
      runtime.actionResolve = resolve;
      runtime.actionTimer = setTimeout(() => { runtime.actionResolve = null; resolve(); }, 1800);
    });
    if (epoch !== runtime.epoch) return;
    el('levelScreen').classList.remove('is-performing');
    if (finalAction) await finishCurrentStep();
    else {
      el('stageFx').innerHTML = '';
      el('stageFx').className = 'stage-fx';
      setPhase(PHASE.WAITING);
      enableTaskControls();
    }
  }

  async function runStageSequence(effects, caption, stateProgress = null) {
    const epoch = runtime.epoch;
    cancelVoice();
    setPhase(PHASE.PERFORMING);
    disableTaskControls();
    el('levelScreen').classList.add('is-performing');
    for (let index = 0; index < effects.length; index += 1) {
      if (epoch !== runtime.epoch) return;
      const effect = effects[index];
      if (stateProgress && stateProgress[index] != null && window.updatePoemState) window.updatePoemState(taskKey(), stateProgress[index]);
      el('visualIcon').innerHTML = stageArt(effectKind(effect));
      el('visualText').textContent = index === effects.length - 1 ? caption : '看，画面还在变化！';
      el('stageFeedback').classList.remove('pop');
      void el('stageFeedback').offsetWidth;
      el('stageFeedback').classList.add('pop');
      playCamera(effect, true);
      renderRichEffect(effect);
      playSfx(effect, true);
      const guide = el('guideImage');
      guide.classList.remove('react-cheer', 'react-hop', 'react-nod', 'react-surprise');
      void guide.offsetWidth;
      guide.classList.add(index === effects.length - 1 ? 'react-cheer' : 'react-surprise');
      await new Promise(resolve => {
        runtime.actionResolve = resolve;
        runtime.actionTimer = setTimeout(() => { runtime.actionResolve = null; resolve(); }, 1320);
      });
    }
    if (epoch !== runtime.epoch) return;
    el('levelScreen').classList.remove('is-performing');
    await finishCurrentStep();
  }

  function effectIcon(effect) {
    const icons = { panorama: '↔️', peak: '⛰️', far: '👣', depth: '🔭', snow: '❄️', scent: '🌸', harmony: '🤝', petals: '🌸', soil: '🟫', cycle: '☀️', sprout: '🌱', bloom: '🌼', book: '📖', seed: '🫘', 'pot-grow': '🪴', water: '💧', idea: '💡' };
    return icons[effect] || '✨';
  }

  function effectKind(effect) {
    const kinds = {
      panorama: 'ridge', peak: 'peak', far: 'footprints', depth: 'footprints',
      snow: 'snow', scent: 'scent', harmony: 'plum', petals: 'petal', soil: 'soil',
      cycle: 'cycle', sprout: 'sprout', bloom: 'bloom', book: 'book', seed: 'seed',
      'pot-grow': 'pot', 'soil-cover': 'soil', 'night-wait': 'moon', water: 'water', idea: 'sprout',
      compost: 'compost', fertilize: 'soil', young: 'young', 'crane-flight': 'crane'
    };
    return kinds[effect] || 'sprout';
  }

  function performCustomAction() {
    if (![PHASE.WAITING, PHASE.HELPING].includes(runtime.phase)) return;
    stopTimers();
    const key = taskKey();
    const stateProgress = {
      'flowers-0': [1, 3],
      'flowers-2': [1, 2, 2, 3],
      'study-1': [0, 1],
      'study-2': [1, 2, 3],
      'xuemei-2': [1, 2, 2]
    };
    const effects = effectPlan[key] || ['idea'];
    if (effects.length > 1) runStageSequence(effects, guidance().successVoice, stateProgress[key] || null);
    else {
      const progress = stateProgress[key] ? stateProgress[key][0] : undefined;
      if (progress != null && window.updatePoemState) window.updatePoemState(key, progress);
      runStageEffect(effects[0], guidance().successVoice, true);
    }
  }

  async function finishCurrentStep() {
    const epoch = runtime.epoch;
    setPhase(PHASE.PERFORMING);
    const storyVoice = storyVoices[taskKey()];
    el('guideBubble').textContent = storyVoice;
    const speaker = levels[currentLevel].guide;
    const successStatus = await speakAsync(guidance().successVoice, .84, speaker, epoch);
    if (epoch !== runtime.epoch || voiceWasInterrupted(successStatus)) return;
    const storyStatus = await speakAsync(storyVoice, .82, 'teacher', epoch);
    if (epoch !== runtime.epoch || voiceWasInterrupted(storyStatus)) return;
    completeStep(levels[currentLevel].steps[stepIndex], true);
  }

  completeStep = function (step) {
    stopTimers();
    stepState.ready = true;
    runtime.progress.add(taskKey());
    persistArray('poetry-task-progress', [...runtime.progress]);
    setPhase(PHASE.DONE);
    inputLocked = true;
    disableTaskControls();
    el('taskFeedback').textContent = step.successVoice;
    el('taskContinue').hidden = false;
    el('taskContinue').textContent = stepIndex === 2 ? '展开诗卷 ➡️' : '继续冒险 ➡️';
    el('taskContinue').classList.add('coach-next');
    const level = el('levelScreen');
    level.classList.add('v3-celebrate');
    setTimeout(() => level.classList.remove('v3-celebrate'), 1300);
    setTimeout(() => el('activityPanel').scrollTo({ top: el('activityPanel').scrollHeight, behavior: 'smooth' }), 120);
    renderCollections();
  };

  worldCard = function (id, large = false) {
    const level = levels[id];
    const done = completed.has(id);
    const count = [0, 1, 2].filter(index => runtime.progress.has(`${id}-${index}`)).length;
    return `<button class="${large ? 'map-card' : 'world-card'}" data-level="${id}"  ><img class="world-art" loading="lazy" decoding="async" data-src="${level.bg}" alt=""><span class="world-badge ${done ? 'done-badge' : ''}">${done ? '已点亮' : `${count}/3 已完成`}</span>${large ? `<div class="copy"><h3>${level.title}</h3><p>${level.poemTitle}<br>${count ? '继续诗词冒险' : '听故事，玩画面'}</p><div class="progress-dots">${[0,1,2].map(index => `<i class="${runtime.progress.has(`${id}-${index}`) ? 'on' : ''}"></i>`).join('')}</div></div>` : `<div class="world-copy"><b>${level.title}</b><small>${level.poemTitle}<br>${count ? '继续上次冒险' : '3个语音小游戏'}</small></div>`}</button>`;
  };

  renderCollections = function () {
    const ids = Object.keys(levels);
    el('homeWorlds').innerHTML = ids.map(id => worldCard(id)).join('');
    el('mapWorlds').innerHTML = ids.map(id => worldCard(id, true)).join('');
    el('homeStars').textContent = runtime.progress.size;
    el('albumCount').textContent = `已收集 ${completed.size}/4`;
    el('albumGrid').innerHTML = ids.map(id => {
      const level = levels[id];
      const done = completed.has(id);
      return `<article class="poem-card ${done ? '' : 'locked'}"><span class="card-status">${done ? '已收藏' : '待解锁'}</span><h3>${level.poemTitle}</h3><div class="author">${level.author}</div><div class="poem-lines">${done ? level.poem.map((line, index) => line + (index % 2 ? '。' : '，')).join('<br>') : '完成诗境后展开诗卷'}</div>${done ? `<button class="speak album-speak" data-read="${id}" style="margin-top:9px">🔊</button>` : ''}</article>`;
    }).join('');
    el('reportWorlds').textContent = completed.size;
    el('reportTasks').textContent = runtime.progress.size;
    bindLevelButtons();
    document.querySelectorAll('.album-speak').forEach(button => { button.onclick = () => speakPoem(button.dataset.read); });
  };

  const baseShowScreen = showScreen;
  showScreen = function (name) {
    runtime.epoch += 1;
    runtime.phase = PHASE.EXITED;
    stopTimers();
    cancelVoice('navigation');
    return baseShowScreen(name);
  };

  const baseLeaveLevel = leaveLevel;
  leaveLevel = function () {
    runtime.epoch += 1;
    runtime.phase = PHASE.EXITED;
    stopTimers();
    cancelVoice();
    clearStageRuntime();
    baseLeaveLevel();
  };

  el('levelBack').onclick = leaveLevel;

  showResult = function () {
    const level = levels[currentLevel];
    clearStageRuntime();
    completed.add(currentLevel);
    persistArray('poetry-completed', [...completed]);
    el('levelScreen').classList.remove('active');
    el('resultScreen').classList.add('active');
    el('resultScreen').style.backgroundImage = `url('${level.bg}')`;
    el('resultReward').textContent = level.reward;
    el('resultHeading').textContent = level.steps[2].done;
    el('resultTitle').textContent = level.poemTitle;
    el('resultAuthor').textContent = level.author;
    el('resultPoem').innerHTML = level.poem.map((line, index) => line + (index % 2 ? '。' : '，')).join('<br>');
    renderCollections();
    const epoch = runtime.epoch;
    speakAsync(audioText[currentLevel].result, .84, 'teacher', epoch).then(status => {
      if (status === 'ended' && epoch === runtime.epoch && el('resultScreen').classList.contains('active')) {
        speakAsync(audioText[currentLevel].poem, .76, 'scholar', epoch);
      }
    });
  };
  el('resultMap').onclick = leaveLevel;
  el('playAgain').onclick = () => {
    el('resultScreen').classList.remove('active');
    runtime.epoch += 1;
    stopTimers();
    cancelVoice();
    startLevel(currentLevel);
  };

  el('taskContinue').onclick = () => {
    if (runtime.phase !== PHASE.DONE) return;
    if (stepIndex < 2) { stepIndex += 1; renderStep(); }
    else showResult();
  };
  el('taskSpeak').onclick = async () => {
    if (runtime.phase === PHASE.DONE) {
      speakAsync(storyVoices[taskKey()], .82, 'teacher', runtime.epoch);
      return;
    }
    if (![PHASE.WAITING, PHASE.ASKING].includes(runtime.phase)) return;
    stopTimers();
    runtime.epoch += 1;
    await askQuestion();
  };
  el('storyReplay').onclick = () => {
    if (![PHASE.WAITING, PHASE.DONE].includes(runtime.phase)) return;
    const beat = runtime.phase === PHASE.DONE ? storyVoices[taskKey()] : introText();
    const speaker = runtime.phase === PHASE.DONE ? 'teacher' : introSpeaker();
    el('guideBubble').textContent = beat;
    speakAsync(beat, .84, speaker, runtime.epoch);
  };

  document.querySelectorAll('.sound-toggle').forEach(button => {
    button.onclick = () => {
      soundOn = !soundOn;
      runtime.epoch += 1;
      cancelVoice();
      document.querySelectorAll('.sound-toggle').forEach(node => { node.textContent = soundOn ? '🔊' : '🔇'; });
      if (el('levelScreen').classList.contains('active') && runtime.phase !== PHASE.DONE) {
        if (soundOn) askQuestion();
        else { showReady(); setPhase(PHASE.WAITING); enableTaskControls(); armIdleHint(); }
      }
    };
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      runtime.hiddenPhase = runtime.phase;
      runtime.epoch += 1;
      stopTimers();
      cancelVoice();
      el('levelScreen').classList.remove('is-performing');
    } else if (el('storyScreen').classList.contains('open')) {
      runtime.hiddenPhase = null;
      stopTimers();
      el('levelScreen').classList.remove('is-performing');
      runtime.epoch += 1;
      renderStoryPanel();
    } else if (el('levelScreen').classList.contains('active') && runtime.phase !== PHASE.DONE) {
      const hiddenPhase = runtime.hiddenPhase;
      runtime.hiddenPhase = null;
      stopTimers();
      el('levelScreen').classList.remove('is-performing');
      if ([PHASE.PERFORMING, PHASE.HELPING].includes(hiddenPhase)) renderStep();
      else {
        runtime.epoch += 1;
        askQuestion();
      }
    } else {
      runtime.hiddenPhase = null;
    }
  });

  window.addEventListener('resize', hideCoach);
  renderCollections();
})();
