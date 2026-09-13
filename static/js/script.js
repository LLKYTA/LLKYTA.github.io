console.log(
  "%cCopyright © 2024 zyyo.net",
  "background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;",
);
console.log("%c   /\\_/\\", "color: #20128b; font-size: 20px;");
console.log("%c  ( o.o )", "color: #20128b; font-size: 20px;");
console.log(" %c  > ^ <", "color: #20128b; font-size: 20px;");
console.log("  %c /  ~ \\", "color: #20128b; font-size: 20px;");
console.log("  %c/______\\", "color: #20128b; font-size: 20px;");
document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});
function handlePress(event) {
  this.classList.add("pressed");
}
function handleRelease(event) {
  this.classList.remove("pressed");
}
function handleCancel(event) {
  this.classList.remove("pressed");
}
var buttons = document.querySelectorAll(".projectItem");
buttons.forEach(function (button) {
  button.addEventListener("mousedown", handlePress);
  button.addEventListener("mouseup", handleRelease);
  button.addEventListener("mouseleave", handleCancel);
  button.addEventListener("touchstart", handlePress);
  button.addEventListener("touchend", handleRelease);
  button.addEventListener("touchcancel", handleCancel);
});
function toggleClass(selector, className) {
  var elements = document.querySelectorAll(selector);
  elements.forEach(function (element) {
    element.classList.toggle(className);
  });
}
function pop(imageURL) {
  var tcMainElement = document.querySelector(".tc-img");
  if (imageURL) {
    tcMainElement.src = imageURL;
  }
  toggleClass(".tc-main", "active");
  toggleClass(".tc", "active");
}
var tc = document.getElementsByClassName("tc");
var tc_main = document.getElementsByClassName("tc-main");
tc[0].addEventListener("click", function (event) {
  pop();
});
tc_main[0].addEventListener("click", function (event) {
  event.stopPropagation();
});
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) == 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}
function LoadHi() {
  fetch("https://v1.hitokoto.cn/?c=j&c=i")
    .then((response) => response.json())
    .then((data) => {
      const hitokoto = document.querySelector("#hitokoto_text");
      const hitokoto_from = document.querySelector("#hitokoto_from");
      // hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`
      if ((data.from_who = "null")) {
        hitokoto.from = "---" + data.from;
      } else {
        hitokoto.from = "---" + data.from + " " + data.from_who;
      }
      hitokoto.innerText = data.hitokoto;
      hitokoto_from.innerText = hitokoto.from;
      console.log(data);
    })
    .catch(console.error);
}
LoadHi();
document.addEventListener("DOMContentLoaded", function () {
  var html = document.querySelector("html");
  var themeState = getCookie("themeState") || "Light";
  var tanChiShe = document.getElementById("tanChiShe");
  function changeTheme(theme) {
    tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
    html.dataset.theme = theme;
    setCookie("themeState", theme, 365);
    themeState = theme;
  }
  var Checkbox = document.getElementById("myonoffswitch");
  Checkbox.addEventListener("change", function () {
    if (themeState == "Dark") {
      changeTheme("Light");
    } else if (themeState == "Light") {
      changeTheme("Dark");
    } else {
      changeTheme("Dark");
    }
  });
  if (themeState == "Dark") {
    Checkbox.checked = false;
  }
  changeTheme(themeState);
  var fpsElement = document.createElement("div");
  fpsElement.id = "fps";
  fpsElement.style.zIndex = "10000";
  fpsElement.style.position = "fixed";
  fpsElement.style.left = "0";
  document.body.insertBefore(fpsElement, document.body.firstChild);
  var showFPS = (function () {
    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    var fps = 0,
      last = Date.now(),
      offset,
      step,
      appendFps;
    step = function () {
      offset = Date.now() - last;
      fps += 1;
      if (offset >= 1000) {
        last += offset;
        // appendFps(fps);
        fps = 0;
      }
      requestAnimationFrame(step);
    };
    // appendFps = function(fpsValue) {
    // 	fpsElement.textContent = 'FPS: ' + fpsValue;
    // };
    step();
  })();
  //pop('./static/img/tz.jpg')
});
var pageLoading = document.querySelector("#zyyo-loading");
window.addEventListener("load", function () {
  setTimeout(function () {
    pageLoading.style.opacity = "0";
  }, 100);
});
// 	  数据结构一言
//{
//     "id": 9525,
//     "uuid": "b3444351-174c-4834-973c-6d68a41afb09",
//     "hitokoto": "火车是往前开的，去哪并不重要，重要的是窗外的风景。",
//     "type": "h",
//     "from": "爱情公寓",
//     "from_who": "吕子乔",
//     "creator": "郁离",
//     "creator_uid": 15811,
//     "reviewer": 4756,
//     "commit_from": "web",
//     "created_at": "1694464264",
//     "length": 25
// }
// ==================== GitHub 数据接入 ====================
const GITHUB_API =
  "https://uapis.cn/api/v1/github/user?user=LLKYTA&activity=true&activity_scope=all&pinned=true&repos=true&repos_limit=6";

