// 板块一视觉套件按需异步 Chunk：v20 PubChem 3D分子与粒子 + v21 四谱 + v22 流体/AR（不含 Three.js）
import '../data/mol3d-pubchem-data.js';
import '../../lab-v20-mol3d-particles.js';
import '../../lab-v21-spectra-lab.js';
import '../../lab-v22-visual-suite-pro.js';

export default {
  v20: typeof window !== 'undefined' ? window.TCM_V20_VISUALS : null,
  v21: typeof window !== 'undefined' ? window.TCM_V21_SPECTRA_LAB : null,
  v22: typeof window !== 'undefined' ? window.TCM_V22_VISUAL_SUITE : null
};
