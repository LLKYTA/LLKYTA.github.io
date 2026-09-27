/**
 * @fileoverview 个人信息 / 标签 / 时间线渲染模块。
 */
(function () {
  'use strict';

  function renderProfileFromConfig() {
    const c = CFG;
    if (!c.profile) return;

    const locEl = document.getElementById('desLocation');
    const statEl = document.getElementById('desStatus');
    if (locEl) locEl.textContent = c.profile.location || '';
    if (statEl) statEl.textContent = c.profile.status || '';

    const tagList = document.getElementById('tagList');
    if (tagList && c.profile.tags) {
      tagList.innerHTML = '';
      c.profile.tags.forEach(function (t) {
        const d = document.createElement('div');
        d.className = 'left-tag-item';
        d.textContent = t;
        tagList.appendChild(d);
      });
    }
  }

  function renderTimelineFromConfig() {
    const list = document.querySelector('.timeline-list');
    if (!list || !CFG.timeline) return;
    list.innerHTML = '';
    CFG.timeline.forEach(function (item) {
      const li = document.createElement('li');
      li.innerHTML =
        '<div class="focus"></div>' +
        '<div class="line-head">' +
        '<span class="line-ver">' +
        item.ver +
        '</span>' +
        '<span class="line-title">' +
        item.title +
        '</span>' +
        '<span class="line-date">' +
        item.date +
        '</span>' +
        '</div>' +
        '<div class="line-desc">' +
        item.desc +
        '</div>';
      list.appendChild(li);
    });
  }

  window.renderProfileFromConfig = renderProfileFromConfig;
  window.renderTimelineFromConfig = renderTimelineFromConfig;
})();