// 语言颜色映射
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
  Vue: "#41b883",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  default: "#8b8b8b",
};

function loadGitHubData() {
  const loadingEl = document.getElementById("github-loading");
  const errorEl = document.getElementById("github-error");
  const contentEl = document.getElementById("github-content");

  // 显示加载状态
  loadingEl.style.display = "flex";
  errorEl.style.display = "none";
  contentEl.style.display = "none";

  fetch(GITHUB_API)
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      renderGitHubProfile(data);
      renderContributionGraph(data.activity);
      renderRepositories(data.pinned_repositories || data.repositories || []);
      loadingEl.style.display = "none";
      contentEl.style.display = "block";
    })
    .catch((err) => {
      console.error("GitHub API Error:", err);
      loadingEl.style.display = "none";
      errorEl.style.display = "block";
    });
}

function renderGitHubProfile(data) {
  // 头像
  document.getElementById("gh-avatar").src = data.avatar_url || "";

  // 主页链接
  const linkEl = document.getElementById("gh-link");
  linkEl.href = data.html_url || "#";

  // 昵称
  document.getElementById("gh-name").textContent =
    data.name || data.login || "";

  // 简介
  const bioEl = document.getElementById("gh-bio");
  bioEl.textContent = data.bio || "这个人很懒，什么都没写~";

  // 统计数据
  document.getElementById("gh-repos").textContent = data.public_repos || 0;
  document.getElementById("gh-followers").textContent = data.followers || 0;
  document.getElementById("gh-following").textContent = data.following || 0;

  // 组织标签
  const orgsEl = document.getElementById("gh-orgs");
  orgsEl.innerHTML = "";
  if (data.organizations && data.organizations.length > 0) {
    data.organizations.forEach((org) => {
      const tag = document.createElement("span");
      tag.className = "github-org-tag";
      tag.textContent = org.login;
      orgsEl.appendChild(tag);
    });
  }
}

function renderContributionGraph(activity) {
  const graphEl = document.getElementById("gh-contrib-graph");
  const totalEl = document.getElementById("gh-total-contrib");

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

  totalEl.textContent = `共 ${total} 次贡献`;

  // 清空并渲染
  graphEl.innerHTML = "";

  // 颜色等级映射（根据贡献数决定颜色深浅）
  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  weeks.forEach((week) => {
    const weekEl = document.createElement("div");
    weekEl.className = "github-contrib-week";

    // 每周固定7天，缺失的天补空白
    const days = week.contribution_days || [];
    const dayMap = {};
    days.forEach((d) => {
      dayMap[d.weekday] = d;
    });

    for (let i = 0; i < 7; i++) {
      const dayEl = document.createElement("div");
      dayEl.className = "github-contrib-day";

      if (dayMap[i]) {
        const count = dayMap[i].contribution_count || 0;
        const level = getLevel(count);
        dayEl.classList.add("level-" + level);
        dayEl.title = `${dayMap[i].date}: ${count} 次贡献`;
      } else {
        dayEl.classList.add("level-0");
        dayEl.style.opacity = "0.3";
      }

      weekEl.appendChild(dayEl);
    }

    graphEl.appendChild(weekEl);
  });
}

function renderRepositories(repos) {
  const gridEl = document.getElementById("gh-repos-grid");
  gridEl.innerHTML = "";

  if (!repos || repos.length === 0) {
    gridEl.innerHTML =
      '<span style="font-size:13px;opacity:0.6;">暂无仓库数据</span>';
    return;
  }

  repos.forEach((repo) => {
    const card = document.createElement("a");
    card.className = "github-repo-card";
    card.href = repo.html_url || "#";
    card.target = "_blank";

    const langColor = LANG_COLORS[repo.language] || LANG_COLORS["default"];

    card.innerHTML = `
            <div class="github-repo-name">${escapeHtml(repo.name)}</div>
            <div class="github-repo-desc">${escapeHtml(repo.description || "暂无描述")}</div>
            <div class="github-repo-meta">
                ${
                  repo.language
                    ? `
                    <span class="github-repo-lang">
                        <span class="github-repo-lang-dot" style="background:${langColor}"></span>
                        ${escapeHtml(repo.language)}
                    </span>
                `
                    : ""
                }
                <span class="github-repo-stars">
                    ⭐ ${formatNumber(repo.stargazers || 0)}
                </span>
                <span>🍴 ${formatNumber(repo.forks || 0)}</span>
            </div>
        `;

    gridEl.appendChild(card);
  });
}

// 简易HTML转义，防止XSS
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

