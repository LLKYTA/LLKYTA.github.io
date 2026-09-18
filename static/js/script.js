/**
 * @fileoverview KD_klin 个人主页交互脚本。
 * @author KD_klin
 */

console.log(
  '%cCopyright © 2024 KD_klin',
  'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);

const CFG = window.KD_CONFIG || {};
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==================== 通用工具 ==================== */

/** 切换元素 class。 */
function toggleClass(selector, className) {
  document.querySelectorAll(selector).forEach(function (el) {
    el.classList.toggle(className);
  });
}

/** 弹出图片弹窗。 */
function pop(imageURL) {
  const img = document.querySelector('.tc-img');
  if (imageURL) img.src = imageURL;
  toggleClass('.tc-main', 'active');
  toggleClass('.tc', 'active');
}

const tc = document.getElementsByClassName('tc');
const tcMain = document.getElementsByClassName('tc-main');
if (tc[0]) tc[0].addEventListener('click', () => pop());
if (tcMain[0]) tcMain[0].addEventListener('click', (e) => e.stopPropagation());

/** 设置 Cookie。 */
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

/** 读取 Cookie。 */
function getCookie(name) {
  const eq = name + '=';
  const parts = document.cookie.split(';');
  for (let i = 0; i < parts.length; i++) {
    let c = parts[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(eq) === 0) return c.substring(eq.length);
  }
  return null;
}

/** 转义 HTML 特殊字符。 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

/** 数字缩写格式化。 */
function formatNumber(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();
}

/* ==================== 配置渲染 ==================== */

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
  const list = document.getElementById('line');
  if (!list || !CFG.timeline) return;
  list.innerHTML = '';
  CFG.timeline.forEach(function (item) {
    const li = document.createElement('li');
    li.innerHTML =
      '<div class="focus"></div>' +
      '<div class="line-head">' +
      '<span class="line-ver">' + item.ver + '</span>' +
      '<span class="line-title">' + item.title + '</span>' +
      '<span class="line-date">' + item.date + '</span>' +
      '</div>' +
      '<div class="line-desc">' + item.desc + '</div>';
    list.appendChild(li);
  });
}

/**
 * 渲染社交图标 + 主题开关。
 * @return {void}
 */
function renderSocialIconsFromConfig() {
  const wrap = document.getElementById('iconContainer');
  if (!wrap || !CFG.socials) return;

  const github = CFG.socials.github || {};
  const email = CFG.socials.email || '';

  wrap.innerHTML =
    // GitHub
    '<a class="iconItem" href="' + (github.url || '#') + '" target="_blank" rel="noopener" aria-label="GitHub">' +
      '<svg viewBox="0 0 1024 1024" aria-hidden="true">' +
        '<path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>' +
      '</svg>' +
      '<div class="iconTip">Github</div>' +
    '</a>' +
    // Mail
    '<a class="iconItem" href="mailto:' + email + '" aria-label="发送邮件">' +
      '<svg viewBox="0 0 1024 1024" aria-hidden="true">' +
        '<path d="M926.47619 355.644952V780.190476a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667a73.142857 73.142857 0 0 1-73.142857-73.142857V355.644952l304.103619 257.828572a170.666667 170.666667 0 0 0 220.745142 0L926.47619 355.644952zM853.333333 170.666667a74.044952 74.044952 0 0 1 26.087619 4.778666 72.704 72.704 0 0 1 30.622477 22.186667 73.508571 73.508571 0 0 1 10.678857 17.67619c3.169524 7.509333 5.12 15.652571 5.607619 24.210286L926.47619 243.809524v24.380952L559.469714 581.241905a73.142857 73.142857 0 0 1-91.306666 2.901333l-3.632762-2.925714L97.52381 268.190476v-24.380952a72.899048 72.899048 0 0 1 40.155428-65.292191A72.97219 72.97219 0 0 1 170.666667 170.666667h682.666666z"></path>' +
      '</svg>' +
      '<div class="iconTip">Mail</div>' +
    '</a>' +
    // QQ
    '<a class="iconItem" id="qqIcon" href="javascript:void(0)" aria-label="QQ 好友二维码">' +
      '<svg viewBox="0 0 1024 1024" aria-hidden="true">' +
        '<path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z"></path>' +
      '</svg>' +
      '<div class="iconTip">QQ</div>' +
    '</a>' +
    // 主题开关
    '<a class="switch" href="javascript:void(0)" aria-label="切换深色/浅色主题">' +
      '<div class="onoffswitch">' +
        '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" aria-label="切换深色/浅色主题" checked />' +
        '<label class="onoffswitch-label" for="myonoffswitch">' +
          '<span class="onoffswitch-inner"></span>' +
          '<span class="onoffswitch-switch"></span>' +
        '</label>' +
      '</div>' +
    '</a>';

  const qqIcon = document.getElementById('qqIcon');
  if (qqIcon) {
    qqIcon.addEventListener('click', function () {
      pop((CFG.socials && CFG.socials.qq && CFG.socials.qq.image) || '');
    });
  }

  const checkbox = document.getElementById('myonoffswitch');
  if (checkbox) {
    checkbox.addEventListener('change', function () {
      const next = document.documentElement.dataset.theme === 'Dark' ? 'Light' : 'Dark';
      changeTheme(next, true);
    });
  }
}

/* ==================== 技能可视化 ==================== */

const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org/';
const RING_R = 32;
const RING_CIRC = 2 * Math.PI * RING_R;

function getSkillIconUrl(slug, color) {
  return SIMPLE_ICONS_CDN + slug + '/' + color.replace('#', '');
}

