// 自有方案演练 + AI 自编课题评审 独立异步 Chunk（按需弹窗水合，首屏零加载）
import '../../lab-v11-userplan.js';
import '../../lab-v17-ai-review.js';

export default {
  userPlan: typeof window !== 'undefined' ? window.TCM_USER_PLAN : null,
  aiReview: typeof window !== 'undefined' ? window.TCM_AI_REVIEW : null
};
