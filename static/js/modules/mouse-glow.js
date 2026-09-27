/**
 * @fileoverview 鼠标跟随光效模块。
 */
(function () {
  'use strict';
  if (PREFERS_REDUCED_MOTION || window.matchMedia('(hover: none)').matches) return;
  const root = document.documentElement;
  let rafId = null;
  let px = null;
  let py = null;

  function apply() {
    rafId = null;
    if (px !== null && py !== null) {
      root.style.setProperty('--mx', px + 'px');
      root.style.setProperty('--my', py + 'px');
      px = py = null;
    }
  }
  document.addEventListener(
    'mousemove',
    function (e) {
      px = e.clientX;
      py = e.clientY;
      if (rafId === null) rafId = requestAnimationFrame(apply);
    },
    {passive: true}
  );
})();
