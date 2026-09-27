/**
 * @fileoverview 一言（Hitokoto）模块。
 */
(function () {
  'use strict';

  window.loadHi = function () {
    fetch('https://v1.hitokoto.cn/?c=j&c=i')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        const el = document.querySelector('#hitokoto_text');
        const fromEl = document.querySelector('#hitokoto_from');
        if (!el) return;
        const from =
          !data.from_who || data.from_who === 'null'
            ? '---' + data.from
            : '---' + data.from + ' ' + data.from_who;
        el.innerText = data.hitokoto;
        fromEl.innerText = from;
      })
      .catch(function (err) {
        console.error('一言加载失败:', err);
        const el = document.querySelector('#hitokoto_text');
        const fromEl = document.querySelector('#hitokoto_from');
        if (el) el.innerText = '一言加载失败，点击重试';
        if (fromEl) fromEl.innerText = '-- 网络异常';
      });
  };
})();
