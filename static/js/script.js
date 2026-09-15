/* static/js/script.js */
/**
 * @fileoverview KD_klin 个人主页交互脚本。
 * @author KD_klin
 */

console.log(
  '%cCopyright © 2024 KD_klin',
  'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);
console.log('%c   /\\_/\\', 'color: #20128b; font-size: 20px;');
console.log('%c  ( o.o )', 'color: #20128b; font-size: 20px;');
console.log(' %c  > ^ <', 'color: #20128b; font-size: 20px;');
console.log('  %c /  ~ \\', 'color: #20128b; font-size: 20px;');
console.log('  %c/______\\', 'color: #20128b; font-size: 20px;');

/**
 * 切换元素的 class。
 * @param {string} selector CSS 选择器。
 * @param {string} className 要切换的 class 名。
 * @return {void}
 */
function toggleClass(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(function (element) {
    element.classList.toggle(className);
  });
}

/**
 * 弹出图片弹窗。
 * @param {string=} imageURL 图片地址。
 * @return {void}
 */
function pop(imageURL) {
  const tcMainElement = document.querySelector('.tc-img');
  if (imageURL) {
    tcMainElement.src = imageURL;
  }
  toggleClass('.tc-main', 'active');
  toggleClass('.tc', 'active');
}

const tc = document.getElementsByClassName('tc');
const tcMain = document.getElementsByClassName('tc-main');
tc[0].addEventListener('click', function () {
  pop();
});
tcMain[0].addEventListener('click', function (event) {
  event.stopPropagation();
});

/**
 * 设置 Cookie。
 * @param {string} name Cookie 名。
 * @param {string} value Cookie 值。
 * @param {number} days 过期天数。
 * @return {void}
 */
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

/**
 * 读取 Cookie。
 * @param {string} name Cookie 名。
 * @return {?string} Cookie 值。
 */
function getCookie(name) {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

/**
 * 从一言 API 获取随机句子并更新页面。
 * @return {void}
 */
function loadHi() {
  fetch('https://v1.hitokoto.cn/?c=j&c=i')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const hitokoto = document.querySelector('#hitokoto_text');
      const hitokotoFrom = document.querySelector('#hitokoto_from');
      if (!data.from_who || data.from_who === 'null') {
        hitokoto.from = '---' + data.from;
      } else {
        hitokoto.from = '---' + data.from + ' ' + data.from_who;
      }
      hitokoto.innerText = data.hitokoto;
      hitokotoFrom.innerText = hitokoto.from;
      console.log(data);
    })
    .catch(function (err) {
      console.error('一言加载失败:', err);
      document.querySelector('#hitokoto_text').innerText =
        '一言加载失败，点击重试';
      document.querySelector('#hitokoto_from').innerText = '-- 网络异常';
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const html = document.querySelector('html');
  let themeState = getCookie('themeState') || 'Light';
  const tanChiShe = document.getElementById('tanChiShe');

  /**
   * 切换主题。
   * @param {string} theme 主题名。
   * @return {void}
   */
  function changeTheme(theme) {
    tanChiShe.src = './static/svg/snake-' + theme + '.svg';
    html.dataset.theme = theme;
    setCookie('themeState', theme, 365);
    themeState = theme;
  }

  const checkbox = document.getElementById('myonoffswitch');
  checkbox.addEventListener('change', function () {
    if (themeState === 'Dark') {
      changeTheme('Light');
    } else if (themeState === 'Light') {
      changeTheme('Dark');
    } else {
      changeTheme('Dark');
    }
  });

  if (themeState === 'Dark') {
    checkbox.checked = false;
  }
  changeTheme(themeState);

  const qqIcon = document.getElementById('qqIcon');
  if (qqIcon) {
    qqIcon.addEventListener('click', function () {
      pop('./static/img/qq.jpg');
    });
  }

  const hitokotoBox = document.getElementById('hitokotoBox');
  if (hitokotoBox) {
    hitokotoBox.addEventListener('click', loadHi);
  }

  const githubRetryBtn = document.getElementById('githubRetryBtn');
  if (githubRetryBtn) {
    githubRetryBtn.addEventListener('click', loadGitHubData);
  }

  loadHi();
  loadGitHubData();
});

const pageLoading = document.querySelector('#KD-loading');
window.addEventListener('load', function () {
  setTimeout(function () {
    pageLoading.style.opacity = '0';
    setTimeout(function () {
      pageLoading.style.display = 'none';
    }, 500);
  }, 100);
});

// ==================== GitHub 数据接入 ====================
const GITHUB_API =
  'https://uapis.cn/api/v1/github/user?user=LLKYTA&activity=true&activity_scope=all&pinned=true&repos=true&repos_limit=6';
const GITHUB_CACHE_KEY = 'github_data_cache';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  Shell: '#89e051',
  Vue: '#41b883',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  default: '#8b8b8b',
};

