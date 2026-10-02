/**
 * @fileoverview GitHub 用户信息展示模块。
 * @description 数据来自 UAPI：`GET /api/v1/github/user`
 *     （https://uapis.cn/docs/api-reference/get-github-user）。
 *     请求与错误处理统一交给 core/uapi.js，本模块只负责参数组装与渲染。
 */
(function () {
  'use strict';

  const CACHE_KEY = 'github_data_cache';
  const DEFAULT_CACHE_TTL = 30 * 60 * 1000;
  const GITHUB_HOME = 'https://github.com/';
  const USER_NOT_FOUND = 'USER_NOT_FOUND';
  /** 文档中 repos_limit 的取值范围。 */
  const REPOS_LIMIT_MIN = 1;
  const REPOS_LIMIT_MAX = 100;
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
   * 读取字符串字段并兜底为空串。
   * @param {!Object} data 数据对象。
   * @param {string} key 字段名。
   * @return {string} 字段值。
   */
  function str(data, key) {
    const value = data && data[key];
    return value === undefined || value === null ? '' : String(value);
  }

  /**
   * 读取数字字段并兜底为 0。
   * @param {!Object} data 数据对象。
   * @param {!Array<string>} keys 候选字段名（文档字段优先）。
   * @return {number} 字段值。
   */
  function num(data, keys) {
    for (let i = 0; i < keys.length; i++) {
      const value = data && data[keys[i]];
      if (typeof value === 'number' && isFinite(value)) return value;
    }
    return 0;
  }

  /**
   * 把配置转换为接口查询参数。
   * @description 文档约束：传了 `org` 时不能再传 `activity_scope=all`；
   *     `repos_limit` 仅 1~100 有效，且单独传入也会开启 repos。
   * @param {!Object} config github 配置。
   * @return {{params: ?Object, error: ?string}} 参数或校验错误。
   */
  function buildQueryParams(config) {
    const userError = window.KD_UAPI.validateGithubUser(config.user);
    if (userError) return {params: null, error: userError};

    const params = {user: config.user};
    if (config.activity) params.activity = 'true';

    const org = config.org ? String(config.org) : '';
    if (org) {
      // 传了 org 就必须是 organization 范围，否则接口返回 400 INVALID_PARAMETER。
      params.org = org;
      params.activity_scope = 'organization';
    } else if (config.activity && config.activityScope) {
      const scope = String(config.activityScope);
      if (scope !== 'all' && scope !== 'organization') {
        return {
          params: null,
          error: 'activityScope 只能取 all 或 organization',
        };
      }
      params.activity_scope = scope;
    }

    if (config.pinned) params.pinned = 'true';

    const wantsRepos = Boolean(config.repos) || config.reposLimit !== undefined;
    if (wantsRepos) {
      params.repos = 'true';
      if (config.reposLimit !== undefined && config.reposLimit !== '') {
        const limit = Number(config.reposLimit);
        if (
          !isFinite(limit) ||
          limit < REPOS_LIMIT_MIN ||
          limit > REPOS_LIMIT_MAX
        ) {
          return {
            params: null,
            error:
              'reposLimit 取值需在 ' +
              REPOS_LIMIT_MIN +
              '~' +
              REPOS_LIMIT_MAX +
              ' 之间',
          };
        }
        params.repos_limit = String(Math.floor(limit));
      }
    }

    return {params: params, error: null};
  }

  /**
   * 把接口错误翻译成面向用户的提示。
   * @description 错误码取自接口文档与 FAQ Q33 对照表。
   * @param {!Error} error UAPI 客户端抛出的错误。
   * @return {string} 提示文案。
   */
  function describeError(error) {
    const code = error && error.code ? error.code : '';
    const message = error && error.message ? error.message : '';

    if (code === 'TIMEOUT') return '请求超时';
    if (code === 'NETWORK_ERROR') return '网络不可达';
    if (code === USER_NOT_FOUND) return '未找到该 GitHub 用户';
    if (code === 'INVALID_PARAMETER' || code === 'INVALID_PARAMS') {
      return message ? '参数有误：' + message : '参数有误';
    }
    if (code === 'UPSTREAM_ERROR' || code === 'UPSTREAM_TIMEOUT') {
      return 'UAPI 上游（GitHub）异常，稍后再试';
    }
    if (code === 'CORS_FORBIDDEN') {
      return '浏览器跨域需携带 API Key（见 README 的 UAPI 配置）';
    }
    if (code === 'UNAUTHORIZED' || code === 'AUTHENTICATION_REQUIRED') {
      return 'API Key 无效或已失效';
    }
    if (code === 'INSUFFICIENT_CREDITS') return '账户积分不足';
    if (code === 'VISITOR_MONTHLY_QUOTA_EXHAUSTED') return '访客月额度已用尽';
    if (code === 'RATE_LIMIT_EXCEEDED' || code === 'SERVICE_BUSY') {
      return '触发限流，稍后重试';
    }
    if (code === 'SERVICE_UNAVAILABLE') return '服务暂不可用';
    if (code === 'INTERNAL_SERVER_ERROR' || code === 'API_ERROR') {
      return 'UAPI 服务端错误';
    }
    if (error && error.status) return 'HTTP ' + error.status;
    return message || '未知错误';
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
   * @param {!Object} data 接口返回的用户数据。
   * @return {void}
   */
  function renderProfile(data) {
    const avatar = document.getElementById('gh-avatar');
    const link = document.getElementById('gh-link');
    if (avatar) avatar.src = str(data, 'avatar_url');
    if (link) link.href = str(data, 'html_url') || GITHUB_HOME;

    setText('gh-name', str(data, 'name') || str(data, 'login'));
    setText('gh-bio', str(data, 'bio') || '这个人很懒，什么都没写~');
    setText('gh-repos', String(num(data, ['public_repos'])));
    setText('gh-followers', String(num(data, ['followers'])));
    setText('gh-following', String(num(data, ['following'])));

    const orgsEl = document.getElementById('gh-orgs');
    if (!orgsEl) return;
    orgsEl.textContent = '';
    const organizations =
      data && Array.isArray(data.organizations) ? data.organizations : [];
    if (!organizations.length) return;

    const frag = document.createDocumentFragment();
    organizations.forEach(function (org) {
      if (!org) return;
      const tag = document.createElement('span');
      tag.className = 'github-org-tag';
      tag.textContent = str(org, 'login');
      frag.appendChild(tag);
    });
    orgsEl.appendChild(frag);
  }

  /**
   * 渲染贡献热力图。
   * @description 字段路径依据文档：
   *     `activity.contribution_calendar.weeks[].contribution_days[]`。
   * @param {!Object} data 接口返回的用户数据。
   * @return {void}
   */
  function renderContributionGraph(data) {
    const graphEl = document.getElementById('gh-contrib-graph');
    const totalEl = document.getElementById('gh-total-contrib');
    if (!graphEl) return;

    const activity = data && data.activity;
    const calendar = activity && activity.contribution_calendar;
    if (!calendar || !Array.isArray(calendar.weeks)) {
      graphEl.innerHTML = '<span class="github-empty">暂无贡献数据</span>';
      if (totalEl) totalEl.textContent = '';
      return;
    }

    const total = num(activity, ['total_contributions']);
    if (totalEl) totalEl.textContent = '共 ' + total + ' 次贡献';

    // 列数按实际周数写入，使 52 / 53 / 54 周都能完整铺满容器，
    // 不会出现被裁掉一半的首尾两列。
    graphEl.style.setProperty('--contrib-weeks', String(calendar.weeks.length));

    const frag = document.createDocumentFragment();
    calendar.weeks.forEach(function (week) {
      if (!week) return;
      const weekEl = document.createElement('div');
      weekEl.className = 'github-contrib-week';

      const byWeekday = {};
      const days = Array.isArray(week.contribution_days)
        ? week.contribution_days
        : [];
      days.forEach(function (day) {
        if (day && day.weekday !== undefined) byWeekday[day.weekday] = day;
      });

      for (let weekday = 0; weekday < 7; weekday++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'github-contrib-day';
        const day = byWeekday[weekday];
        if (day) {
          const count = num(day, ['contribution_count']);
          dayEl.classList.add('level-' + contributionLevel(count));
          dayEl.title = str(day, 'date') + ': ' + count + ' 次贡献';
          // 文档提供了当天颜色，有则直接用，保证与 GitHub 配色一致。
          const color = str(day, 'color');
          if (color) dayEl.style.backgroundColor = color;
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
   * @description 优先展示 pinned 仓库，其次展示最近活跃仓库；
   *     Star / Fork 的文档字段为 `stargazers` / `forks`。
   * @param {!Object} data 接口返回的用户数据。
   * @return {void}
   */
  function renderRepositories(data) {
    const grid = document.getElementById('gh-repos-grid');
    if (!grid) return;

    const pinned =
      data && Array.isArray(data.pinned_repositories)
        ? data.pinned_repositories
        : [];
    const recent =
      data && Array.isArray(data.repositories) ? data.repositories : [];
    const list = pinned.length ? pinned : recent;

    grid.textContent = '';
    if (!list.length) {
      grid.innerHTML = '<span class="github-empty">暂无仓库数据</span>';
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(function (repo) {
      if (!repo) return;
      const card = document.createElement('a');
      card.className = 'github-repo-card';
      card.href = str(repo, 'html_url') || GITHUB_HOME;
      card.target = '_blank';
      card.rel = 'noopener';

      const name = document.createElement('div');
      name.className = 'github-repo-name';
      name.textContent = str(repo, 'name');

      const desc = document.createElement('div');
      desc.className = 'github-repo-desc';
      desc.textContent = str(repo, 'description') || '暂无描述';

      const meta = document.createElement('div');
      meta.className = 'github-repo-meta';

      const language = str(repo, 'language');
      if (language) {
        const lang = document.createElement('span');
        lang.className = 'github-repo-lang';
        const dot = document.createElement('span');
        dot.className = 'github-repo-lang-dot';
        dot.style.background = LANG_COLORS[language] || LANG_COLORS.default;
        lang.appendChild(dot);
        lang.appendChild(document.createTextNode(language));
        meta.appendChild(lang);
      }

      const stars = document.createElement('span');
      stars.className = 'github-repo-stars';
      stars.textContent =
        '⭐ ' +
        window.formatNumber(num(repo, ['stargazers', 'stargazers_count']));
      meta.appendChild(stars);

      const forks = document.createElement('span');
      forks.textContent =
        '🍴 ' + window.formatNumber(num(repo, ['forks', 'forks_count']));
      meta.appendChild(forks);

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  /**
   * 渲染整个 GitHub 区块。
   * @description 每步独立容错，某一步失败不会清空其它已渲染的内容。
   * @param {!Object} data 接口返回的用户数据。
   * @return {void}
   */
  function renderAll(data) {
    [
      ['资料卡', renderProfile],
      ['贡献图', renderContributionGraph],
      ['仓库', renderRepositories],
    ].forEach(function (step) {
      try {
        step[1](data);
      } catch (error) {
        console.error('[GitHub] ' + step[0] + ' 渲染失败:', error);
      }
    });
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

    const config = CFG.github || {};
    if (config.enabled === false) return;

    const cacheTtl = config.cacheTtl || DEFAULT_CACHE_TTL;

    /**
     * `github-content` 是静态容器，数据渲染在其内部子容器里，
     * 因此用真正承载数据的节点判断是否已有内容。
     * @return {boolean} 已有渲染结果返回 true。
     */
    function hasRenderedData() {
      const grid = document.getElementById('gh-repos-grid');
      const graph = document.getElementById('gh-contrib-graph');
      return Boolean(
        (grid && grid.children.length) || (graph && graph.children.length),
      );
    }

    const hadContent = hasRenderedData();

    /**
     * 显示错误态：已有内容时保留内容并改用轻提示。
     * @param {string} reason 提示文案。
     * @return {void}
     */
    function showError(reason) {
      loadingEl.style.display = 'none';
      if (hadContent || hasRenderedData()) {
        contentEl.style.display = 'block';
        errorEl.style.display = 'none';
        try {
          if (window.notify) window.notify('GitHub 数据刷新失败：' + reason);
        } catch (notifyError) {
          console.warn('[GitHub] 提示显示失败:', notifyError);
        }
        return;
      }
      contentEl.style.display = 'none';
      errorEl.style.display = 'block';
      const tip = errorEl.querySelector('.github-error-msg');
      if (tip) tip.textContent = '😥 ' + reason + '，可点击重新加载';
    }

    if (!opt_force) {
      const cached = window.KD_STORAGE.readSessionJson(CACHE_KEY, cacheTtl);
      if (cached) {
        renderAll(cached);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';
        return;
      }
    }

    const built = buildQueryParams(config);
    if (built.error) {
      showError(built.error);
      return;
    }

    loadingEl.style.display = hadContent ? 'none' : 'flex';
    errorEl.style.display = 'none';
    if (!hadContent) contentEl.style.display = 'none';

    window.KD_UAPI.get('/github/user', built.params, {
      timeout: config.timeout,
      retries: config.retries,
    })
      .then(function (result) {
        window.KD_STORAGE.writeSessionJson(CACHE_KEY, result.data);
        renderAll(result.data);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';
      })
      .catch(function (error) {
        console.error('[GitHub] 加载失败:', error);
        showError(describeError(error));
      });
  };
})();
