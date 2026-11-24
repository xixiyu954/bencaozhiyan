// 按需动态加载图表与长图导出依赖（从首屏 <head> 移除，零首屏阻塞）
let chartPromise = null;
let html2canvasPromise = null;

export function loadChartJs() {
  if (typeof window !== 'undefined' && typeof window.Chart === 'function') {
    return Promise.resolve(window.Chart);
  }
  if (!chartPromise) {
    chartPromise = import('./chart-lite.js').then((mod) => {
      const Chart = mod.default;
      if (typeof window !== 'undefined') window.Chart = Chart;
      return Chart;
    }).catch((err) => {
      chartPromise = null;
      throw err;
    });
  }
  return chartPromise;
}

export function loadHtml2Canvas() {
  if (typeof window !== 'undefined' && typeof window.html2canvas === 'function') {
    return Promise.resolve(window.html2canvas);
  }
  if (!html2canvasPromise) {
    html2canvasPromise = import('html2canvas').then((mod) => {
      const fn = mod.default || mod;
      if (typeof window !== 'undefined') window.html2canvas = fn;
      return fn;
    }).catch((err) => {
      html2canvasPromise = null;
      throw err;
    });
  }
  return html2canvasPromise;
}

export const TCM_LAZY_VENDORS = Object.freeze({
  loadChartJs,
  loadHtml2Canvas
});

if (typeof window !== 'undefined') {
  window.TCM_LAZY_VENDORS = TCM_LAZY_VENDORS;
}

export default TCM_LAZY_VENDORS;
