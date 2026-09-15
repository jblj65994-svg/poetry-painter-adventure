(function v19Interface() {
  'use strict';

  const level = document.getElementById('levelScreen');
  const storyReplay = document.getElementById('storyReplay');
  const taskSpeak = document.getElementById('taskSpeak');
  const guideBubble = document.getElementById('guideBubble');
  const stageFeedback = document.getElementById('stageFeedback');

  if (!level || !storyReplay || !taskSpeak || !guideBubble || !stageFeedback) return;
  if (level.dataset.v19Interface === 'ready') return;
  level.dataset.v19Interface = 'ready';

  function storyMarkup(label) {
    return '<span class="v19-story-mark" aria-hidden="true"></span>' +
      '<span class="v19-btn-label">' + label + '</span>';
  }

  function listenMarkup(label) {
    return '<span class="v19-listen-mark" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="v19-btn-label">' + label + '</span>';
  }

  function setButton(button, label, markup) {
    button.classList.add('v19-audio-pill');
    if (button.dataset.v19Label !== label) {
      button.innerHTML = markup(label);
      button.dataset.v19Label = label;
    }
    button.title = label;
    button.setAttribute('aria-label', label);
  }

  function syncInterface() {
    const done = level.classList.contains('phase-done');
    const performing = level.classList.contains('phase-performing');

    setButton(storyReplay, '听故事', storyMarkup);
    setButton(taskSpeak, done ? '听讲解' : '听题目', listenMarkup);

    guideBubble.hidden = performing;
    guideBubble.setAttribute('aria-hidden', performing ? 'true' : 'false');

    const showFeedback = performing && !done;
    stageFeedback.hidden = !showFeedback;
    stageFeedback.setAttribute('aria-hidden', showFeedback ? 'false' : 'true');
  }

  let syncQueued = false;
  function scheduleSync() {
    if (syncQueued) return;
    syncQueued = true;
    queueMicrotask(function () {
      syncQueued = false;
      syncInterface();
    });
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(level, {
    attributes: true,
    attributeFilter: ['class', 'data-task', 'data-world']
  });

  guideBubble.setAttribute('aria-live', 'polite');
  syncInterface();
})();
