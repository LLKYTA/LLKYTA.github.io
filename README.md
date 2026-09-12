# KD_klin 的个人主页

> 整天半吊子和不学无术的坏孩子，
> 梦想成为庄稼地里的读书人。

一个简洁、响应式的个人引导页，
基于原生 HTML / CSS / JavaScript 构建，
无需任何框架。

## ✨ 功能特性

- 🌓 明暗主题切换
  一键切换深色/浅色模式，
  使用 Cookie 记忆用户偏好。

- 📱 响应式布局
  适配桌面端与移动端，
  小屏自动隐藏侧边栏。

- 🎯 一言（Hitokoto）
  随机展示一句动漫/文学语录，
  点击可刷新。

- 🐙 GitHub 数据展示
  实时获取 GitHub 用户信息、
  贡献热力图、置顶/活跃仓库。

- 🏷️ 个人标签
  展示兴趣与技术栈标签。

- 📅 时间线
  记录网站更新与个人里程碑。

- 🖼️ 图片弹窗
  点击图标可查看微信、QQ、
  赞赏码等图片。

- ⚡ 加载动画
  页面初始化时的优雅过渡效果。

## 🛠️ 技术栈

- 原生 HTML5 / CSS3 / JavaScript
- CSS 变量驱动主题（root.css）
- 毛玻璃效果（backdrop-filter）
- 一言 API：v1.hitokoto.cn
- GitHub 用户 API：uapis.cn
  https://uapis.cn/docs/api-reference/get-github-user

## 📁 目录结构

.
├── index.html
├── README.md
└── static/
    ├── css/
    │   ├── style.css
    │   ├── root.css
    │   └── github-card.css
    ├── js/
    │   └── script.js
    ├── img/
    ├── svg/
    └── fonts/

## 🚀 本地运行

直接双击 index.html 即可在浏览器中打开。
若需部署，将整个目录上传至任意静态托管服务，
如 Vercel、Netlify、GitHub Pages。

## 📌 待办事项

- [x] 接入 GitHub 用户数据展示
- [x] 删除冗余的 site 项目列表
- [ ] 优化侧边栏交互
- [ ] 完善时间线模块，支持动态数据
- [ ] 增加更多主题配色

## 🙏 致谢

页面设计改编自 Zyyo，
感谢原作者的开源精神。

---

© 2024 KD_klin

