/**
 * @fileoverview KD_klin 音乐播放器模块（独立）。
 * @description 支持播放列表、音量、播放模式与 Media Session。
 *   依赖：config.js 中的 window.KD_CONFIG（music 字段）。
 *   不依赖 script.js，可单独加载。
 */
(function () {
  "use strict";

  /* ==================== 常量 ==================== */

  const CFG = window.KD_CONFIG || {};
  const PREFERS_REDUCED_MOTION = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const STORAGE_KEYS = {
    volume: "KD_musicVolume",
    mode: "KD_musicMode",
    index: "KD_musicIndex",
  };
  const MODES = ["list", "single", "shuffle"];
  const MODE_LABEL = {
    list: "列表循环",
    single: "单曲循环",
    shuffle: "随机播放",
  };
  const ICONS = {
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    single:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 15V9h-1l-2 1v1h1.5v4H13zm4-8H7v3l-4-4 4-4v3h12v6h-2V7zm-4 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    shuffle:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
    volHigh:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L9 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volLow:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>',
    volMute:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>',
  };

  /* ==================== 工具函数 ==================== */

  /**
   * 转义 HTML 特殊字符，避免 XSS 与渲染异常。
   * @param {string} str 原始字符串。
   * @return {string} 转义后的字符串。
   */
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  /**
   * 将秒数格式化为 mm:ss。
   * @param {number} sec 秒数。
   * @return {string} 格式化后的时间字符串。
   */
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /**
   * 读取当前主题的强调色。
   * @return {string} 十六进制或 CSS 变量解析后的颜色值。
   */
  function getAccentColor() {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--purple_text_color")
        .trim() || "#747bff"
    );
  }

  /* ==================== DOM ==================== */

  const player = document.getElementById("musicPlayer");
  if (!player) return;

  const audio = document.getElementById("musicAudio");
  const cover = document.getElementById("musicCover");
  const collapse = document.getElementById("musicCollapse");
  const seek = document.getElementById("musicSeek");
  const curEl = document.getElementById("musicCurrent");
  const durEl = document.getElementById("musicDuration");
  const titleEl = document.getElementById("musicTitle");
  const artistEl = document.getElementById("musicArtist");
  const viz = document.getElementById("musicViz");
  const prevBtn = document.getElementById("musicPrev");
  const nextBtn = document.getElementById("musicNext");
  const modeBtn = document.getElementById("musicMode");
  const volumeBtn = document.getElementById("musicVolumeBtn");
  const volumeSlider = document.getElementById("musicVolume");
  const playlistBtn = document.getElementById("musicPlaylistBtn");
  const playlistPanel = document.getElementById("musicPlaylistPanel");
  const playlistList = document.getElementById("musicPlaylistList");
  const playlistCount = document.getElementById("musicPlaylistCount");

  /* ==================== 配置归一化 ==================== */

  const raw = CFG.music || {};
  if (raw.enabled === false) {
    player.style.display = "none";
    return;
  }

  let playlist = [];
  if (Array.isArray(raw.playlist) && raw.playlist.length) {
    playlist = raw.playlist;
  } else if (raw.src) {
    playlist = [{ src: raw.src, title: raw.title || "未知曲目", artist: "" }];
  } else {
    player.style.display = "none";
    return;
  }

  playlist = playlist
    .filter(function (t) {
      return t && t.src;
    })
    .map(function (t) {
      return {
        src: t.src,
        title: t.title || "未知曲目",
        artist: t.artist || "",
        cover: t.cover || "",
      };
    });

  if (!playlist.length) {
    player.style.display = "none";
    return;
  }

  const PERSIST = raw.persist !== false;

  /* ==================== 状态 ==================== */

  let currentIndex = PERSIST
    ? Math.max(
        0,
        Math.min(
          playlist.length - 1,
          parseInt(localStorage.getItem(STORAGE_KEYS.index) || "0", 10) || 0,
        ),
      )
    : 0;

  let mode = PERSIST
    ? localStorage.getItem(STORAGE_KEYS.mode) || raw.mode || "list"
    : raw.mode || "list";
  if (MODES.indexOf(mode) === -1) mode = "list";

  let volume = PERSIST
    ? parseFloat(localStorage.getItem(STORAGE_KEYS.volume))
    : NaN;
  if (!isFinite(volume)) {
    volume = typeof raw.volume === "number" ? raw.volume : 0.7;
  }
  volume = Math.max(0, Math.min(1, volume));
  let lastVolume = volume > 0 ? volume : 0.7;
  let unlocked = false;

  /* ==================== 可视化状态 ==================== */

  let analyser = null;
  let freqData = null;
  let audioCtx = null;
  let usePseudo = false;
  let vizRaf = null;
  let pseudoT = 0;

  /* ==================== 状态持久化 ==================== */

  /**
   * 将音量 / 模式 / 当前曲目索引写入 localStorage。
   * @return {void}
   */
  function saveState() {
    if (!PERSIST) return;
    try {
      localStorage.setItem(STORAGE_KEYS.volume, String(volume));
      localStorage.setItem(STORAGE_KEYS.mode, mode);
      localStorage.setItem(STORAGE_KEYS.index, String(currentIndex));
    } catch (e) {
      // 隐私模式 / 配额不足时静默失败
    }
  }

  /* ==================== 界面绘制 ==================== */

  /**
   * 绘制进度条已播放部分。
   * @param {number} pct 百分比（0-100）。
   * @return {void}
   */
  function paintSeek(pct) {
    const accent = getAccentColor();
    seek.style.background =
      "linear-gradient(to right, " +
      accent +
      " " +
      pct +
      "%, var(--item_hover_color) " +
      pct +
      "%)";
  }

  /**
   * 刷新音量按钮图标与滑块背景。
   * @return {void}
   */
  function paintVolume() {
    if (!volumeSlider) return;
    const pct = (audio.muted ? 0 : volume) * 100;
    const accent = getAccentColor();
    volumeSlider.style.background =
      "linear-gradient(to right, " +
      accent +
      " " +
      pct +
      "%, var(--item_hover_color) " +
      pct +
      "%)";
    if (volumeBtn) {
      const v = audio.muted ? 0 : volume;
      volumeBtn.innerHTML =
        v === 0 ? ICONS.volMute : v < 0.5 ? ICONS.volLow : ICONS.volHigh;
      volumeBtn.setAttribute("aria-label", v === 0 ? "取消静音" : "静音");
    }
  }

  /**
   * 刷新播放模式按钮图标与提示。
   * @return {void}
   */
  function paintModeBtn() {
    if (!modeBtn) return;
    modeBtn.innerHTML = ICONS[mode] || ICONS.list;
    const label = MODE_LABEL[mode] || "列表循环";
    modeBtn.setAttribute("aria-label", "播放模式：" + label);
    modeBtn.title = label;
  }

  /**
   * 渲染播放列表项，并高亮当前曲目。
   * @return {void}
   */
  function renderPlaylist() {
    if (!playlistList) return;
    playlistList.innerHTML = "";
    playlistCount.textContent = playlist.length + " 首";
    playlist.forEach(function (t, i) {
      const li = document.createElement("li");
      li.className =
        "music-playlist-item" + (i === currentIndex ? " playing" : "");
      li.dataset.index = i;
      li.innerHTML =
        '<span class="music-playlist-item-idx">' +
        (i === currentIndex ? "▶" : i + 1) +
        "</span>" +
        '<span class="music-playlist-item-name">' +
        escapeHtml(t.title) +
        "</span>" +
        (t.artist
          ? '<span class="music-playlist-item-artist">' +
            escapeHtml(t.artist) +
            "</span>"
          : "");
      li.addEventListener("click", function () {
        if (i === currentIndex) {
          togglePlay();
          return;
        }
        loadTrack(i, true);
      });
      playlistList.appendChild(li);
    });
  }

  /**
   * 打开 / 关闭播放列表面板。
   * @param {boolean=} force 为 true 强制打开，false 强制关闭，缺省时切换。
   * @return {void}
   */
  function togglePlaylistPanel(force) {
    if (!playlistPanel) return;
    const open =
      force != null ? force : !playlistPanel.classList.contains("active");
    playlistPanel.classList.toggle("active", open);
    playlistPanel.setAttribute("aria-hidden", open ? "false" : "true");
    if (playlistBtn) playlistBtn.classList.toggle("active", open);
  }

  /* ==================== Media Session ==================== */

  /**
   * 更新系统媒体会话元数据（锁屏 / 通知栏）。
   * @return {void}
   */
  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    const track = playlist[currentIndex] || {};
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || "未知曲目",
        artist: track.artist || (CFG.site && CFG.site.name) || "",
        album: (CFG.site && CFG.site.name) || "KD_klin",
        artwork: track.cover ? [{ src: track.cover, sizes: "512x512" }] : [],
      });
    } catch (e) {
      // MediaMetadata 不被支持时静默失败
    }
  }

  /* ==================== 曲目控制 ==================== */

  /**
   * 加载指定索引的曲目。
   * @param {number} index 曲目索引。
   * @param {boolean} autoplay 是否自动播放。
   * @return {void}
   */
  function loadTrack(index, autoplay) {
    currentIndex = index;
    const track = playlist[index];
    if (!track) return;
    audio.src = track.src;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist || "";
    seek.value = 0;
    paintSeek(0);
    curEl.textContent = "0:00";
    durEl.textContent = "0:00";
    renderPlaylist();
    saveState();
    updateMediaSession();
    if (autoplay) {
      audio.play().catch(function (err) {
        console.warn("[Music] 播放失败:", err);
      });
    }
  }

  /**
   * 切换播放 / 暂停。
   * @return {void}
   */
  function togglePlay() {
    if (!unlocked) {
      unlocked = true;
      audio.muted = false;
      paintVolume();
    }
    if (audio.paused) {
      audio.play().catch(function (err) {
        console.warn("[Music] 播放失败:", err);
        titleEl.textContent = "播放失败，请检查音源";
      });
    } else {
      audio.pause();
    }
  }

  /**
   * 生成随机曲目索引（不与当前重复）。
   * @return {number} 随机索引。
   */
  function randomIndex() {
    if (playlist.length <= 1) return 0;
    let idx = currentIndex;
    while (idx === currentIndex) {
      idx = Math.floor(Math.random() * playlist.length);
    }
    return idx;
  }

  /**
   * 播放上一首（播放超过 3 秒则回到开头）。
   * @return {void}
   */
  function playPrev() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const idx =
      mode === "shuffle"
        ? randomIndex()
        : (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(idx, true);
  }

  /**
   * 播放下一首。
   * @param {boolean} auto 是否由曲目结束事件自动触发。
   * @return {void}
   */
  function playNext(auto) {
    const idx =
      mode === "shuffle" ? randomIndex() : (currentIndex + 1) % playlist.length;
    loadTrack(idx, true);
  }

  /**
   * 初始化 Web Audio Analyser。
   * 说明：仅在同源音频时启用真实频谱；
   *   跨域音频（未返回 CORS 头）会导致 createMediaElementSource 后静音，
   *   因此保守起见只对同源音频启用，否则回退到伪频谱。
   * @return {void}
   */
  function setupAnalyser() {
    if (audioCtx || PREFERS_REDUCED_MOTION) return;

    // 同源检查：相对路径 / 同域资源才启用真实频谱
    const srcUrl = audio.src || '';
    let sameOrigin = true;
    try {
      if (srcUrl) {
        sameOrigin = new URL(srcUrl, location.href).origin === location.origin;
      }
    } catch (e) {
      sameOrigin = false;
    }

    if (!sameOrigin) {
      usePseudo = true;
      return;
    }

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);

      // 500ms 后检测数据是否全为 0，为 0 则回退伪频谱
      setTimeout(function () {
        try {
          analyser.getByteFrequencyData(freqData);
          const sum = freqData.reduce(function (a, b) {
            return a + b;
          }, 0);
          if (sum === 0) usePseudo = true;
        } catch (e) {
          usePseudo = true;
        }
      }, 500);
    } catch (e) {
      usePseudo = true;
    }
  }

  /**
   * 绘制一帧频谱。
   * @return {void}
   */
  function drawViz() {
    if (!viz) return;
    vizRaf = null;
    const ctx = viz.getContext("2d");
    const w = viz.width;
    const h = viz.height;
    const bars = 24;
    const gap = 2;
    const bw = (w - gap * (bars - 1)) / bars;
    const accent = getAccentColor();

    ctx.clearRect(0, 0, w, h);

    if (analyser && !usePseudo) {
      analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < bars; i++) {
        const v = freqData[Math.floor((i * freqData.length) / bars)] / 255;
        const bh = Math.max(2, v * h);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + v * 0.6;
        ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
      }
    } else {
      pseudoT += 0.08;
      for (let i = 0; i < bars; i++) {
        const v =
          ((Math.sin(pseudoT + i * 0.55) + 1) / 2) * 0.6 +
          Math.sin(pseudoT * 1.7 + i * 0.3) * 0.2 +
          0.2;
        const bh = Math.max(2, Math.abs(v) * h * 0.9);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + Math.abs(v) * 0.5;
        ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
      }
    }
    ctx.globalAlpha = 1;
    if (!audio.paused) vizRaf = requestAnimationFrame(drawViz);
  }

  /**
   * 启动频谱可视化循环。
   * @return {void}
   */
  function startViz() {
    if (PREFERS_REDUCED_MOTION) return;
    setupAnalyser();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    if (!vizRaf) vizRaf = requestAnimationFrame(drawViz);
  }

  /**
   * 停止频谱可视化循环并清空画布。
   * @return {void}
   */
  function stopViz() {
    if (vizRaf) {
      cancelAnimationFrame(vizRaf);
      vizRaf = null;
    }
    if (viz) {
      const ctx = viz.getContext("2d");
      ctx.clearRect(0, 0, viz.width, viz.height);
    }
  }

  /* ==================== 自动播放解锁 ==================== */

  /**
   * 监听用户手势，解锁被浏览器拦截的自动播放。
   * @param {boolean=} needResume 是否需要在解锁后主动续播。
   * @return {void}
   */
  function armUnlockGesture(needResume) {
    const events = ["pointerdown", "touchstart", "keydown"];
    const unlock = function (e) {
      if (unlocked) return;
      if (e && e.target && e.target.closest) {
        if (e.target.closest("#musicCollapse")) return;
        if (
          e.target.closest(
            "#musicVolumeBtn, #musicVolume, #musicPlaylistBtn, " +
              "#musicMode, #musicPrev, #musicNext, #musicCover",
          )
        ) {
          return;
        }
      }
      unlocked = true;
      events.forEach(function (ev) {
        document.removeEventListener(ev, unlock);
      });
      audio.muted = false;
      paintVolume();
      if (needResume || audio.paused) {
        audio.play().catch(function (err) {
          console.warn("[Music] 手势补播失败:", err);
        });
      }
    };
    events.forEach(function (ev) {
      document.addEventListener(ev, unlock, { passive: true });
    });
  }

  /* ==================== 事件绑定 ==================== */

  cover.addEventListener("click", togglePlay);

  if (prevBtn) {
    prevBtn.addEventListener("click", playPrev);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      playNext(false);
    });
  }

  if (modeBtn) {
    modeBtn.addEventListener("click", function () {
      const i = MODES.indexOf(mode);
      mode = MODES[(i + 1) % MODES.length];
      paintModeBtn();
      saveState();
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener("click", function () {
      if (audio.muted || volume === 0) {
        audio.muted = false;
        volume = lastVolume || 0.7;
        audio.volume = volume;
        if (volumeSlider) volumeSlider.value = volume;
      } else {
        lastVolume = volume;
        audio.muted = true;
      }
      paintVolume();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      volume = parseFloat(volumeSlider.value);
      if (volume > 0) {
        audio.muted = false;
        lastVolume = volume;
      }
      audio.volume = volume;
      paintVolume();
      saveState();
    });
  }

  if (playlistBtn) {
    playlistBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      togglePlaylistPanel();
    });
  }

  document.addEventListener("click", function (e) {
    if (!playlistPanel || !playlistPanel.classList.contains("active")) return;
    if (playlistPanel.contains(e.target)) return;
    if (playlistBtn && playlistBtn.contains(e.target)) return;
    togglePlaylistPanel(false);
  });

  if (collapse) {
    collapse.addEventListener("click", function (e) {
      e.stopPropagation();
      player.classList.toggle("expanded");
      if (!player.classList.contains("expanded")) togglePlaylistPanel(false);
    });
  }

  seek.addEventListener("input", function () {
    paintSeek(seek.value);
    if (audio.duration) {
      curEl.textContent = formatTime((seek.value / 100) * audio.duration);
    }
  });
  seek.addEventListener("change", function () {
    if (!audio.duration) return;
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  audio.addEventListener("play", function () {
    player.classList.add("playing");
    startViz();
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  });
  audio.addEventListener("pause", function () {
    player.classList.remove("playing");
    stopViz();
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  });
  audio.addEventListener("loadedmetadata", function () {
    durEl.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", function () {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    paintSeek(pct);
    curEl.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener("ended", function () {
    if (mode === "single") {
      audio.currentTime = 0;
      audio.play().catch(function () {});
      return;
    }
    playNext(true);
  });
  audio.addEventListener("error", function () {
    titleEl.textContent = "音源加载失败";
  });

  /* ==================== Media Session 动作 ==================== */

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", function () {
        audio.play();
      });
      navigator.mediaSession.setActionHandler("pause", function () {
        audio.pause();
      });
      navigator.mediaSession.setActionHandler("previoustrack", playPrev);
      navigator.mediaSession.setActionHandler("nexttrack", function () {
        playNext(false);
      });
      navigator.mediaSession.setActionHandler("seekto", function (details) {
        if (details.seekTime != null) audio.currentTime = details.seekTime;
      });
    } catch (e) {
      // 部分动作不被支持时静默失败
    }
  }

  /* ==================== 初始化 ==================== */

  audio.preload = "metadata";
  audio.loop = false;
  audio.volume = volume;
  if (volumeSlider) volumeSlider.value = volume;
  paintVolume();
  paintModeBtn();
  renderPlaylist();
  loadTrack(currentIndex, false);
  paintSeek(0);

  if (window.innerWidth > 600) player.classList.add("expanded");

  if (raw.autoplay) {
    audio.muted = true;
    audio
      .play()
      .then(function () {
        armUnlockGesture();
      })
      .catch(function () {
        armUnlockGesture(true);
      });
  }
})();
