// DIY 创意实验室 + 实验任务舱 独立异步 Chunk（按需水合，首屏零加载）
import '../../lab-v12-diy-studio.js';
import '../../lab-v13-mission-os.js';

export default {
  diyStudio: typeof window !== 'undefined' ? window.TCM_DIY_STUDIO : null,
  missionOs: typeof window !== 'undefined' ? window.TCM_MISSION_OS : null
};
