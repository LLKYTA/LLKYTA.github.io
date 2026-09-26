/**
 * @fileoverview 侧边栏美化：滚动遮罩 + 焦点高亮 + 时间线进度。
 */
(function() {
  'use strict';

  const left = document.querySelector('.KD-left');
  if (!left) return;
  const line = document.querySelector('.timeline-list');
  const container = line ? line.closest('.left-time') : null;

  const mask = document.createElement('div');
  mask.className = 'left-scroll-mask';
  document.body.appendChild(mask);

  function updateMask() {
    const rect = left.getBoundingClientRect();
    if (rect.width === 0 || window.innerWidth <= 800) {
      mask.style.display = 'none';
      return;
    }
    mask.style.display = 'block';
    mask.style.left = rect.left + 'px';
    mask.style.width = rect.width + 'px';
    mask.style.top = rect.bottom - 60 + 'px';
    const max = left.scrollHeight - left.clientHeight;
    const isBottom = max <= 0 || left.scrollTop >= max - 10;
    mask.style.opacity = isBottom ? '0' : '1';
  }
  left.addEventListener('scroll', updateMask, {passive: true});
  window.addEventListener('resize', updateMask, {passive: true});
  window.addEventListener('scroll', updateMask, {passive: true});
  updateMask();
  window.addEventListener('load', updateMask);

  const cards = left.querySelectorAll('.left-div:not(.left-weather)');
  if (cards.length && !PREFERS_REDUCED_MOTION) {
    const observer = new IntersectionObserver(
        function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              cards.forEach(function(el) {
                el.classList.remove('in-focus');
              });
              entry.target.classList.add('in-focus');
            }
          });
        },
        {root: left, rootMargin: '-45% 0px -45% 0px', threshold: 0},
    );
    cards.forEach(function(el) {
      observer.observe(el);
    });
  }

  if (line && container) {
    const bar = document.createElement('div');
    bar.className = 'timeline-progress';
    bar.innerHTML = '<div class="timeline-progress-fill"></div>';
    container.appendChild(bar);
    const fill = bar.querySelector('.timeline-progress-fill');
    function updateProgress() {
      const max = line.scrollHeight - line.clientHeight;
      const pct = max > 0 ? (line.scrollTop / max) * 100 : 0;
      fill.style.height = pct + '%';
    }
    line.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress, {passive: true});
    updateProgress();
  }
})();