function renderSkillsFromConfig() {
  const skills = (CFG && CFG.skills) || [];
  if (!skills.length) return;
  renderSkillRings(skills);
  renderSkillRadar(skills);
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
      '<svg class="skill-ring-svg" viewBox="0 0 72 72" style="color:' + s.color + '" aria-hidden="true">' +
      '<circle class="skill-ring-track" cx="36" cy="36" r="' + RING_R + '"></circle>' +
      '<circle class="skill-ring-fill" cx="36" cy="36" r="' + RING_R + '"' +
      ' stroke="' + s.color + '"' +
      ' data-target="' + s.level + '"' +
      ' style="stroke-dasharray:' + RING_CIRC + ';stroke-dashoffset:' + RING_CIRC + '"></circle>' +
      '</svg>' +
      '<div class="skill-icon-wrap">' +
      '<img src="' + getSkillIconUrl(s.slug, s.color) + '" alt="' + s.name + '" loading="lazy" />' +
      '</div>' +
      '<div class="skill-ring-label">' + s.name + '</div>' +
      '<div class="skill-ring-pct">' + s.level + '%</div>';

    wrap.appendChild(card);
  });

  const observer = new IntersectionObserver(function (entries) {
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
  }, { threshold: 0.2 });

  wrap.querySelectorAll('.skill-ring-fill').forEach(function (el) {
    observer.observe(el);
  });
}

function renderSkillRadar(skills) {
  const canvas = document.getElementById('skillRadar');
  if (!canvas) return;
  if (PREFERS_REDUCED_MOTION) return;

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
  window.addEventListener('resize', function () {
    resize();
    if (progress >= 1) draw();
  }, { passive: true });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      progress = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  }, { threshold: 0.2 });

  observer.observe(canvas.parentElement);
}

/* ==================== 一言 ==================== */

function loadHi() {
  fetch('https://v1.hitokoto.cn/?c=j&c=i')
    .then((r) => r.json())
    .then(function (data) {
      const el = document.querySelector('#hitokoto_text');
      const fromEl = document.querySelector('#hitokoto_from');
      if (!el) return;
      const from = !data.from_who || data.from_who === 'null'
        ? '---' + data.from
        : '---' + data.from + ' ' + data.from_who;
      el.innerText = data.hitokoto;
      fromEl.innerText = from;
    })
    .catch(function (err) {
      console.error('一言加载失败:', err);
      const el = document.querySelector('#hitokoto_text');
      const fromEl = document.querySelector('#hitokoto_from');
      if (el) el.innerText = '一言加载失败，点击重试';
      if (fromEl) fromEl.innerText = '-- 网络异常';
    });
}

/* ==================== 站点运行时间 ==================== */

