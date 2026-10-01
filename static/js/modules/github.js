/**
 * @fileoverview GitHub 数据展示模块：资料卡、贡献热力图与置顶仓库。
 */
(function () {
  'use strict';

  const CACHE_KEY = 'github_data_cache';
  const CACHE_TTL = 30 * 60 * 1000;
  const REQUEST_TIMEOUT = 10000;
  const GITHUB_HOME = 'https://github.com/';
  const LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
    Go: '#00add8',
    Rust: '#dea584',
    C: '#555',
    'C++': '#f34b7d',
    Shell: '#89e051',
    Vue: '#41b883',
    PHP: '#4f5d95',
    Ruby: '#701516',
    Kotlin: '#a97bff',
    Swift: '#f05138',
    default: '#8b8b8b',
  };

  /**
   * 按贡献次数映射热力等级（0~4）。
   * @param {number} count 当日贡献次数。
   * @return {number} 等级。
   */
  function contributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  /**
   * 写入文本到指定 id 的元素（元素不存在时静默跳过）。
   * @param {string} id 元素 id。
   * @param {string} text 文本内容。
   * @return {void}
   */
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /**
   * 渲染 GitHub 用户资料卡。
   * @param {!Object} data 用户数据。
   * @return {void}
   */
  function renderProfile(data) {
    const avatar = document.getElementById('gh-avatar');
    const link = document.getElementById('gh-link');
    if (avatar) avatar.src = data.avatar_url || '';
    if (link) link.href = data.html_url || GITHUB_HOME;

    setText('gh-name', data.name || data.login || '');
    setText('gh-bio', data.bio || '这个人很懒，什么都没写~');
    setText('gh-repos', String(data.public_repos || 0));
    setText('gh-followers', String(data.followers || 0));
    setText('gh-following', String(data.following || 0));

    const orgsEl = document.getElementById('gh-orgs');
    if (!orgsEl) return;
    orgsEl.textContent = '';
    const organizations = data.organizations || [];
    if (!organizations.length) return;

    const frag = document.createDocumentFragment();
    organizations.forEach(function (org) {
      const tag = document.createElement('span');
      tag.className = 'github-org-tag';
      tag.textContent = org.login;
      frag.appendChild(tag);
    });
    orgsEl.appendChild(frag);
  }

  /**
   * 渲染贡献热力图。
   * @param {!Object=} opt_activity 活动数据。
   * @return {void}
   */
  function renderContributionGraph(opt_activity) {
    const graphEl = document.getElementById('gh-contrib-graph');
    const totalEl = document.getElementById('gh-total-contrib');
    if (!graphEl) return;

    const calendar = opt_activity && opt_activity.contribution_calendar;
    if (!calendar) {
      graphEl.innerHTML = '<span class="github-empty">暂无贡献数据</span>';
      if (totalEl) totalEl.textContent = '';
      return;
    }

    const weeks = calendar.weeks || [];
    const total =
      opt_activity.total_contributions || calendar.total_contributions || 0;
    if (totalEl) totalEl.textContent = '共 ' + total + ' 次贡献';

    const frag = document.createDocumentFragment();
    weeks.forEach(function (week) {
      const weekEl = document.createElement('div');
      weekEl.className = 'github-contrib-week';

      const byWeekday = {};
      (week.contribution_days || []).forEach(function (day) {
        byWeekday[day.weekday] = day;
      });

      for (let weekday = 0; weekday < 7; weekday++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'github-contrib-day';
        const day = byWeekday[weekday];
        if (day) {
          const count = day.contribution_count || 0;
          dayEl.classList.add('level-' + contributionLevel(count));
          dayEl.title = day.date + ': ' + count + ' 次贡献';
        } else {
          dayEl.classList.add('level-0', 'is-empty');
        }
        weekEl.appendChild(dayEl);
      }
      frag.appendChild(weekEl);
    });

    graphEl.textContent = '';
    graphEl.appendChild(frag);
  }

  /**
   * 渲染仓库卡片列表。
   * @param {!Array<!Object>=} opt_repos 仓库列表。
   * @return {void}
   */
  function renderRepositories(opt_repos) {
    const grid = document.getElementById('gh-repos-grid');
    if (!grid) return;

    const repos = opt_repos || [];
    grid.textContent = '';
    if (!repos.length) {
      grid.innerHTML = '<span class="github-empty">暂无仓库数据</span>';
      return;
    }

    const frag = document.createDocumentFragment();
    repos.forEach(function (repo) {
      const card = document.createElement('a');
      card.className = 'github-repo-card';
      card.href = repo.html_url || GITHUB_HOME;
      card.target = '_blank';
      card.rel = 'noopener';

      const name = document.createElement('div');
      name.className = 'github-repo-name';
      name.textContent = repo.name || '';

      const desc = document.createElement('div');
      desc.className = 'github-repo-desc';
      desc.textContent = repo.description || '暂无描述';

      const meta = document.createElement('div');
      meta.className = 'github-repo-meta';

      if (repo.language) {
        const lang = document.createElement('span');
        lang.className = 'github-repo-lang';
        const dot = document.createElement('span');
        dot.className = 'github-repo-lang-dot';
        dot.style.background =
          LANG_COLORS[repo.language] || LANG_COLORS.default;
        lang.appendChild(dot);
        lang.appendChild(document.createTextNode(repo.language));
        meta.appendChild(lang);
      }

      const stars = document.createElement('span');
      stars.className = 'github-repo-stars';
      stars.textContent =
        '⭐ ' +
        window.formatNumber(repo.stargazers_count || repo.stargazers || 0);
      meta.appendChild(stars);

      const forks = document.createElement('span');
      forks.textContent =
        '🍴 ' + window.formatNumber(repo.forks_count || repo.forks || 0);
      meta.appendChild(forks);

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  /**
   * 用一份数据渲染整个 GitHub 区块。
   * @param {!Object} data 接口数据。
   * @return {void}
   */
  function renderAll(data) {
    renderProfile(data);
    renderContributionGraph(data.activity);
    renderRepositories(data.pinned_repositories || data.repositories);
  }

  /**
   * 加载并渲染 GitHub 数据。
   * @param {boolean=} opt_force 为 true 时忽略缓存重新请求。
   * @return {void}
   */
  window.loadGitHubData = function (opt_force) {
    const loadingEl = document.getElementById('github-loading');
    const errorEl = document.getElementById('github-error');
    const contentEl = document.getElementById('github-content');
    if (!loadingEl || !errorEl || !contentEl) return;

    /**
     * 显示错误态，并把失败原因写进提示行，便于区分接口问题与网络问题。
     * @param {string} reason 原因文案（可为空）。
     * @return {void}
     */
    function showError(reason) {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'none';
      errorEl.style.display = 'block';
      const tip = errorEl.querySelector('.github-error-msg');
      if (tip && reason) tip.textContent = reason;
    }

    if (!opt_force) {
      const cached = window.KD_STORAGE.readSessionJson(CACHE_KEY, CACHE_TTL);
      if (cached) {
        renderAll(cached);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';
        return;
      }
    }

    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';

    const api = (CFG.github && CFG.github.api) || '';
    if (!api) {
      showError('未配置 GitHub 接口地址');
      return;
    }

    // 请求可能被扩展或网络设备静默挂起（既不 resolve 也不 reject），
    // 不加超时会让加载动画一直转下去。
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, REQUEST_TIMEOUT);

    fetch(api, {signal: controller.signal})
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        window.KD_STORAGE.writeSessionJson(CACHE_KEY, data);
        renderAll(data);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
      })
      .catch(function (error) {
        clearTimeout(timer);
        console.error('GitHub API Error:', error);
        if (error && error.name === 'AbortError') {
          showError(
            '请求超时（' + REQUEST_TIMEOUT / 1000 + 's），可点击重新加载',
          );
          return;
        }
        if (error && error.name === 'TypeError') {
          showError('网络无法访问接口，请检查网络或代理设置');
          return;
        }
        showError(error && error.message ? error.message : '');
      });
  };
})();
