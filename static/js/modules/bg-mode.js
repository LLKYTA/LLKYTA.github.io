/**
 * @fileoverview 背景模式切换模块。
 */
(function() {
  'use strict';

  window.applyBgMode = function(mode) {
    const modes = (CFG.background && CFG.background.modes) || ['glow', 'particles', 'none'];
    if (modes.indexOf(mode) === -1) mode = 'glow';
    document.documentElement.dataset.bg = mode;
    localStorage.setItem('KD_bgMode', mode);
    const p = window.KD_BG_PARTICLES;
    if (p) {
      if (mode === 'particles') p.start();
      else p.stop();
    }
  };
})();
