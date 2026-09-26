/**
 * @fileoverview 全局状态与配置引用。
 * @description 必须在其他所有脚本之前加载。
 */
const CFG = window.KD_CONFIG || {};
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
