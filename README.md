<!-- README.md -->

# KD_klin 的个人主页

> 整天半吊子和不学无术的坏孩子，
> 梦想成为庄稼地里的读书人。

一个简洁、响应式的个人引导页，
基于原生 HTML / CSS / JavaScript 构建，
无需任何框架。

## ✨ 功能特性

- 🌓 明暗主题切换
  一键切换深色 / 浅色模式，
  支持跟随系统，使用 Cookie 与 localStorage 记忆偏好。

- 📱 响应式布局
  适配桌面端与移动端，
  小屏自动收起侧边栏为抽屉（汉堡按钮 + 遮罩 + 右滑关闭）。

- 🎯 一言（Hitokoto）
  随机展示一句动漫 / 文学语录，
  点击可刷新。

- 🐙 GitHub 数据展示
  实时获取 GitHub 用户信息、
  贡献热力图、置顶 / 活跃仓库。

- 🏷️ 个人标签
  展示兴趣与技术栈标签。

- 📅 时间线
  记录网站更新与个人里程碑。

- 🖼️ 图片弹窗
  点击图标可查看微信、QQ、
  赞赏码等图片。

- ⚡ 加载动画
  页面初始化时的优雅过渡效果。

- 🎵 音乐播放器
  支持歌单、音量、播放模式、
  频谱可视化与 Media Session 系统控制。

- 🌤️ 沉浸式天气小组件
  渐变背景 + 微粒子动效 + AQI + 气象预警。

- 📊 技能可视化
  Canvas 雷达图 + SVG 环形进度条，
  图标来自 Simple Icons。

- ⌨️ 命令面板
  快捷键 `Ctrl + K` 呼出，
  支持切换主题、背景、音乐、刷新一言等操作。

- ✨ 背景动效
  鼠标跟随光晕 / Canvas 粒子，
  可通过命令面板切换。

## 🛠️ 技术栈

- 原生 HTML5 / CSS3 / JavaScript（ES2022，无框架、无构建步骤）
- CSS 自定义属性驱动主题（`static/css/root.css`）
- 毛玻璃效果（`backdrop-filter`）
- Web Audio API（音频频谱分析）
- Canvas 2D（雷达图 / 频谱）
- Three.js（3D 粒子星云，经 importmap 从 CDN 加载）
- View Transitions API（主题切换过渡）
- 一言 API：v1.hitokoto.cn
- GitHub 用户 API：uapis.cn
  https://uapis.cn/docs/api-reference/get-github-user
- 天气 API：uapis.cn
  https://uapis.cn/docs/api-reference/get-misc-weather
- 图标 CDN：Simple Icons / Meteocons

## 📁 目录结构

```
.
├── index.html                     单页结构 + 内联 SVG sprite
├── README.md
├── robots.txt / sitemap.xml / CNAME
├── tools/
│   ├── check-dom.js               静态自检：id / class / 变量 / 资源 / HTML 结构
│   └── build-og-cover.py          生成社交分享卡片 og-cover.png
└── static/
    ├── css/
    │   ├── root.css               设计令牌（颜色 / 阴影 / 强调色）
    │   ├── base.css               全局、布局、侧边栏、主内容
    │   ├── utilities.css          工具类、无障碍、动效降级
    │   └── components/            github-card / music-player / weather /
    │                              skill / timeline / sidebar /
    │                              command-palette / mobile-drawer
    ├── js/
    │   ├── config.js              站点配置（所有可自定义内容）
    │   ├── analytics.js           51.la 统计初始化
    │   ├── main.js                入口：绑定交互并初始化各模块
    │   ├── music-player.js        音乐播放器
    │   ├── core/                  globals / storage / utils / theme / loading
    │   └── modules/               profile / skills / hitokoto / runtime /
    │                              visits / typewriter / mouse-glow /
    │                              three-bg / bg-mode / command-palette /
    │                              weather / github / title /
    │                              sidebar-extras / mobile-sidebar
    ├── img/                       logo / 背景 / 二维码 / og-cover
    ├── svg/                       明暗主题插画
    ├── music/                     音频
    └── fonts/                     Ubuntu / Pacifico
```

## 🚀 本地运行

直接双击 `index.html` 即可在浏览器中打开。
若需部署，将整个目录上传至任意静态托管服务，
如 Vercel、Netlify、GitHub Pages。

天气、GitHub、一言等模块依赖线上接口，需要联网才能看到数据。

## 🧹 代码规范

项目遵循 **Google 代码规范**：

