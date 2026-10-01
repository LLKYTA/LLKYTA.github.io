/**
 * @fileoverview 访客统计模块。
 * @description 本站是纯静态页面，没有后端计数服务，因此以本地累计次数
 *     加一个固定基数作为展示值；归属地来自公共 IP 接口，失败时静默降级。
 */
(function () {
  'use strict';

  const VISIT_KEY = 'KD_visitCount';
  const BASE_COUNT = 1024;
  const GEO_API = 'https://ip.useragentinfo.com/json';
  const GEO_TIMEOUT = 6000;

  const el = document.getElementById('visit-stats');
  if (!el) return;

  const stored = parseInt(window.KD_STORAGE.read(VISIT_KEY, '0'), 10) || 0;
  const localCount = stored + 1;
  window.KD_STORAGE.write(VISIT_KEY, localCount);
  const total = (BASE_COUNT + localCount).toLocaleString();

  /**
   * 渲染访客序号，可选附带归属地。
   * @param {string=} opt_region 归属地名称。
   * @return {void}
   */
  function render(opt_region) {
    const region = opt_region
      ? ' · 来自 <b>' + window.escapeHtml(opt_region) + '</b>'
      : '';
    el.innerHTML = '你是第 <b>' + total + '</b> 位访客' + region;
  }

  render();

  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, GEO_TIMEOUT);

  fetch(GEO_API, {signal: controller.signal})
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      clearTimeout(timer);
      const region = data.city || data.province || data.country;
      if (region) render(region);
    })
    .catch(function () {
      clearTimeout(timer);
      // 归属地获取失败时保留基础展示，不打扰用户。
    });
})();
