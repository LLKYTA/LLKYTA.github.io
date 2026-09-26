/**
 * @fileoverview 访客统计模块。
 */
(function() {
  'use strict';
  const el = document.getElementById('visitStats');
  if (!el) return;
  const KEY = 'KD_visitCount';
  const BASE = 1024;
  const local = parseInt(localStorage.getItem(KEY) || '0', 10) + 1;
  localStorage.setItem(KEY, local);
  const total = BASE + local;
  el.innerHTML = '你是第 <b>' + total.toLocaleString() + '</b> 位访客';

  fetch('https://ip.useragentinfo.com/json')
      .then(function(r) {
        return r.json();
      })
      .then(function(d) {
        const city = d.city || d.province || d.country || '未知';
        el.innerHTML =
        '你是第 <b>' + total.toLocaleString() + '</b> 位访客 · 来自 <b>' + city + '</b>';
      })
      .catch(function() {});
})();
