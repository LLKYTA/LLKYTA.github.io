/**
 * @fileoverview 安全的本地存储与剪贴板封装。
 * @description 隐私模式、存储配额耗尽或用户禁用存储时，浏览器会在访问
 *     localStorage / sessionStorage 时抛出异常。所有读写都经过本模块，
 *     调用方无需再包 try/catch，也不会因为存储不可用而中断页面渲染。
 */
(function () {
  'use strict';

  /**
   * 判断某个 Storage 是否可读写。
   * @param {string} name 'localStorage' 或 'sessionStorage'。
   * @return {?Storage} 可用的 Storage 对象，不可用时返回 null。
   */
  function resolveStore(name) {
    try {
      const store = window[name];
      if (!store) return null;
      const probe = '__kd_probe__';
      store.setItem(probe, '1');
      store.removeItem(probe);
      return store;
    } catch (e) {
      return null;
    }
  }

  const local = resolveStore('localStorage');
  const session = resolveStore('sessionStorage');
  const memory = {};

  /**
   * 读取字符串值。
   * @param {string} key 键名。
   * @param {string=} opt_fallback 取不到时的默认值。
   * @return {string} 存储中的值或默认值。
   */
  function read(key, opt_fallback) {
    const fallback = opt_fallback === undefined ? null : opt_fallback;
    if (local) {
      const value = local.getItem(key);
      return value === null ? fallback : value;
    }
    return Object.prototype.hasOwnProperty.call(memory, key)
      ? memory[key]
      : fallback;
  }

  /**
   * 写入字符串值。
   * @param {string} key 键名。
   * @param {string} value 值。
   * @return {void}
   */
  function write(key, value) {
    const text = String(value);
    if (local) {
      try {
        local.setItem(key, text);
        return;
      } catch (e) {
        // 配额耗尽时退化为内存存储，保证本次会话内状态一致。
      }
    }
    memory[key] = text;
  }

  /**
   * 删除指定键。
   * @param {string} key 键名。
   * @return {void}
   */
  function remove(key) {
    delete memory[key];
    if (local) {
      try {
        local.removeItem(key);
      } catch (e) {
        // 忽略删除失败。
      }
    }
  }

  /**
   * 读取并按 JSON 解析会话缓存。
   * @param {string} key 键名。
   * @param {number} ttl 有效期（毫秒），超过则视为失效。
   * @return {?Object} 解析结果，失效或异常时返回 null。
   */
  function readSessionJson(key, ttl) {
    if (!session) return null;
    let raw = null;
    try {
      raw = session.getItem(key);
    } catch (e) {
      return null;
    }
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== 'number') return null;
      if (ttl > 0 && Date.now() - parsed.ts > ttl) {
        session.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      try {
        session.removeItem(key);
      } catch (e2) {
        // 忽略清理失败。
      }
      return null;
    }
  }

  /**
   * 写入带时间戳的会话缓存。
   * @param {string} key 键名。
   * @param {*} data 任意可序列化数据。
   * @return {void}
   */
  function writeSessionJson(key, data) {
    if (!session) return;
    try {
      session.setItem(key, JSON.stringify({ts: Date.now(), data: data}));
    } catch (e) {
      // 缓存失败不影响主流程。
    }
  }

  /**
   * 清空会话缓存项。
   * @param {string} key 键名。
   * @return {void}
   */
  function clearSession(key) {
    if (!session) return;
    try {
      session.removeItem(key);
    } catch (e) {
      // 忽略。
    }
  }

  /**
   * 复制文本到剪贴板，并给出轻量提示。
   * @param {string} text 待复制文本。
   * @return {void}
   */
  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          window.notify('已复制：' + text);
        },
        function () {
          window.notify('复制失败，请手动复制');
        },
      );
      return;
    }
    window.notify('当前浏览器不支持自动复制');
  }

  /**
   * 在页面底部显示一条短暂的浮动提示。
   * @param {string} message 提示文案。
   * @return {void}
   */
  window.notify = function (message) {
    if (!message) return;
    const tip = document.createElement('div');
    tip.className = 'kd-toast';
    tip.setAttribute('role', 'status');
    tip.textContent = message;
    document.body.appendChild(tip);
    requestAnimationFrame(function () {
      tip.classList.add('kd-toast-show');
    });
    setTimeout(function () {
      tip.classList.remove('kd-toast-show');
      setTimeout(function () {
        if (tip.parentNode) tip.parentNode.removeChild(tip);
      }, 300);
    }, 1600);
  };

  window.KD_STORAGE = {
    local: local,
    session: session,
    read: read,
    write: write,
    remove: remove,
    readSessionJson: readSessionJson,
    writeSessionJson: writeSessionJson,
    clearSession: clearSession,
    copyText: copyText,
  };
})();
