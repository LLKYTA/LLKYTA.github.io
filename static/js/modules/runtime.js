/**
 * @fileoverview 站点运行时间显示模块。
 */
(function() {
  'use strict';
  const el = document.getElementById('siteRuntime');
  if (!el || !CFG.site) return;
  const START = new Date(CFG.site.startDate).getTime();

  function tick() {
    const diff = Date.now() - START;
    if (diff < 0) {
      el.innerHTML = '尚未上线';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.innerHTML = '本站已运行 <b>' + d + '</b> 天 <b>' + h + '</b> 时 <b>' + m + '</b> 分';
  }
  tick();
  setInterval(tick, 30000);
})();
