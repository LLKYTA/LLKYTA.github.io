/**
 * @fileoverview 基本资料、标签与更新日志的渲染模块。
 */
(function () {
  'use strict';

  /**
   * 渲染所在地与当前状态。
   * @return {void}
   */
  function renderProfileFromConfig() {
    const profile = CFG.profile;
    if (!profile) return;

    const locEl = document.getElementById('des-location');
    const statEl = document.getElementById('des-status');
    if (locEl) locEl.textContent = profile.location || '';
    if (statEl) statEl.textContent = profile.status || '';
  }

  /**
   * 渲染标签列表。
   * @return {void}
   */
  function renderTagsFromConfig() {
    const tags = (CFG.profile && CFG.profile.tags) || [];
    const tagList = document.getElementById('tag-list');
    if (!tagList || !tags.length) return;

    const frag = document.createDocumentFragment();
    tags.forEach(function (tag) {
      const item = document.createElement('div');
      item.className = 'left-tag-item';
      item.textContent = tag;
      frag.appendChild(item);
    });
    tagList.textContent = '';
    tagList.appendChild(frag);
  }

  /**
   * 创建一条更新日志的 DOM 结构。
   * @param {{ver: string, title: string, date: string, desc: string}} entry
   *     日志条目。
   * @return {!HTMLLIElement} 组装好的列表项。
   */
  function createTimelineItem(entry) {
    const li = document.createElement('li');
    li.innerHTML =
      '<div class="focus"></div>' +
      '<div class="line-head">' +
      '<span class="line-ver"></span>' +
      '<span class="line-title"></span>' +
      '<span class="line-date"></span>' +
      '</div>' +
      '<div class="line-desc"></div>';

    li.querySelector('.line-ver').textContent = entry.ver || '';
    li.querySelector('.line-title').textContent = entry.title || '';
    li.querySelector('.line-date').textContent = entry.date || '';
    li.querySelector('.line-desc').textContent = entry.desc || '';
    return li;
  }

  /**
   * 渲染更新日志列表。
   * @return {void}
   */
  function renderTimelineFromConfig() {
    const list = document.querySelector('.timeline-list');
    const timeline = CFG.timeline || [];
    if (!list || !timeline.length) return;

    const frag = document.createDocumentFragment();
    timeline.forEach(function (entry) {
      frag.appendChild(createTimelineItem(entry));
    });
    list.textContent = '';
    list.appendChild(frag);
  }

  window.renderProfileFromConfig = function () {
    renderProfileFromConfig();
    renderTagsFromConfig();
  };
  window.renderTimelineFromConfig = renderTimelineFromConfig;
})();
