/**
 * @fileoverview 一言（Hitokoto）模块。
 */
(function () {
  'use strict';

  const API = 'https://v1.hitokoto.cn/?c=j&c=i';
  const TIMEOUT = 8000;

  /**
   * 写入一言正文与出处。
   * @param {string} text 正文。
   * @param {string} from 出处的展示文本。
   * @return {void}
   */
  function render(text, from) {
    const textEl = document.getElementById('hitokoto-text');
    const fromEl = document.getElementById('hitokoto-from');
    if (textEl) textEl.textContent = text;
    if (fromEl) fromEl.textContent = from;
  }

  /**
   * 组装出处展示文本。
   * @param {!Object} data 一言接口返回的数据。
   * @return {string} 形如 '---《出处》作者' 的文本。
   */
  function formatFrom(data) {
    const source = data.from || '网络';
    const author = data.from_who;
    const hasAuthor = author && author !== 'null';
    return '---' + source + (hasAuthor ? ' ' + author : '');
  }

  /**
   * 拉取一条随机一言。
   * @return {void}
   */
  window.loadHi = function () {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, TIMEOUT);

    fetch(API, {signal: controller.signal})
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        render(data.hitokoto || '——', formatFrom(data));
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') {
          render('一言请求超时，点击重试', '-- 超时');
          return;
        }
        console.error('一言加载失败:', err);
        render('一言加载失败，点击重试', '-- 网络异常');
      });
  };
})();
