/**
 * @fileoverview 通用工具函数：图片弹窗、Cookie、HTML 转义与数字格式化。
 */
(function () {
  'use strict';

  /**
   * 批量切换元素上的 class。
   * @param {string} selector CSS 选择器。
   * @param {string} className 要切换的类名。
   * @return {void}
   */
  window.toggleClass = function (selector, className) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.toggle(className);
    });
  };

  /**
   * 打开或关闭图片弹窗（二维码等）。不传地址时仅切换开关状态。
   * @param {string=} opt_imageUrl 图片地址。
   * @return {void}
   */
  window.pop = function (opt_imageUrl) {
    const modal = document.querySelector('.qr-modal');
    if (!modal) return;
    const img = modal.querySelector('.qr-modal-img');
    if (opt_imageUrl && img) img.src = opt_imageUrl;
    modal.classList.toggle('active');
    const main = modal.querySelector('.qr-modal-main');
    if (main) main.classList.toggle('active');
    modal.setAttribute(
      'aria-hidden',
      modal.classList.contains('active') ? 'false' : 'true',
    );
  };

  /**
   * 写入 Cookie。
   * @param {string} name 名称。
   * @param {string} value 值。
   * @param {number} days 过期天数。
   * @return {void}
   */
  window.setCookie = function (name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 86400000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie =
      name +
      '=' +
      encodeURIComponent(value) +
      expires +
      '; path=/; SameSite=Lax';
  };

  /**
   * 读取 Cookie。
   * @param {string} name 名称。
   * @return {?string} Cookie 值，不存在时返回 null。
   */
  window.getCookie = function (name) {
    const prefix = name + '=';
    const parts = document.cookie.split(';');
    for (let i = 0; i < parts.length; i++) {
      const item = parts[i].trim();
      if (item.indexOf(prefix) === 0) {
        return decodeURIComponent(item.substring(prefix.length));
      }
    }
    return null;
  };

  /**
   * 转义 HTML 特殊字符，用于拼接 innerHTML 时防止注入。
   * @param {string} str 原始字符串。
   * @return {string} 转义后的字符串。
   */
  window.escapeHtml = function (str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char];
    });
  };

  /**
   * 数字缩写格式化：1200 → 1.2k。
   * @param {number} number 数字。
   * @return {string} 缩写字符串。
   */
  window.formatNumber = function (number) {
    return number >= 1000 ? (number / 1000).toFixed(1) + 'k' : String(number);
  };

  const modal = document.querySelector('.qr-modal');
  if (modal) {
    modal.addEventListener('click', function () {
      window.pop();
    });
    const main = modal.querySelector('.qr-modal-main');
    if (main) {
      main.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    }
  }
})();
