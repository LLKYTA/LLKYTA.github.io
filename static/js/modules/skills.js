/**
 * @fileoverview 技能可视化：Canvas 雷达图 + SVG 环形进度条。
 */
(function () {
  'use strict';

  const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org/';
  const ICON_VIEW_BOX = '0 0 72 72';
  const RING_RADIUS = 32;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const RADAR_LAYERS = 5;
  const RADAR_RADIUS_RATIO = 0.62;
  const RADAR_LABEL_PADDING = 18;
  const RADAR_STEP = 0.022;

  /**
   * 拼接 Simple Icons 图标地址。
   * @param {string} slug 图标 slug。
   * @param {string} color 形如 '#rrggbb' 的主色。
   * @return {string} 图标 URL。
   */
  function getSkillIconUrl(slug, color) {
    return SIMPLE_ICONS_CDN + slug + '/' + color.replace('#', '');
  }

  /**
   * 把十六进制颜色转换为 rgba 字符串。
   * @param {string} hex 形如 '#rgb' 或 '#rrggbb' 的颜色。
   * @param {number} alpha 透明度 0~1。
   * @return {string} rgba() 颜色。
   */
  function hexToRgba(hex, alpha) {
    let value = hex.replace('#', '');
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /**
   * 读到主题无关的静态颜色（雷达图描边等）。
   * @return {{accent: string, text: string}} 颜色集合。
   */
  function readThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const accent =
      style.getPropertyValue('--purple-text-color').trim() || '#747bff';
    const text =
      style.getPropertyValue('--item-left-text-color').trim() || '#888';
    return {accent: accent, text: text};
  }

  /**
   * 构建一张技能卡（环形进度 + 图标）。
   * @param {{name: string, slug: string, color: string, level: number}} skill
   *     技能配置。
   * @return {!HTMLDivElement} 技能卡元素。
   */
  function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'skill-ring-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute(
      'aria-label',
      skill.name + ' 熟练度 ' + skill.level + '%',
    );

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'skill-ring-svg');
    svg.setAttribute('viewBox', ICON_VIEW_BOX);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.color = skill.color;

    /**
     * 创建圆环。
     * @param {string} className 类名。
     * @param {boolean} isFill 是否为进度圆环。
     * @return {!SVGCircleElement} 圆环元素。
     */
    function createCircle(className, isFill) {
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
      );
      circle.setAttribute('class', className);
      circle.setAttribute('cx', '36');
      circle.setAttribute('cy', '36');
      circle.setAttribute('r', String(RING_RADIUS));
      if (isFill) {
        circle.setAttribute('stroke', skill.color);
        circle.dataset.target = String(skill.level);
        circle.style.strokeDasharray = String(RING_CIRCUMFERENCE);
        circle.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
      }
      return circle;
    }

    svg.appendChild(createCircle('skill-ring-track', false));
    svg.appendChild(createCircle('skill-ring-fill', true));

    const iconWrap = document.createElement('div');
    iconWrap.className = 'skill-icon-wrap';
    const icon = document.createElement('img');
    icon.src = getSkillIconUrl(skill.slug, skill.color);
    icon.alt = skill.name;
    icon.loading = 'lazy';
    iconWrap.appendChild(icon);

    const label = document.createElement('div');
    label.className = 'skill-ring-label';
    label.textContent = skill.name;

    const percent = document.createElement('div');
    percent.className = 'skill-ring-pct';
    percent.textContent = skill.level + '%';

    card.appendChild(svg);
    card.appendChild(iconWrap);
    card.appendChild(label);
    card.appendChild(percent);
    return card;
  }

  /**
   * 渲染技能环形进度，进入视口时才播放动画。
   * @param {!Array<!Object>} skills 技能列表。
   * @return {void}
   */
  function renderSkillRings(skills) {
    const wrap = document.getElementById('skill-rings');
    if (!wrap) return;

    const frag = document.createDocumentFragment();
    skills.forEach(function (skill) {
      frag.appendChild(createSkillCard(skill));
    });
    wrap.textContent = '';
    wrap.appendChild(frag);

    if (PREFERS_REDUCED_MOTION) {
      wrap.querySelectorAll('.skill-ring-fill').forEach(function (circle) {
        const target = parseInt(circle.dataset.target, 10) || 0;
        circle.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - target / 100),
        );
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const circle = entry.target;
          const target = parseInt(circle.dataset.target, 10) || 0;
          circle.style.strokeDashoffset = String(
            RING_CIRCUMFERENCE * (1 - target / 100),
          );
          observer.unobserve(circle);
        });
      },
      {threshold: 0.2},
    );

    wrap.querySelectorAll('.skill-ring-fill').forEach(function (circle) {
      observer.observe(circle);
    });
  }

  /**
   * 渲染 Canvas 雷达图。
   * @param {!Array<!Object>} skills 技能列表。
   * @return {void}
   */
  function renderSkillRadar(skills) {
    const canvas = document.getElementById('skillRadar');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = skills.length;
    const step = (Math.PI * 2) / count;
    const startAngle = -Math.PI / 2;
    let rafId = null;
    let progress = PREFERS_REDUCED_MOTION ? 1 : 0;

    /**
     * 依据容器尺寸重设画布分辨率。
     * @return {void}
     */
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const size = Math.min(rect.width - 28, rect.height - 28);
      if (size <= 0) return;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * 计算某一圈层上顶点的坐标。
     * @param {number} radius 当前半径。
     * @param {number} index 顶点下标。
     * @return {{x: number, y: number}} 顶点坐标。
     */
    function vertex(radius, index) {
      const angle = startAngle + index * step;
      return {
        x: canvas.width / dpr / 2 + radius * Math.cos(angle),
        y: canvas.height / dpr / 2 + radius * Math.sin(angle),
      };
    }

    /**
     * 绘制整张雷达图。
     * @return {void}
     */
    function draw() {
      rafId = null;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      if (width <= 0 || height <= 0) return;

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) * RADAR_RADIUS_RATIO;
      const colors = readThemeColors();
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;

      for (let layer = 1; layer <= RADAR_LAYERS; layer++) {
        const r = (layer / RADAR_LAYERS) * radius;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const point = vertex(r, i);
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.globalAlpha = layer === RADAR_LAYERS ? 0.28 : 0.1;
        ctx.stroke();
      }

      ctx.globalAlpha = 0.14;
      for (let i = 0; i < count; i++) {
        const point = vertex(radius, i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }

      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const point = vertex(radius * (skills[i].level / 100) * eased, i);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, hexToRgba(colors.accent, 0.35));
      gradient.addColorStop(1, hexToRgba(colors.accent, 0.08));
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalAlpha = 0.75 * eased;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.globalAlpha = 0.95 * eased;
      for (let i = 0; i < count; i++) {
        const point = vertex(radius * (skills[i].level / 100) * eased, i);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = skills[i].color;
        ctx.fill();
      }

      ctx.globalAlpha = 0.75 * eased;
      ctx.font = '600 11px "Segoe UI", sans-serif';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
        const point = vertex(radius + RADAR_LABEL_PADDING, i);
        const x = Math.max(24, Math.min(width - 24, point.x));
        const y = Math.max(10, Math.min(height - 10, point.y));
        ctx.fillText(skills[i].name, x, y);
      }
      ctx.globalAlpha = 1;
    }

    /**
     * 入场动画：逐帧推进绘制进度。
     * @return {void}
     */
    function animate() {
      progress += RADAR_STEP;
      if (progress > 1) progress = 1;
      draw();
      rafId = progress < 1 ? requestAnimationFrame(animate) : null;
    }

    resize();

    let resizeTimer = null;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          resize();
          draw();
        }, 150);
      },
      {passive: true},
    );

    if (PREFERS_REDUCED_MOTION) {
      draw();
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          progress = 0;
          if (!rafId) rafId = requestAnimationFrame(animate);
        });
      },
      {threshold: 0.2},
    );
    observer.observe(canvas.parentElement);
  }

  /**
   * 依据配置渲染技能区。
   * @return {void}
   */
  window.renderSkillsFromConfig = function () {
    const skills = (CFG && CFG.skills) || [];
    if (!skills.length) return;
    renderSkillRings(skills);
    renderSkillRadar(skills);
  };
})();
