/**
 * @fileoverview 通用工具函数模块。
 */
(function() {
  'use strict';

  /**
   * 切换元素 class。
   * @param {string} selector CSS 选择器。
   * @param {string} className 要切换的类名。
   * @return {void}
   */
  window.toggleClass = function(selector, className) {
    document.querySelectorAll(selector).forEach(function(el) {
      el.classList.toggle(className);
    });
  };

  /**
   * 弹出图片弹窗。
   * @param {string=} imageURL 图片地址。
   * @return {void}
   */
  window.pop = function(imageURL) {
    const img = document.querySelector('.tc-img');
    if (imageURL && img) img.src = imageURL;
    window.toggleClass('.tc-main', 'active');
    window.toggleClass('.tc', 'active');
  };

  /**
   * 设置 Cookie。
   * @param {string} name 名称。
   * @param {string} value 值。
   * @param {number} days 过期天数。
   * @return {void}
   */
  window.setCookie = function(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 86400000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  };

  /**
   * 读取 Cookie。
   * @param {string} name 名称。
   * @return {?string} Cookie 值或 null。
   */
  window.getCookie = function(name) {
    const eq = name + '=';
    const parts = document.cookie.split(';');
    for (let i = 0; i < parts.length; i++) {
      let c = parts[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(eq) === 0) return c.substring(eq.length);
    }
    return null;
  };

  /**
   * 转义 HTML 特殊字符。
   * @param {string} str 原始字符串。
   * @return {string} 转义后的字符串。
   */
  window.escapeHtml = function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;'}[m];
    });
  };

  /**
   * 数字缩写格式化。
   * @param {number} n 数字。
   * @return {string} 缩写字符串。
   */
  window.formatNumber = function(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();
  };

  const tc = document.getElementsByClassName('tc');
  const tcMain = document.getElementsByClassName('tc-main');
  if (tc[0]) {
    tc[0].addEventListener('click', function() {
      window.pop();
    });
  }
  if (tcMain[0]) {
    tcMain[0].addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
})();
