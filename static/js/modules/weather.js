/**
 * @fileoverview 沉浸式天气小组件。
 * @description 数据来自 uapis.cn，按天气现象与时段生成渐变主题、图标、
 *     粒子效果，并展示 AQI 与气象预警；结果按 refreshInterval 缓存。
 */
(function () {
  'use strict';

  const CACHE_KEY = 'KD_weather_cache';
  const API_URL = 'https://uapis.cn/api/v1/misc/weather';
  const METEOCONS_CDN =
    'https://cdn.jsdelivr.net/npm/@meteocons/svg@0.1.0/fill/';
  const DEFAULT_TIMEOUT = 10000;
  const DEFAULT_REFRESH = 1800000;
  const NIGHT_START = 18;
  const NIGHT_END = 6;

  // 按顺序做「包含匹配」，因此更具体的天气现象要排在前面。
  const ICON_RULES = [
    ['雷阵雨', 'thunderstorms-rain'],
    ['雨夹雪', 'sleet'],
    ['强沙尘暴', 'dust'],
    ['沙尘暴', 'dust'],
    ['暴雨', 'extreme-rain'],
    ['大雨', 'extreme-rain'],
    ['中雨', 'rain'],
    ['小雨', 'rain'],
    ['大雪', 'extreme-snow'],
    ['中雪', 'snow'],
    ['小雪', 'snow'],
    ['晴', 'clear'],
    ['多云', 'partly-cloudy'],
    ['阴', 'overcast'],
    ['雾', 'fog'],
    ['霾', 'fog'],
    ['沙尘', 'dust'],
  ];

  // 夜间需要换用的图标名。
  const NIGHT_ICON = {
    clear: 'clear-night',
    'partly-cloudy': 'partly-cloudy-night',
    overcast: 'overcast-day',
  };

  /**
   * 拼装三段式线性渐变，便于复用与保持行宽。
   * @param {string} angle 渐变角度。
   * @param {string} from 起始色。
   * @param {string} mid 中间色。
   * @param {string} to 结束色。
   * @return {string} linear-gradient 值。
   */
  function gradient(angle, from, mid, to) {
    return (
      'linear-gradient(' +
      angle +
      ', ' +
      from +
      ' 0%, ' +
      mid +
      ' 50%, ' +
      to +
      ' 100%)'
    );
  }

  const SKY = {
    clearDay: {
      gradient: gradient('#135deg', '#56ccf2', '#2f80ed', '#1a5276'),
      accent: '#fff',
      glow: 'rgba(255,255,255,0.2)',
    },
    clearDusk: {
      gradient:
        'linear-gradient(135deg, #f5af19 0%, #f12711 50%, #7b2d8e 100%)',
      accent: '#ffeaa7',
      glow: 'rgba(255,234,167,0.25)',
    },
    clearNight: {
      gradient: gradient('#135deg', '#1a1a3e', '#2d2b55', '#1e3a5f'),
      accent: '#a8c8ff',
      glow: 'rgba(168,200,255,0.2)',
    },
    cloudyDay: {
      gradient: gradient('#135deg', '#89f7fe', '#66a6ff', '#4a6fa5'),
      accent: '#fff',
      glow: 'rgba(255,255,255,0.18)',
    },
    cloudyNight: {
      gradient: gradient('#135deg', '#232526', '#414345', '#2c3e50'),
      accent: '#b0bec5',
      glow: 'rgba(176,190,197,0.15)',
    },
    overcast: {
      gradient: gradient('#135deg', '#4b6cb7', '#3a4a6b', '#2c3e50'),
      accent: '#cfd8dc',
      glow: 'rgba(207,216,220,0.12)',
    },
    rain: {
      gradient: gradient('#135deg', '#1a2a6c', '#2a3f5f', '#0f2027'),
      accent: '#90caf9',
      glow: 'rgba(144,202,249,0.2)',
    },
    snow: {
      gradient: gradient('#135deg', '#e0eafc', '#a8c0d8', '#7b9cb8'),
      accent: '#fff',
      glow: 'rgba(255,255,255,0.3)',
    },
    haze: {
      gradient: gradient('#135deg', '#606c88', '#3f4c6b', '#2c3e50'),
      accent: '#d1d8e0',
      glow: 'rgba(209,216,224,0.15)',
    },
    dust: {
      gradient: gradient('#135deg', '#b79891', '#94716b', '#5d4037'),
      accent: '#ffccbc',
      glow: 'rgba(255,204,188,0.2)',
    },
    fallback: {
      gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
      accent: '#cfd8dc',
      glow: 'rgba(207,216,220,0.12)',
    },
  };

  const AQI_COLORS = {
    1: '#00e400',
    2: '#ff0',
    3: '#ff7e00',
    4: '#f00',
    5: '#99004c',
    6: '#7e0023',
  };

  /**
   * 当前是否为夜间。
   * @return {boolean} 夜间返回 true。
   */
  function isNight() {
    const hour = new Date().getHours();
    return hour < NIGHT_END || hour >= NIGHT_START;
  }

  /**
   * 依据天气文案与时段挑选渐变主题。
   * @param {string} text 天气文案。
   * @return {{gradient: string, accent: string, glow: string}} 主题。
   */
  function getWeatherTheme(text) {
    const value = text || '';
    const hour = new Date().getHours();
    const dusk = hour >= 17 && hour < 19;

    if (value.indexOf('晴') !== -1) {
      if (isNight()) return SKY.clearNight;
      return dusk ? SKY.clearDusk : SKY.clearDay;
    }
    if (value.indexOf('多云') !== -1) {
      return isNight() ? SKY.cloudyNight : SKY.cloudyDay;
    }
    if (value.indexOf('阴') !== -1) return SKY.overcast;
    if (value.indexOf('雨') !== -1 || value.indexOf('雷') !== -1) {
      return SKY.rain;
    }
    if (value.indexOf('雪') !== -1) return SKY.snow;
    if (value.indexOf('雾') !== -1 || value.indexOf('霾') !== -1) {
      return SKY.haze;
    }
    if (value.indexOf('沙尘') !== -1) return SKY.dust;
    return SKY.fallback;
  }

  /**
   * 依据天气文案挑选 Meteocons 图标。
   * @param {string} text 天气文案。
   * @return {string} 图标 URL。
   */
  function getWeatherIconUrl(text) {
    const value = text || '';
    let base = 'clear';
    for (let i = 0; i < ICON_RULES.length; i++) {
      if (value.indexOf(ICON_RULES[i][0]) !== -1) {
        base = ICON_RULES[i][1];
        break;
      }
    }
    if (isNight() && NIGHT_ICON[base]) base = NIGHT_ICON[base];
    return METEOCONS_CDN + base + '.svg';
  }

  /**
   * 依据天气文案挑选粒子效果类名。
   * @param {string} text 天气文案。
   * @return {string} 效果类名，无效果时为空串。
   */
  function getWeatherEffect(text) {
    const value = text || '';
    if (value.indexOf('雨') !== -1 || value.indexOf('雷') !== -1) {
      return 'effect-rain';
    }
    if (value.indexOf('雪') !== -1) return 'effect-snow';
    if (value.indexOf('晴') !== -1) return 'effect-sunny';
    return '';
  }

  /**
   * 依据配置拼接请求地址。
   * @return {string} 完整请求 URL。
   */
  function buildWeatherUrl() {
    const config = CFG.weather || {};
    const params = new URLSearchParams();
    if (config.adcode) params.set('adcode', config.adcode);
    else if (config.city) params.set('city', config.city);
    if (config.lang) params.set('lang', config.lang);
    if (config.extended) params.set('extended', 'true');
    if (config.forecast) params.set('forecast', 'true');
    if (config.hourly) params.set('hourly', 'true');
    if (config.minutely) params.set('minutely', 'true');
    if (config.indices) params.set('indices', 'true');
    const query = params.toString();
    return API_URL + (query ? '?' + query : '');
  }

  /**
   * 带超时与错误码解析的天气请求。
   * @param {string} url 请求地址。
   * @param {!Object} headers 附加请求头。
   * @param {number} timeout 超时毫秒数。
   * @return {!Promise<!Object>} 解析后的响应体。
   */
  function requestWeather(url, headers, timeout) {
    return new Promise(function (resolve, reject) {
      const controller = new AbortController();
      const timer = setTimeout(function () {
        controller.abort();
      }, timeout);

      fetch(url, {headers: headers, signal: controller.signal})
        .then(function (response) {
          clearTimeout(timer);
          if (response.ok) return response.json();
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (body) {
              const error = new Error(
                body.message || 'HTTP ' + response.status,
              );
              error.code = body.code || 'HTTP_' + response.status;
              error.status = response.status;
              throw error;
            });
        })
        .then(resolve)
        .catch(function (error) {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 把错误对象翻译成用户可读文案。
   * @param {!Object} error 错误对象。
   * @return {string} 提示文案。
   */
  function describeError(error) {
    if (error.name === 'AbortError') return '请求超时';
    if (error.status === 401 || error.status === 403) return '密钥无效或未配置';
    if (error.status === 429) return '请求过于频繁';
    const byCode = {
      NOT_FOUND: '未找到该城市',
      INVALID_PARAMETER: '参数无效',
      SERVICE_UNAVAILABLE: '服务暂不可用',
      INTERNAL_SERVER_ERROR: '服务器错误',
    };
    return byCode[error.code] || error.message || '天气加载失败';
  }

  /**
   * 组装天气卡片的 HTML。
   * @param {!Object} data 天气接口数据。
   * @return {string} 卡片 HTML。
   */
  function buildWeatherHtml(data) {
    const escape = window.escapeHtml;
    const city = data.city || data.district || data.province || '未知';
    const district =
      data.district && data.city && data.district !== data.city
        ? data.district
        : '';
    const temperature =
      typeof data.temperature === 'number'
        ? Math.round(data.temperature)
        : '--';
    const weatherText = data.weather || '--';

    const meta = [];
    if (data.wind_direction) {
      meta.push(
        escape(data.wind_direction) +
          (data.wind_power ? ' ' + escape(data.wind_power) : ''),
      );
    }
    if (typeof data.humidity === 'number') {
      meta.push('湿度 ' + data.humidity + '%');
    }
    if (typeof data.feels_like === 'number') {
      meta.push('体感 ' + Math.round(data.feels_like) + '°');
    }

    const atmosphere = [];
    if (typeof data.pressure === 'number') {
      atmosphere.push(data.pressure + ' hPa');
    }
    if (typeof data.visibility === 'number') {
      atmosphere.push('能见 ' + data.visibility + ' km');
    }
    if (typeof data.uv === 'number') atmosphere.push('UV ' + data.uv);

    let html =
      '<div class="weather-icon-wrap">' +
      '<img class="weather-icon" src="' +
      getWeatherIconUrl(data.weather) +
      '" alt="' +
      escape(weatherText) +
      '" loading="lazy" />' +
      '<div class="weather-icon-glow"></div></div>' +
      '<div class="weather-info"><div class="weather-city-row">' +
      '<span class="weather-city">' +
      escape(city) +
      '</span>' +
      (district
        ? '<span class="weather-district">' + escape(district) + '</span>'
        : '') +
      '</div><div class="weather-temp-row"><span class="weather-temp">' +
      temperature +
      '</span><span class="weather-temp-unit">°C</span></div>' +
      '<div class="weather-desc">' +
      escape(weatherText) +
      '</div></div>' +
      '<div class="weather-meta">' +
      meta.join(' · ') +
      '</div>';

    if (atmosphere.length) {
      html +=
        '<div class="weather-atmos">' +
        atmosphere.join(' &nbsp;·&nbsp; ') +
        '</div>';
    }
    if (typeof data.aqi === 'number') {
      const color = AQI_COLORS[data.aqi_level] || '#8b8b8b';
      html +=
        '<div class="weather-aqi"><span class="weather-aqi-dot" ' +
        'style="background:' +
        color +
        '"></span>空气 ' +
        escape(data.aqi_category || '--') +
        ' · AQI ' +
        data.aqi +
        '</div>';
    }
    if (data.alerts && data.alerts.length) {
      const alert = data.alerts[0];
      html +=
        '<div class="weather-alert">⚠️ ' +
        escape(alert.title || alert.type || '气象预警') +
        '</div>';
    }
    return html + '<div class="weather-particles" aria-hidden="true"></div>';
  }

  /**
   * 渲染天气数据到小组件。
   * @param {!Object} data 天气接口数据。
   * @param {!HTMLElement} widget 小组件根元素。
   * @return {void}
   */
  function renderWeather(data, widget) {
    const loadingEl = widget.querySelector('.weather-loading');
    const contentEl = widget.querySelector('.weather-content');
    const errorEl = widget.querySelector('.weather-error');
    if (!contentEl) return;

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    contentEl.style.display = 'block';

    const theme = getWeatherTheme(data.weather);
    contentEl.style.background = theme.gradient;
    contentEl.style.setProperty('--weather-accent', theme.accent);
    contentEl.style.setProperty('--weather-glow', theme.glow);
    contentEl.className =
      'weather-content immersive ' + getWeatherEffect(data.weather);
    contentEl.innerHTML = buildWeatherHtml(data);
  }

  /**
   * 加载天气数据，默认优先使用未过期的会话缓存。
   * @param {boolean=} opt_force 为 true 时跳过缓存。
   * @return {void}
   */
  function loadWeatherData(opt_force) {
    const config = CFG.weather || {};
    if (config.enabled === false) return;

    const widget = document.getElementById('weather-widget');
    if (!widget) return;
    const loadingEl = widget.querySelector('.weather-loading');
    const contentEl = widget.querySelector('.weather-content');
    const errorEl = widget.querySelector('.weather-error');
    if (!loadingEl || !contentEl || !errorEl) return;

    if (!opt_force) {
      const cached = window.KD_STORAGE.readSessionJson(
        CACHE_KEY,
        config.refreshInterval || DEFAULT_REFRESH,
      );
      if (cached) {
        renderWeather(cached, widget);
        return;
      }
    }

    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';

    const headers = {};
    if (config.apiKey && config.apiKey.indexOf('uapi-') === 0) {
      headers['Authorization'] = 'Bearer ' + config.apiKey;
    }

    requestWeather(
      buildWeatherUrl(),
      headers,
      config.timeout || DEFAULT_TIMEOUT,
    )
      .then(function (data) {
        window.KD_STORAGE.writeSessionJson(CACHE_KEY, data);
        renderWeather(data, widget);
      })
      .catch(function (error) {
        console.error('[Weather] 加载失败:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
        const messageEl = errorEl.querySelector('.weather-error-msg');
        if (messageEl) messageEl.textContent = describeError(error);
      });
  }

  window.WEATHER_CACHE_KEY = CACHE_KEY;
  window.loadWeatherData = loadWeatherData;

  let refreshTimer = null;

  /**
   * 初始化天气小组件：首次加载、重试按钮与定时刷新。
   * @return {void}
   */
  window.initWeatherWidget = function () {
    const config = CFG.weather || {};
    if (config.enabled === false) return;
    if (!document.getElementById('weather-widget')) return;

    loadWeatherData(false);

    const retryBtn = document.getElementById('weather-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        window.KD_STORAGE.clearSession(CACHE_KEY);
        loadWeatherData(true);
      });
    }

    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(function () {
      if (!document.hidden) loadWeatherData(true);
    }, config.refreshInterval || DEFAULT_REFRESH);
  };
})();