- [Google JavaScript 风格指南](https://zh-google-styleguide.readthedocs.io/en/latest/google-javascript-styleguide/)
  —— 单引号、2 空格缩进、行宽 80、`const`/`let`、JSDoc 注释公开函数。
- [Google HTML/CSS 风格指南](https://zh-google-styleguide.readthedocs.io/en/latest/google-html-css-styleguide/)
  —— class / id / 自定义属性统一 kebab-case、声明按字母序、
  零值省略单位、属性值使用单引号。
- 格式化由 Prettier 统一执行（`printWidth: 80`），
  ESLint 负责语义规则、Stylelint 负责 CSS 规则，
  三者互不冲突。

```bash
npm install        # 安装开发依赖（仅 lint / 格式化工具）
npm run lint       # ESLint + Stylelint
npm run check      # 上述检查 + Prettier 格式校验 + 静态自检
npm run fix        # 自动修复格式与可自动修复的规范问题
node tools/check-dom.js   # 单独运行静态自检
```

`tools/check-dom.js` 会校验四件事：JS 引用的 id / class 是否都存在于 HTML、
CSS 与 JS 用到的自定义属性是否都有定义、本地资源引用是否存在，
以及 HTML 的标签配对 / 属性引号 / id 唯一性 / sprite 引用有效性。
改完结构或批量改名之后建议跑一次，避免「改名漏改」这类问题。

## 📌 已完成计划

### 🎨 UI / 交互

- [x] 明暗主题切换 + View Transitions 过渡
- [x] 响应式布局（桌面 / 平板 / 移动端）
- [x] 移动端侧边栏抽屉（汉堡按钮 + 遮罩 + 右滑关闭）
- [x] 鼠标跟随光效 / Canvas 背景粒子
- [x] 命令面板（Ctrl + K 快捷操作）
- [x] 沉浸式天气卡片（渐变背景 + 微粒子 + AQI + 预警）
- [x] 技能可视化（Canvas 雷达图 + SVG 环形进度）
- [x] 页面加载动画 + 打字机欢迎语
- [x] 音乐播放器折叠态动效优化（双层脉冲 / hover 反馈）

### ⚙️ 功能

- [x] 接入 GitHub 用户数据展示（资料 / 贡献热力图 / 仓库）
- [x] 一言（Hitokoto）随机语录 + 点击刷新
- [x] 音乐播放器（歌单 / 音量 / 播放模式 / 频谱可视化 / Media Session）
- [x] 站点运行时长 + 访客统计
- [x] 时间线模块（配置驱动）
- [x] 图片弹窗（微信 / QQ / 赞赏码）
- [x] 底栏与播放器状态联动避让
- [x] 删除冗余的 site 项目列表

### 🧱 工程化与规范（2024 重构）

- [x] 修复 ESLint / Stylelint 配置错误，`npm run lint` 可正常通过
- [x] 统一为 Google 代码规范并通过 Prettier 固化格式
- [x] class / id / CSS 自定义属性全部改为 kebab-case
- [x] CSS 拆分为令牌层 + 基础层 + 工具层 + 组件层
- [x] 内联 SVG sprite 复用图标，去掉 JS 中的大段 SVG 字符串
- [x] `localStorage` / `sessionStorage` 统一封装，隐私模式不再抛错
- [x] 脚本全部 `defer`，加载遮罩由 CSS 先渲染，消除首屏闪白
- [x] `prefers-reduced-motion` 覆盖全部装饰性动画
- [x] 恢复键盘焦点轮廓（`focus-visible`），移除全局 `user-select: none`

### 🚀 性能与体验

- [x] 关键域名 preconnect（simpleicons / jsdelivr / hitokoto / uapis）
- [x] 字体 preload
- [x] 脚本 defer 非阻塞加载
- [x] Simple Icons 图标加载失败回退占位
- [x] `prefers-reduced-motion` 全面降级
- [x] 无障碍焦点轮廓
- [x] GitHub / 天气数据会话级缓存 + TTL，避免重复请求
- [x] 雷达图 resize 节流、时间线进度条 rAF 合并

## 📌 未来计划

### 🎨 UI / 交互

- [ ] 优化侧边栏交互，支持拖拽排序卡片
- [ ] 增加更多主题配色（日落 / 森林 / 赛博朋克）
- [ ] 首页加入骨架屏，避免首屏闪白
- [ ] 移动端底部导航栏（替代汉堡菜单）
- [ ] 播放器支持歌词滚动

### ⚙️ 功能

- [ ] 完善时间线模块，支持从外部 JSON / API 动态加载
- [ ] 接入评论系统（Giscus / Waline / Artalk）
- [ ] 增加博客 / 文章列表模块
- [ ] 相册页（支持灯箱浏览）
- [ ] 站点地图 / RSS 订阅
- [ ] 归档页（按年份 / 标签筛选）
- [ ] 天气小组件支持多城市切换
- [ ] 多语言切换（中 / 英）

### 🚀 性能与工程化

- [ ] 引入 Vite / esbuild，做资源压缩与 tree-shaking
- [ ] 天气 API 通过 Cloudflare Workers 代理，隐藏密钥
- [ ] 图片资源 WebP / AVIF 转换
- [ ] 增加 GitHub Actions 自动部署与体积报告
- [ ] 添加单元测试（核心工具函数）

### 📚 文档

- [ ] 完善 README 部署指南（Vercel / Netlify / Cloudflare Pages）
- [ ] 补全 `config.js` 每项配置的详细说明
- [ ] 录制演示视频或 GIF 动图

## 🙏 致谢

页面设计改编自 Zyyo，
感谢原作者的开源精神。

---

© 2024 KD_klin
