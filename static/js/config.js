/**
 * @fileoverview KD_klin 站点配置文件。所有可自定义内容集中在此。
 */
window.KD_CONFIG = {
  site: {
    name: 'KD_klin',
    url: 'https://kd.of.cd',
    startDate: '2026-01-01T00:00:00',
    ogImage: './static/img/og-cover.png',
    description: '整天半吊子和不学无术的坏孩子，梦想成为庄稼地里的读书人。',
  },

  profile: {
    name: 'KD_klin',
    location: 'China-HuHot',
    status: '高中在读',
    tags: [
      'Indie Hacker',
      'Full-Stack',
      'Open Sourcer',
      'Linux',
      'Self-Hosted',
      'Runner',
      'Cyclist',
      'Badminton',
    ],
  },

  socials: {
    github: {url: 'https://github.com/LLKYTA', label: 'GitHub'},
    email: '010107lys@163.com',
    qq: {image: './static/img/qq.jpg'},
  },

  weather: {
    enabled: true,
    apiKey: '',
    city: '',
    adcode: '',
    lang: 'zh',
    extended: true,
    forecast: false,
    hourly: false,
    minutely: false,
    indices: false,
    refreshInterval: 30 * 60 * 1000,
    timeout: 10000,
  },

  github: {
    username: 'LLKYTA',
    api:
      'https://uapis.cn/api/v1/github/user?user=LLKYTA' +
      '&activity=true&activity_scope=all&pinned=true&repos=true&repos_limit=6',
  },

  music: {
    enabled: true,
    autoplay: true,
    volume: 0.7,
    mode: 'list',
    persist: true,
    playlist: [
      {src: './static/music/失眠.mp3', title: '失眠', artist: '', cover: ''},
    ],
  },

  timeline: [
    {
      ver: 'v1.2',
      title: '内容扩展',
      date: '2026.09',
      desc: '接入 GitHub 动态与音乐播放器',
    },
    {
      ver: 'v1.1',
      title: '域名迁移',
      date: '2026.02',
      desc: '正式迁移至 KD.of.cd',
    },
    {
      ver: 'v1.0',
      title: '主题重构',
      date: '2026.01',
      desc: '基于 CSS 变量重写主题系统',
    },
    {
      ver: 'v0.1',
      title: '首次上线',
      date: '2026.01',
      desc: '完成基础框架与个人信息展示',
    },
  ],

  skills: [
    {name: 'JavaScript', slug: 'javascript', level: 85, color: '#f7df1e'},
    {name: 'TypeScript', slug: 'typescript', level: 70, color: '#3178c6'},
    {name: 'Python', slug: 'python', level: 75, color: '#3776ab'},
    {name: 'Vue', slug: 'vuedotjs', level: 70, color: '#4fc08d'},
    {name: 'React', slug: 'react', level: 60, color: '#61dafb'},
    {name: 'Node.js', slug: 'nodedotjs', level: 70, color: '#5fa04e'},
    {name: 'Linux', slug: 'linux', level: 80, color: '#fcc624'},
    {name: 'Docker', slug: 'docker', level: 60, color: '#2496ed'},
    {name: 'Git', slug: 'git', level: 85, color: '#f05032'},
    {name: 'HTML5', slug: 'html5', level: 90, color: '#e34f26'},
    {name: 'CSS3', slug: 'css', level: 85, color: '#1572b6'},
    {name: 'MySQL', slug: 'mysql', level: 60, color: '#4479a1'},
  ],

  typewriter: {
    segments: [
      {
        start: 5,
        end: 11,
        phrases: [
          [
            {text: 'Good morning, I am ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
          [
            {text: '早上好，我是 ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
        ],
      },
      {
        start: 11,
        end: 18,
        phrases: [
          [
            {text: "Hello, I'm ", hl: false},
            {text: 'KD_klin', hl: true},
          ],
          [
            {text: '你好，我是 ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
        ],
      },
      {
        start: 18,
        end: 23,
        phrases: [
          [
            {text: 'Good evening, I am ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
          [
            {text: '晚上好，我是 ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
        ],
      },
      {
        start: 23,
        end: 5,
        phrases: [
          [
            {text: '还在熬夜吗？我是 ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
          [
            {text: 'Still awake? I am ', hl: false},
            {text: 'KD_klin', hl: true},
          ],
        ],
      },
    ],
  },

  background: {
    default: 'particles',
    modes: ['glow', 'particles', 'none'],
    three: {
      particleCount: 2000,
      particleColor: '#747bff',
      particleSize: 2,
      connectionDistance: 120,
      connectionOpacity: 0.12,
      mouseMode: 'attract', // ← 新增：attract | repel | off
      mouseRadius: 250, // ← 从 150 改大，作用范围更明显
      mouseStrength: 0.003,
      cameraZ: 400,
      autoRotate: true,
    },
  },
};
