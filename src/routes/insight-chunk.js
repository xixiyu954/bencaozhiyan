// 实验项目中枢与体检抽屉独立 Chunk（打开项目中枢时按需加载 JS + CSS）
import '../../lab-v15-insight.css';
import '../../lab-v15-insight.js';

export default typeof window !== 'undefined' ? window.TCM_V15_INSIGHT : null;
