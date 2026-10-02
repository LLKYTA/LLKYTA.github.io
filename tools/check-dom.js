/**
 * 静态自检（无第三方依赖）：
 * 1. 校验 index.html 的 id / class 与 JS、CSS 引用一致；
 * 2. 校验 CSS / JS 中使用到的自定义属性都在 root.css 中定义；
 * 3. 校验 index.html 引用的本地资源确实存在；
 * 4. 校验 index.html 的标签配对、属性引号、id 唯一性与 sprite 引用有效性。
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/github/LLKYTA.github.io';
const html = fs.readFileSync(ROOT + '/index.html', 'utf8');

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const classes = new Set();
for (const m of html.matchAll(/\sclass="([^"]+)"/g)) {
  m[1]
    .split(/\s+/)
    .filter(Boolean)
    .forEach((c) => classes.add(c));
}

const jsFiles = [];
const cssFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) jsFiles.push(full);
    else if (entry.name.endsWith('.css')) cssFiles.push(full);
  }
})(ROOT + '/static');

// 动态创建的类名（由 JS 生成，HTML 中不会出现）。
const DYNAMIC = new Set([
  'active',
  'cmd-empty',
  'cmd-item',
  'cmd-item-hint',
  'cmd-item-icon',
  'cmd-item-title',
  'effect-rain',
  'effect-snow',
  'effect-sunny',
  'expanded',
  'focus',
  'github-empty',
  'github-org-tag',
  'github-repo-card',
  'github-repo-desc',
  'github-repo-lang',
  'github-repo-lang-dot',
  'github-repo-meta',
  'github-repo-name',
  'github-repo-stars',
  'github-contrib-day',
  'github-contrib-week',
  'in-focus',
  'is-empty',
  'is-hidden',
  'kd-toast',
  'kd-toast-show',
  'left-tag-item',
  'line-date',
  'line-desc',
  'line-head',
  'line-title',
  'line-ver',
  'music-playlist-item',
  'music-playlist-item-artist',
  'music-playlist-item-idx',
  'music-playlist-item-name',
  'playing',
  'skill-icon-wrap',
  'skill-ring-card',
  'skill-ring-fill',
  'skill-ring-label',
  'skill-ring-pct',
  'skill-ring-svg',
  'skill-ring-track',
  'timeline-progress',
  'timeline-progress-fill',
  'weather-aqi',
  'weather-aqi-dot',
  'weather-alert',
  'weather-atmos',
  'weather-city',
  'weather-city-row',
  'weather-content',
  'weather-desc',
  'weather-district',
  'weather-error-msg',
  'weather-icon',
  'weather-icon-glow',
  'weather-icon-wrap',
  'weather-info',
  'weather-meta',
  'weather-particles',
  'weather-temp',
  'weather-temp-row',
  'weather-temp-unit',
]);

const problems = [];

for (const file of jsFiles) {
  const src = fs.readFileSync(file, 'utf8');
  const base = path.basename(file);
  for (const m of src.matchAll(/getElementById\('([^']+)'\)/g)) {
    // three-bg.js 自己创建 canvas（#bgParticlesThree），属于例外。
    if (base === 'three-bg.js') continue;
    if (!ids.has(m[1])) problems.push(base + ': 缺少 id #' + m[1]);
  }
  for (const m of src.matchAll(/querySelector(?:All)?\('([^']+)'\)/g)) {
    for (const cls of m[1].matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
      if (!classes.has(cls[1]) && !DYNAMIC.has(cls[1])) {
        problems.push(base + ': 缺少 class .' + cls[1]);
      }
    }
  }
}

// CSS 里的 #id 选择器必须命中 HTML 中真实存在的 id。
// 这一类漏改会让样式静默失效（曾经把 #hitokoto_text 改成 span 却漏改 CSS）。
for (const file of cssFiles) {
  const src = fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 去掉带引号的属性值，避免把 url('#x') 之类误判为 id 选择器。
    .replace(/"[^"]*"|'[^']*'/g, '""');
  for (const m of src.matchAll(/#([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    const name = m[1];
    // 排除十六进制颜色（#fff / #1a1a2e）与转义字符。
    if (/^[0-9a-fA-F]{3,8}$/.test(name) && !ids.has(name)) continue;
    if (!ids.has(name)) {
      problems.push(
        path.basename(file) + ': CSS 中的 #' + name + ' 在 HTML 里不存在',
      );
    }
  }
}

// CSS 自定义属性定义与使用
const rootCss = fs.readFileSync(ROOT + '/static/css/root.css', 'utf8');
const defined = new Set(
  [...rootCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);
const used = new Map();
for (const file of cssFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/var\((--[a-z0-9-]+)/g)) {
    if (!used.has(m[1])) used.set(m[1], path.basename(file));
  }
}
for (const file of jsFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/setProperty\('(--[a-z0-9-]+)'/g)) {
    if (!used.has(m[1])) used.set(m[1], path.basename(file));
  }
}
const BUILTIN = new Set([
  '--mx',
  '--my',
  '--weather-accent',
  '--weather-glow',
  '--footer-avoid-right',
  // 组件内部局部变量，定义在使用它的同一文件 / 由 JS 写入。
  '--contrib-weeks',
  '--drawer-duration',
  '--drawer-ease',
  '--drawer-width',
  '--music-cover-size',
]);
for (const [name, where] of used) {
  if (!defined.has(name) && !BUILTIN.has(name)) {
    problems.push('未定义的自定义属性 ' + name + '（用于 ' + where + '）');
  }
}

// 带 !important 的工具类不能被 JS 通过 style.display 覆盖。
// 曾经用 .is-hidden 初始隐藏 #github-content，JS 设 style.display='block'
// 却因 !important 无效，导致内容永远不显示（且 getComputedStyle 恒为 none）。
const importantClasses = new Set();
for (const file of cssFiles) {
  const src = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{([^}]*)\}/g)) {
    if (/display\s*:[^;]*!important/.test(m[2])) importantClasses.add(m[1]);
  }
}
if (importantClasses.size) {
  // 内联 SVG（含 sprite 定义）属于静态装饰，不会被 JS 切换显示，跳过检查。
  // 注意：标签内部不得再出现 <svg，否则会把跨度拉到后面的元素上。
  const svgRanges = [];
  const svgRegex = /<svg(?:(?!<svg)[\s\S])*?<\/svg\s*>/g;
  let svgMatch;
  while ((svgMatch = svgRegex.exec(html))) {
    svgRanges.push([svgMatch.index, svgMatch.index + svgMatch[0].length]);
  }
  /**
   * 判断某个偏移是否落在内联 SVG 内。
   * @param {number} index 字符偏移。
   * @return {boolean} 在 SVG 内返回 true。
   */
  function insideSvg(index) {
    return svgRanges.some((range) => index >= range[0] && index < range[1]);
  }
  for (const m of html.matchAll(/\sclass="([^"]+)"/g)) {
    if (insideSvg(m.index)) continue;
    for (const cls of m[1].split(/\s+/)) {
      if (importantClasses.has(cls)) {
        problems.push(
          'HTML 类 "' +
            cls +
            '" 含 display:!important，JS 无法用 style.display 覆盖它',
        );
      }
    }
  }
}

