/**
 * @fileoverview UAPI（uapis.cn）接口客户端。
 * @description 统一处理鉴权、参数校验、超时、限流重试与错误码解析，
 *     让各业务模块只关心「调用哪个接口 + 怎么渲染」。
 *
 * 依据文档：https://uapis.cn/docs/api-reference/get-github-user
 * 错误码与限流规则：https://uapis.cn/docs-md/api-reference/faq
 */
(function () {
  'use strict';

  const BASE_URL = 'https://uapis.cn/api/v1';
  const API_KEY_PREFIX = 'uapi-';
  const DEFAULT_TIMEOUT = 10000;
  const DEFAULT_RETRIES = 2;
  /** 退避基数（毫秒），按照 500ms、1s、2s 递增。 */
  const BACKOFF_BASE = 500;

  /**
   * 读取 API Key：优先运行时注入，其次配置，最后本地调试存储。
   * @description 静态站点无法读取「环境变量」，因此约定构建/部署时通过
   *     `window.__UAPI_KEY__` 或 `KD_CONFIG.uapi.apiKey` 注入。
   * @return {string} Key，未配置时为空串。
   */
  function readApiKey() {
    const injected = window.__UAPI_KEY__;
    if (typeof injected === 'string' && injected) return injected;
    const config = window.KD_CONFIG || {};
    const fromConfig = config.uapi && config.uapi.apiKey;
    if (typeof fromConfig === 'string' && fromConfig) return fromConfig;
    // 仅用于本地调试：控制台执行
    // localStorage.setItem('KD_uapiKey', 'uapi-xxxx')
    const stored = window.KD_STORAGE.read('KD_uapi_key', '');
    return typeof stored === 'string' ? stored : '';
  }

  /**
   * 当前是否已配置 API Key。
   * @return {boolean} 已配置返回 true。
   */
  function hasApiKey() {
    return readApiKey().indexOf(API_KEY_PREFIX) === 0;
  }

  /**
   * 构造 UAPI 错误对象。
   * @param {string} code 错误码。
   * @param {string} message 面向用户的错误说明。
   * @param {!Object=} opt_extra 附加信息（status / requestId / retryable）。
   * @return {!Error} 带结构化字段的错误对象。
   */
  function createError(code, message, opt_extra) {
    const error = new Error(message);
    error.code = code;
    const extra = opt_extra || {};
    error.status = extra.status || 0;
    error.requestId = extra.requestId || '';
    error.retryable = Boolean(extra.retryable);
    return error;
  }

  /**
   * 从任意错误响应体中解析出错误码与说明。
   * @description 文档 FAQ Q32 指出错误结构并不统一，需要按以下顺序兼容：
   *     1. `{code: string, message}`；
   *     2. `{error: string, details}`；
   *     3. 限流类 `{code: number, message, limit}`；
   *     4. 积分不足 `{error, message, docs}`。
   * @param {*} body 已解析的响应体。
   * @param {number} status HTTP 状态码。
   * @return {{code: string, message: string}} 归一化后的错误信息。
   */
  function parseErrorBody(body, status) {
    const data = body && typeof body === 'object' ? body : {};

    let code = '';
    if (typeof data.code === 'string' && data.code) code = data.code;
    else if (typeof data.error === 'string' && data.error) code = data.error;
    else if (typeof data.code === 'number') code = String(data.code);

    let message = '';
    if (typeof data.message === 'string' && data.message) {
      message = data.message;
    } else if (typeof data.error === 'string' && data.error) {
      // 简化结构里 error 本身是错误码，此时优先用 details 作为说明。
      message =
        typeof data.details === 'string' && data.details
          ? data.details
          : data.error;
    } else if (typeof data.details === 'string' && data.details) {
      message = data.details;
    }

    if (!code) code = 'HTTP_' + status;
    if (!message) message = 'HTTP ' + status;
    return {code: code, message: message};
  }

  /**
   * 判断某个失败是否值得重试。
   * @description 依据 FAQ Q36：429、408、5xx 以及网络/超时类错误可重试；
   *     400、401、402、403、404 等客户端错误重试也不会成功。
   * @param {!Error} error 错误对象。
   * @return {boolean} 可重试返回 true。
   */
  function isRetryable(error) {
    if (error.retryable) return true;
    const status = error.status;
    if (status === 408 || status === 429) return true;
    if (status >= 500 && status <= 599) return true;
    return false;
  }

  /**
   * 按 `Retry-After` 或指数退避计算等待时间。
   * @param {number} attempt 第几次尝试（从 0 开始）。
   * @param {?number} retryAfterSeconds 响应头中的 Retry-After（秒）。
   * @return {number} 等待毫秒数。
   */
  function backoffDelay(attempt, retryAfterSeconds) {
    if (typeof retryAfterSeconds === 'number' && retryAfterSeconds >= 0) {
      return retryAfterSeconds * 1000;
    }
    return BACKOFF_BASE * Math.pow(2, attempt);
  }

  /**
   * 读取响应头中的 Retry-After（秒）。
   * @param {!Headers} headers 响应头。
   * @return {?number} 秒数，没有该头时返回 null。
   */
  function readRetryAfter(headers) {
    if (!headers || typeof headers.get !== 'function') return null;
    const raw = headers.get('Retry-After');
    if (!raw) return null;
    const seconds = Number(raw);
    return isFinite(seconds) ? seconds : null;
  }

  /**
   * 读取排查用的请求 ID。
   * @param {!Headers} headers 响应头。
   * @return {string} X-Request-ID，缺失时为空串。
   */
  function readRequestId(headers) {
    if (!headers || typeof headers.get !== 'function') return '';
    return headers.get('X-Request-ID') || '';
  }

  /**
   * 判断响应是否声明命中了服务端缓存。
   * @param {!Headers} headers 响应头。
   * @return {boolean} 命中返回 true。
   */
  function isCacheHit(headers) {
    if (!headers || typeof headers.get !== 'function') return false;
    const status =
      headers.get('X-Cache-Status') || headers.get('EO-Cache-Status') || '';
    return status.toUpperCase() === 'HIT';
  }

  /**
   * 解析一次响应：2xx 返回数据，其余抛出结构化错误。
   * @param {!Response} response fetch 响应。
   * @return {!Promise<*>} 响应体。
   */
  function readResponse(response) {
    const requestId = readRequestId(response.headers);
    const cacheHit = isCacheHit(response.headers);

    return response
      .json()
      .catch(function () {
        return null;
      })
      .then(function (body) {
        if (response.ok) {
          return {data: body, requestId: requestId, cacheHit: cacheHit};
        }
        const parsed = parseErrorBody(body, response.status);
        const retryAfter = readRetryAfter(response.headers);
        const extra = {
          status: response.status,
          requestId: requestId,
          retryable:
            retryAfter !== null ||
            response.status === 408 ||
            response.status === 429 ||
            (response.status >= 500 && response.status <= 599),
        };
        const error = createError(parsed.code, parsed.message, extra);
        // 保留 Retry-After，重试时按服务端要求等待（FAQ Q14 / Q36）。
        if (retryAfter !== null) error.retryAfter = retryAfter;
        throw error;
      });
  }

  /**
   * 发起一次带超时的请求。
   * @param {string} url 完整地址。
   * @param {!Object} headers 请求头。
   * @param {number} timeout 超时毫秒数。
   * @return {!Promise<!Object>} {data, requestId, cacheHit}。
   */
  function fetchOnce(url, headers, timeout) {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, timeout);

    return fetch(url, {headers: headers, signal: controller.signal})
      .then(function (response) {
        clearTimeout(timer);
        return readResponse(response);
      })
      .catch(function (error) {
        clearTimeout(timer);
        // 已经被 readResponse 结构化过的错误直接透传。
        if (error && error.code) throw error;
        if (error && error.name === 'AbortError') {
          throw createError('TIMEOUT', '请求超时', {retryable: true});
        }
        // 浏览器在网络不可达时抛 TypeError('Failed to fetch')。
        throw createError('NETWORK_ERROR', '网络不可达', {retryable: true});
      });
  }

  /**
   * 调用 UAPI 接口（GET），带参数校验、超时、限流退避重试。
   * @param {string} path 以 `/` 开头的接口路径，例如 `/github/user`。
   * @param {!Object<string, (string|number|boolean|undefined)>} params
   *     查询参数。
   * @param {{
   *   timeout: (number|undefined),
   *   retries: (number|undefined),
   * }=} opt_options 可选配置。
   * @return {!Promise<!Object>} {data, requestId, cacheHit}。
   */
  function get(path, params, opt_options) {
    const options = opt_options || {};
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const retries =
      typeof options.retries === 'number' ? options.retries : DEFAULT_RETRIES;

    const query = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];
      if (value === undefined || value === null || value === '') return;
      query.set(key, String(value));
    });

    const headers = {};
    const apiKey = readApiKey();
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;

    const url = BASE_URL + path + (query.toString() ? '?' + query : '');

    /**
     * 尝试第 n 次请求（n 从 0 开始）。
     * @param {number} n 已尝试次数。
     * @return {!Promise<!Object>} 结果。
     */
    function attempt(n) {
      return fetchOnce(url, headers, timeout).catch(function (error) {
        const canRetry = n < retries && isRetryable(error);
        if (!canRetry) {
          if (error.status === 403 && error.code === 'CORS_FORBIDDEN') {
            error.message =
              '浏览器跨域调用需要携带 API Key（403 CORS_FORBIDDEN）';
          }
          throw error;
        }
        const delay = backoffDelay(
          n,
          typeof error.retryAfter === 'number' ? error.retryAfter : null,
        );
        console.warn(
          '[UAPI] 第 ' +
            (n + 1) +
            ' 次失败（' +
            error.code +
            '），' +
            delay +
            'ms 后重试',
        );
        return new Promise(function (resolve) {
          setTimeout(resolve, delay);
        }).then(function () {
          return attempt(n + 1);
        });
      });
    }

    return attempt(0);
  }

  /**
   * 校验 GitHub 用户名是否符合文档约束。
   * @description 文档：仅字母、数字、连字符，最长 39 位。
   * @param {string} user 用户名。
   * @return {?string} 合法时返回 null，否则返回原因。
   */
  function validateGithubUser(user) {
    if (!user) return '缺少必填参数 user';
    if (typeof user !== 'string') return 'user 必须是字符串';
    if (user.length > 39) return 'user 最长 39 位';
    if (!/^[A-Za-z0-9-]+$/.test(user)) {
      return 'user 只能包含字母、数字和连字符';
    }
    return null;
  }

  window.KD_UAPI = {
    BASE_URL: BASE_URL,
    get: get,
    hasApiKey: hasApiKey,
    readApiKey: readApiKey,
    validateGithubUser: validateGithubUser,
    isRetryable: isRetryable,
    parseErrorBody: parseErrorBody,
  };
})();
