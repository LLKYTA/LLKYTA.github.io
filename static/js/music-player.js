/**
 * @fileoverview 音乐播放器：歌单、进度、音量、播放模式、频谱与 Media Session。
 * @description 图标使用 index.html 中的 SVG sprite，避免在 JS 里内联大段
 *     SVG；状态通过 KD_STORAGE 持久化；跨域音源自动降级为伪频谱。
 */
(function () {
  'use strict';

  const MUSIC_CFG = (window.KD_CONFIG && window.KD_CONFIG.music) || {};
  const REDUCED_MOTION = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const SITE_NAME =
    (window.KD_CONFIG && window.KD_CONFIG.site && window.KD_CONFIG.site.name) ||
    'KD_klin';

  const STORAGE_KEYS = {
    volume: 'KD_musicVolume',
    mode: 'KD_musicMode',
    index: 'KD_musicIndex',
  };
  const MODES = ['list', 'single', 'shuffle'];
  const MODE_LABEL = {
    list: '列表循环',
    single: '单曲循环',
    shuffle: '随机播放',
  };
  const MODE_ICON = {
    list: 'music-list',
    single: 'music-single',
    shuffle: 'music-shuffle',
  };
  const VOLUME_ICON = {
    mute: 'music-vol-mute',
    low: 'music-vol-low',
    high: 'music-vol-high',
  };
  const DEFAULT_VOLUME = 0.7;
  const SEEK_REWIND_SECONDS = 3;
  const VIZ_BARS = 24;
  const VIZ_GAP = 2;
  const DESKTOP_MIN_WIDTH = 600;

  /**
   * 生成引用 sprite 符号的 SVG 图标标记。
   * @param {string} symbolId sprite 中的 symbol id。
   * @return {string} SVG 标记字符串。
   */
  function iconMarkup(symbolId) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<use href="#' +
      symbolId +
      '"></use></svg>'
    );
  }

  /**
   * 秒数格式化为 m:ss。
   * @param {number} seconds 秒数。
   * @return {string} 时间文本。
   */
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);
    return minutes + ':' + (rest < 10 ? '0' : '') + rest;
  }

  /**
   * 读取主题强调色。
   * @return {string} 颜色值。
   */
  function getAccentColor() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--purple-text-color')
      .trim();
    return value || '#747bff';
  }

  const player = document.getElementById('music-player');
  if (!player) return;

  const audio = document.getElementById('music-audio');
  const cover = document.getElementById('music-cover');
  const collapse = document.getElementById('music-collapse');
  const seek = document.getElementById('music-seek');
  const currentEl = document.getElementById('music-current');
  const durationEl = document.getElementById('music-duration');
  const titleEl = document.getElementById('music-title');
  const artistEl = document.getElementById('music-artist');
  const viz = document.getElementById('music-viz');
  const prevBtn = document.getElementById('music-prev');
  const nextBtn = document.getElementById('music-next');
  const modeBtn = document.getElementById('music-mode');
  const volumeBtn = document.getElementById('music-volume-btn');
  const volumeSlider = document.getElementById('music-volume');
  const playlistBtn = document.getElementById('music-playlist-btn');
  const playlistPanel = document.getElementById('music-playlist-panel');
  const playlistList = document.getElementById('music-playlist-list');
  const playlistCount = document.getElementById('music-playlist-count');

  /**
   * 隐藏播放器（配置关闭或无可用音源时）。
   * @return {void}
   */
  function disablePlayer() {
    player.style.display = 'none';
  }

  if (MUSIC_CFG.enabled === false) {
    disablePlayer();
    return;
  }

  /**
   * 读取并规范化配置中的歌单。
   * @return {!Array<!Object>} 曲目列表。
   */
  function readPlaylist() {
    let list = [];
    if (Array.isArray(MUSIC_CFG.playlist) && MUSIC_CFG.playlist.length) {
      list = MUSIC_CFG.playlist;
    } else if (MUSIC_CFG.src) {
      list = [
        {
          src: MUSIC_CFG.src,
          title: MUSIC_CFG.title || '未知曲目',
          artist: '',
        },
      ];
    }
    return list
      .filter(function (track) {
        return track && track.src;
      })
      .map(function (track) {
        return {
          src: track.src,
          title: track.title || '未知曲目',
          artist: track.artist || '',
          cover: track.cover || '',
        };
      });
  }

  const playlist = readPlaylist();
  if (!playlist.length) {
    disablePlayer();
    return;
  }

  const PERSIST = MUSIC_CFG.persist !== false;

  /**
   * 读取持久化的曲目下标。
   * @return {number} 合法下标。
   */
  function readStoredIndex() {
    if (!PERSIST) return 0;
    const stored = parseInt(
      window.KD_STORAGE.read(STORAGE_KEYS.index, '0'),
      10,
    );
    if (isNaN(stored)) return 0;
    return Math.max(0, Math.min(playlist.length - 1, stored));
  }

  /**
   * 读取持久化的播放模式。
   * @return {string} 模式名。
   */
  function readStoredMode() {
    const stored = PERSIST
      ? window.KD_STORAGE.read(STORAGE_KEYS.mode)
      : MUSIC_CFG.mode;
    const mode = stored || MUSIC_CFG.mode || 'list';
    return MODES.indexOf(mode) === -1 ? 'list' : mode;
  }

  /**
   * 读取持久化的音量。
   * @return {number} 0~1 之间的音量。
   */
  function readStoredVolume() {
    let value = NaN;
    if (PERSIST) {
      value = parseFloat(window.KD_STORAGE.read(STORAGE_KEYS.volume, ''));
    }
    if (!isFinite(value)) {
      value =
        typeof MUSIC_CFG.volume === 'number'
          ? MUSIC_CFG.volume
          : DEFAULT_VOLUME;
    }
    return Math.max(0, Math.min(1, value));
  }

  let currentIndex = readStoredIndex();
  let mode = readStoredMode();
  let volume = readStoredVolume();
  let lastVolume = volume > 0 ? volume : DEFAULT_VOLUME;
  let unlocked = false;

  let analyser = null;
  let freqData = null;
  let audioCtx = null;
  let usePseudo = false;
  let vizRaf = null;
  let pseudoPhase = 0;

  /**
   * 持久化当前播放状态。
   * @return {void}
   */
  function saveState() {
    if (!PERSIST) return;
    window.KD_STORAGE.write(STORAGE_KEYS.volume, volume);
    window.KD_STORAGE.write(STORAGE_KEYS.mode, mode);
    window.KD_STORAGE.write(STORAGE_KEYS.index, currentIndex);
  }

  /**
   * 用主题色绘制滑块的已填充区间。
   * @param {!HTMLInputElement} input 滑块元素。
   * @param {number} percent 已填充百分比。
   * @return {void}
   */
  function paintSlider(input, percent) {
    input.style.background =
      'linear-gradient(to right, ' +
      getAccentColor() +
      ' ' +
      percent +
      '%, var(--item-hover-color) ' +
      percent +
      '%)';
  }

  /**
   * 刷新音量滑块与音量按钮图标。
   * @return {void}
   */
  function paintVolume() {
    const effective = audio.muted ? 0 : volume;
    if (volumeSlider) {
      paintSlider(volumeSlider, effective * 100);
      volumeSlider.value = String(effective);
    }
    if (!volumeBtn) return;
    if (effective === 0) volumeBtn.innerHTML = iconMarkup(VOLUME_ICON.mute);
    else if (effective < 0.5) volumeBtn.innerHTML = iconMarkup(VOLUME_ICON.low);
    else volumeBtn.innerHTML = iconMarkup(VOLUME_ICON.high);
    volumeBtn.setAttribute('aria-label', effective === 0 ? '取消静音' : '静音');
  }

  /**
   * 刷新播放模式按钮。
   * @return {void}
   */
  function paintModeBtn() {
    if (!modeBtn) return;
    modeBtn.innerHTML = iconMarkup(MODE_ICON[mode] || MODE_ICON.list);
    const label = MODE_LABEL[mode] || MODE_LABEL.list;
    modeBtn.setAttribute('aria-label', '播放模式：' + label);
    modeBtn.title = label;
  }

  /**
   * 重绘播放列表。
   * @return {void}
   */
  function renderPlaylist() {
    if (!playlistList) return;
    if (playlistCount) playlistCount.textContent = playlist.length + ' 首';

    const frag = document.createDocumentFragment();
    playlist.forEach(function (track, index) {
      const item = document.createElement('li');
      item.className =
        'music-playlist-item' + (index === currentIndex ? ' playing' : '');
      item.dataset.index = String(index);

      const order = document.createElement('span');
      order.className = 'music-playlist-item-idx';
      order.textContent = index === currentIndex ? '▶' : String(index + 1);

      const name = document.createElement('span');
      name.className = 'music-playlist-item-name';
      name.textContent = track.title;

      item.appendChild(order);
      item.appendChild(name);

      if (track.artist) {
        const artist = document.createElement('span');
        artist.className = 'music-playlist-item-artist';
        artist.textContent = track.artist;
        item.appendChild(artist);
      }

      item.addEventListener('click', function () {
        if (index === currentIndex) {
          togglePlay();
          return;
        }
        loadTrack(index, true);
      });
      frag.appendChild(item);
    });

    playlistList.textContent = '';
    playlistList.appendChild(frag);
  }

  /**
   * 打开或关闭播放列表面板。
   * @param {boolean=} opt_force 指定目标状态。
   * @return {void}
   */
  function togglePlaylistPanel(opt_force) {
    if (!playlistPanel) return;
    const open =
      opt_force != null
        ? opt_force
        : !playlistPanel.classList.contains('active');
    playlistPanel.classList.toggle('active', open);
    playlistPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (playlistBtn) playlistBtn.classList.toggle('active', open);
  }

  /**
   * 同步播放器状态到 body，供页脚避让等样式使用。
   * @return {void}
   */
  function syncBodyState() {
    document.body.classList.toggle(
      'music-expanded',
      player.classList.contains('expanded'),
    );
    if (!playlistPanel) return;
    document.body.classList.toggle(
      'music-playlist-open',
      playlistPanel.classList.contains('active'),
    );
  }

  /**
   * 更新系统媒体控件显示的曲目信息。
   * @return {void}
   */
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const track = playlist[currentIndex] || {};
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || '未知曲目',
        artist: track.artist || SITE_NAME,
        album: SITE_NAME,
        artwork: track.cover ? [{src: track.cover, sizes: '512x512'}] : [],
      });
    } catch (e) {
      // 部分浏览器不支持 MediaMetadata，忽略即可。
    }
  }

  /**
   * 载入指定曲目。
   * @param {number} index 曲目下标。
   * @param {boolean} autoplay 是否自动播放。
   * @return {void}
   */
  function loadTrack(index, autoplay) {
    const track = playlist[index];
    if (!track) return;

    currentIndex = index;
    audio.src = track.src;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    seek.value = '0';
    paintSlider(seek, 0);
    currentEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    renderPlaylist();
    saveState();
    updateMediaSession();

    if (autoplay) {
      audio.play().catch(function (error) {
        console.warn('[Music] 播放失败:', error);
      });
    }
  }

  /**
   * 播放 / 暂停切换。
   * @return {void}
   */
  function togglePlay() {
    if (!unlocked) {
      unlocked = true;
      audio.muted = false;
      paintVolume();
    }
    if (audio.paused) {
      audio.play().catch(function (error) {
        console.warn('[Music] 播放失败:', error);
        titleEl.textContent = '播放失败，请检查音源';
      });
      return;
    }
    audio.pause();
  }

  /**
   * 随机取一个不同于当前曲目的下标。
   * @return {number} 曲目下标。
   */
  function randomIndex() {
    if (playlist.length <= 1) return 0;
    let index = currentIndex;
    while (index === currentIndex) {
      index = Math.floor(Math.random() * playlist.length);
    }
    return index;
  }

  /**
   * 上一首：播放超过 3 秒时先回到开头。
   * @return {void}
   */
  function playPrev() {
    if (audio.currentTime > SEEK_REWIND_SECONDS) {
      audio.currentTime = 0;
      return;
    }
    const index =
      mode === 'shuffle'
        ? randomIndex()
        : (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(index, true);
  }

  /**
   * 下一首。
   * @return {void}
   */
  function playNext() {
    const index =
      mode === 'shuffle' ? randomIndex() : (currentIndex + 1) % playlist.length;
    loadTrack(index, true);
  }

  /**
   * 初始化 Web Audio 频谱分析；同源音源才可用。
   * @return {void}
   */
  function setupAnalyser() {
    if (audioCtx || REDUCED_MOTION) return;

    let sameOrigin = true;
    try {
      const sourceUrl = audio.src;
      if (sourceUrl) {
        sameOrigin =
          new URL(sourceUrl, location.href).origin === location.origin;
      }
    } catch (e) {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      usePseudo = true;
      return;
    }

    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtor();
      const source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      setTimeout(function () {
        try {
          analyser.getByteFrequencyData(freqData);
          const sum = freqData.reduce(function (total, value) {
            return total + value;
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

    const ctx = viz.getContext('2d');
    const width = viz.width;
    const height = viz.height;
    const barWidth = (width - VIZ_GAP * (VIZ_BARS - 1)) / VIZ_BARS;
    const accent = getAccentColor();
    ctx.clearRect(0, 0, width, height);

    if (analyser && !usePseudo) {
      analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < VIZ_BARS; i++) {
        const value =
          freqData[Math.floor((i * freqData.length) / VIZ_BARS)] / 255;
        const barHeight = Math.max(2, value * height);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + value * 0.6;
        ctx.fillRect(
          i * (barWidth + VIZ_GAP),
          height - barHeight,
          barWidth,
          barHeight,
        );
      }
    } else {
      pseudoPhase += 0.08;
      for (let i = 0; i < VIZ_BARS; i++) {
        const value =
          ((Math.sin(pseudoPhase + i * 0.55) + 1) / 2) * 0.6 +
          Math.sin(pseudoPhase * 1.7 + i * 0.3) * 0.2 +
          0.2;
        const barHeight = Math.max(2, Math.abs(value) * height * 0.9);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + Math.abs(value) * 0.5;
        ctx.fillRect(
          i * (barWidth + VIZ_GAP),
          height - barHeight,
          barWidth,
          barHeight,
        );
      }
    }
    ctx.globalAlpha = 1;

    if (!audio.paused) vizRaf = requestAnimationFrame(drawViz);
  }

  /**
   * 开始频谱动画。
   * @return {void}
   */
  function startViz() {
    if (REDUCED_MOTION || !viz) return;
    setupAnalyser();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!vizRaf) vizRaf = requestAnimationFrame(drawViz);
  }

  /**
   * 停止频谱动画并清空画布。
   * @return {void}
   */
  function stopViz() {
    if (vizRaf) {
      cancelAnimationFrame(vizRaf);
      vizRaf = null;
    }
    if (!viz) return;
    viz.getContext('2d').clearRect(0, 0, viz.width, viz.height);
  }

  const CONTROLS_SELECTOR = [
    '#music-volume-btn',
    '#music-volume',
    '#music-playlist-btn',
    '#music-mode',
    '#music-prev',
    '#music-next',
    '#music-cover',
  ].join(', ');

  /**
   * 因自动播放策略被拦截时，等待首次用户手势后取消静音并补播。
   * @param {boolean=} opt_needResume 是否需要在手势后主动继续播放。
   * @return {void}
   */
  function armUnlockGesture(opt_needResume) {
    const events = ['pointerdown', 'touchstart', 'keydown'];

    /**
     * 首次手势的处理函数。
     * @param {!Event} event 触发的事件。
     * @return {void}
     */
    function unlock(event) {
      if (unlocked) return;
      const target = event && event.target;
      if (target && target.closest) {
        // 这些控件自身会处理播放状态，不在这里抢跑。
        if (
          target.closest('#music-collapse') ||
          target.closest(CONTROLS_SELECTOR)
        ) {
          return;
        }
      }
      unlocked = true;
      events.forEach(function (name) {
        document.removeEventListener(name, unlock);
      });
      audio.muted = false;
      paintVolume();
      if (opt_needResume || audio.paused) {
        audio.play().catch(function (error) {
          console.warn('[Music] 手势补播失败:', error);
        });
      }
    }

    events.forEach(function (name) {
      document.addEventListener(name, unlock, {passive: true});
    });
  }

  /* ==================== 事件绑定 ==================== */

  cover.addEventListener('click', togglePlay);

  if (prevBtn) prevBtn.addEventListener('click', playPrev);
  if (nextBtn) nextBtn.addEventListener('click', playNext);

  if (modeBtn) {
    modeBtn.addEventListener('click', function () {
      const next = (MODES.indexOf(mode) + 1) % MODES.length;
      mode = MODES[next];
      paintModeBtn();
      saveState();
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener('click', function () {
      if (audio.muted || volume === 0) {
        audio.muted = false;
        volume = lastVolume || DEFAULT_VOLUME;
        audio.volume = volume;
      } else {
        lastVolume = volume;
        audio.muted = true;
      }
      paintVolume();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
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
    playlistBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      togglePlaylistPanel();
      syncBodyState();
    });
  }

  document.addEventListener('click', function (event) {
    if (!playlistPanel || !playlistPanel.classList.contains('active')) return;
    if (playlistPanel.contains(event.target)) return;
    if (playlistBtn && playlistBtn.contains(event.target)) return;
    togglePlaylistPanel(false);
    syncBodyState();
  });

  if (collapse) {
    collapse.addEventListener('click', function (event) {
      event.stopPropagation();
      player.classList.toggle('expanded');
      syncBodyState();
      if (!player.classList.contains('expanded')) {
        togglePlaylistPanel(false);
        syncBodyState();
      }
    });
  }

  seek.addEventListener('input', function () {
    paintSlider(seek, parseFloat(seek.value));
    if (audio.duration) {
      currentEl.textContent = formatTime((seek.value / 100) * audio.duration);
    }
  });

  seek.addEventListener('change', function () {
    if (!audio.duration) return;
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  audio.addEventListener('play', function () {
    player.classList.add('playing');
    startViz();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  });

  audio.addEventListener('pause', function () {
    player.classList.remove('playing');
    stopViz();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  });

  audio.addEventListener('loadedmetadata', function () {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    seek.value = String(percent);
    paintSlider(seek, percent);
    currentEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', function () {
    if (mode === 'single') {
      audio.currentTime = 0;
      audio.play().catch(function () {
        // 单曲循环失败时忽略，等待用户操作。
      });
      return;
    }
    playNext();
  });

  audio.addEventListener('error', function () {
    titleEl.textContent = '音源加载失败';
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', function () {
        audio.play();
      });
      navigator.mediaSession.setActionHandler('pause', function () {
        audio.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', function (details) {
        if (details.seekTime != null) audio.currentTime = details.seekTime;
      });
    } catch (e) {
      // 未支持的 action 会被忽略。
    }
  }

  /* ==================== 初始化 ==================== */

  audio.preload = 'metadata';
  audio.loop = false;
  audio.volume = volume;
  paintVolume();
  paintModeBtn();
  renderPlaylist();
  loadTrack(currentIndex, false);

  if (window.innerWidth > DESKTOP_MIN_WIDTH) player.classList.add('expanded');
  syncBodyState();

  if (MUSIC_CFG.autoplay) {
    // 先静音自动播放以规避浏览器策略，再在首次手势时解除静音。
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

  // 供其它模块（命令面板等）判断播放列表是否处于打开状态。
  window.KD_MUSIC = {
    togglePlay: togglePlay,
    playNext: playNext,
    playPrev: playPrev,
    isPlaylistOpen: function () {
      return !!playlistPanel && playlistPanel.classList.contains('active');
    },
    closePlaylist: function () {
      togglePlaylistPanel(false);
      syncBodyState();
    },
  };
})();