// 本地资源存在性
for (const m of html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)) {
  const target = path.join(ROOT, m[1].replace('./', ''));
  if (!fs.existsSync(target)) problems.push('资源不存在: ' + m[1]);
}

// index.html 结构：标签配对、属性引号、id 唯一性、sprite 引用
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const symbolIds = new Set(
  [...html.matchAll(/<symbol[^>]*\sid="([^"]+)"/g)].map((m) => m[1]),
);
const idLines = new Map();
const openTags = [];
const tagPattern =
  /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
let tagMatch;
while ((tagMatch = tagPattern.exec(html))) {
  const closing = tagMatch[1];
  const name = tagMatch[2].toLowerCase();
  const attrs = tagMatch[3];
  const selfClose = tagMatch[4];
  const line = html.slice(0, tagMatch.index).split('\n').length;

  if ((attrs.match(/"/g) || []).length % 2 !== 0) {
    problems.push('第 ' + line + ' 行 <' + name + '> 属性引号不成对');
  }
  // 剔除带引号的属性值后，不应再有裸露的 = 值。
  const bare = attrs.replace(/"[^"]*"|'[^']*'/g, '""').match(/=\s*[^\s"'>]+/g);
  if (bare) {
    problems.push(
      '第 ' + line + ' 行 <' + name + '> 属性值未加引号: ' + bare[0],
    );
  }
  for (const idMatch of attrs.matchAll(/\sid="([^"]+)"/g)) {
    if (idLines.has(idMatch[1])) {
      problems.push(
        '重复 id #' +
          idMatch[1] +
          '（第 ' +
          idLines.get(idMatch[1]) +
          ' 行与第 ' +
          line +
          ' 行）',
      );
    } else {
      idLines.set(idMatch[1], line);
    }
  }

  if (selfClose === '/' || VOID_TAGS.has(name)) continue;
  if (closing) {
    const open = openTags.pop();
    if (!open) problems.push('第 ' + line + ' 行多余的 </' + name + '>');
    else if (open.name !== name) {
      problems.push(
        '第 ' +
          line +
          ' 行 </' +
          name +
          '> 与第 ' +
          open.line +
          ' 行 <' +
          open.name +
          '> 不匹配',
      );
    }
  } else {
    openTags.push({name: name, line: line});
  }
}
openTags.forEach((open) => {
  problems.push('第 ' + open.line + ' 行 <' + open.name + '> 未闭合');
});
for (const useMatch of html.matchAll(/<use href="#([^"]+)"/g)) {
  if (!symbolIds.has(useMatch[1])) {
    problems.push('引用了不存在的 sprite 符号 #' + useMatch[1]);
  }
}

if (problems.length) {
  console.log('发现 ' + problems.length + ' 个问题：');
  problems.forEach((p) => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log(
    '静态自检通过：id / class / 自定义属性 / 资源引用 / HTML 结构均一致' +
      '（' +
      idLines.size +
      ' 个 id，' +
      symbolIds.size +
      ' 个 sprite 符号）',
  );
}
