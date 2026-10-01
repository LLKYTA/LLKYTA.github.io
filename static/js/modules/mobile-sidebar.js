/**
 * @fileoverview 移动端侧边栏抽屉模块。
 */
(function () {
  'use strict';
  const toggle = document.getElementById('mobile-sidebar-toggle');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  const sidebar = document.querySelector('.kd-left');
  if (!toggle || !sidebar) return;

  let scrollLockY = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let dragging = false;

  /**
   * 打开抽屉并锁定页面滚动。
   * @return {void}
   */
  function open() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -scrollLockY + 'px';
    document.body.classList.add('mobile-sidebar-locked');
    sidebar.classList.add('drawer-open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '关闭侧边栏');
    if (backdrop) backdrop.classList.add('active');
  }

  /**
   * 关闭抽屉并恢复页面滚动位置。
   * @return {void}
   */
  function close() {
    sidebar.classList.remove('drawer-open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开侧边栏');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('mobile-sidebar-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollLockY);
  }

  /**
   * 抽屉是否处于打开状态。
   * @return {boolean} 打开时返回 true。
   */
  function isOpen() {
    return sidebar.classList.contains('drawer-open');
  }
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen() ? close() : open();
  });
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
  });
  window.addEventListener(
    'resize',
    function () {
      if (window.innerWidth > 800 && isOpen()) close();
    },
    {passive: true},
  );

  sidebar.addEventListener(
    'touchstart',
    function (e) {
      if (!isOpen() || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      dragging = true;
      sidebar.style.transition = 'none';
    },
    {passive: true},
  );
  sidebar.addEventListener(
    'touchmove',
    function (e) {
      if (!dragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dy) > Math.abs(dx)) {
        dragging = false;
        sidebar.style.transition = '';
        sidebar.style.transform = '';
        return;
      }
      if (dx < 0) {
        const offset = Math.max(dx, -sidebar.offsetWidth);
        sidebar.style.transform = 'translateX(' + offset + 'px)';
      }
    },
    {passive: true},
  );
  sidebar.addEventListener(
    'touchend',
    function (e) {
      if (!dragging) return;
      dragging = false;
      const dx =
        (e.changedTouches[0] ? e.changedTouches[0].clientX : touchStartX) -
        touchStartX;
      sidebar.style.transition = '';
      sidebar.style.transform = '';
      if (dx < -60) close();
    },
    {passive: true},
  );
  sidebar.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) close();
  });
})();
