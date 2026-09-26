/**
 * @fileoverview 标题个性化（切换标签页时改变标题）。
 */
(function() {
  'use strict';
  const BASE = 'KD_klin · 个人主页';
  const AWAY = '👀 别走嘛，回来看看～';
  const BLUR = '💤 暂时离开了...';
  let timer = null;
  let idx = 0;
  let visible = !document.hidden;
  let focus = document.hasFocus();

  function type(text, speed, cb) {
    clearInterval(timer);
    idx = 0;
    document.title = '';
    timer = setInterval(function() {
      if (idx >= text.length) {
        clearInterval(timer);
        if (typeof cb === 'function') cb();
        return;
      }
      document.title += text.charAt(idx++);
    }, speed || 100);
  }
  function restore() {
    if (document.title !== BASE) type(BASE, 100);
  }
  document.addEventListener('visibilitychange', function() {
    visible = !document.hidden;
    if (visible && focus) restore();
    else if (!visible) {
      clearInterval(timer);
      document.title = AWAY;
    }
  });
  window.addEventListener('blur', function() {
    focus = false;
    if (visible) {
      clearInterval(timer);
      document.title = BLUR;
    }
  });
  window.addEventListener('focus', function() {
    focus = true;
    if (visible) restore();
  });
  window.addEventListener('load', function() {
    setTimeout(function() {
      type(BASE, 100);
    }, 300);
  });
})();
