/**
 * @fileoverview 主题三态（浅色 / 深色 / 自动）与 View Transitions。
 */
(function() {
  'use strict';

  /**
   * 应用解析后的主题。
   * @return {void}
   */
  function applyResolvedTheme() {
    const raw = localStorage.getItem('KD_themeMode') || window.getCookie('themeState') || 'auto';
    const mode = raw.toLowerCase();
    const html = document.documentElement;
    const tanChiShe = document.getElementById('tanChiShe');
    const checkbox = document.getElementById('myonoffswitch');

    let resolved;
    if (mode === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
    } else {
      resolved = mode === 'dark' ? 'Dark' : 'Light';
    }

    if (tanChiShe) tanChiShe.src = './static/svg/snake-' + resolved + '.svg';
    html.dataset.theme = resolved;
    if (checkbox) checkbox.checked = resolved === 'Light';
    window.setCookie('themeState', resolved, 365);
  }

  /**
   * 切换主题（带 View Transition）。
   * @param {string} theme 'Dark' 或 'Light'。
   * @param {boolean} animate 是否使用 View Transitions。
   * @return {void}
   */
  window.changeTheme = function(theme, animate) {
    const apply = function() {
      const mode = theme === 'Dark' ? 'dark' : 'light';
      localStorage.setItem('KD_themeMode', mode);
      applyResolvedTheme();
    };
    if (animate && document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  window.applyResolvedTheme = applyResolvedTheme;

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    if ((localStorage.getItem('KD_themeMode') || 'auto') === 'auto') {
      applyResolvedTheme();
    }
  });
})();
