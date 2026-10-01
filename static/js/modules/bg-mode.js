/**
 * @fileoverview 背景模式切换模块。
 */
(function () {
  'use strict';

  const FALLBACK_MODES = ['glow', 'particles', 'none'];

  /**
   * 读取配置中允许的背景模式列表。
   * @return {!Array<string>} 模式列表。
   */
  function getAllowedModes() {
    const modes = CFG.background && CFG.background.modes;
    return Array.isArray(modes) && modes.length ? modes : FALLBACK_MODES;
  }

  /**
   * 应用背景模式并持久化选择。
   * @param {string} mode 'glow'、'particles' 或 'none'。
   * @return {void}
   */
  window.applyBgMode = function (mode) {
    const modes = getAllowedModes();
    const next = modes.indexOf(mode) === -1 ? modes[0] : mode;
    document.documentElement.dataset.bg = next;
    window.KD_STORAGE.write('KD_bgMode', next);

    const particles = window.KD_BG_PARTICLES;
    if (!particles) return;
    if (next === 'particles') particles.start();
    else particles.stop();
  };
})();