(function initSiteRuntime() {
  const el = document.getElementById('siteRuntime');
  if (!el || !CFG.site) return;
  const START = new Date(CFG.site.startDate).getTime();

  function tick() {
    const diff = Date.now() - START;
    if (diff < 0) { el.innerHTML = '尚未上线'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.innerHTML = '本站已运行 <b>' + d + '</b> 天 <b>' + h + '</b> 时 <b>' + m + '</b> 分';
  }
  tick();
  setInterval(tick, 30000);
})();

/* ==================== 访客统计 ==================== */

(function initVisitStats() {
  const el = document.getElementById('visitStats');
  if (!el) return;
  const KEY = 'KD_visitCount';
  const BASE = 1024;
  const local = parseInt(localStorage.getItem(KEY) || '0', 10) + 1;
  localStorage.setItem(KEY, local);
  const total = BASE + local;
  el.innerHTML = '你是第 <b>' + total.toLocaleString() + '</b> 位访客';

  fetch('https://ip.useragentinfo.com/json')
    .then((r) => r.json())
    .then(function (d) {
      const city = d.city || d.province || d.country || '未知';
      el.innerHTML = '你是第 <b>' + total.toLocaleString() + '</b> 位访客 · 来自 <b>' + city + '</b>';
    })
    .catch(function () { /* 静默 */ });
})();

/* ==================== 打字机 ==================== */

(function initTypewriter() {
  const target = document.getElementById('welcomeTyped');
  if (!target || !CFG.typewriter) return;

  function getPhrases() {
    const h = new Date().getHours();
    const segs = CFG.typewriter.segments || [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const inRange = s.start < s.end ? (h >= s.start && h < s.end) : (h >= s.start || h < s.end);
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
    return frags.reduce((s, f) => s + f.text.length, 0);
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
        setTimeout(function () { deleting = true; tick(); }, 1600);
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

/* ==================== 鼠标光效 ==================== */

(function initMouseGlow() {
  if (PREFERS_REDUCED_MOTION) return;
  if (window.matchMedia('(hover: none)').matches) return;
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
  document.addEventListener('mousemove', function (e) {
    px = e.clientX;
    py = e.clientY;
    if (rafId === null) rafId = requestAnimationFrame(apply);
  }, { passive: true });
})();

/* ==================== 背景粒子 ==================== */

(function initBgParticles() {
  const canvas = document.getElementById('bgParticles');
  if (!canvas || PREFERS_REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
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
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--purple_text_color').trim() || '#747bff';
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
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, w, h);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (document.documentElement.dataset.bg === 'particles') start();
  });

  window.KD_BG_PARTICLES = { start, stop };
})();

/* ==================== 背景模式切换 ==================== */

function applyBgMode(mode) {
  const modes = (CFG.background && CFG.background.modes) || ['glow', 'particles', 'none'];
  if (modes.indexOf(mode) === -1) mode = 'glow';
  document.documentElement.dataset.bg = mode;
  localStorage.setItem('KD_bgMode', mode);
  const p = window.KD_BG_PARTICLES;
  if (p) {
    if (mode === 'particles') p.start();
    else p.stop();
  }
}

/* ==================== 命令面板 ==================== */

(function initCommandPalette() {
  const palette = document.getElementById('cmdPalette');
  const backdrop = document.getElementById('cmdBackdrop');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  const hint = document.getElementById('cmdHint');
  if (!palette || !input || !list) return;

  const COMMANDS = [
    {
      icon: '🌓', title: '切换深色 / 浅色主题', hint: 'Theme',
      keywords: 'theme dark light', action: function () {
        const sw = document.getElementById('myonoffswitch');
        if (sw) sw.click();
      },
    },
    {
      icon: '🌗', title: '主题跟随系统', hint: 'Auto',
      keywords: 'theme auto system', action: function () {
        localStorage.setItem('KD_themeMode', 'auto');
        applyResolvedTheme();
      },
    },
    {
      icon: '🎨', title: '切换背景模式', hint: 'BG',
      keywords: 'background bg particles glow none', action: function () {
        const modes = (CFG.background && CFG.background.modes) || ['glow', 'particles', 'none'];
        const cur = document.documentElement.dataset.bg || 'glow';
        const next = modes[(modes.indexOf(cur) + 1) % modes.length];
        applyBgMode(next);
      },
    },
    {
      icon: '🎵', title: '播放 / 暂停音乐', hint: 'Music',
      keywords: 'music play pause', action: function () {
        const c = document.getElementById('musicCover');
        if (c) c.click();
      },
    },
    {
      icon: '💬', title: '刷新一言', hint: 'Hitokoto',
      keywords: 'hitokoto quote refresh', action: loadHi,
    },
    {
      icon: '🌤️', title: '刷新天气', hint: 'Weather',
      keywords: 'weather refresh 天气', action: function () {
        sessionStorage.removeItem(WEATHER_CACHE_KEY);
        loadWeatherData(true);
      },
    },
    {
      icon: '🐙', title: '打开 GitHub 主页', hint: 'GitHub',
      keywords: 'github source code', action: function () {
        window.open((CFG.socials && CFG.socials.github.url) || '#', '_blank', 'noopener');
      },
    },
    {
      icon: '📧', title: '发送邮件', hint: 'Mail',
      keywords: 'mail email contact', action: function () {
        location.href = 'mailto:' + ((CFG.socials && CFG.socials.email) || '');
      },
    },
    {
      icon: '📋', title: '复制邮箱到剪贴板', hint: 'Copy',
      keywords: 'copy email clipboard', action: function () {
        const t = (CFG.socials && CFG.socials.email) || '';
        if (navigator.clipboard && t) navigator.clipboard.writeText(t);
      },
    },
    {
      icon: '💌', title: '查看 QQ 二维码', hint: 'QQ',
      keywords: 'qq qrcode contact', action: function () {
        pop((CFG.socials && CFG.socials.qq && CFG.socials.qq.image) || '');
      },
    },
    {
      icon: '⚡', title: '跳转到技能图', hint: 'Skills',
      keywords: 'skills stack tech', action: function () {
        const el = document.querySelector('.skill-visual');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      icon: '📊', title: '跳转到贡献热力图', hint: 'Contrib',
      keywords: 'github contrib heatmap', action: function () {
        const el = document.querySelector('.github-contrib-card');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      icon: '⬆️', title: '回到顶部', hint: 'Scroll',
      keywords: 'top scroll up', action: function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];

  let filtered = COMMANDS.slice();
  let activeIndex = 0;

  function filterCommands(kw) {
    const q = (kw || '').trim().toLowerCase();
    filtered = !q ? COMMANDS.slice() : COMMANDS.filter(function (c) {
      return c.title.toLowerCase().indexOf(q) !== -1
        || (c.hint || '').toLowerCase().indexOf(q) !== -1
        || (c.keywords || '').toLowerCase().indexOf(q) !== -1;
    });
    activeIndex = 0;
    renderList();
  }

  function renderList() {
    list.innerHTML = '';
    if (!filtered.length) {
      list.innerHTML = '<div class="cmd-empty">没有匹配的命令</div>';
      return;
    }
    filtered.forEach(function (cmd, idx) {
      const item = document.createElement('div');
      item.className = 'cmd-item' + (idx === activeIndex ? ' active' : '');
      item.dataset.index = idx;
      item.innerHTML =
        '<div class="cmd-item-icon">' + cmd.icon + '</div>' +
        '<div class="cmd-item-title">' + cmd.title + '</div>' +
        '<div class="cmd-item-hint">' + (cmd.hint || '') + '</div>';
      item.addEventListener('click', function () { runCommand(idx); });
      item.addEventListener('mouseenter', function () { activeIndex = idx; updateActive(); });
      list.appendChild(item);
    });
  }

  function updateActive() {
    const items = list.querySelectorAll('.cmd-item');
    items.forEach(function (el, i) { el.classList.toggle('active', i === activeIndex); });
    if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function runCommand(idx) {
    const cmd = filtered[idx];
    if (!cmd) return;
    closePalette();
    setTimeout(function () {
      try { cmd.action(); } catch (e) { console.error('命令执行失败:', e); }
    }, 80);
  }

  function openPalette() {
    palette.classList.add('active');
    palette.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterCommands('');
    setTimeout(function () { input.focus(); }, 60);
  }

  function closePalette() {
    palette.classList.remove('active');
    palette.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('active') ? closePalette() : openPalette();
      return;
    }
    if (!palette.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!filtered.length) return;
      activeIndex = (activeIndex + 1) % filtered.length;
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!filtered.length) return;
      activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(activeIndex);
    }
  });

  input.addEventListener('input', function () { filterCommands(input.value); });
  if (backdrop) backdrop.addEventListener('click', closePalette);
  if (hint) {
    hint.addEventListener('click', openPalette);
    hint.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPalette(); }
    });
  }
  renderList();
})();

