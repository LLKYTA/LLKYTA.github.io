/**
 * @fileoverview 51.la 站点统计初始化。
 * @description 从内联脚本拆出，避免内联脚本被 CSP 拦截，同时保证统计
 *     失败不会影响页面其它功能。
 */
(function () {
  'use strict';

  const SITE_ID = '3RJpmxKH3r4dvx15';

  /**
   * 初始化统计 SDK。
   * @return {void}
   */
  function init() {
    if (typeof window.LA === 'undefined' || !window.LA.init) return;
    try {
      window.LA.init({id: SITE_ID, ck: SITE_ID});
    } catch (e) {
      console.warn('[Analytics] 初始化失败:', e);
    }
  }

  init();
})();
