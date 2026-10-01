/**
 * @fileoverview 鼠标跟随光效模块。
 * @description 只在支持悬停且未开启降低动效时启用，并把坐标写入 CSS
 *     自定义属性 --mx / --my，由样式负责绘制。
 */
(function () {
  'use strict';

  if (PREFERS_REDUCED_MOTION) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const root = document.documentElement;
  let rafId = null;
  let pendingX = null;
  let pendingY = null;

  /**
   * 把最新坐标写入自定义属性（每帧最多一次）。
   * @return {void}
   */
  function applyPosition() {
    rafId = null;
    if (pendingX === null || pendingY === null) return;
    root.style.setProperty('--mx', pendingX + 'px');
    root.style.setProperty('--my', pendingY + 'px');
    pendingX = null;
    pendingY = null;
  }

  document.addEventListener(
    'mousemove',
    function (event) {
      pendingX = event.clientX;
      pendingY = event.clientY;
      if (rafId === null) rafId = requestAnimationFrame(applyPosition);
    },
    {passive: true},
  );
})();