/* ==================== 主题三态 ==================== */

function applyResolvedTheme() {
  const raw = localStorage.getItem('KD_themeMode') || getCookie('themeState') || 'auto';
  const mode = raw.toLowerCase();
  const html = document.documentElement;
  const tanChiShe = document.getElementById('tanChiShe');
  const checkbox = document.getElementById('myonoffswitch');

  let resolved;
  if (mode === 'auto') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
  } else {
    resolved = mode === 'dark' ? 'Dark' : 'Light';
  }

  if (tanChiShe) tanChiShe.src = './static/svg/snake-' + resolved + '.svg';
  html.dataset.theme = resolved;
  if (checkbox) checkbox.checked = resolved === 'Light';
  setCookie('themeState', resolved, 365);
}

function changeTheme(theme, animate) {
  const apply = function () {
    const mode = theme === 'Dark' ? 'dark' : 'light';
    localStorage.setItem('KD_themeMode', mode);
    applyResolvedTheme();
  };
  if (animate && document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
  if ((localStorage.getItem('KD_themeMode') || 'auto') === 'auto') {
    applyResolvedTheme();
  }
});

/* ==================== 沉浸式天气小组件 ==================== */

const WEATHER_CACHE_KEY = 'KD_weather_cache';
const WEATHER_API_URL = 'https://uapis.cn/api/v1/misc/weather';
/**const METEOCONS_CDN = 'https://cdn.jsdelivr.net/gh/basmilius/weather-icons@production/production/fill/svg/';**/
const METEOCONS_CDN = 'https://cdn.jsdelivr.net/npm/@meteocons/svg@0.1.0/fill/';
/**
 * 天气文本 → Meteocons 图标名映射。
 * 按具体度排序，长键优先匹配。
 */
const WEATHER_ICON_MAP = [
  ['雷阵雨', 'thunderstorms-rain'],
  ['雨夹雪', 'sleet'],
  ['强沙尘暴', 'dust'],
  ['沙尘暴', 'dust'],
  ['暴雨', 'extreme-rain'],
  ['大雨', 'extreme-rain'],
  ['中雨', 'rain'],
  ['小雨', 'rain'],
  ['大雪', 'extreme-snow'],
  ['中雪', 'snow'],
  ['小雪', 'snow'],
  ['晴', 'clear'],
  ['多云', 'partly-cloudy'],
  ['阴', 'overcast'],
  ['雾', 'fog'],
  ['霾', 'fog'],
  ['沙尘', 'dust'],
];

/** AQI 等级 1-6 → 颜色。 */
const AQI_COLORS = {
  1: '#00e400', 2: '#ffff00', 3: '#ff7e00',
  4: '#ff0000', 5: '#99004c', 6: '#7e0023',
};

/**
 * 获取 Meteocons 图标 URL。
 * @param {string} text 天气描述文本。
 * @return {string} 完整图标 URL。
 */
function getWeatherIconUrl(text) {
  if (!text) return METEOCONS_CDN + 'clear-day.svg';

  let baseName = 'clear-day';
  for (let i = 0; i < WEATHER_ICON_MAP.length; i++) {
    if (text.indexOf(WEATHER_ICON_MAP[i][0]) !== -1) {
      baseName = WEATHER_ICON_MAP[i][1];
      break;
    }
  }

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;

  if (baseName === 'clear') baseName = isNight ? 'clear-night' : 'clear-day';
  else if (baseName === 'partly-cloudy') baseName = isNight ? 'partly-cloudy-night' : 'partly-cloudy-day';
  else if (baseName === 'overcast') baseName = 'overcast-day';

  return METEOCONS_CDN + baseName + '.svg';
}

/**
 * 获取天气对应的背景渐变主题。
 * @param {string} weatherText 天气文本。
 * @return {!Object} 包含 gradient / accent / glow。
 */
