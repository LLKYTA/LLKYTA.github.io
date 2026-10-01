/**
 * @fileoverview 页面标题个性化：切换标签页时改变标题并做打字效果。
 */
(function () {
  'use strict';

  const BASE_TITLE = 'KD_klin · 个人主页';
  const AWAY_TITLE = '👀 别走嘛，回来看看～';
  const BLUR_TITLE = '💤 暂时离开了...';
  const TYPE_SPEED = 100;
  const START_DELAY = 300;

  let timer = null;
  let cursor = 0;
  let visible = !document.hidden;
  let focused = document.hasFocus();

  /**
   * 逐字输入标题。
   * @param {string} text 目标标题。
   * @param {number} speed 每个字符的间隔（毫秒）。
   * @return {void}
   */
  function typeTitle(text, speed) {
    clearInterval(timer);
    cursor = 0;
    document.title = '';
    timer = setInterval(function () {
      if (cursor >= text.length) {
        clearInterval(timer);
        return;
      }
      document.title += text.charAt(cursor++);
    }, speed);
  }

  /**
   * 需要时把标题恢复为默认文案。
   * @return {void}
   */
  function restoreTitle() {
    if (document.title !== BASE_TITLE) typeTitle(BASE_TITLE, TYPE_SPEED);
  }

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible && focused) {
      restoreTitle();
      return;
    }
    if (!visible) {
      clearInterval(timer);
      document.title = AWAY_TITLE;
    }
  });

  window.addEventListener('blur', function () {
    focused = false;
    if (!visible) return;
    clearInterval(timer);
    document.title = BLUR_TITLE;
  });

  window.addEventListener('focus', function () {
    focused = true;
    if (visible) restoreTitle();
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      typeTitle(BASE_TITLE, TYPE_SPEED);
    }, START_DELAY);
  });
})();
