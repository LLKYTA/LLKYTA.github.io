/**
 * @fileoverview KD_klin 站点配置文件。所有可自定义内容集中在此。
 */
window.KD_CONFIG = {
  site: {
    name: 'KD_klin',
    url: 'https://kd.of.cd',
    startDate: '2026-01-01T00:00:00',
    ogImage: './static/img/logokuang.png',
    description: '整天半吊子和不学无术的坏孩子，梦想成为庄稼地里的读书人。',
  },

  profile: {
    name: 'KD_klin',
    location: 'China-HuHot',
    status: '高中在读',
    tags: ['Indie Hacker', 'Full-Stack', 'Open Sourcer', 'Linux', 'Self-Hosted', 'Runner', 'Cyclist', 'Badminton'],
  },

  socials: {
    github: { url: 'https://github.com/LLKYTA', label: 'GitHub' },
    email: '010107lys@163.com',
    qq: { image: './static/img/qq.jpg' },
  },

  /**
   * 天气小组件配置。
   * API 文档：https://uapis.cn/docs/api-reference/get-misc-weather
   * ⚠️ 纯静态站点 apiKey 会暴露在客户端，仅建议本地/私有部署使用；
   *    公网部署请通过 Cloudflare Workers 等做一层代理。
   */
  weather: {
    enabled: true,
    // UAPI 密钥（以 uapi- 开头），留空则不携带 Authorization 头
    apiKey: '',
    // 两种定位方式二选一：city 或 adcode；都不填则按访客 IP 自动定位
    city: '',      // 例如：'北京' / 'Tokyo'
    adcode: '',    // 例如：'110000'（优先级高于 city）
    lang: 'zh',    // 'zh' | 'en'
    // 可选功能模块
    extended: true,    // 体感温度 / 能见度 / 气压 / UV / AQI / 污染物
    forecast: false,   // 多天预报（最多 7 天）
    hourly: false,     // 逐小时预报（24 小时）
    minutely: false,   // 分钟级降水（仅国内城市）
    indices: false,    // 18 项生活指数
    // 数据缓存 & 刷新间隔（毫秒，默认 30 分钟）
    refreshInterval: 30 * 60 * 1000,
    // 请求超时（毫秒）
    timeout: 10000,
  },

  github: {
    username: 'LLKYTA',
    api: 'https://uapis.cn/api/v1/github/user?user=LLKYTA&activity=true&activity_scope=all&pinned=true&repos=true&repos_limit=6',
  },

  music: {
    // 是否启用音乐播放器
    enabled: true,
    // 首次进入是否尝试自动播放（浏览器可能仍会拦截）
    autoplay: true,
    // 默认音量 0 - 1
    volume: 0.7,
    // 默认播放模式：list 列表循环 | single 单曲循环 | shuffle 随机播放
    mode: 'list',
    // 是否记住音量 / 模式 / 上次播放曲目（localStorage）
    persist: true,
    // 播放列表
    playlist: [
      {
        src: './static/music/失眠.mp3', // 音频文件 URL
        title: '失眠',
        artist: '',
        cover: '', // 可选，封面图 URL
      },
      // 继续添加更多曲目...
    ],
  },

  timeline: [
    { ver: 'v1.2', title: '内容扩展', date: '2026.09', desc: '接入 GitHub 动态与音乐播放器' },
    { ver: 'v1.1', title: '域名迁移', date: '2026.02', desc: '正式迁移至 KD.of.cd' },
    { ver: 'v1.0', title: '主题重构', date: '2026.01', desc: '基于 CSS 变量重写主题系统' },
    { ver: 'v0.1', title: '首次上线', date: '2026.01', desc: '完成基础框架与个人信息展示' },
  ],

  /**
   * 技能数据。slug 用于 Simple Icons CDN，color 为品牌色。
   * 图标 URL 形如 https://cdn.simpleicons.org/{slug}/{color}。
   */
  skills: [
    { name: 'JavaScript', slug: 'javascript', level: 85, color: '#F7DF1E' },
    { name: 'TypeScript', slug: 'typescript', level: 70, color: '#3178C6' },
    { name: 'Python', slug: 'python', level: 75, color: '#3776AB' },
    { name: 'Vue', slug: 'vuedotjs', level: 70, color: '#4FC08D' },
    { name: 'React', slug: 'react', level: 60, color: '#61DAFB' },
    { name: 'Node.js', slug: 'nodedotjs', level: 70, color: '#5FA04E' },
    { name: 'Linux', slug: 'linux', level: 80, color: '#FCC624' },
    { name: 'Docker', slug: 'docker', level: 60, color: '#2496ED' },
    { name: 'Git', slug: 'git', level: 85, color: '#F05032' },
    { name: 'HTML5', slug: 'html5', level: 90, color: '#E34F26' },
    { name: 'CSS3', slug: 'css', level: 85, color: '#1572B6' },
    { name: 'MySQL', slug: 'mysql', level: 60, color: '#4479A1' },
  ],

  /** 打字机文案：按时间段分组，每条为片段数组，hl 表示高亮。 */
  typewriter: {
    segments: [
      {
        start: 5,
        end: 11,
        phrases: [
          [{ text: 'Good morning, I am ', hl: false }, { text: 'KD_klin', hl: true }],
          [{ text: '早上好，我是 ', hl: false }, { text: 'KD_klin', hl: true }],
        ],
      },
      {
        start: 11,
        end: 18,
        phrases: [
          [{ text: "Hello, I'm ", hl: false }, { text: 'KD_klin', hl: true }],
          [{ text: '你好，我是 ', hl: false }, { text: 'KD_klin', hl: true }],
        ],
      },
      {
        start: 18,
        end: 23,
        phrases: [
          [{ text: 'Good evening, I am ', hl: false }, { text: 'KD_klin', hl: true }],
          [{ text: '晚上好，我是 ', hl: false }, { text: 'KD_klin', hl: true }],
        ],
      },
      {
        start: 23,
        end: 5,
        phrases: [
          [{ text: '还在熬夜吗？我是 ', hl: false }, { text: 'KD_klin', hl: true }],
          [{ text: 'Still awake? I am ', hl: false }, { text: 'KD_klin', hl: true }],
        ],
      },
    ],
  },

  /** 背景模式：glow（鼠标光效）/ particles（粒子）/ none（无动效）。 */
  background: {
    default: 'glow',
    modes: ['glow', 'particles', 'none'],
  },
};