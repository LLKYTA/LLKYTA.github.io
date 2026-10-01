/**
 * @fileoverview 打字机欢迎语模块（按当前时段挑选用语）。
 */
(function () {
  'use strict';

  const target = document.getElementById('welcome-typed');
  if (!target) return;

  const TYPE_SPEED = 85;
  const DELETE_SPEED = 35;
  const HOLD_DELAY = 1600;
  const NEXT_DELAY = 400;

  /**
   * 依据当前小时挑选时段文案。
   * @return {!Array<!Array<{text: string, hl: boolean}>>} 候选短语列表。
   */
  function getPhrases() {
    const segments = (CFG.typewriter && CFG.typewriter.segments) || [];
    if (!segments.length) return [];
    const hour = new Date().getHours();
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const inRange =
        seg.start < seg.end
          ? hour >= seg.start && hour < seg.end
          : hour >= seg.start || hour < seg.end;
      if (inRange) return seg.phrases || [];
    }
    return segments[0].phrases || [];
  }

  /**
   * 统计一条短语的总字符数。
   * @param {!Array<{text: string, hl: boolean}>} frags 短语片段。
   * @return {number} 字符总数。
   */
  function totalLength(frags) {
    return frags.reduce(function (sum, frag) {
      return sum + frag.text.length;
    }, 0);
  }

  /**
   * 生成前 count 个字符对应的 HTML 片段。
   * @param {!Array<{text: string, hl: boolean}>} frags 短语片段。
   * @param {number} count 已显示的字符数。
   * @return {string} 组装后的 HTML。
   */
  function render(frags, count) {
    let html = '';
    let left = count;
    for (let i = 0; i < frags.length && left > 0; i++) {
      const slice = frags[i].text.slice(0, left);
      const safe = window.escapeHtml(slice);
      html += frags[i].hl
        ? '<span class="gradient-text">' + safe + '</span>'
        : safe;
      left -= slice.length;
    }
    return html;
  }

  const phrases = getPhrases();
  if (!phrases.length) return;

  if (PREFERS_REDUCED_MOTION) {
    target.innerHTML = render(phrases[0], totalLength(phrases[0]));
    return;
  }

  let index = 0;
  let cursor = 0;
  let deleting = false;

  /**
   * 单步推进打字机动画。
   * @return {void}
   */
  function tick() {
    const current = phrases[index];
    const total = totalLength(current);

    if (!deleting) {
      cursor++;
      if (cursor >= total) {
        cursor = total;
        target.innerHTML = render(current, cursor);
        setTimeout(function () {
          deleting = true;
          tick();
        }, HOLD_DELAY);
        return;
      }
    } else {
      cursor--;
      if (cursor <= 0) {
        cursor = 0;
        target.textContent = '';
        deleting = false;
        index = (index + 1) % phrases.length;
        setTimeout(tick, NEXT_DELAY);
        return;
      }
    }

    target.innerHTML = render(current, cursor);
    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  tick();
})();