/**
 * 加载 GitHub 数据。
 * @return {void}
 */
function loadGitHubData() {
  const loadingEl = document.getElementById('github-loading');
  const errorEl = document.getElementById('github-error');
  const contentEl = document.getElementById('github-content');

  const cachedData = sessionStorage.getItem(GITHUB_CACHE_KEY);
  if (cachedData) {
    try {
      const data = JSON.parse(cachedData);
      renderGitHubProfile(data);
      renderContributionGraph(data.activity);
      renderRepositories(data.pinned_repositories || data.repositories || []);
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      return;
    } catch (e) {
      sessionStorage.removeItem(GITHUB_CACHE_KEY);
    }
  }

  loadingEl.style.display = 'flex';
  errorEl.style.display = 'none';
  contentEl.style.display = 'none';

  fetch(GITHUB_API)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return res.json();
    })
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

/**
 * 渲染 GitHub 用户信息。
 * @param {!Object} data GitHub 用户数据。
 * @return {void}
 */
function renderGitHubProfile(data) {
  document.getElementById('gh-avatar').src = data.avatar_url || '';
  const linkEl = document.getElementById('gh-link');
  linkEl.href = data.html_url || '#';
  document.getElementById('gh-name').textContent =
    data.name || data.login || '';
  const bioEl = document.getElementById('gh-bio');
  bioEl.textContent = data.bio || '这个人很懒，什么都没写~';
  document.getElementById('gh-repos').textContent = data.public_repos || 0;
  document.getElementById('gh-followers').textContent = data.followers || 0;
  document.getElementById('gh-following').textContent = data.following || 0;

  const orgsEl = document.getElementById('gh-orgs');
  orgsEl.innerHTML = '';
  if (data.organizations && data.organizations.length > 0) {
    data.organizations.forEach(function (org) {
      const tag = document.createElement('span');
      tag.className = 'github-org-tag';
      tag.textContent = org.login;
      orgsEl.appendChild(tag);
    });
  }
}

/**
 * 渲染贡献热力图。
 * @param {!Object} activity GitHub 活动数据。
 * @return {void}
 */
function renderContributionGraph(activity) {
  const graphEl = document.getElementById('gh-contrib-graph');
  const totalEl = document.getElementById('gh-total-contrib');

  if (!activity || !activity.contribution_calendar) {
    graphEl.innerHTML =
      '<span style="font-size:13px;opacity:0.6;">暂无贡献数据</span>';
    return;
  }

  const weeks = activity.contribution_calendar.weeks || [];
  const total =
    activity.total_contributions ||
    activity.contribution_calendar.total_contributions ||
    0;

  totalEl.textContent = '共 ' + total + ' 次贡献';
  graphEl.innerHTML = '';
  const fragment = document.createDocumentFragment();

  /**
   * 获取贡献等级。
   * @param {number} count 贡献次数。
   * @return {number} 等级 0-4。
   */
  function getLevel(count) {
    if (count === 0) {
      return 0;
    }
    if (count <= 2) {
      return 1;
    }
    if (count <= 5) {
      return 2;
    }
    if (count <= 9) {
      return 3;
    }
    return 4;
  }

  weeks.forEach(function (week) {
    const weekEl = document.createElement('div');
    weekEl.className = 'github-contrib-week';

    const days = week.contribution_days || [];
    const dayMap = {};
    days.forEach(function (d) {
      dayMap[d.weekday] = d;
    });

    for (let i = 0; i < 7; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'github-contrib-day';

      if (dayMap[i]) {
        const count = dayMap[i].contribution_count || 0;
        const level = getLevel(count);
        dayEl.classList.add('level-' + level);
        dayEl.title = dayMap[i].date + ': ' + count + ' 次贡献';
      } else {
        dayEl.classList.add('level-0');
        dayEl.style.opacity = '0.3';
      }

      weekEl.appendChild(dayEl);
    }

    fragment.appendChild(weekEl);
  });

  graphEl.appendChild(fragment);
}