function getWeatherTheme(weatherText) {
  const t = weatherText || '';
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  const isDusk = hour >= 17 && hour < 19;

  if (t.indexOf('晴') !== -1) {
    return isNight
      ? { gradient: 'linear-gradient(135deg, #1a1a3e 0%, #2d2b55 50%, #1e3a5f 100%)', accent: '#a8c8ff', glow: 'rgba(168,200,255,0.2)' }
      : isDusk
        ? { gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 50%, #7b2d8e 100%)', accent: '#ffeaa7', glow: 'rgba(255,234,167,0.25)' }
        : { gradient: 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 50%, #1a5276 100%)', accent: '#ffffff', glow: 'rgba(255,255,255,0.2)' };
  }

  if (t.indexOf('多云') !== -1) {
    return isNight
      ? { gradient: 'linear-gradient(135deg, #232526 0%, #414345 50%, #2c3e50 100%)', accent: '#b0bec5', glow: 'rgba(176,190,197,0.15)' }
      : { gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 40%, #4a6fa5 100%)', accent: '#ffffff', glow: 'rgba(255,255,255,0.18)' };
  }

  if (t.indexOf('阴') !== -1) {
    return { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #3a4a6b 50%, #2c3e50 100%)', accent: '#cfd8dc', glow: 'rgba(207,216,220,0.12)' };
  }

  if (t.indexOf('雨') !== -1 || t.indexOf('雷') !== -1) {
    return { gradient: 'linear-gradient(135deg, #1a2a6c 0%, #2a3f5f 40%, #0f2027 100%)', accent: '#90caf9', glow: 'rgba(144,202,249,0.2)' };
  }

  if (t.indexOf('雪') !== -1) {
    return { gradient: 'linear-gradient(135deg, #e0eafc 0%, #a8c0d8 40%, #7b9cb8 100%)', accent: '#ffffff', glow: 'rgba(255,255,255,0.3)' };
  }

  if (t.indexOf('雾') !== -1 || t.indexOf('霾') !== -1) {
    return { gradient: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 50%, #2c3e50 100%)', accent: '#d1d8e0', glow: 'rgba(209,216,224,0.15)' };
  }

  if (t.indexOf('沙尘') !== -1) {
    return { gradient: 'linear-gradient(135deg, #b79891 0%, #94716b 50%, #5d4037 100%)', accent: '#ffccbc', glow: 'rgba(255,204,188,0.2)' };
  }

  return { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', accent: '#cfd8dc', glow: 'rgba(207,216,220,0.12)' };
}

/**
 * 获取天气类型对应的微粒子效果类名。
 * @param {string} weatherText 天气文本。
 * @return {string} CSS 类名后缀。
 */
function getWeatherEffect(weatherText) {
  const t = weatherText || '';
  if (t.indexOf('雨') !== -1 || t.indexOf('雷') !== -1) return 'effect-rain';
  if (t.indexOf('雪') !== -1) return 'effect-snow';
  if (t.indexOf('晴') !== -1) return 'effect-sunny';
  return '';
}

/**
 * 构建天气 API 的完整 URL。
 * @return {string} 完整请求地址。
 */
function buildWeatherUrl() {
  const cfg = CFG.weather || {};
  const params = new URLSearchParams();
  if (cfg.adcode) params.set('adcode', cfg.adcode);
  else if (cfg.city) params.set('city', cfg.city);
  if (cfg.lang) params.set('lang', cfg.lang);
  if (cfg.extended) params.set('extended', 'true');
  if (cfg.forecast) params.set('forecast', 'true');
  if (cfg.hourly) params.set('hourly', 'true');
  if (cfg.minutely) params.set('minutely', 'true');
  if (cfg.indices) params.set('indices', 'true');
  const qs = params.toString();
  return WEATHER_API_URL + (qs ? '?' + qs : '');
}

/**
 * 发起带超时的天气请求。
 * @param {string} url 完整请求地址。
 * @param {!Object} headers 请求头。
 * @param {number} timeout 超时毫秒。
 * @return {!Promise<!Object>} 解析后的 JSON。
 */
function requestWeather(url, headers, timeout) {
  return new Promise(function (resolve, reject) {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, timeout);

    fetch(url, { headers: headers, signal: controller.signal })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            const err = new Error(body.message || ('HTTP ' + res.status));
            err.code = body.code || ('HTTP_' + res.status);
            err.status = res.status;
            throw err;
          });
        }
        return res.json();
      })
      .then(resolve)
      .catch(function (err) {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * 加载天气数据（优先读缓存）。
 * @param {boolean=} forceRefresh 是否强制跳过缓存。
 * @return {void}
 */
function loadWeatherData(forceRefresh) {
  const cfg = CFG.weather || {};
  if (!cfg.enabled) return;

  const widget = document.getElementById('weatherWidget');
  if (!widget) return;

  const loadingEl = widget.querySelector('.weather-loading');
  const contentEl = widget.querySelector('.weather-content');
  const errorEl = widget.querySelector('.weather-error');
  if (!loadingEl || !contentEl || !errorEl) return;

  if (!forceRefresh) {
    const cached = sessionStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const ttl = cfg.refreshInterval || 1800000;
        if (parsed && parsed.data && (Date.now() - parsed.ts) < ttl) {
          renderWeather(parsed.data, widget);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem(WEATHER_CACHE_KEY);
      }
    }
  }

  loadingEl.style.display = 'flex';
  contentEl.style.display = 'none';
  errorEl.style.display = 'none';

  const headers = {};
  if (cfg.apiKey && cfg.apiKey.indexOf('uapi-') === 0) {
    headers['Authorization'] = 'Bearer ' + cfg.apiKey;
  }

  requestWeather(buildWeatherUrl(), headers, cfg.timeout || 10000)
    .then(function (data) {
      sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data: data, ts: Date.now() }));
      renderWeather(data, widget);
    })
    .catch(function (err) {
      console.error('[Weather] 加载失败:', err);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'flex';
      const msgEl = errorEl.querySelector('.weather-error-msg');
      if (!msgEl) return;
      let msg = '天气加载失败';
      if (err.name === 'AbortError') msg = '请求超时';
      else if (err.status === 401 || err.status === 403) msg = '密钥无效或未配置';
      else if (err.status === 429) msg = '请求过于频繁';
      else if (err.code === 'NOT_FOUND') msg = '未找到该城市';
      else if (err.code === 'INVALID_PARAMETER') msg = '参数无效';
      else if (err.code === 'SERVICE_UNAVAILABLE') msg = '服务暂不可用';
      else if (err.code === 'INTERNAL_SERVER_ERROR') msg = '服务器错误';
      else if (err.message) msg = err.message;
      msgEl.textContent = msg;
    });
}

/**
 * 渲染沉浸式天气卡片。
 * @param {!Object} data API 返回数据。
 * @param {!Element} widget 容器元素。
 * @return {void}
 */
function renderWeather(data, widget) {
  const loadingEl = widget.querySelector('.weather-loading');
  const contentEl = widget.querySelector('.weather-content');
  const errorEl = widget.querySelector('.weather-error');
  if (!contentEl) return;

  loadingEl.style.display = 'none';
  errorEl.style.display = 'none';
  contentEl.style.display = 'block';

  const weatherText = data.weather || '';
  const theme = getWeatherTheme(weatherText);
  const iconUrl = getWeatherIconUrl(weatherText);
  const effect = getWeatherEffect(weatherText);

  contentEl.style.background = theme.gradient;
  contentEl.style.setProperty('--weather-accent', theme.accent);
  contentEl.style.setProperty('--weather-glow', theme.glow);
  contentEl.className = 'weather-content immersive ' + effect;

  const cityName = data.city || data.district || data.province || '未知';
  const subName = (data.district && data.city && data.district !== data.city) ? data.district : '';
  const temp = (typeof data.temperature === 'number') ? Math.round(data.temperature) : '--';

  const metaParts = [];
  if (data.wind_direction) {
    metaParts.push(escapeHtml(data.wind_direction) + (data.wind_power ? ' ' + escapeHtml(data.wind_power) : ''));
  }
  if (typeof data.humidity === 'number') metaParts.push('湿度 ' + data.humidity + '%');
  if (typeof data.feels_like === 'number') metaParts.push('体感 ' + Math.round(data.feels_like) + '°');

  const atmosParts = [];
  if (typeof data.pressure === 'number') atmosParts.push(data.pressure + ' hPa');
  if (typeof data.visibility === 'number') atmosParts.push('能见 ' + data.visibility + ' km');
  if (typeof data.uv === 'number') atmosParts.push('UV ' + data.uv);

  let html =
    '<div class="weather-icon-wrap">' +
      '<img class="weather-icon" src="' + iconUrl + '" alt="' + escapeHtml(weatherText) + '" loading="lazy" />' +
      '<div class="weather-icon-glow"></div>' +
    '</div>' +
    '<div class="weather-info">' +
      '<div class="weather-city-row">' +
        '<span class="weather-city">' + escapeHtml(cityName) + '</span>' +
        (subName ? '<span class="weather-district">' + escapeHtml(subName) + '</span>' : '') +
      '</div>' +
      '<div class="weather-temp-row">' +
        '<span class="weather-temp">' + temp + '</span>' +
        '<span class="weather-temp-unit">°C</span>' +
      '</div>' +
      '<div class="weather-desc">' + escapeHtml(weatherText || '--') + '</div>' +
    '</div>' +
    '<div class="weather-meta">' + metaParts.join(' · ') + '</div>';

  if (atmosParts.length) {
    html += '<div class="weather-atmos">' + atmosParts.join(' &nbsp;·&nbsp; ') + '</div>';
  }

  if (typeof data.aqi === 'number') {
    const color = AQI_COLORS[data.aqi_level] || '#8b8b8b';
    html +=
      '<div class="weather-aqi">' +
        '<span class="weather-aqi-dot" style="background:' + color + '"></span>' +
        '空气 ' + escapeHtml(data.aqi_category || '--') + ' · AQI ' + data.aqi +
      '</div>';
  }

  if (data.alerts && data.alerts.length) {
    const alertTitle = data.alerts[0].title || data.alerts[0].type || '气象预警';
    html += '<div class="weather-alert">⚠️ ' + escapeHtml(alertTitle) + '</div>';
  }

  html += '<div class="weather-particles" aria-hidden="true"></div>';

  contentEl.innerHTML = html;
}

/** 天气自动刷新定时器 ID。 */
let weatherTimer = null;

/**
 * 启动天气模块（首次加载 + 定时刷新 + 重试按钮）。
 * @return {void}
 */
function initWeatherWidget() {
  const cfg = CFG.weather || {};
  if (!cfg.enabled) return;

  const widget = document.getElementById('weatherWidget');
  if (!widget) return;

  loadWeatherData(false);

  const retryBtn = document.getElementById('weatherRetryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      sessionStorage.removeItem(WEATHER_CACHE_KEY);
      loadWeatherData(true);
    });
  }

  const interval = cfg.refreshInterval || 1800000;
  if (weatherTimer) clearInterval(weatherTimer);
  weatherTimer = setInterval(function () {
    if (!document.hidden) loadWeatherData(true);
  }, interval);
}

