/**
 * @fileoverview 首屏加载遮罩的控制逻辑。
 * @description 遮罩的初始状态由 CSS 直接渲染（body.loading），无需等待
 *     脚本执行，因此不会出现白色闪烁。本模块只负责在资源加载完成后
 *     淡出并移除遮罩，并额外提供超时兜底。
 */
(function () {
  'use strict';

  let hidden = false;

  /**
   * 淡出加载遮罩，并在过渡结束后从文档中移除。
   * @return {void}
   */
  function hideLoading() {
    if (hidden) return;
    hidden = true;
    const pageLoading = document.querySelector('.kd-loading');
    document.body.classList.remove('loading');
    if (!pageLoading) return;
    pageLoading.style.opacity = '0';
    setTimeout(function () {
      if (pageLoading.parentNode) {
        pageLoading.parentNode.removeChild(pageLoading);
      }
    }, 500);
  }

  window.addEventListener('load', function () {
    setTimeout(hideLoading, 100);
  });

  // 兜底：即使 load 事件被第三方资源拖住，也在 4 秒内收起遮罩。
  setTimeout(hideLoading, 4000);
})();