/**
 * 渲染仓库卡片。
 * @param {!Array<!Object>} repos 仓库列表。
 * @return {void}
 */
function renderRepositories(repos) {
  const gridEl = document.getElementById('gh-repos-grid');
  gridEl.innerHTML = '';

  if (!repos || repos.length === 0) {
    gridEl.innerHTML =
      '<span style="font-size:13px;opacity:0.6;">暂无仓库数据</span>';
    return;
  }

  repos.forEach(function (repo) {
    const card = document.createElement('a');
    card.className = 'github-repo-card';
    card.href = repo.html_url || '#';
    card.target = '_blank';

    const langColor = LANG_COLORS[repo.language] || LANG_COLORS['default'];
    const repoName = escapeHtml(repo.name);
    const repoDesc = escapeHtml(repo.description || '暂无描述');
    const langHtml = repo.language
      ? '<span class="github-repo-lang">' +
        '<span class="github-repo-lang-dot" style="background:' +
        langColor +
        '"></span>' +
        escapeHtml(repo.language) +
        '</span>'
      : '';

    card.innerHTML =
      '<div class="github-repo-name">' +
      repoName +
      '</div>' +
      '<div class="github-repo-desc">' +
      repoDesc +
      '</div>' +
      '<div class="github-repo-meta">' +
      langHtml +
      '<span class="github-repo-stars">⭐ ' +
      formatNumber(repo.stargazers || 0) +
      '</span>' +
      '<span>🍴 ' +
      formatNumber(repo.forks || 0) +
      '</span>' +
      '</div>';

    gridEl.appendChild(card);
  });
}

/**
 * 转义 HTML 特殊字符。
 * @param {string} str 原始字符串。
 * @return {string} 转义后的字符串。
 */
function escapeHtml(str) {
  if (!str) {
    return '';
  }
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m];
  });
}

/**
 * 格式化数字。
 * @param {number} n 数字。
 * @return {string} 格式化后的字符串。
 */
function formatNumber(n) {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'k';
  }
  return n.toString();
}

