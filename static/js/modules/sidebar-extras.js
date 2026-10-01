/**
 * @fileoverview 侧边栏增强：滚动焦点高亮与时间线阅读进度条。
 */
(function () {
  'use strict';

  const left = document.querySelector('.kd-left');
  if (!left) return;

  const line = document.querySelector('.timeline-list');
  const container = line ? line.closest('.left-time') : null;

  // 卡片焦点高亮：滚到视口中央的卡片加 .in-focus。
  if (!PREFERS_REDUCED_MOTION) {
    const cards = left.querySelectorAll('.left-div:not(.left-weather)');
    if (cards.length) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            cards.forEach(function (el) {
              el.classList.remove('in-focus');
            });
            entry.target.classList.add('in-focus');
          });
        },
        {root: left, rootMargin: '-45% 0px -45% 0px', threshold: 0},
      );
      cards.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  // 时间线阅读进度：在卡片右侧绘制一条进度线。
  if (line && container) {
    const bar = document.createElement('div');
    bar.className = 'timeline-progress';
    bar.innerHTML = '<div class="timeline-progress-fill"></div>';
    container.appendChild(bar);
    const fill = bar.querySelector('.timeline-progress-fill');

    let rafId = null;

    /**
     * 按时间线滚动位置更新进度条高度。
     * @return {void}
     */
    function updateProgress() {
      rafId = null;
      const max = line.scrollHeight - line.clientHeight;
      const pct = max > 0 ? (line.scrollTop / max) * 100 : 0;
      fill.style.height = pct + '%';
    }

    /**
     * 用 requestAnimationFrame 合并高频滚动事件。
     * @return {void}
     */
    function scheduleProgress() {
      if (rafId === null) rafId = requestAnimationFrame(updateProgress);
    }

    line.addEventListener('scroll', scheduleProgress, {passive: true});
    window.addEventListener('resize', scheduleProgress, {passive: true});
    updateProgress();
  }
})();
