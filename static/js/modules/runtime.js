/**
 * @fileoverview 站点运行时间显示模块。
 */
(function () {
  'use strict';

  const el = document.getElementById('site-runtime');
  if (!el || !CFG.site || !CFG.site.startDate) return;

  const START = new Date(CFG.site.startDate).getTime();
  if (isNaN(START)) return;

  const DAY = 86400000;
  const HOUR = 3600000;
  const MINUTE = 60000;

  /**
   * 计算并渲染运行时长。
   * @return {void}
   */
  function tick() {
    const diff = Date.now() - START;
    if (diff < 0) {
      el.textContent = '尚未上线';
      return;
    }
    const days = Math.floor(diff / DAY);
    const hours = Math.floor((diff % DAY) / HOUR);
    const minutes = Math.floor((diff % HOUR) / MINUTE);
    el.innerHTML =
      '本站已运行 <b>' +
      days +
      '</b> 天 <b>' +
      hours +
      '</b> 时 <b>' +
      minutes +
      '</b> 分';
  }

  tick();
  // 页面不可见时不刷新，避免后台标签页的无效计算。
  setInterval(function () {
    if (!document.hidden) tick();
  }, 30000);
})();
