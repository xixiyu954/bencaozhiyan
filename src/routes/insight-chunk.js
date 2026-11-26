// 实验项目中枢与体检抽屉独立 Chunk（打开项目中枢时按需加载 JS + CSS）
import '../styles/lab-v15-insight.css';
import '../core/lab-v15-insight.js';

export default typeof window !== 'undefined' ? window.TCM_V15_INSIGHT : null;
