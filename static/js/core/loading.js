/**
 * @fileoverview 页面加载动画。
 */
(function() {
  'use strict';
  const pageLoading = document.querySelector('#KD-loading');
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (pageLoading) {
        pageLoading.style.opacity = '0';
        setTimeout(function() {
          pageLoading.style.display = 'none';
        }, 500);
      }
    }, 100);
  });
})();
