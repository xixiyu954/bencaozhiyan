// 自有方案演练 + AI 自编课题评审 + 2.5 AI 课题生成器（90分竞技）独立异步 Chunk（按需水合，首屏零加载）
import '../styles/lab-v27-ai-topic-arena.css';
import '../core/lab-v11-userplan.js';
import '../core/lab-v17-ai-review.js';
import '../modules/lab-v27-ai-topic-arena.js';

export default {
  userPlan: typeof window !== 'undefined' ? window.TCM_USER_PLAN : null,
  aiReview: typeof window !== 'undefined' ? window.TCM_AI_REVIEW : null,
  aiArena: typeof window !== 'undefined' ? window.TCM_V27_AI_ARENA : null
};
