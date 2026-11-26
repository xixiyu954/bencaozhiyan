// 六步工坊可视化驾驶舱与动态图谱 Chunk（进入 workflow 工作区时按需水合）
import '../core/lab-v8-studio.js';
import '../core/lab-v9-visuals.js';

export default {
  studioV8: typeof window !== 'undefined' ? window.TCM_STUDIO_V8 : null,
  visualsV9: typeof window !== 'undefined' ? window.TCM_V9 : null
};
