(function () {
  'use strict';

  if (window.V17_ACCESSIBILITY && window.V17_ACCESSIBILITY.initialized) return;

  const VERSION = '17.0';
  const RUBY_SELECTOR = [
    '#taskTitle',
    '#taskPrompt',
    '#taskFeedback',
    '#guideBubble',
    '#resultTitle',
    '#resultAuthor',
    '#resultPoem',
    '.poem-card:not(.locked) h3',
    '.poem-card:not(.locked) .author',
    '.poem-card:not(.locked) .poem-lines'
  ].join(',');

  const PINYIN = Object.freeze({
    '冬夜读书示子聿': 'dōng yè dú shū shì zǐ yù',
    '己亥杂诗': 'jǐ hài zá shī',
    '题西林壁': 'tí xī lín bì',
    '龚自珍': 'gōng zì zhēn',
    '卢梅坡': 'lú méi pō',
    '闪光点': 'shǎn guāng diǎn',
    '未肯降': 'wèi kěn xiáng',
    '费评章': 'fèi píng zhāng',
    '无遗力': 'wú yí lì',
    '终觉浅': 'zhōng jué qiǎn',
    '小亭子': 'xiǎo tíng zi',
    '小船': 'xiǎo chuán',
    '物件': 'wù jiàn',
    '图画书': 'tú huà shū',
    '真面目': 'zhēn miàn mù',
    '白日斜': 'bái rì xié',
    '即天涯': 'jí tiān yá',
    '无情物': 'wú qíng wù',
    '横看': 'héng kàn',
    '成岭': 'chéng lǐng',
    '侧成峰': 'cè chéng fēng',
    '远近': 'yuǎn jìn',
    '高低': 'gāo dī',
    '各不同': 'gè bù tóng',
    '不识': 'bù shí',
    '山岭': 'shān lǐng',
    '山峰': 'shān fēng',
    '庐山': 'lú shān',
    '只缘': 'zhǐ yuán',
    '骚人': 'sāo rén',
    '搁笔': 'gē bǐ',
    '须逊': 'xū xùn',
    '争春': 'zhēng chūn',
    '却输': 'què shū',
    '浩荡': 'hào dàng',
    '离愁': 'lí chóu',
    '吟鞭': 'yín biān',
    '东指': 'dōng zhǐ',
    '天涯': 'tiān yá',
    '落红': 'luò hóng',
    '化作': 'huà zuò',
    '春泥': 'chūn ní',
    '更护花': 'gèng hù huā',
    '少壮': 'shào zhuàng',
    '工夫': 'gōng fu',
    '学问': 'xué wèn',
    '纸上得来': 'zhǐ shàng dé lái',
    '始成': 'shǐ chéng',
    '绝知': 'jué zhī',
    '躬行': 'gōng xíng',
    '苏轼': 'sū shì',
    '陆游': 'lù yóu',
    '按住': 'àn zhù',
    '拖到': 'tuō dào',
    '观察': 'guān chá',
    '白鹤': 'bái hè',
    '白雪': 'bái xuě',
    '雪云': 'xuě yún',
    '花苞': 'huā bāo',
    '梅香': 'méi xiāng',
    '梅枝': 'méi zhī',
    '竹篮': 'zhú lán',
    '木箱': 'mù xiāng',
    '落花': 'luò huā',
    '花肥': 'huā féi',
    '喂饱': 'wèi bǎo',
    '肥沃': 'féi wò',
    '营养': 'yíng yǎng',
    '花圃': 'huā pǔ',
    '土地': 'tǔ dì',
    '水壶': 'shuǐ hú',
    '浇水': 'jiāo shuǐ',
    '种子': 'zhǒng zi',
    '小坑': 'xiǎo kēng',
    '花盆': 'huā pén',
    '嫩芽': 'nèn yá',
    '新花': 'xīn huā'
  });

  const PRAISE_BY_TASK = Object.freeze({
    'lushan-0': '你看得真仔细！换个位置，长山岭就变成尖山峰啦。',
    'lushan-1': '你发现得真棒！站远一点，整座庐山都来到眼前啦。',
    'lushan-2': '太会观察啦！跟着白鹤飞出去，终于看清整座山啦。',
    'xuemei-0': '你轻轻一点，白雪就把山谷盖得亮晶晶啦！',
    'xuemei-1': '好温柔的小手！梅花开啦，香香的。',
    'xuemei-2': '你帮它们找到了闪光点：雪更白，梅更香，都很棒！',
    'flowers-0': '你送得真稳！落花变成有营养的花肥啦。',
    'flowers-1': '照顾得真好！土地吃饱啦，可以抱抱新种子了。',
    'flowers-2': '你真有耐心！春泥护着种子，新花开出来啦。',
    'study-0': '你找到好办法啦！书里说，种下去以后还要浇水。',
    'study-1': '你的小手真能干！种子种好啦，这就是亲手学会。',
    'study-2': '你又认真又有耐心！看书再亲手做，真的学会啦。'
  });

  const RESULT_HEADINGS = Object.freeze({
    lushan: '你看懂庐山啦！',
    xuemei: '你找到了它们的闪光点！',
    flowers: '新花被你照顾开啦！',
    study: '你亲手学会啦！'
  });

  const PRAISE_AUDIO_BY_TASK = Object.freeze({
    'lushan-0': Object.freeze({ speaker: 'xiaohei', voice: 'zh-CN-YunxiaNeural', rate: '-4%', pitch: '+6Hz', volume: '+1%', file: 'assets/audio/v17/praise-lushan-0-v17.mp3' }),
    'lushan-1': Object.freeze({ speaker: 'xiaohei', voice: 'zh-CN-YunxiaNeural', rate: '-4%', pitch: '+6Hz', volume: '+1%', file: 'assets/audio/v17/praise-lushan-1-v17.mp3' }),
    'lushan-2': Object.freeze({ speaker: 'xiaohei', voice: 'zh-CN-YunxiaNeural', rate: '-4%', pitch: '+6Hz', volume: '+1%', file: 'assets/audio/v17/praise-lushan-2-v17.mp3' }),
    'xuemei-0': Object.freeze({ speaker: 'teacher', voice: 'zh-CN-XiaoxiaoNeural', rate: '-9%', pitch: '+1Hz', volume: '+0%', file: 'assets/audio/v17/praise-xuemei-0-v17.mp3' }),
    'xuemei-1': Object.freeze({ speaker: 'teacher', voice: 'zh-CN-XiaoxiaoNeural', rate: '-9%', pitch: '+1Hz', volume: '+0%', file: 'assets/audio/v17/praise-xuemei-1-v17.mp3' }),
    'xuemei-2': Object.freeze({ speaker: 'teacher', voice: 'zh-CN-XiaoxiaoNeural', rate: '-9%', pitch: '+1Hz', volume: '+0%', file: 'assets/audio/v17/praise-xuemei-2-v17.mp3' }),
    'flowers-0': Object.freeze({ speaker: 'tangyun', voice: 'zh-CN-XiaoyiNeural', rate: '-5%', pitch: '+5Hz', volume: '+0%', file: 'assets/audio/v17/praise-flowers-0-v17.mp3' }),
    'flowers-1': Object.freeze({ speaker: 'tangyun', voice: 'zh-CN-XiaoyiNeural', rate: '-5%', pitch: '+5Hz', volume: '+0%', file: 'assets/audio/v17/praise-flowers-1-v17.mp3' }),
    'flowers-2': Object.freeze({ speaker: 'tangyun', voice: 'zh-CN-XiaoyiNeural', rate: '-5%', pitch: '+5Hz', volume: '+0%', file: 'assets/audio/v17/praise-flowers-2-v17.mp3' }),
    'study-0': Object.freeze({ speaker: 'scholar', voice: 'zh-CN-YunxiNeural', rate: '-8%', pitch: '+2Hz', volume: '+0%', file: 'assets/audio/v17/praise-study-0-v17.mp3' }),
    'study-1': Object.freeze({ speaker: 'scholar', voice: 'zh-CN-YunxiNeural', rate: '-8%', pitch: '+2Hz', volume: '+0%', file: 'assets/audio/v17/praise-study-1-v17.mp3' }),
    'study-2': Object.freeze({ speaker: 'scholar', voice: 'zh-CN-YunxiNeural', rate: '-8%', pitch: '+2Hz', volume: '+0%', file: 'assets/audio/v17/praise-study-2-v17.mp3' })
  });

  const PRAISE_PROFILE = Object.freeze({
    schemaVersion: 1,
    version: VERSION,
    mode: 'v3-character-static-audio',
    rate: .84,
    description: '具体夸赞孩子的观察、耐心和动作；用标点留出自然停顿，并沿用 v3 的角色声线。',
    phrases: PRAISE_BY_TASK,
    audio: PRAISE_AUDIO_BY_TASK
  });

  const TASK_CANDIDATES = [
    '#taskArea button',
    '#taskArea [role="button"]',
    '#taskArea .scene-hotspot',
    '#taskArea .tap-target',
    '#taskArea .gesture-card',
    '#taskArea .drag-token'
  ].join(',');

  const rubyTerms = Object.keys(PINYIN).sort((a, b) => b.length - a.length);
  const rubyPattern = new RegExp(`(${rubyTerms.map(escapeRegExp).join('|')})`, 'g');
  const sourcePraise = new Map();
  const diagnostics = {
    observerCallbacks: 0,
    refreshRequests: 0,
    refreshRuns: 0
  };
  let observer = null;
  let refreshQueued = false;

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function currentLevelId() {
    try {
      return typeof currentLevel === 'string' ? currentLevel : null;
    } catch (_) {
      return null;
    }
  }

  function currentStepNumber() {
    try {
      return Number.isInteger(stepIndex) ? stepIndex : null;
    } catch (_) {
      return null;
    }
  }

  function liveLevels() {
    try {
      return typeof levels === 'object' && levels ? levels : null;
    } catch (_) {
      return null;
    }
  }

  function patchPraiseData() {
    const guidance = window.V3_GUIDANCE && window.V3_GUIDANCE.worlds;
    const runtimeLevels = liveLevels();
    const characterMap = window.V3_CHARACTER_FEEDBACK_TEXT_MAP;
    Object.entries(PRAISE_BY_TASK).forEach(([key, replacement]) => {
      const separator = key.lastIndexOf('-');
      const worldId = key.slice(0, separator);
      const index = Number(key.slice(separator + 1));
      const sourceStep = guidance && guidance[worldId] && guidance[worldId].steps[index];
      const runtimeStep = runtimeLevels && runtimeLevels[worldId] && runtimeLevels[worldId].steps[index];
      if (sourceStep && sourceStep.successVoice !== replacement) {
        sourcePraise.set(sourceStep.successVoice, replacement);
        sourceStep.successVoice = replacement;
      }
      if (runtimeStep) {
        if (runtimeStep.successVoice && runtimeStep.successVoice !== replacement) {
          sourcePraise.set(runtimeStep.successVoice, replacement);
        }
        if (runtimeStep.done && runtimeStep.done !== replacement) {
          sourcePraise.set(runtimeStep.done, replacement);
        }
        runtimeStep.successVoice = replacement;
        runtimeStep.done = replacement;
      }
      const audio = PRAISE_AUDIO_BY_TASK[key];
      if (characterMap && audio) characterMap[`${audio.speaker}|${replacement}`] = audio.file;
    });
  }

  function replacePraiseText() {
    const feedback = document.getElementById('taskFeedback');
    const level = document.getElementById('levelScreen');
    if (feedback && level && level.classList.contains('phase-done')) {
      const worldId = currentLevelId();
      const index = currentStepNumber();
      const replacement = worldId != null && index != null ? PRAISE_BY_TASK[`${worldId}-${index}`] : null;
      if (replacement && feedback.textContent.trim() !== replacement) feedback.textContent = replacement;
    } else if (feedback) {
      const replacement = sourcePraise.get(feedback.textContent.trim());
      if (replacement) feedback.textContent = replacement;
    }

    const result = document.getElementById('resultScreen');
    const heading = document.getElementById('resultHeading');
    const worldId = currentLevelId();
    if (result && heading && result.classList.contains('active') && RESULT_HEADINGS[worldId]) {
      heading.textContent = RESULT_HEADINGS[worldId];
    }
  }

  function createRuby(term) {
    const ruby = document.createElement('ruby');
    ruby.dataset.v17Ruby = 'true';
    ruby.appendChild(document.createTextNode(term));
    const open = document.createElement('rp');
    open.textContent = '（';
    const reading = document.createElement('rt');
    reading.textContent = PINYIN[term];
    reading.setAttribute('aria-hidden', 'true');
    const close = document.createElement('rp');
    close.textContent = '）';
    ruby.append(open, reading, close);
    return ruby;
  }

  function rubyTextNode(node) {
    const text = node.nodeValue || '';
    rubyPattern.lastIndex = 0;
    if (!rubyPattern.test(text)) return false;
    rubyPattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let match;
    while ((match = rubyPattern.exec(text)) !== null) {
      if (match.index > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      fragment.appendChild(createRuby(match[0]));
      cursor = match.index + match[0].length;
    }
    if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
    return true;
  }

  function addRuby(element) {
    if (!element || element.querySelector('ruby[data-v17-ruby]')) return;
    if (element.classList.contains('v17-ruby-ready')) element.classList.remove('v17-ruby-ready');
    if (element.dataset.v17RubyLabel === 'true') {
      element.removeAttribute('aria-label');
      delete element.dataset.v17RubyLabel;
    }
    const accessibleText = element.textContent.replace(/\s+/g, ' ').trim();
    if (!accessibleText) return;
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest('ruby,rt,rp,script,style,[data-v17-no-ruby]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const changed = nodes.reduce((found, node) => rubyTextNode(node) || found, false);
    if (!changed) return;
    if (!element.classList.contains('v17-ruby-ready')) element.classList.add('v17-ruby-ready');
    if (!element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', accessibleText);
      element.dataset.v17RubyLabel = 'true';
    }
  }

  function addRubyToCurrentCopy() {
    document.querySelectorAll(RUBY_SELECTOR).forEach(addRuby);
  }

  function isUnavailable(node) {
    if (!node || node.hidden || node.disabled) return true;
    if (node.getAttribute('aria-disabled') === 'true') return true;
    if (node.classList.contains('done') || node.classList.contains('used') || node.classList.contains('locked')) return true;
    if (node.closest('[hidden]')) return true;
    const style = window.getComputedStyle(node);
    return style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none';
  }

  function isVisibleDropTarget(node) {
    if (!node || node.hidden || node.classList.contains('done') || node.closest('[hidden]')) return false;
    const style = window.getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function currentCueTargets() {
    const targets = new Set();
    const level = document.getElementById('levelScreen');
    const taskArea = document.getElementById('taskArea');
    if (!level || !taskArea || !level.classList.contains('active')) return targets;

    if (level.classList.contains('phase-waiting')) {
      taskArea.querySelectorAll(TASK_CANDIDATES).forEach(node => {
        if (!isUnavailable(node)) targets.add(node);
      });

      const activeDrops = new Set();
      taskArea.querySelectorAll('.drag-token[data-target]').forEach(token => {
        if (!isUnavailable(token)) activeDrops.add(token.dataset.target);
      });
      taskArea.querySelectorAll('.drop-target[data-drop]').forEach(target => {
        if (activeDrops.has(target.dataset.drop) && isVisibleDropTarget(target)) targets.add(target);
      });
    }

    const continueButton = document.getElementById('taskContinue');
    if (continueButton) {
      if (continueButton.hidden) delete continueButton.dataset.v17CueDismissed;
      if (level.classList.contains('phase-done') && !isUnavailable(continueButton)) targets.add(continueButton);
    }
    return targets;
  }

  function removeCue(node, clearHost = true) {
    if (!node) return;
    [...node.children].filter(child => child.classList.contains('v17-cue-ring')).forEach(ring => ring.remove());
    if (node.classList.contains('v17-cue-host')) node.classList.remove('v17-cue-host');
    if (node.classList.contains('v17-cue-static')) node.classList.remove('v17-cue-static');
    if (node.style.getPropertyValue('--v17-cue-delay')) node.style.removeProperty('--v17-cue-delay');
    if (clearHost && node.dataset.v17CueHost != null) delete node.dataset.v17CueHost;
  }

  function addCue(node, order) {
    if (node.dataset.v17CueDismissed === 'true') return;
    if (node.dataset.v17CueHost !== 'true') node.dataset.v17CueHost = 'true';
    if (!node.classList.contains('v17-cue-host')) node.classList.add('v17-cue-host');
    const needsPosition = window.getComputedStyle(node).position === 'static';
    if (needsPosition && !node.classList.contains('v17-cue-static')) node.classList.add('v17-cue-static');
    if (!needsPosition && node.classList.contains('v17-cue-static')) node.classList.remove('v17-cue-static');
    const delay = `${-(order % 4) * .18}s`;
    if (node.style.getPropertyValue('--v17-cue-delay') !== delay) node.style.setProperty('--v17-cue-delay', delay);
    if (![...node.children].some(child => child.classList.contains('v17-cue-ring'))) {
      const ring = document.createElement('span');
      ring.className = 'v17-cue-ring';
      ring.setAttribute('aria-hidden', 'true');
      node.appendChild(ring);
    }
  }

  function syncCues() {
    const targets = currentCueTargets();
    document.querySelectorAll('[data-v17-cue-host="true"]').forEach(node => {
      if (!targets.has(node) || node.dataset.v17CueDismissed === 'true') removeCue(node);
    });
    [...targets].forEach(addCue);
  }

  function dismissCue(event) {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const origin = event.target instanceof Element ? event.target : null;
    const target = origin && origin.closest('[data-v17-cue-host="true"]');
    if (!target) return;
    target.dataset.v17CueDismissed = 'true';
    removeCue(target, false);
  }

  function refresh() {
    refreshQueued = false;
    diagnostics.refreshRuns += 1;
    if (observer) observer.disconnect();
    try {
      patchPraiseData();
      replacePraiseText();
      addRubyToCurrentCopy();
      syncCues();
    } finally {
      observeDom();
    }
  }

  function scheduleRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    diagnostics.refreshRequests += 1;
    const schedule = window.requestAnimationFrame || (callback => setTimeout(callback, 16));
    schedule(refresh);
  }

  function observeDom() {
    if (!observer || !document.body) return;
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'disabled', 'aria-disabled']
    });
  }

  function boot() {
    document.documentElement.classList.add('v17-accessibility');
    patchPraiseData();
    document.addEventListener('pointerdown', dismissCue, true);
    document.addEventListener('click', dismissCue, true);
    document.addEventListener('keydown', dismissCue, true);
    observer = new MutationObserver(() => {
      diagnostics.observerCallbacks += 1;
      scheduleRefresh();
    });
    observeDom();
    refresh();
    document.dispatchEvent(new CustomEvent('poetry:v17-accessibility-ready', {
      detail: { version: VERSION }
    }));
  }

  window.V17_ACCESSIBILITY = {
    initialized: true,
    version: VERSION,
    praiseProfile: PRAISE_PROFILE,
    refresh: scheduleRefresh,
    diagnostics() {
      return Object.freeze({ ...diagnostics, refreshQueued });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
