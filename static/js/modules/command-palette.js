/**
 * @fileoverview 命令面板（Ctrl + K）模块。
 */
(function() {
  'use strict';

  const palette = document.getElementById('cmdPalette');
  const backdrop = document.getElementById('cmdBackdrop');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  const hint = document.getElementById('cmdHint');
  if (!palette || !input || !list) return;

  const COMMANDS = [
    {
      icon: '🌓',
      title: '切换深色 / 浅色主题',
      hint: 'Theme',
      keywords: 'theme dark light',
      action: function() {
        const sw = document.getElementById('myonoffswitch');
        if (sw) sw.click();
      },
    },
    {
      icon: '🌗',
      title: '主题跟随系统',
      hint: 'Auto',
      keywords: 'theme auto system',
      action: function() {
        localStorage.setItem('KD_themeMode', 'auto');
        window.applyResolvedTheme();
      },
    },
    {
      icon: '🎨',
      title: '切换背景模式',
      hint: 'BG',
      keywords: 'background bg particles glow none',
      action: function() {
        const modes = (CFG.background && CFG.background.modes) || ['glow', 'particles', 'none'];
        const cur = document.documentElement.dataset.bg || 'glow';
        const next = modes[(modes.indexOf(cur) + 1) % modes.length];
        window.applyBgMode(next);
      },
    },
    {
      icon: '🎵',
      title: '播放 / 暂停音乐',
      hint: 'Music',
      keywords: 'music play pause',
      action: function() {
        const c = document.getElementById('musicCover');
        if (c) c.click();
      },
    },
    {
      icon: '💬',
      title: '刷新一言',
      hint: 'Hitokoto',
      keywords: 'hitokoto quote refresh',
      action: function() {
        window.loadHi();
      },
    },
    {
      icon: '🌤️',
      title: '刷新天气',
      hint: 'Weather',
      keywords: 'weather refresh 天气',
      action: function() {
        if (typeof window.WEATHER_CACHE_KEY === 'string') {
          sessionStorage.removeItem(window.WEATHER_CACHE_KEY);
        }
        if (typeof window.loadWeatherData === 'function') window.loadWeatherData(true);
      },
    },
    {
      icon: '🐙',
      title: '打开 GitHub 主页',
      hint: 'GitHub',
      keywords: 'github source code',
      action: function() {
        window.open((CFG.socials && CFG.socials.github.url) || '#', '_blank', 'noopener');
      },
    },
    {
      icon: '📧',
      title: '发送邮件',
      hint: 'Mail',
      keywords: 'mail email contact',
      action: function() {
        location.href = 'mailto:' + ((CFG.socials && CFG.socials.email) || '');
      },
    },
    {
      icon: '📋',
      title: '复制邮箱到剪贴板',
      hint: 'Copy',
      keywords: 'copy email clipboard',
      action: function() {
        const t = (CFG.socials && CFG.socials.email) || '';
        if (navigator.clipboard && t) navigator.clipboard.writeText(t);
      },
    },
    {
      icon: '💌',
      title: '查看 QQ 二维码',
      hint: 'QQ',
      keywords: 'qq qrcode contact',
      action: function() {
        window.pop((CFG.socials && CFG.socials.qq && CFG.socials.qq.image) || '');
      },
    },
    {
      icon: '⚡',
      title: '跳转到技能图',
      hint: 'Skills',
      keywords: 'skills stack tech',
      action: function() {
        const el = document.querySelector('.skill-visual');
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
      },
    },
    {
  icon: '🧲',
  title: '切换鼠标引力模式',
  hint: 'Mouse',
  keywords: 'mouse attract repel gravity 鼠标 引力 排斥',
  action: function () {
    const order = ['attract', 'repel', 'off'];
    const labels = { attract: '🧲 吸引', repel: '💥 排斥', off: '🚫 关闭' };
    const cur = localStorage.getItem('KD_mouseMode') || 'attract';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    if (typeof window.setMouseMode === 'function') {
      window.setMouseMode(next);
    } else {
      localStorage.setItem('KD_mouseMode', next);
    }
    // 底部提示
    const tip = document.createElement('div');
    tip.textContent = '鼠标引力：' + (labels[next] || next);
    tip.style.cssText =
      'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);' +
      'padding:8px 16px;border-radius:8px;background:rgba(0,0,0,0.75);' +
      'color:#fff;font-size:13px;z-index:99999;pointer-events:none;' +
      'transition:opacity 0.3s ease;';
    document.body.appendChild(tip);
    setTimeout(function () {
      tip.style.opacity = '0';
      setTimeout(function () {
        if (tip.parentNode) tip.parentNode.removeChild(tip);
      }, 300);
    }, 1000);
  },
},
    {
      icon: '📊',
      title: '跳转到贡献热力图',
      hint: 'Contrib',
      keywords: 'github contrib heatmap',
      action: function() {
        const el = document.querySelector('.github-contrib-card');
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
      },
    },
    {
      icon: '⬆️',
      title: '回到顶部',
      hint: 'Scroll',
      keywords: 'top scroll up',
      action: function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
      },
    },
  ];

  let filtered = COMMANDS.slice();
  let activeIndex = 0;

  function filterCommands(kw) {
    const q = (kw || '').trim().toLowerCase();
    filtered = !q ?
      COMMANDS.slice() :
      COMMANDS.filter(function(c) {
        return (
          c.title.toLowerCase().indexOf(q) !== -1 ||
            (c.hint || '').toLowerCase().indexOf(q) !== -1 ||
            (c.keywords || '').toLowerCase().indexOf(q) !== -1
        );
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
    filtered.forEach(function(cmd, idx) {
      const item = document.createElement('div');
      item.className = 'cmd-item' + (idx === activeIndex ? ' active' : '');
      item.dataset.index = idx;
      item.innerHTML =
        '<div class="cmd-item-icon">' +
        cmd.icon +
        '</div>' +
        '<div class="cmd-item-title">' +
        cmd.title +
        '</div>' +
        '<div class="cmd-item-hint">' +
        (cmd.hint || '') +
        '</div>';
      item.addEventListener('click', function() {
        runCommand(idx);
      });
      item.addEventListener('mouseenter', function() {
        activeIndex = idx;
        updateActive();
      });
      list.appendChild(item);
    });
  }
  function updateActive() {
    const items = list.querySelectorAll('.cmd-item');
    items.forEach(function(el, i) {
      el.classList.toggle('active', i === activeIndex);
    });
    if (items[activeIndex]) items[activeIndex].scrollIntoView({block: 'nearest'});
  }
  function runCommand(idx) {
    const cmd = filtered[idx];
    if (!cmd) return;
    closePalette();
    setTimeout(function() {
      try {
        cmd.action();
      } catch (e) {
        console.error('命令执行失败:', e);
      }
    }, 80);
  }
  function openPalette() {
    palette.classList.add('active');
    palette.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterCommands('');
    setTimeout(function() {
      input.focus();
    }, 60);
  }
  function closePalette() {
    palette.classList.remove('active');
    palette.setAttribute('aria-hidden', 'true');
  }
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('active') ? closePalette() : openPalette();
      return;
    }
    if (!palette.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    } else if (e.key === 'ArrowDown') {
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
  input.addEventListener('input', function() {
    filterCommands(input.value);
  });
  if (backdrop) backdrop.addEventListener('click', closePalette);
  if (hint) {
    hint.addEventListener('click', openPalette);
    hint.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPalette();
      }
    });
  }
  renderList();
})();
