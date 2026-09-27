/**
 * @fileoverview 打字机欢迎语模块。
 */
(function () {
  'use strict';
  const target = document.getElementById('welcomeTyped');
  if (!target || !CFG.typewriter) return;

  function getPhrases() {
    const h = new Date().getHours();
    const segs = CFG.typewriter.segments || [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const inRange = s.start < s.end ? h >= s.start && h < s.end : h >= s.start || h < s.end;
      if (inRange) return s.phrases;
    }
    return segs[0] ? segs[0].phrases : [];
  }
  function render(frags, count) {
    let html = '';
    let left = count;
    for (let i = 0; i < frags.length && left > 0; i++) {
      const slice = frags[i].text.slice(0, left);
      html += frags[i].hl ? '<span class="gradientText">' + slice + '</span>' : slice;
      left -= slice.length;
    }
    return html;
  }
  function totalLen(frags) {
    return frags.reduce(function (s, f) {
      return s + f.text.length;
    }, 0);
  }

  const phrases = getPhrases();
  if (!phrases.length) return;

  if (PREFERS_REDUCED_MOTION) {
    target.innerHTML = render(phrases[0], totalLen(phrases[0]));
    return;
  }

  let idx = 0;
  let ch = 0;
  let deleting = false;

  function tick() {
    const p = phrases[idx];
    const total = totalLen(p);
    if (!deleting) {
      ch++;
      if (ch >= total) {
        ch = total;
        target.innerHTML = render(p, ch);
        setTimeout(function () {
          deleting = true;
          tick();
        }, 1600);
        return;
      }
    } else {
      ch--;
      if (ch <= 0) {
        ch = 0;
        target.innerHTML = '';
        deleting = false;
        idx = (idx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
    }
    target.innerHTML = render(p, ch);
    setTimeout(tick, deleting ? 35 : 85);
  }
  tick();
})();
