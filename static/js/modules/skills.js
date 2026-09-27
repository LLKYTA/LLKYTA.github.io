/**
 * @fileoverview 技能可视化（Canvas 雷达图 + SVG 环形进度）。
 */
(function () {
  'use strict';

  const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org/';
  const RING_R = 32;
  const RING_CIRC = 2 * Math.PI * RING_R;

  function getSkillIconUrl(slug, color) {
    return SIMPLE_ICONS_CDN + slug + '/' + color.replace('#', '');
  }

  function renderSkillRings(skills) {
    const wrap = document.getElementById('skillRings');
    if (!wrap) return;
    wrap.innerHTML = '';

    skills.forEach(function (s) {
      const card = document.createElement('div');
      card.className = 'skill-ring-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', s.name + ' 熟练度 ' + s.level + '%');
      card.innerHTML =
        '<svg class="skill-ring-svg" viewBox="0 0 72 72" style="color:' +
        s.color +
        '" aria-hidden="true">' +
        '<circle class="skill-ring-track" cx="36" cy="36" r="' +
        RING_R +
        '"></circle>' +
        '<circle class="skill-ring-fill" cx="36" cy="36" r="' +
        RING_R +
        '"' +
        ' stroke="' +
        s.color +
        '"' +
        ' data-target="' +
        s.level +
        '"' +
        ' style="stroke-dasharray:' +
        RING_CIRC +
        ';stroke-dashoffset:' +
        RING_CIRC +
        '"></circle>' +
        '</svg>' +
        '<div class="skill-icon-wrap"><img src="' +
        getSkillIconUrl(s.slug, s.color) +
        '" alt="' +
        s.name +
        '" loading="lazy" /></div>' +
        '<div class="skill-ring-label">' +
        s.name +
        '</div>' +
        '<div class="skill-ring-pct">' +
        s.level +
        '%</div>';
      wrap.appendChild(card);
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const circle = entry.target;
          const target = parseInt(circle.dataset.target, 10);
          const offset = RING_CIRC * (1 - target / 100);
          requestAnimationFrame(function () {
            circle.style.strokeDashoffset = offset;
          });
          observer.unobserve(circle);
        });
      },
      {threshold: 0.2}
    );

    wrap.querySelectorAll('.skill-ring-fill').forEach(function (el) {
      observer.observe(el);
    });
  }

  function renderSkillRadar(skills) {
    const canvas = document.getElementById('skillRadar');
    if (!canvas || PREFERS_REDUCED_MOTION) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = null;
    let progress = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const size = Math.min(rect.width - 28, rect.height - 28);
      if (size <= 0) return;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function hexToRgba(hex, alpha) {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function draw() {
      rafId = null;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W <= 0 || H <= 0) return;
      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(cx, cy) * 0.62;
      const n = skills.length;
      const step = (Math.PI * 2) / n;
      const startAngle = -Math.PI / 2;
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--purple_text_color').trim() || '#747bff';
      const textColor = style.getPropertyValue('--item_left_text_color').trim() || '#888';

      ctx.clearRect(0, 0, W, H);
      for (let layer = 1; layer <= 5; layer++) {
        const r = (layer / 5) * radius;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = startAngle + i * step;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = layer === 5 ? 0.28 : 0.1;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 0.14;
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * step;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const p = easeOutCubic(progress);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * step;
        const val = (skills[i].level / 100) * p;
        const x = cx + radius * val * Math.cos(a);
        const y = cy + radius * val * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, hexToRgba(accent, 0.35));
      grad.addColorStop(1, hexToRgba(accent, 0.08));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.75 * p;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 0.95 * p;
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * step;
        const val = (skills[i].level / 100) * p;
        const x = cx + radius * val * Math.cos(a);
        const y = cy + radius * val * Math.sin(a);
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = skills[i].color;
        ctx.fill();
      }
      ctx.globalAlpha = 0.75 * p;
      ctx.font = '600 11px -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * step;
        const lr = radius + 18;
        let x = cx + lr * Math.cos(a);
        let y = cy + lr * Math.sin(a);
        x = Math.max(24, Math.min(W - 24, x));
        y = Math.max(10, Math.min(H - 10, y));
        ctx.fillText(skills[i].name, x, y);
      }
      ctx.globalAlpha = 1;
    }
    function animate() {
      progress += 0.022;
      if (progress > 1) progress = 1;
      draw();
      if (progress < 1) rafId = requestAnimationFrame(animate);
      else rafId = null;
    }
    resize();
    window.addEventListener(
      'resize',
      function () {
        resize();
        if (progress >= 1) draw();
      },
      {passive: true}
    );
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          progress = 0;
          if (!rafId) rafId = requestAnimationFrame(animate);
        });
      },
      {threshold: 0.2}
    );
    observer.observe(canvas.parentElement);
  }

  window.renderSkillsFromConfig = function () {
    const skills = (CFG && CFG.skills) || [];
    if (!skills.length) return;
    renderSkillRings(skills);
    renderSkillRadar(skills);
  };
})();
