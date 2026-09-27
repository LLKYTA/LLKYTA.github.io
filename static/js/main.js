/**
 * @fileoverview KD_klin 主入口。负责初始化各模块。
 * @author KD_klin
 */
console.log(
  '%cCopyright © 2024 KD_klin',
  'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);

/* ==================== 社交图标 / 主题开关 ==================== */

function renderSocialIconsFromConfig() {
  const wrap = document.getElementById('iconContainer');
  if (!wrap || !CFG.socials) return;
  const github = CFG.socials.github || {};
  const email = CFG.socials.email || '';

  wrap.innerHTML =
    '<a class="iconItem" href="' +
    (github.url || '#') +
    '" target="_blank" rel="noopener" aria-label="GitHub">' +
    '<svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>' +
    '<div class="iconTip">Github</div></a>' +
    '<a class="iconItem" href="mailto:' +
    email +
    '" aria-label="发送邮件">' +
    '<svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M926.47619 355.644952V780.190476a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667a73.142857 73.142857 0 0 1-73.142857-73.142857V355.644952l304.103619 257.828572a170.666667 170.666667 0 0 0 220.745142 0L926.47619 355.644952zM853.333333 170.666667a74.044952 74.044952 0 0 1 26.087619 4.778666 72.704 72.704 0 0 1 30.622477 22.186667 73.508571 73.508571 0 0 1 10.678857 17.67619c3.169524 7.509333 5.12 15.652571 5.607619 24.210286L926.47619 243.809524v24.380952L559.469714 581.241905a73.142857 73.142857 0 0 1-91.306666 2.901333l-3.632762-2.925714L97.52381 268.190476v-24.380952a72.899048 72.899048 0 0 1 40.155428-65.292191A72.97219 72.97219 0 0 1 170.666667 170.666667h682.666666z"></path></svg>' +
    '<div class="iconTip">Mail</div></a>' +
    '<a class="iconItem" id="qqIcon" href="javascript:void(0)" aria-label="QQ 好友二维码">' +
    '<svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z"></path></svg>' +
    '<div class="iconTip">QQ</div></a>' +
    '<a class="switch" href="javascript:void(0)" aria-label="切换深色/浅色主题">' +
    '<div class="onoffswitch">' +
    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" aria-label="切换深色/浅色主题" checked />' +
    '<label class="onoffswitch-label" for="myonoffswitch"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label>' +
    '</div></a>';

  const qqIcon = document.getElementById('qqIcon');
  if (qqIcon) {
    qqIcon.addEventListener('click', function () {
      window.pop((CFG.socials && CFG.socials.qq && CFG.socials.qq.image) || '');
    });
  }
  const checkbox = document.getElementById('myonoffswitch');
  if (checkbox) {
    checkbox.addEventListener('change', function () {
      const next = document.documentElement.dataset.theme === 'Dark' ? 'Light' : 'Dark';
      window.changeTheme(next, true);
    });
  }
}

/* ==================== 页面初始化 ==================== */

document.addEventListener('DOMContentLoaded', function () {
  window.renderProfileFromConfig();
  window.renderTimelineFromConfig();
  window.renderSkillsFromConfig();
  renderSocialIconsFromConfig();

  window.applyResolvedTheme();
  window.applyBgMode(
    localStorage.getItem('KD_bgMode') || (CFG.background && CFG.background.default) || 'glow'
  );

  const hitokotoBox = document.getElementById('hitokotoBox');
  if (hitokotoBox) hitokotoBox.addEventListener('click', window.loadHi);

  const githubRetryBtn = document.getElementById('githubRetryBtn');
  if (githubRetryBtn) githubRetryBtn.addEventListener('click', window.loadGitHubData);

  const footerName = document.getElementById('footerName');
  if (footerName && CFG.site) footerName.textContent = CFG.site.name;

  window.loadHi();
  window.loadGitHubData();
  window.initWeatherWidget();
});
