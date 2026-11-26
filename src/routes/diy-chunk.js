// DIY 创意实验室 + 自由配方沙盒 + 失败分支实训 + 实验任务舱 独立异步 Chunk（按需水合，首屏零加载）
import '../styles/lab-v25-formula-sandbox.css';
import '../styles/lab-v26-failure-branches.css';
import '../core/lab-v12-diy-studio.js';
import '../core/lab-v13-mission-os.js';
import '../modules/lab-v25-formula-sandbox.js';
import '../modules/lab-v26-failure-branches.js';

export default {
  diyStudio: typeof window !== 'undefined' ? window.TCM_DIY_STUDIO : null,
  missionOs: typeof window !== 'undefined' ? window.TCM_MISSION_OS : null,
  formulaSandbox: typeof window !== 'undefined' ? window.TCM_V25_FORMULA_SANDBOX : null,
  failureBranches: typeof window !== 'undefined' ? window.TCM_V26_FAILURE_BRANCHES : null
};
