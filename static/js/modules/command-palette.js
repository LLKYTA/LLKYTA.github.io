/**
 * @fileoverview 命令面板（Ctrl + K）模块。
 */
(function () {
  'use strict';

  const palette = document.getElementById('cmd-palette');
  const backdrop = document.getElementById('cmd-backdrop');
  const input = document.getElementById('cmd-input');
  const list = document.getElementById('cmd-list');
  const hint = document.getElementById('cmd-hint');
  if (!palette || !input || !list) return;

  const MOUSE_MODES = ['attract', 'repel', 'off'];
  const MOUSE_LABELS = {attract: '吸引', repel: '排斥', off: '关闭'};
  const OPEN_FOCUS_DELAY = 60;
  const ACTION_DELAY = 80;

  /**
   * 取配置中的背景模式列表。
   * @return {!Array<string>} 模式列表。
   */
  function getBgModes() {
    const modes = CFG.background && CFG.background.modes;
    return Array.isArray(modes) && modes.length ? modes : ['glow', 'particles'];
  }

  /**
   * 平滑滚动到指定选择器命中的元素。
   * @param {string} selector CSS 选择器。
   * @return {void}
   */
  function scrollToElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  const COMMANDS = [
    {
      icon: '🌓',
      title: '切换深色 / 浅色主题',
      hint: 'Theme',
      keywords: 'theme dark light',
      action: function () {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.click();
      },
    },
    {
      icon: '🌗',
      title: '主题跟随系统',
      hint: 'Auto',
      keywords: 'theme auto system',
      action: function () {
        window.KD_STORAGE.write('KD_themeMode', 'auto');
        window.applyResolvedTheme();
        window.notify('主题已跟随系统');
      },
    },
    {
      icon: '🎨',
      title: '切换背景模式',
      hint: 'BG',
      keywords: 'background bg particles glow none',
      action: function () {
        const modes = getBgModes();
        const current = document.documentElement.dataset.bg || modes[0];
        const next = modes[(modes.indexOf(current) + 1) % modes.length];
        window.applyBgMode(next);
        window.notify('背景模式：' + next);
      },
    },
    {
      icon: '🎵',
      title: '播放 / 暂停音乐',
      hint: 'Music',
      keywords: 'music play pause',
      action: function () {
        const cover = document.getElementById('music-cover');
        if (cover) cover.click();
      },
    },
    {
      icon: '💬',
      title: '刷新一言',
      hint: 'Hitokoto',
      keywords: 'hitokoto quote refresh',
      action: function () {
        window.loadHi();
      },
    },
    {
      icon: '🌤️',
      title: '刷新天气',
      hint: 'Weather',
      keywords: 'weather refresh 天气',
      action: function () {
        if (typeof window.loadWeatherData === 'function') {
          window.loadWeatherData(true);
          window.notify('正在刷新天气…');
        }
      },
    },
    {
      icon: '🐙',
      title: '打开 GitHub 主页',
      hint: 'GitHub',
      keywords: 'github source code',
      action: function () {
        const url = (CFG.socials && CFG.socials.github.url) || '#';
        window.open(url, '_blank', 'noopener');
      },
    },
    {
      icon: '📧',
      title: '发送邮件',
      hint: 'Mail',
      keywords: 'mail email contact',
      action: function () {
        const email = (CFG.socials && CFG.socials.email) || '';
        if (email) location.href = 'mailto:' + email;
      },
    },
    {
      icon: '📋',
      title: '复制邮箱到剪贴板',
      hint: 'Copy',
      keywords: 'copy email clipboard',
      action: function () {
        window.KD_STORAGE.copyText((CFG.socials && CFG.socials.email) || '');
      },
    },
    {
      icon: '💌',
      title: '查看 QQ 二维码',
      hint: 'QQ',
      keywords: 'qq qrcode contact',
      action: function () {
        window.pop(
          (CFG.socials && CFG.socials.qq && CFG.socials.qq.image) || '',
        );
      },
    },
    {
      icon: '⚡',
      title: '跳转到技能图',
      hint: 'Skills',
      keywords: 'skills stack tech',
      action: function () {
        scrollToElement('.skill-visual');
      },
    },
    {
      icon: '🧲',
      title: '切换鼠标引力模式',
      hint: 'Mouse',
      keywords: 'mouse attract repel gravity 鼠标 引力 排斥',
      action: function () {
        const current = window.KD_STORAGE.read('KD_mouseMode', MOUSE_MODES[0]);
        const next =
          MOUSE_MODES[(MOUSE_MODES.indexOf(current) + 1) % MOUSE_MODES.length];
        if (typeof window.setMouseMode === 'function') {
          window.setMouseMode(next);
        } else {
          window.KD_STORAGE.write('KD_mouseMode', next);
        }
        window.notify('鼠标引力：' + (MOUSE_LABELS[next] || next));
      },
    },
    {
      icon: '📊',
      title: '跳转到贡献热力图',
      hint: 'Contrib',
      keywords: 'github contrib heatmap',
      action: function () {
        scrollToElement('.github-contrib-card');
      },
    },
    {
      icon: '⬆️',
      title: '回到顶部',
      hint: 'Scroll',
      keywords: 'top scroll up',
      action: function () {
        window.scrollTo({top: 0, behavior: 'smooth'});
      },
    },
  ];

  let filtered = COMMANDS.slice();
  let activeIndex = 0;

  /**
   * 按关键字过滤命令并重绘列表。
   * @param {string} keyword 搜索关键字。
   * @return {void}
   */
  function filterCommands(keyword) {
    const query = (keyword || '').trim().toLowerCase();
    filtered = !query
      ? COMMANDS.slice()
      : COMMANDS.filter(function (command) {
          return (
            command.title.toLowerCase().indexOf(query) !== -1 ||
            (command.hint || '').toLowerCase().indexOf(query) !== -1 ||
            (command.keywords || '').toLowerCase().indexOf(query) !== -1
          );
        });
    activeIndex = 0;
    renderList();
  }

  /**
   * 重绘命令列表。
   * @return {void}
   */
  function renderList() {
    list.textContent = '';
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'cmd-empty';
      empty.textContent = '没有匹配的命令';
      list.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(function (command, index) {
      const item = document.createElement('div');
      item.className = 'cmd-item' + (index === activeIndex ? ' active' : '');
      item.dataset.index = String(index);
      item.innerHTML =
        '<div class="cmd-item-icon"></div>' +
        '<div class="cmd-item-title"></div>' +
        '<div class="cmd-item-hint"></div>';
      item.querySelector('.cmd-item-icon').textContent = command.icon;
      item.querySelector('.cmd-item-title').textContent = command.title;
      item.querySelector('.cmd-item-hint').textContent = command.hint || '';
      item.addEventListener('click', function () {
        runCommand(index);
      });
      item.addEventListener('mouseenter', function () {
        activeIndex = index;
        updateActive();
      });
      frag.appendChild(item);
    });
    list.appendChild(frag);
  }

  /**
   * 同步列表项的选中态。
   * @return {void}
   */
  function updateActive() {
    const items = list.querySelectorAll('.cmd-item');
    items.forEach(function (el, index) {
      el.classList.toggle('active', index === activeIndex);
    });
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({block: 'nearest'});
    }
  }

  /**
   * 执行第 index 条命令。
   * @param {number} index 过滤后列表中的下标。
   * @return {void}
   */
  function runCommand(index) {
    const command = filtered[index];
    if (!command) return;
    closePalette();
    setTimeout(function () {
      try {
        command.action();
      } catch (e) {
        console.error('命令执行失败:', e);
      }
    }, ACTION_DELAY);
  }

  /**
   * 打开命令面板。
   * @return {void}
   */
  function openPalette() {
    palette.classList.add('active');
    palette.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterCommands('');
    setTimeout(function () {
      input.focus();
    }, OPEN_FOCUS_DELAY);
  }

  /**
   * 关闭命令面板。
   * @return {void}
   */
  function closePalette() {
    palette.classList.remove('active');
    palette.setAttribute('aria-hidden', 'true');
  }

  /**
   * 面板是否处于打开状态。
   * @return {boolean} 打开中返回 true。
   */
  function isOpen() {
    return palette.classList.contains('active');
  }

  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (isOpen()) closePalette();
      else openPalette();
      return;
    }
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!filtered.length) return;
      activeIndex = (activeIndex + 1) % filtered.length;
      updateActive();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!filtered.length) return;
      activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
      updateActive();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(activeIndex);
    }
  });

  input.addEventListener('input', function () {
    filterCommands(input.value);
  });

  if (backdrop) backdrop.addEventListener('click', closePalette);
  if (hint) {
    hint.addEventListener('click', openPalette);
    hint.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPalette();
      }
    });
  }

  renderList();
})();