// 在 DOMContentLoaded 中调用
document.addEventListener("DOMContentLoaded", function () {
  // ... 保留你原有的代码 ...

  // 延迟加载 GitHub 数据
  loadGitHubData();
});
/* ==================== 音乐播放器（静音自动播放 + 手势解锁） ==================== */
(function () {
    var player = document.getElementById('musicPlayer');
    if (!player) return;

    var audio = document.getElementById('musicAudio');
    var cover = document.getElementById('musicCover');
    var collapse = document.getElementById('musicCollapse');
    var seek = document.getElementById('musicSeek');
    var curEl = document.getElementById('musicCurrent');
    var durEl = document.getElementById('musicDuration');
    var titleEl = document.getElementById('musicTitle');

    var ACCENT = 'var(--purple_text_color)';
    var TRACK = 'var(--item_hover_color)';

    var unlocked = false;   // 是否已解锁声音

    /* ---------- 工具函数 ---------- */
    function formatTime(sec) {
        if (!isFinite(sec) || sec < 0) return '0:00';
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function paintSeek(pct) {
        seek.style.background =
            'linear-gradient(to right, ' + ACCENT + ' ' + pct + '%, ' +
            TRACK + ' ' + pct + '%)';
    }

    /* ---------- 核心：静音自动播放 ---------- */
    function autoPlayMuted() {
        audio.muted = true;          // 关键：静音后浏览器允许自动播放
        var p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(function () {
                player.classList.add('playing');
                armUnlockGesture();
            }).catch(function () {
                // 连静音都被拦截（极少见，如省电模式），走手势补播
                armUnlockGesture(true);
            });
        }
    }

    /* ---------- 手势解锁声音 ---------- */
    function armUnlockGesture(needResume) {
        var events = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];

        var unlock = function () {
            if (unlocked) return;
            unlocked = true;

            events.forEach(function (e) {
                document.removeEventListener(e, unlock);
            });

            audio.muted = false;

            // 如果是被彻底拦截的情况，这里顺便启动播放
            if (needResume || audio.paused) {
                audio.play().catch(function (err) {
                    console.warn('[Music] 手势补播失败:', err);
                });
            }

            // 短暂提示用户声音已开启
            flashTitle('🔊 已开启声音');
        };

        events.forEach(function (e) {
            document.addEventListener(e, unlock, { passive: true });
        });
    }

    /* ---------- 临时替换标题做提示 ---------- */
    var titleTimer = null;
    function flashTitle(text) {
        var original = titleEl.dataset.original || titleEl.textContent;
        titleEl.dataset.original = original;
        titleEl.textContent = text;
        clearTimeout(titleTimer);
        titleTimer = setTimeout(function () {
            titleEl.textContent = titleEl.dataset.original;
        }, 2000);
    }

    /* ---------- 交互事件 ---------- */
    cover.addEventListener('click', function () {
        // 若从未解锁，第一次点击同时解锁并播放
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
        if (!audio.duration) return;
        var pct = (audio.currentTime / audio.duration) * 100;
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
        if (!audio.duration) return;
        audio.currentTime = (seek.value / 100) * audio.duration;
    });

    audio.addEventListener('error', function () {
        titleEl.textContent = '音源加载失败';
        console.warn('[Music] 音频加载失败。网易云外链对部分歌曲会返回 404。');
    });
    /* ---------- 初始化 ---------- */
    paintSeek(0);

// 宽屏默认展开，小屏默认收起
    if (window.innerWidth > 600) { 
           player.classList.add('expanded');
    } else {
       player.classList.remove('expanded');
    }

autoPlayMuted();

    // 直接尝试静音自动播放
    autoPlayMuted();
})();
/* ==================== 标题个性化 ==================== */
(function () {
    var BASE_TITLE = 'KD_klin · 个人主页';
    var AWAY_TITLE = '👀 别走嘛，回来看看～';
    var BLUR_TITLE = '💤 暂时离开了...';

    var typeTimer = null;
    var typeIndex = 0;
    var isVisible = !document.hidden;
    var hasFocus = document.hasFocus();

    /* ---------- 打字机效果 ---------- */
    function typeTitle(text, speed, callback) {
        clearInterval(typeTimer);
        typeIndex = 0;
        document.title = '';

        typeTimer = setInterval(function () {
            if (typeIndex >= text.length) {
                clearInterval(typeTimer);
                if (typeof callback === 'function') callback();
                return;
            }
            document.title += text.charAt(typeIndex);
            typeIndex++;
        }, speed || 100);
    }

    /* ---------- 恢复标题 ---------- */
    function restoreTitle() {
        // 避免重复打字：如果当前标题已经是基础标题，直接返回
        if (document.title === BASE_TITLE) return;
        typeTitle(BASE_TITLE, 100);
    }

    /* ---------- 可见性变化（切标签页） ---------- */
    document.addEventListener('visibilitychange', function () {
        isVisible = !document.hidden;
        if (isVisible && hasFocus) {
            restoreTitle();
        } else if (!isVisible) {
            clearInterval(typeTimer);
            document.title = AWAY_TITLE;
        }
    });

    /* ---------- 窗口焦点变化（切应用） ---------- */
    window.addEventListener('blur', function () {
        hasFocus = false;
        // 只有在页面可见时才显示"离开"提示，避免和 visibilitychange 冲突
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

    /* ---------- 首次加载：打字机入场 ---------- */
    window.addEventListener('load', function () {
        setTimeout(function () {
            typeTitle(BASE_TITLE, 100);
        }, 300);
    });
})();