/* ==================== 页面初始化 ==================== */

document.addEventListener('DOMContentLoaded', function () {
  renderProfileFromConfig();
  renderTimelineFromConfig();
  renderSkillsFromConfig();
  renderSocialIconsFromConfig();

  applyResolvedTheme();
  applyBgMode(localStorage.getItem('KD_bgMode') || (CFG.background && CFG.background.default) || 'glow');

  const hitokotoBox = document.getElementById('hitokotoBox');
  if (hitokotoBox) hitokotoBox.addEventListener('click', loadHi);

  const githubRetryBtn = document.getElementById('githubRetryBtn');
  if (githubRetryBtn) githubRetryBtn.addEventListener('click', loadGitHubData);

  const audio = document.getElementById('musicAudio');
  if (audio && CFG.music) audio.src = CFG.music.src;
  const mt = document.getElementById('musicTitle');
  if (mt && CFG.music) mt.textContent = CFG.music.title;

  const footerName = document.getElementById('footerName');
  if (footerName && CFG.site) footerName.textContent = CFG.site.name;

  loadHi();
  loadGitHubData();
  initWeatherWidget();
});

/* ==================== 页面加载 ==================== */

const pageLoading = document.querySelector('#KD-loading');
window.addEventListener('load', function () {
  setTimeout(function () {
    if (pageLoading) {
      pageLoading.style.opacity = '0';
      setTimeout(function () { pageLoading.style.display = 'none'; }, 500);
    }
  }, 100);
});

/* ==================== GitHub 数据 ==================== */

const GITHUB_CACHE_KEY = 'github_data_cache';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Go: '#00ADD8',
  Rust: '#dea584', C: '#555555', 'C++': '#f34b7d', Shell: '#89e051',
  Vue: '#41b883', PHP: '#4F5D95', Ruby: '#701516', Kotlin: '#A97BFF',
  Swift: '#F05138', default: '#8b8b8b',
};

