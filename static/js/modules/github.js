/**
 * @fileoverview GitHub 数据展示模块。
 */
(function() {
  'use strict';

  const GITHUB_CACHE_KEY = 'github_data_cache';
  const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572a5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Java': '#b07219',
    'Go': '#00add8',
    'Rust': '#dea584',
    'C': '#555555',
    'C++': '#f34b7d',
    'Shell': '#89e051',
    'Vue': '#41b883',
    'PHP': '#4f5d95',
    'Ruby': '#701516',
    'Kotlin': '#a97bff',
    'Swift': '#f05138',
    'default': '#8b8b8b',
  };

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
      data.organizations.forEach(function(org) {
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
    const total =
      activity.total_contributions || activity.contribution_calendar.total_contributions || 0;
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
    weeks.forEach(function(week) {
      const wEl = document.createElement('div');
      wEl.className = 'github-contrib-week';
      const days = week.contribution_days || [];
      const map = {};
      days.forEach(function(d) {
        map[d.weekday] = d;
      });
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
    repos.forEach(function(repo) {
      const card = document.createElement('a');
      card.className = 'github-repo-card';
      card.href = repo.html_url || '#';
      card.target = '_blank';
      card.rel = 'noopener';
      const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
      const langHtml = repo.language ?
        '<span class="github-repo-lang"><span class="github-repo-lang-dot" style="background:' +
          langColor +
          '"></span>' +
          window.escapeHtml(repo.language) +
          '</span>' :
        '';
      const stars = repo.stargazers_count || repo.stargazers || 0;
      const forks = repo.forks_count || repo.forks || 0;
      card.innerHTML =
        '<div class="github-repo-name">' +
        window.escapeHtml(repo.name) +
        '</div>' +
        '<div class="github-repo-desc">' +
        window.escapeHtml(repo.description || '暂无描述') +
        '</div>' +
        '<div class="github-repo-meta">' +
        langHtml +
        '<span class="github-repo-stars">⭐ ' +
        window.formatNumber(stars) +
        '</span>' +
        '<span>🍴 ' +
        window.formatNumber(forks) +
        '</span></div>';
      grid.appendChild(card);
    });
  }
  window.loadGitHubData = function() {
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
      } catch (e) {
        sessionStorage.removeItem(GITHUB_CACHE_KEY);
      }
    }
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';

    fetch(api)
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function(data) {
          sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(data));
          renderGitHubProfile(data);
          renderContributionGraph(data.activity);
          renderRepositories(data.pinned_repositories || data.repositories || []);
          loadingEl.style.display = 'none';
          contentEl.style.display = 'block';
        })
        .catch(function(err) {
          console.error('GitHub API Error:', err);
          loadingEl.style.display = 'none';
          errorEl.style.display = 'block';
        });
  };
})();
