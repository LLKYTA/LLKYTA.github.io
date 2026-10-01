/**
 * @fileoverview 主题三态（浅色 / 深色 / 跟随系统）与 View Transitions。
 */
(function () {
  'use strict';

  /**
   * 读取用户保存的主题模式。
   * @return {string} 'auto'、'dark' 或 'light'。
   */
  function readMode() {
    const stored = window.KD_STORAGE.read('KD_themeMode');
    const cookie = window.getCookie('themeState');
    return (stored || cookie || 'auto').toLowerCase();
  }

  /**
   * 解析当前应生效的主题。
   * @param {string} mode 主题模式。
   * @return {string} 'Dark' 或 'Light'。
   */
  function resolveTheme(mode) {
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'Dark'
        : 'Light';
    }
    return mode === 'dark' ? 'Dark' : 'Light';
  }

  /**
   * 应用解析后的主题到文档、插画与开关状态。
   * @return {void}
   */
  function applyResolvedTheme() {
    const resolved = resolveTheme(readMode());
    const snakeArt = document.getElementById('snake-art');
    const checkbox = document.getElementById('theme-toggle');

    if (snakeArt) snakeArt.src = './static/svg/snake-' + resolved + '.svg';
    document.documentElement.dataset.theme = resolved;
    if (checkbox) checkbox.checked = resolved === 'Light';
    window.setCookie('themeState', resolved, 365);
  }

  /**
   * 切换主题，可选带 View Transition 过渡。
   * @param {string} theme 'Dark' 或 'Light'。
   * @param {boolean} animate 是否使用 View Transitions。
   * @return {void}
   */
  window.changeTheme = function (theme, animate) {
    const apply = function () {
      window.KD_STORAGE.write(
        'KD_themeMode',
        theme === 'Dark' ? 'dark' : 'light',
      );
      applyResolvedTheme();
    };
    if (animate && document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  window.applyResolvedTheme = applyResolvedTheme;

  // 跟随系统模式下，监听系统主题变化。
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', function () {
      if (readMode() === 'auto') applyResolvedTheme();
    });
})();
