/**
 * @fileoverview KD_klin 主入口。负责绑定静态结构上的交互并初始化各模块。
 * @author KD_klin
 */
console.log(
  '%cCopyright © 2024 KD_klin',
  'background-color: #ff00ff; color: white; font-size: 24px; ' +
    'font-weight: bold; padding: 10px;',
);

/**
 * 按配置补全社交图标链接（图标本体是 index.html 中的 SVG sprite）。
 * @return {void}
 */
function syncSocialLinks() {
  const socials = CFG.socials || {};
  const github = socials.github || {};

  const githubLink = document.getElementById('social-github');
  if (githubLink) {
    if (github.url) githubLink.href = github.url;
    else githubLink.removeAttribute('href');
  }

  const mailLink = document.getElementById('social-mail');
  if (mailLink) {
    if (socials.email) mailLink.href = 'mailto:' + socials.email;
    else mailLink.removeAttribute('href');
  }

  const qqLink = document.getElementById('social-qq');
  if (qqLink) {
    const qqImage = (socials.qq && socials.qq.image) || '';
    qqLink.dataset.image = qqImage;
    qqLink.addEventListener('click', function () {
      if (qqImage) window.pop(qqImage);
    });
  }

  const checkbox = document.getElementById('theme-toggle');
  if (checkbox) {
    checkbox.addEventListener('change', function () {
      const isDark = document.documentElement.dataset.theme === 'Dark';
      window.changeTheme(isDark ? 'Light' : 'Dark', true);
    });
  }
}

/**
 * 绑定点赞（一言）与 GitHub 重试等静态结构上的事件。
 * @return {void}
 */
function bindStaticHandlers() {
  const hitokotoBox = document.getElementById('hitokoto-box');
  if (hitokotoBox) hitokotoBox.addEventListener('click', window.loadHi);

  const githubRetryBtn = document.getElementById('github-retry-btn');
  if (githubRetryBtn) {
    githubRetryBtn.addEventListener('click', function () {
      window.loadGitHubData(true);
    });
  }

  const footerName = document.getElementById('footer-name');
  if (footerName && CFG.site) footerName.textContent = CFG.site.name;
}

document.addEventListener('DOMContentLoaded', function () {
  window.renderProfileFromConfig();
  window.renderTimelineFromConfig();
  window.renderSkillsFromConfig();

  syncSocialLinks();
  bindStaticHandlers();

  window.applyResolvedTheme();
  window.applyBgMode(
    window.KD_STORAGE.read('KD_bgMode') ||
      (CFG.background && CFG.background.default) ||
      'glow',
  );

  window.loadHi();
  window.loadGitHubData();
  window.initWeatherWidget();
});