function loadGitHubData() {
  const loadingEl = document.getElementById('github-loading');
  const errorEl = document.getElementById('github-error');
  const contentEl = document.getElementById('github-content');
  if (!loadingEl) return;
  const api = (CFG.github && CFG.github.api) || '';

  const cached = sessionStorage.getItem(GITHUB_CACHE_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      renderGitHubProfile(data);
      renderContributionGraph(data.activity);
      renderRepositories(data.pinned_repositories || data.repositories || []);
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      return;
    } catch (e) { sessionStorage.removeItem(GITHUB_CACHE_KEY); }
  }

  loadingEl.style.display = 'flex';
  errorEl.style.display = 'none';
  contentEl.style.display = 'none';

  fetch(api)
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function (data) {
      sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(data));
      renderGitHubProfile(data);
      renderContributionGraph(data.activity);
      renderRepositories(data.pinned_repositories || data.repositories || []);
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
    })
    .catch(function (err) {
      console.error('GitHub API Error:', err);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
    });
}

function renderGitHubProfile(data) {
  document.getElementById('gh-avatar').src = data.avatar_url || '';
  document.getElementById('gh-link').href = data.html_url || '#';
  document.getElementById('gh-name').textContent = data.name || data.login || '';
  document.getElementById('gh-bio').textContent = data.bio || '这个人很懒，什么都没写~';
  document.getElementById('gh-repos').textContent = data.public_repos || 0;
  document.getElementById('gh-followers').textContent = data.followers || 0;
  document.getElementById('gh-following').textContent = data.following || 0;
  const orgsEl = document.getElementById('gh-orgs');
  orgsEl.innerHTML = '';
  if (data.organizations && data.organizations.length) {
    data.organizations.forEach(function (org) {
      const tag = document.createElement('span');
      tag.className = 'github-org-tag';
      tag.textContent = org.login;
      orgsEl.appendChild(tag);
    });
  }
}

function renderContributionGraph(activity) {
  const graphEl = document.getElementById('gh-contrib-graph');
  const totalEl = document.getElementById('gh-total-contrib');
  if (!activity || !activity.contribution_calendar) {
    graphEl.innerHTML = '<span style="font-size:13px;opacity:0.6;">暂无贡献数据</span>';
    return;
  }
  const weeks = activity.contribution_calendar.weeks || [];
  const total = activity.total_contributions || activity.contribution_calendar.total_contributions || 0;
  totalEl.textContent = '共 ' + total + ' 次贡献';
  graphEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  function level(c) {
    if (c === 0) return 0;
    if (c <= 2) return 1;
    if (c <= 5) return 2;
    if (c <= 9) return 3;
    return 4;
  }

  weeks.forEach(function (week) {
    const wEl = document.createElement('div');
    wEl.className = 'github-contrib-week';
    const days = week.contribution_days || [];
    const map = {};
    days.forEach(function (d) { map[d.weekday] = d; });
    for (let i = 0; i < 7; i++) {
      const dEl = document.createElement('div');
      dEl.className = 'github-contrib-day';
      if (map[i]) {
        const c = map[i].contribution_count || 0;
        dEl.classList.add('level-' + level(c));
        dEl.title = map[i].date + ': ' + c + ' 次贡献';
      } else {
        dEl.classList.add('level-0');
        dEl.style.opacity = '0.3';
      }
      wEl.appendChild(dEl);
    }
    frag.appendChild(wEl);
  });
  graphEl.appendChild(frag);
}

function renderRepositories(repos) {
  const grid = document.getElementById('gh-repos-grid');
  grid.innerHTML = '';
  if (!repos || !repos.length) {
    grid.innerHTML = '<span style="font-size:13px;opacity:0.6;">暂无仓库数据</span>';
    return;
  }
  repos.forEach(function (repo) {
    const card = document.createElement('a');
    card.className = 'github-repo-card';
    card.href = repo.html_url || '#';
    card.target = '_blank';
    card.rel = 'noopener';
    const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
    const langHtml = repo.language
      ? '<span class="github-repo-lang"><span class="github-repo-lang-dot" style="background:' + langColor + '"></span>' + escapeHtml(repo.language) + '</span>'
      : '';
    const stars = repo.stargazers_count || repo.stargazers || 0;
    const forks = repo.forks_count || repo.forks || 0;
    card.innerHTML =
      '<div class="github-repo-name">' + escapeHtml(repo.name) + '</div>' +
      '<div class="github-repo-desc">' + escapeHtml(repo.description || '暂无描述') + '</div>' +
      '<div class="github-repo-meta">' + langHtml +
      '<span class="github-repo-stars">⭐ ' + formatNumber(stars) + '</span>' +
      '<span>🍴 ' + formatNumber(forks) + '</span></div>';
    grid.appendChild(card);
  });
}

/* ==================== 音乐播放器（含频谱可视化） ==================== */

