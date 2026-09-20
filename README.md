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

- 原生 HTML5 / CSS3 / JavaScript
- CSS 变量驱动主题（root.css）
- 毛玻璃效果（backdrop-filter）
- Web Audio API（音频频谱分析）
- Canvas 2D（雷达图 / 粒子 / 频谱）
- View Transitions API（主题切换过渡）
- 一言 API：v1.hitokoto.cn
- GitHub 用户 API：uapis.cn
  https://uapis.cn/docs/api-reference/get-github-user
- 天气 API：uapis.cn
  https://uapis.cn/docs/api-reference/get-misc-weather
- 图标 CDN：Simple Icons / Meteocons

## 📁 目录结构

.
├── index.html
├── README.md
└── static/
    ├── css/
    │   ├── style.css
    │   ├── root.css
    │   ├── github-card.css
    │   └── music-player.css
    ├── js/
    │   ├── config.js
    │   ├── script.js
    │   └── music-player.js
    ├── img/
    ├── svg/
    ├── music/
    └── fonts/

## 🚀 本地运行

直接双击 `index.html` 即可在浏览器中打开。
若需部署，将整个目录上传至任意静态托管服务，
如 Vercel、Netlify、GitHub Pages。

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

### 🚀 性能与体验
- [x] 关键域名 preconnect（simpleicons / jsdelivr / hitokoto / uapis）
- [x] 字体 preload
- [x] 脚本 defer 非阻塞加载
- [x] Simple Icons 图标加载失败回退占位
- [x] `prefers-reduced-motion` 全面降级
- [x] 无障碍焦点轮廓

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
- [ ] 拆分 `style.css` 为多个模块文件，配合构建工具打包
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