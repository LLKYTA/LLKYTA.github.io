/**
 * @fileoverview 背景粒子模块。
 */
(function() {
  'use strict';
  const canvas = document.getElementById('bgParticles');
  if (!canvas || PREFERS_REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;
  let running = false;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function build() {
    const count = Math.min(90, Math.floor((w * h) / 22000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        a: 0.25 + Math.random() * 0.5,
      });
    }
  }
  function step() {
    rafId = null;
    ctx.clearRect(0, 0, w, h);
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--purple_text_color').trim() ||
      '#747bff';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = p.a;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = (1 - d2 / 14000) * 0.14;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (running) rafId = requestAnimationFrame(step);
  }
  function start() {
    if (running) return;
    running = true;
    if (!rafId) rafId = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    ctx.clearRect(0, 0, w, h);
  }
  resize();
  window.addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) stop();
    else if (document.documentElement.dataset.bg === 'particles') start();
  });
  window.KD_BG_PARTICLES = {start: start, stop: stop};
})();
