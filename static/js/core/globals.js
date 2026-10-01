/**
 * @fileoverview 全局配置与用户偏好引用。
 * @description 必须在其他所有脚本之前加载。这两个常量是刻意的全局
 *     共享状态（`CFG` 供所有模块读取配置，`PREFERS_REDUCED_MOTION` 供
 *     各模块做动效降级判断），因此在各自文件内会被标记为未使用。
 */
/* exported CFG, PREFERS_REDUCED_MOTION */

/** @type {!Object} 站点配置（来自 config.js）。 */
const CFG = window.KD_CONFIG || {};

/** @type {boolean} 用户是否开启「减少动效」偏好。 */
const PREFERS_REDUCED_MOTION = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
