/**
 * @fileoverview Three.js 3D 粒子星云背景。
 * @description 自建 canvas，防重复加载，防 WebGL context 冲突。
 */

import * as THREE from 'three';

(function () {
  'use strict';

  // 防重复加载（避免同一脚本被执行两次导致 context 冲突）
  if (window.__KD_THREE_BG_LOADED__) {
    console.log('[three-bg] 已加载过，跳过');
    return;
  }
  window.__KD_THREE_BG_LOADED__ = true;

  // 减少动效偏好
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('[three-bg] 减少动效偏好，跳过');
    return;
  }

  const isMobile = window.innerWidth <= 800;

  // WebGL 支持检测（独立 canvas，不占用主 canvas）
  let webglSupported = false;
  try {
    const test = document.createElement('canvas');
    webglSupported = !!test.getContext('webgl');
  } catch (e) {
    webglSupported = false;
  }
  if (!webglSupported) {
    console.warn('[three-bg] 浏览器不支持 WebGL，跳过');
    return;
  }

  // 若已存在旧 canvas，先移除（防止上一个版本遗留）
  const old = document.getElementById('bgParticlesThree');
  if (old && old.parentNode) old.parentNode.removeChild(old);

  /* ==================== 创建 canvas ==================== */

  const canvas = document.createElement('canvas');
  canvas.id = 'bgParticlesThree';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;' +
    'opacity:0;transition:opacity 0.6s ease;will-change:opacity;';
  document.body.appendChild(canvas);

  /* ==================== 配置 ==================== */

  const KD_CFG = window.KD_CONFIG || {};
  const threeCfg = (KD_CFG.background && KD_CFG.background.three) || {};

  const CONFIG = {
    particleCount: threeCfg.particleCount || 2000,
    particleSize: threeCfg.particleSize || 3,
    particleColor: parseInt((threeCfg.particleColor || '#747bff').replace('#', ''), 16),
    connectionDistance: threeCfg.connectionDistance || 120,
    connectionOpacity: threeCfg.connectionOpacity != null ? threeCfg.connectionOpacity : 0.12,
    mouseMode: threeCfg.mouseMode || 'attract',
    mouseRadius: threeCfg.mouseRadius || 250,
    mouseStrength: threeCfg.mouseStrength || 0.003,
    baseSpeed: 0.0002,
    cameraZ: threeCfg.cameraZ || 400,
    autoRotate: threeCfg.autoRotate !== false,
  };

  if (isMobile) {
    CONFIG.particleCount = Math.floor(CONFIG.particleCount * 0.4);
  }

  /* ==================== 场景 ==================== */

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = CONFIG.cameraZ;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
    });
  } catch (err) {
    console.error('[three-bg] WebGL 初始化失败：', err);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ==================== 粒子 ==================== */

  const positions = new Float32Array(CONFIG.particleCount * 3);
  const velocities = new Float32Array(CONFIG.particleCount * 3);
  const originalPositions = new Float32Array(CONFIG.particleCount * 3);

  for (let i = 0; i < CONFIG.particleCount; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 1200;
    const y = (Math.random() - 0.5) * 800;
    const z = (Math.random() - 0.5) * 600;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    originalPositions[i3] = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;
    velocities[i3] = (Math.random() - 0.5) * CONFIG.baseSpeed;
    velocities[i3 + 1] = (Math.random() - 0.5) * CONFIG.baseSpeed;
    velocities[i3 + 2] = (Math.random() - 0.5) * CONFIG.baseSpeed;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // 圆形纹理
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 64;
  spriteCanvas.height = 64;
  const ctx2d = spriteCanvas.getContext('2d');
  const gradient = ctx2d.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(180,190,255,1)');
  gradient.addColorStop(1, 'rgba(116,123,255,0)');
  ctx2d.fillStyle = gradient;
  ctx2d.fillRect(0, 0, 64, 64);
  const particleTexture = new THREE.CanvasTexture(spriteCanvas);

  const material = new THREE.PointsMaterial({
    color: CONFIG.particleColor,
    size: CONFIG.particleSize,
    map: particleTexture,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* ==================== 连接线 ==================== */

  const lineGeometry = new THREE.BufferGeometry();
  const maxConnections = isMobile ? 600 : 2000;
  const linePositions = new Float32Array(maxConnections * 6);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.particleColor,
    transparent: true,
    opacity: CONFIG.connectionOpacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  /* ==================== 鼠标交互 ==================== */

  const mouse = new THREE.Vector2(-9999, -9999);
  const targetMouse = new THREE.Vector2(-9999, -9999);

  document.addEventListener(
    'mousemove',
    function (e) {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    {passive: true}
  );

  document.addEventListener(
    'touchmove',
    function (e) {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        targetMouse.x = (t.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
      }
    },
    {passive: true}
  );

  document.addEventListener(
    'touchend',
    function () {
      targetMouse.x = -9999;
      targetMouse.y = -9999;
    },
    {passive: true}
  );

  /* ==================== 动画 ==================== */

  let rafId = null;
  let running = false;
  let clock = null;

  function updateParticles(delta) {
    const posArray = geometry.attributes.position.array;
    const lineArray = lineGeometry.attributes.position.array;
    let lineIndex = 0;

    mouse.lerp(targetMouse, 0.08);
    const tanHalfFov = Math.tan((camera.fov * Math.PI) / 180 / 2);
    const mouseWorldX = mouse.x * camera.position.z * tanHalfFov * camera.aspect;
    const mouseWorldY = mouse.y * camera.position.z * tanHalfFov;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const i3 = i * 3;
      const px = posArray[i3];
      const py = posArray[i3 + 1];

      const dx = mouseWorldX - px;
      const dy = mouseWorldY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (CONFIG.mouseMode !== 'off' && dist < CONFIG.mouseRadius && dist > 0.1) {
        const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseStrength;
        const sign = CONFIG.mouseMode === 'repel' ? -1 : 1;
        posArray[i3] += dx * force * sign * delta * 60;
        posArray[i3 + 1] += dy * force * sign * delta * 60;
      }

      posArray[i3] += velocities[i3] * delta * 60;
      posArray[i3 + 1] += velocities[i3 + 1] * delta * 60;
      posArray[i3 + 2] += velocities[i3 + 2] * delta * 60;

      const ox = originalPositions[i3] - posArray[i3];
      const oy = originalPositions[i3 + 1] - posArray[i3 + 1];
      const oz = originalPositions[i3 + 2] - posArray[i3 + 2];
      posArray[i3] += ox * 0.002 * delta * 60;
      posArray[i3 + 1] += oy * 0.002 * delta * 60;
      posArray[i3 + 2] += oz * 0.002 * delta * 60;

      if (Math.abs(posArray[i3]) > 700) velocities[i3] *= -1;
      if (Math.abs(posArray[i3 + 1]) > 500) velocities[i3 + 1] *= -1;
      if (Math.abs(posArray[i3 + 2]) > 400) velocities[i3 + 2] *= -1;
    }

    if (!isMobile) {
      const connSq = CONFIG.connectionDistance * CONFIG.connectionDistance;
      for (let i = 0; i < CONFIG.particleCount && lineIndex < maxConnections * 6; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < CONFIG.particleCount && lineIndex < maxConnections * 6; j++) {
          const j3 = j * 3;
          const dx = posArray[i3] - posArray[j3];
          const dy = posArray[i3 + 1] - posArray[j3 + 1];
          const dz = posArray[i3 + 2] - posArray[j3 + 2];
          const dSq = dx * dx + dy * dy + dz * dz;
          if (dSq < connSq) {
            lineArray[lineIndex++] = posArray[i3];
            lineArray[lineIndex++] = posArray[i3 + 1];
            lineArray[lineIndex++] = posArray[i3 + 2];
            lineArray[lineIndex++] = posArray[j3];
            lineArray[lineIndex++] = posArray[j3 + 1];
            lineArray[lineIndex++] = posArray[j3 + 2];
          }
        }
      }
    }

    for (let k = lineIndex; k < maxConnections * 6; k++) {
      lineArray[k] = 0;
    }

    geometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIndex / 3);
  }

  function animate() {
    rafId = null;
    if (!running) return;
    const delta = Math.min(clock.getDelta(), 0.1);
    updateParticles(delta);
    if (CONFIG.autoRotate) {
      particles.rotation.y += 0.0001;
      particles.rotation.x += 0.00005;
    }
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    canvas.style.opacity = '0.55';
    if (!clock) clock = new THREE.Clock();
    clock.getDelta();
    if (!rafId) rafId = requestAnimationFrame(animate);
    console.log('[three-bg] 已启动，粒子数：', CONFIG.particleCount);
  }

  function stop() {
    running = false;
    canvas.style.opacity = '0';
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (running && !rafId) {
      clock.getDelta();
      rafId = requestAnimationFrame(animate);
    }
  });

  let resizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 200);
    },
    {passive: true}
  );

  /**
   * 运行时切换鼠标引力模式。
   * @param {string} mode 'attract' | 'repel' | 'off'。
   * @return {string} 切换后的模式。
   */
  window.setMouseMode = function (mode) {
    if (['attract', 'repel', 'off'].indexOf(mode) === -1) return CONFIG.mouseMode;
    CONFIG.mouseMode = mode;
    localStorage.setItem('KD_mouseMode', mode);
    console.log('[three-bg] 鼠标模式 →', mode);
    return mode;
  };

  // 启动时恢复上次的鼠标模式
  const savedMouseMode = localStorage.getItem('KD_mouseMode');
  if (savedMouseMode && ['attract', 'repel', 'off'].indexOf(savedMouseMode) !== -1) {
    CONFIG.mouseMode = savedMouseMode;
  }

  window.KD_BG_PARTICLES = {
    start: start,
    stop: stop,
    get isRunning() {
      return running;
    },
  };

  if (document.documentElement.dataset.bg === 'particles') {
    start();
  } else {
    console.log('[three-bg] 待命（当前模式：' + document.documentElement.dataset.bg + '）');
  }
})();
