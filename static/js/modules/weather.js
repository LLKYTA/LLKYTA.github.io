/**
 * @fileoverview 沉浸式天气小组件模块。
 */
(function() {
  'use strict';

  const WEATHER_CACHE_KEY = 'KD_weather_cache';
  const WEATHER_API_URL = 'https://uapis.cn/api/v1/misc/weather';
  const METEOCONS_CDN = 'https://cdn.jsdelivr.net/npm/@meteocons/svg@0.1.0/fill/';
  const WEATHER_ICON_MAP = [
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
  const AQI_COLORS = {
    1: '#00e400',
    2: '#ffff00',
    3: '#ff7e00',
    4: '#ff0000',
    5: '#99004c',
    6: '#7e0023',
  };

  function getWeatherIconUrl(text) {
    if (!text) return METEOCONS_CDN + 'clear-day.svg';
    let baseName = 'clear-day';
    for (let i = 0; i < WEATHER_ICON_MAP.length; i++) {
      if (text.indexOf(WEATHER_ICON_MAP[i][0]) !== -1) {
        baseName = WEATHER_ICON_MAP[i][1];
        break;
      }
    }
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    if (baseName === 'clear') baseName = isNight ? 'clear-night' : 'clear-day';
    else if (baseName === 'partly-cloudy') {
      baseName = isNight ? 'partly-cloudy-night' : 'partly-cloudy-day';
    } else if (baseName === 'overcast') baseName = 'overcast-day';
    return METEOCONS_CDN + baseName + '.svg';
  }
  function getWeatherTheme(weatherText) {
    const t = weatherText || '';
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    const isDusk = hour >= 17 && hour < 19;
    if (t.indexOf('晴') !== -1) {
      return isNight ?
        {
          gradient: 'linear-gradient(135deg, #1a1a3e 0%, #2d2b55 50%, #1e3a5f 100%)',
          accent: '#a8c8ff',
          glow: 'rgba(168,200,255,0.2)',
        } :
        isDusk ?
          {
            gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 50%, #7b2d8e 100%)',
            accent: '#ffeaa7',
            glow: 'rgba(255,234,167,0.25)',
          } :
          {
            gradient: 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 50%, #1a5276 100%)',
            accent: '#ffffff',
            glow: 'rgba(255,255,255,0.2)',
          };
    }
    if (t.indexOf('多云') !== -1) {
      return isNight ?
        {
          gradient: 'linear-gradient(135deg, #232526 0%, #414345 50%, #2c3e50 100%)',
          accent: '#b0bec5',
          glow: 'rgba(176,190,197,0.15)',
        } :
        {
          gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 40%, #4a6fa5 100%)',
          accent: '#ffffff',
          glow: 'rgba(255,255,255,0.18)',
        };
    }
    if (t.indexOf('阴') !== -1) {
      return {
        gradient: 'linear-gradient(135deg, #4b6cb7 0%, #3a4a6b 50%, #2c3e50 100%)',
        accent: '#cfd8dc',
        glow: 'rgba(207,216,220,0.12)',
      };
    }
    if (t.indexOf('雨') !== -1 || t.indexOf('雷') !== -1) {
      return {
        gradient: 'linear-gradient(135deg, #1a2a6c 0%, #2a3f5f 40%, #0f2027 100%)',
        accent: '#90caf9',
        glow: 'rgba(144,202,249,0.2)',
      };
    }
    if (t.indexOf('雪') !== -1) {
      return {
        gradient: 'linear-gradient(135deg, #e0eafc 0%, #a8c0d8 40%, #7b9cb8 100%)',
        accent: '#ffffff',
        glow: 'rgba(255,255,255,0.3)',
      };
    }
    if (t.indexOf('雾') !== -1 || t.indexOf('霾') !== -1) {
      return {
        gradient: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 50%, #2c3e50 100%)',
        accent: '#d1d8e0',
        glow: 'rgba(209,216,224,0.15)',
      };
    }
    if (t.indexOf('沙尘') !== -1) {
      return {
        gradient: 'linear-gradient(135deg, #b79891 0%, #94716b 50%, #5d4037 100%)',
        accent: '#ffccbc',
        glow: 'rgba(255,204,188,0.2)',
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
      accent: '#cfd8dc',
      glow: 'rgba(207,216,220,0.12)',
    };
  }
  function getWeatherEffect(weatherText) {
    const t = weatherText || '';
    if (t.indexOf('雨') !== -1 || t.indexOf('雷') !== -1) return 'effect-rain';
    if (t.indexOf('雪') !== -1) return 'effect-snow';
    if (t.indexOf('晴') !== -1) return 'effect-sunny';
    return '';
  }
  function buildWeatherUrl() {
    const cfg = CFG.weather || {};
    const params = new URLSearchParams();
    if (cfg.adcode) params.set('adcode', cfg.adcode);
    else if (cfg.city) params.set('city', cfg.city);
    if (cfg.lang) params.set('lang', cfg.lang);
    if (cfg.extended) params.set('extended', 'true');
    if (cfg.forecast) params.set('forecast', 'true');
    if (cfg.hourly) params.set('hourly', 'true');
    if (cfg.minutely) params.set('minutely', 'true');
    if (cfg.indices) params.set('indices', 'true');
    const qs = params.toString();
    return WEATHER_API_URL + (qs ? '?' + qs : '');
  }
  function requestWeather(url, headers, timeout) {
    return new Promise(function(resolve, reject) {
      const controller = new AbortController();
      const timer = setTimeout(function() {
        controller.abort();
      }, timeout);
      fetch(url, {headers: headers, signal: controller.signal})
          .then(function(res) {
            clearTimeout(timer);
            if (!res.ok) {
              return res
                  .json()
                  .catch(function() {
                    return {};
                  })
                  .then(function(body) {
                    const err = new Error(body.message || 'HTTP ' + res.status);
                    err.code = body.code || 'HTTP_' + res.status;
                    err.status = res.status;
                    throw err;
                  });
            }
            return res.json();
          })
          .then(resolve)
          .catch(function(err) {
            clearTimeout(timer);
            reject(err);
          });
    });
  }
  function loadWeatherData(forceRefresh) {
    const cfg = CFG.weather || {};
    if (!cfg.enabled) return;
    const widget = document.getElementById('weatherWidget');
    if (!widget) return;
    const loadingEl = widget.querySelector('.weather-loading');
    const contentEl = widget.querySelector('.weather-content');
    const errorEl = widget.querySelector('.weather-error');
    if (!loadingEl || !contentEl || !errorEl) return;

    if (!forceRefresh) {
      const cached = sessionStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const ttl = cfg.refreshInterval || 1800000;
          if (parsed && parsed.data && Date.now() - parsed.ts < ttl) {
            renderWeather(parsed.data, widget);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem(WEATHER_CACHE_KEY);
        }
      }
    }
    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';

    const headers = {};
    if (cfg.apiKey && cfg.apiKey.indexOf('uapi-') === 0) {
      headers['Authorization'] = 'Bearer ' + cfg.apiKey;
    }
    requestWeather(buildWeatherUrl(), headers, cfg.timeout || 10000)
        .then(function(data) {
          sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({data: data, ts: Date.now()}));
          renderWeather(data, widget);
        })
        .catch(function(err) {
          console.error('[Weather] 加载失败:', err);
          loadingEl.style.display = 'none';
          errorEl.style.display = 'flex';
          const msgEl = errorEl.querySelector('.weather-error-msg');
          if (!msgEl) return;
          let msg = '天气加载失败';
          if (err.name === 'AbortError') msg = '请求超时';
          else if (err.status === 401 || err.status === 403) msg = '密钥无效或未配置';
          else if (err.status === 429) msg = '请求过于频繁';
          else if (err.code === 'NOT_FOUND') msg = '未找到该城市';
          else if (err.code === 'INVALID_PARAMETER') msg = '参数无效';
          else if (err.code === 'SERVICE_UNAVAILABLE') msg = '服务暂不可用';
          else if (err.code === 'INTERNAL_SERVER_ERROR') msg = '服务器错误';
          else if (err.message) msg = err.message;
          msgEl.textContent = msg;
        });
  }
  function renderWeather(data, widget) {
    const loadingEl = widget.querySelector('.weather-loading');
    const contentEl = widget.querySelector('.weather-content');
    const errorEl = widget.querySelector('.weather-error');
    if (!contentEl) return;
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'block';

    const weatherText = data.weather || '';
    const theme = getWeatherTheme(weatherText);
    const iconUrl = getWeatherIconUrl(weatherText);
    const effect = getWeatherEffect(weatherText);

    contentEl.style.background = theme.gradient;
    contentEl.style.setProperty('--weather-accent', theme.accent);
    contentEl.style.setProperty('--weather-glow', theme.glow);
    contentEl.className = 'weather-content immersive ' + effect;

    const cityName = data.city || data.district || data.province || '未知';
    const subName = data.district && data.city && data.district !== data.city ? data.district : '';
    const temp = typeof data.temperature === 'number' ? Math.round(data.temperature) : '--';
    const metaParts = [];
    if (data.wind_direction) {
      metaParts.push(
          window.escapeHtml(data.wind_direction) +
          (data.wind_power ? ' ' + window.escapeHtml(data.wind_power) : ''),
      );
    }
    if (typeof data.humidity === 'number') metaParts.push('湿度 ' + data.humidity + '%');
    if (typeof data.feels_like === 'number') {
      metaParts.push('体感 ' + Math.round(data.feels_like) + '°');
    }
    const atmosParts = [];
    if (typeof data.pressure === 'number') atmosParts.push(data.pressure + ' hPa');
    if (typeof data.visibility === 'number') atmosParts.push('能见 ' + data.visibility + ' km');
    if (typeof data.uv === 'number') atmosParts.push('UV ' + data.uv);

    let html =
      '<div class="weather-icon-wrap">' +
      '<img class="weather-icon" src="' +
      iconUrl +
      '" alt="' +
      window.escapeHtml(weatherText) +
      '" loading="lazy" />' +
      '<div class="weather-icon-glow"></div></div>' +
      '<div class="weather-info"><div class="weather-city-row">' +
      '<span class="weather-city">' +
      window.escapeHtml(cityName) +
      '</span>' +
      (subName ? '<span class="weather-district">' + window.escapeHtml(subName) + '</span>' : '') +
      '</div><div class="weather-temp-row"><span class="weather-temp">' +
      temp +
      '</span>' +
      '<span class="weather-temp-unit">°C</span></div>' +
      '<div class="weather-desc">' +
      window.escapeHtml(weatherText || '--') +
      '</div></div>' +
      '<div class="weather-meta">' +
      metaParts.join(' · ') +
      '</div>';

    if (atmosParts.length) {
      html += '<div class="weather-atmos">' + atmosParts.join(' &nbsp;·&nbsp; ') + '</div>';
    }
    if (typeof data.aqi === 'number') {
      const color = AQI_COLORS[data.aqi_level] || '#8b8b8b';
      html +=
        '<div class="weather-aqi"><span class="weather-aqi-dot" style="background:' +
        color +
        '"></span>空气 ' +
        window.escapeHtml(data.aqi_category || '--') +
        ' · AQI ' +
        data.aqi +
        '</div>';
    }
    if (data.alerts && data.alerts.length) {
      const alertTitle = data.alerts[0].title || data.alerts[0].type || '气象预警';
      html += '<div class="weather-alert">⚠️ ' + window.escapeHtml(alertTitle) + '</div>';
    }
    html += '<div class="weather-particles" aria-hidden="true"></div>';
    contentEl.innerHTML = html;
  }

  window.WEATHER_CACHE_KEY = WEATHER_CACHE_KEY;
  window.loadWeatherData = loadWeatherData;

  let weatherTimer = null;
  window.initWeatherWidget = function() {
    const cfg = CFG.weather || {};
    if (!cfg.enabled) return;
    const widget = document.getElementById('weatherWidget');
    if (!widget) return;
    loadWeatherData(false);
    const retryBtn = document.getElementById('weatherRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        sessionStorage.removeItem(WEATHER_CACHE_KEY);
        loadWeatherData(true);
      });
    }
    const interval = cfg.refreshInterval || 1800000;
    if (weatherTimer) clearInterval(weatherTimer);
    weatherTimer = setInterval(function() {
      if (!document.hidden) loadWeatherData(true);
    }, interval);
  };
})();