/* ==================== 音乐播放器 ==================== */
(function () {
  const player = document.getElementById('musicPlayer');
  if (!player) {
    return;
  }

  const audio = document.getElementById('musicAudio');
  const cover = document.getElementById('musicCover');
  const collapse = document.getElementById('musicCollapse');
  const seek = document.getElementById('musicSeek');
  const curEl = document.getElementById('musicCurrent');
  const durEl = document.getElementById('musicDuration');
  const titleEl = document.getElementById('musicTitle');

  const ACCENT = 'var(--purple_text_color)';
  const TRACK = 'var(--item_hover_color)';

  let unlocked = false;

  /**
   * 格式化时间。
   * @param {number} sec 秒数。
   * @return {string} 格式化后的时间。
   */
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) {
      return '0:00';
    }
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /**
   * 绘制进度条。
   * @param {number} pct 百分比。
   * @return {void}
   */
  function paintSeek(pct) {
    seek.style.background =
      'linear-gradient(to right, ' +
      ACCENT +
      ' ' +
      pct +
      '%, ' +
      TRACK +
      ' ' +
      pct +
      '%)';
  }

  /**
   * 静音自动播放。
   * @return {void}
   */
  function autoPlayMuted() {
    audio.muted = true;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        player.classList.add('playing');
        armUnlockGesture();
      }).catch(function () {
        armUnlockGesture(true);
      });
    }
  }

  /**
   * 绑定手势解锁声音。
   * @param {boolean=} needResume 是否需要恢复播放。
   * @return {void}
   */
  function armUnlockGesture(needResume) {
    const events = ['pointerdown', 'touchstart', 'keydown'];

    const unlock = function () {
      if (unlocked) {
        return;
      }
      unlocked = true;

      events.forEach(function (e) {
        document.removeEventListener(e, unlock);
      });

      audio.muted = false;

      if (needResume || audio.paused) {
        audio.play().catch(function (err) {
          console.warn('[Music] 手势补播失败:', err);
        });
      }

      flashTitle('🔊 已开启声音');
    };

    events.forEach(function (e) {
      document.addEventListener(e, unlock, { passive: true });
    });
  }

  let titleTimer = null;

  /**
   * 临时替换标题做提示。
   * @param {string} text 提示文本。
   * @return {void}
   */
  function flashTitle(text) {
    const original = titleEl.dataset.original || titleEl.textContent;
    titleEl.dataset.original = original;
    titleEl.textContent = text;
    clearTimeout(titleTimer);
    titleTimer = setTimeout(function () {
      titleEl.textContent = titleEl.dataset.original;
    }, 2000);
  }

  cover.addEventListener('click', function () {
    if (!unlocked) {
      unlocked = true;
      audio.muted = false;
    }

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
  });

  audio.addEventListener('pause', function () {
    player.classList.remove('playing');
  });

  collapse.addEventListener('click', function (e) {
    e.stopPropagation();
    player.classList.toggle('expanded');
  });

  audio.addEventListener('loadedmetadata', function () {
    durEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) {
      return;
    }
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    paintSeek(pct);
    curEl.textContent = formatTime(audio.currentTime);
  });

  seek.addEventListener('input', function () {
    paintSeek(seek.value);
    if (audio.duration) {
      curEl.textContent = formatTime((seek.value / 100) * audio.duration);
    }
  });

  seek.addEventListener('change', function () {
    if (!audio.duration) {
      return;
    }
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  audio.addEventListener('error', function () {
    titleEl.textContent = '音源加载失败';
    console.warn('[Music] 音频加载失败。网易云外链对部分歌曲会返回 404。');
  });

  paintSeek(0);

  if (window.innerWidth > 600) {
    player.classList.add('expanded');
  } else {
    player.classList.remove('expanded');
  }

  autoPlayMuted();
})();

/* ==================== 标题个性化 ==================== */
(function () {
  const BASE_TITLE = 'KD_klin · 个人主页';
  const AWAY_TITLE = '👀 别走嘛，回来看看～';
  const BLUR_TITLE = '💤 暂时离开了...';

  let typeTimer = null;
  let typeIndex = 0;
  let isVisible = !document.hidden;
  let hasFocus = document.hasFocus();

  /**
   * 打字机效果。
   * @param {string} text 文本。
   * @param {number} speed 速度。
   * @param {function()=} callback 回调。
   * @return {void}
   */
  function typeTitle(text, speed, callback) {
    clearInterval(typeTimer);
    typeIndex = 0;
    document.title = '';

    typeTimer = setInterval(function () {
      if (typeIndex >= text.length) {
        clearInterval(typeTimer);
        if (typeof callback === 'function') {
          callback();
        }
        return;
      }
      document.title += text.charAt(typeIndex);
      typeIndex++;
    }, speed || 100);
  }

  /**
   * 恢复标题。
   * @return {void}
   */
  function restoreTitle() {
    if (document.title === BASE_TITLE) {
      return;
    }
    typeTitle(BASE_TITLE, 100);
  }

  document.addEventListener('visibilitychange', function () {
    isVisible = !document.hidden;
    if (isVisible && hasFocus) {
      restoreTitle();
    } else if (!isVisible) {
      clearInterval(typeTimer);
      document.title = AWAY_TITLE;
    }
  });

  window.addEventListener('blur', function () {
    hasFocus = false;
    if (isVisible) {
      clearInterval(typeTimer);
      document.title = BLUR_TITLE;
    }
  });

  window.addEventListener('focus', function () {
    hasFocus = true;
    if (isVisible) {
      restoreTitle();
    }
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      typeTitle(BASE_TITLE, 100);
    }, 300);
  });
})();