(function () {
  const player = document.getElementById('musicPlayer');
  if (!player) return;

  const audio = document.getElementById('musicAudio');
  const cover = document.getElementById('musicCover');
  const collapse = document.getElementById('musicCollapse');
  const seek = document.getElementById('musicSeek');
  const curEl = document.getElementById('musicCurrent');
  const durEl = document.getElementById('musicDuration');
  const titleEl = document.getElementById('musicTitle');
  const viz = document.getElementById('musicViz');

  const ACCENT = 'var(--purple_text_color)';
  const TRACK = 'var(--item_hover_color)';
  let unlocked = false;

  let analyser = null;
  let freqData = null;
  let audioCtx = null;
  let usePseudo = false;
  let vizRaf = null;
  let pseudoT = 0;

  function setupAnalyser() {
    if (audioCtx || PREFERS_REDUCED_MOTION) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);

      setTimeout(function () {
        try {
          analyser.getByteFrequencyData(freqData);
          const sum = freqData.reduce(function (a, b) { return a + b; }, 0);
          if (sum === 0) usePseudo = true;
        } catch (e) { usePseudo = true; }
      }, 500);
    } catch (e) { usePseudo = true; }
  }

  function drawViz() {
    if (!viz) return;
    vizRaf = null;
    const ctx = viz.getContext('2d');
    const W = viz.width;
    const H = viz.height;
    const bars = 24;
    const gap = 2;
    const bw = (W - gap * (bars - 1)) / bars;

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--purple_text_color').trim() || '#747bff';

    ctx.clearRect(0, 0, W, H);

    if (analyser && !usePseudo) {
      analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < bars; i++) {
        const v = freqData[Math.floor(i * freqData.length / bars)] / 255;
        const bh = Math.max(2, v * H);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + v * 0.6;
        ctx.fillRect(i * (bw + gap), H - bh, bw, bh);
      }
    } else {
      pseudoT += 0.08;
      for (let i = 0; i < bars; i++) {
        const v = (Math.sin(pseudoT + i * 0.55) + 1) / 2 * 0.6
          + Math.sin(pseudoT * 1.7 + i * 0.3) * 0.2 + 0.2;
        const bh = Math.max(2, Math.abs(v) * H * 0.9);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + Math.abs(v) * 0.5;
        ctx.fillRect(i * (bw + gap), H - bh, bw, bh);
      }
    }
    ctx.globalAlpha = 1;

    if (!audio.paused) vizRaf = requestAnimationFrame(drawViz);
  }

  function startViz() {
    if (PREFERS_REDUCED_MOTION) return;
    setupAnalyser();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!vizRaf) vizRaf = requestAnimationFrame(drawViz);
  }

  function stopViz() {
    if (vizRaf) { cancelAnimationFrame(vizRaf); vizRaf = null; }
    if (viz) {
      const ctx = viz.getContext('2d');
      ctx.clearRect(0, 0, viz.width, viz.height);
    }
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function paintSeek(pct) {
    seek.style.background = 'linear-gradient(to right, ' + ACCENT + ' ' + pct + '%, ' + TRACK + ' ' + pct + '%)';
  }

  function autoPlayMuted() {
    audio.muted = true;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        player.classList.add('playing');
        armUnlockGesture();
      }).catch(function () { armUnlockGesture(true); });
    }
  }

  function armUnlockGesture(needResume) {
    const events = ['pointerdown', 'touchstart', 'keydown'];
    const unlock = function (e) {
      if (unlocked) return;
      if (e && e.target && e.target.closest && e.target.closest('#musicCollapse')) return;
      unlocked = true;
      events.forEach(function (ev) { document.removeEventListener(ev, unlock); });
      audio.muted = false;
      if (needResume || audio.paused) {
        audio.play().catch(function (err) { console.warn('[Music] 手势补播失败:', err); });
      }
      flashTitle('🔊 已开启声音');
    };
    events.forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true }); });
  }

  let titleTimer = null;
  function flashTitle(text) {
    const original = titleEl.dataset.original || titleEl.textContent;
    titleEl.dataset.original = original;
    titleEl.textContent = text;
    clearTimeout(titleTimer);
    titleTimer = setTimeout(function () { titleEl.textContent = titleEl.dataset.original; }, 2000);
  }

  cover.addEventListener('click', function () {
    if (!unlocked) { unlocked = true; audio.muted = false; }
    if (audio.paused) {
      audio.play().catch(function (err) {
        console.warn('[Music] 播放失败:', err);
        titleEl.textContent = '播放失败，请检查音源';
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', function () {
    player.classList.add('playing');
    startViz();
  });
  audio.addEventListener('pause', function () {
    player.classList.remove('playing');
    stopViz();
  });
  audio.addEventListener('loadedmetadata', function () {
    durEl.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    paintSeek(pct);
    curEl.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener('error', function () {
    titleEl.textContent = '音源加载失败';
  });

  collapse.addEventListener('click', function (e) {
    e.stopPropagation();
    player.classList.toggle('expanded');
  });

  seek.addEventListener('input', function () {
    paintSeek(seek.value);
    if (audio.duration) curEl.textContent = formatTime((seek.value / 100) * audio.duration);
  });
  seek.addEventListener('change', function () {
    if (!audio.duration) return;
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  paintSeek(0);
  if (window.innerWidth > 600) player.classList.add('expanded');
  autoPlayMuted();
})();

/* ==================== 标题个性化 ==================== */

(function () {
  const BASE = 'KD_klin · 个人主页';
  const AWAY = '👀 别走嘛，回来看看～';
  const BLUR = '💤 暂时离开了...';
  let timer = null;
  let idx = 0;
  let visible = !document.hidden;
  let focus = document.hasFocus();

  function type(text, speed, cb) {
    clearInterval(timer);
    idx = 0;
    document.title = '';
    timer = setInterval(function () {
      if (idx >= text.length) {
        clearInterval(timer);
        if (typeof cb === 'function') cb();
        return;
      }
      document.title += text.charAt(idx++);
    }, speed || 100);
  }

  function restore() {
    if (document.title === BASE) return;
    type(BASE, 100);
  }

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible && focus) restore();
    else if (!visible) { clearInterval(timer); document.title = AWAY; }
  });
  window.addEventListener('blur', function () {
    focus = false;
    if (visible) { clearInterval(timer); document.title = BLUR; }
  });
  window.addEventListener('focus', function () {
    focus = true;
    if (visible) restore();
  });
  window.addEventListener('load', function () {
    setTimeout(function () { type(BASE, 100); }, 300);
  });
})();