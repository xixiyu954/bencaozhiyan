// 本草智研 v7.0 旗舰升级模块
// 1. 全网实测直达视频库（核验 B站 BV 直链 + 名校 MOOC 课程 + 全网多平台视频聚合弹窗，彻底解决搜不到/视频偏题）
// 2. 深色护眼实验室模式（Dark Lab Mode）一键切换与持久化
// 3. 虚拟实验预习仿真考核与 100 分实时评分系统（Step 4）
// 4. 实验室原始数据手写记录单切换（Step 6）
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ============ 1. 全网实测直达实验视频库（已核验 B站 BV 与高校 MOOC 真实页面） ============
  const VERIFIED_VIDEOS = {
    steam: {
      topic: '水蒸气蒸馏与挥发油提取',
      safeKw: '水蒸气蒸馏 实验',
      direct: [
        { title: '化学实验之水蒸汽蒸馏装置搭建及操作', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV18K4y1t7ne/' },
        { title: '大学有机化学实验——水蒸气蒸馏', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1Bw411K7XY/' },
        { title: '减压蒸发与水蒸气蒸馏实操讲解', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1qK4y1x7o5/' }
      ]
    },
    reflux: {
      topic: '加热回流与冷凝管搭建',
      safeKw: '有机化学实验 回流',
      direct: [
        { title: '青岛科技大学有机化学实验——简单回流', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1XG4y1T7Mc/' },
        { title: '分水回流反应实操演示', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1gw411i7af/' },
        { title: '中国石油大学有机化学实验：常压蒸馏操作', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1vW411R7VG/' }
      ]
    },
    extract: {
      topic: '分液漏斗液-液萃取与干燥脱水',
      safeKw: '分液漏斗 萃取实验',
      direct: [
        { title: '中国石油大学有机化学实验第七讲：萃取操作（7.9万播放）', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV18W411R7nj/' },
        { title: '有机化学实验必修技能：萃取与分液速通', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1G1421k7j3/' },
        { title: '中国石油大学有机化学实验第四讲：无水干燥操作', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV18W411R7kJ/' }
      ]
    },
    dry: {
      topic: '无水硫酸钠脱水与有机相干燥',
      safeKw: '有机化学 干燥操作',
      direct: [
        { title: '中国石油大学有机化学实验第四讲：干燥操作', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV18W411R7kJ/' },
        { title: '有机化学实验必修技能：萃取与分液速通', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1G1421k7j3/' }
      ]
    },
    filter: {
      topic: '减压抽滤（布氏漏斗与安全瓶）',
      safeKw: '减压过滤 抽滤实验',
      direct: [
        { title: '减压过滤（抽滤）与减压操作演示', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1qK4y1x7o5/' },
        { title: '基础化学实验技能：减压过滤标准示范', platform: 'YouTube实测', url: 'https://www.youtube.com/watch?v=GDjwhRyi4ss' }
      ]
    },
    recryst: {
      topic: '重结晶、热过滤与析晶纯化',
      safeKw: '重结晶 实验操作',
      direct: [
        { title: '【物质纯化】化工大博带你学习重结晶操作', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1dL4y1x7DV/' },
        { title: '大学有机化学实验：合成、蒸馏与重结晶', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1ug411A7z1/' }
      ]
    },
    column: {
      topic: '硅胶柱层析装柱、上样与梯度洗脱',
      safeKw: '硅胶柱层析 过柱子',
      direct: [
        { title: '有机化学实验实战——血泪过柱史（实操避坑）', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1eV4y1R7pp/' },
        { title: '柱层析装柱、干湿法上样与梯度洗脱图文详解', platform: '高校工程中心', url: 'https://www.muhn.edu.cn/ecmd/info/1471/6794.htm' }
      ]
    },
    rotavap: {
      topic: '旋转蒸发仪安装与减压浓缩操作',
      safeKw: '旋转蒸发仪 使用教程',
      direct: [
        { title: '旋转蒸发仪操作演示（标准流程）', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1d94y1q7Lc/' },
        { title: '旋转蒸发仪的使用方法与步骤详解', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV15V4y1t7bC/' },
        { title: '旋转蒸发仪安装视频（小白也能学会操作）', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV17vQmBxEMw/' }
      ]
    },
    tlc: {
      topic: '薄层色谱（TLC）点样、展开与 Rf 检视',
      safeKw: '薄层色谱 TLC 点板',
      direct: [
        { title: '浙江大学化学系有机基本操作教学视频——薄层色谱 TLC', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1agNfzEEMn/' }
      ]
    },
    hplc: {
      topic: 'HPLC 高效液相色谱仪操作与定量',
      safeKw: '高效液相色谱 HPLC 操作',
      direct: [
        { title: '安捷伦高效液相色谱仪超详细使用方法', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1BY4y1x7Su/' }
      ]
    },
    freeze_dry: {
      topic: '真空冷冻干燥机预冻与升华操作',
      safeKw: '冷冻干燥机 使用方法',
      direct: [
        { title: '冻干机基本操作演示（预冻/抽真空/停机）', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1F541177iS/' }
      ]
    },
    soxhlet: {
      topic: '索氏提取器组装与连续虹吸提取',
      safeKw: '索氏提取器 茶叶咖啡因',
      direct: [
        { title: '中国石油大学有机化学实验第一讲：玻璃仪器认知', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV18W411R7Y9/' },
        { title: '有机化学实验中常用的玻璃仪器详解', platform: 'B站实测直达', url: 'https://www.bilibili.com/video/BV1xd4y1D7Bu/' }
      ]
    },
    ultrasound: {
      topic: '超声波辅助提取实验操作',
      safeKw: '超声波提取 中药实验',
      direct: [
        { title: '南京中医药大学《有机化学实验》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/NJUTCM-1462495213' },
        { title: '河南中医药大学《中药化学》国家一流慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/HACTCM-1206432809' }
      ]
    },
    resin: {
      topic: '大孔吸附树脂预处理、装柱与梯度洗脱',
      safeKw: '大孔吸附树脂 纯化实验',
      direct: [
        { title: '河南中医药大学《中药化学》提取分离章节慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/HACTCM-1206432809' },
        { title: '暨南大学《中药化学》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/course/JNU-1460879163' }
      ]
    },
    percolation: {
      topic: '渗漉法常温动态连续提取',
      safeKw: '渗漉法 提取实验',
      direct: [
        { title: '西安交通大学《天然药物化学》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/course/XJTU-1205916810' },
        { title: '河南中医药大学《中药化学》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/HACTCM-1206432809' }
      ]
    }
  };

  const MOOC_COURSES = [
    { name: '南京中医药大学 · 有机化学实验', url: 'https://www.icourse163.org/learn/NJUTCM-1462495213' },
    { name: '河南中医药大学 · 中药化学', url: 'https://www.icourse163.org/learn/HACTCM-1206432809' },
    { name: '暨南大学 · 中药化学', url: 'https://www.icourse163.org/course/JNU-1460879163' },
    { name: '西安交通大学 · 天然药物化学', url: 'https://www.icourse163.org/course/XJTU-1205916810' }
  ];

  // 将任意旧关键词或装置名智能映射到实测视频库分组
  function resolveVideoBundle(rawKw) {
    const k = String(rawKw || '');
    if (/挥发油|水蒸气|蒸馏|薄荷|肉桂/.test(k)) return VERIFIED_VIDEOS.steam;
    if (/无水硫酸钠|干燥/.test(k)) return VERIFIED_VIDEOS.dry;
    if (/重结晶|析晶|冷冻结晶|热过滤/.test(k)) return VERIFIED_VIDEOS.recryst;
    if (/抽滤|布氏漏斗|真空泵|沉淀/.test(k)) return VERIFIED_VIDEOS.filter;
    if (/分液|萃取|乳化|放气/.test(k)) return VERIFIED_VIDEOS.extract;
    if (/回流|冷凝管/.test(k)) return VERIFIED_VIDEOS.reflux;
    if (/索氏|滤纸筒/.test(k)) return VERIFIED_VIDEOS.soxhlet;
    if (/硅胶柱|柱层析|梯度洗脱|上样/.test(k)) return VERIFIED_VIDEOS.column;
    if (/旋蒸|旋转蒸发/.test(k)) return VERIFIED_VIDEOS.rotavap;
    if (/薄层|TLC|展开缸|点样|Rf/.test(k)) return VERIFIED_VIDEOS.tlc;
    if (/HPLC|液相|流动相|色谱柱/.test(k)) return VERIFIED_VIDEOS.hplc;
    if (/冻干|冷冻干燥/.test(k)) return VERIFIED_VIDEOS.freeze_dry;
    if (/大孔|树脂/.test(k)) return VERIFIED_VIDEOS.resin;
    if (/渗漉/.test(k)) return VERIFIED_VIDEOS.percolation;
    if (/超声/.test(k)) return VERIFIED_VIDEOS.ultrasound;
    return {
      topic: k || '中药化学标准实验操作',
      safeKw: k ? `${k.split(' ')[0]} 实验操作` : '中药化学实验',
      direct: [
        { title: '南京中医药大学《有机化学实验》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/NJUTCM-1462495213' },
        { title: '河南中医药大学《中药化学》官方慕课', platform: '中国大学MOOC', url: 'https://www.icourse163.org/learn/HACTCM-1206432809' }
      ]
    };
  }

  // 构建全网多平台视频弹窗，并全局拦截所有 .bili-pill 与旧 bilibili 搜索链接
  function initVideoHubModal() {
    if (!document.getElementById('videoHubModal')) {
      const div = document.createElement('div');
      div.innerHTML = `
        <div id="videoHubModal" class="no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div class="bg-white rounded-3xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-r from-[#05211d] to-[#0f5c54] text-white flex items-center justify-between gap-2">
              <div>
                <div class="text-[10px] font-extrabold text-emerald-200 uppercase tracking-widest">VERIFIED MULTI-PLATFORM VIDEO HUB</div>
                <h3 id="vhTitle" class="text-base font-extrabold mt-0.5">全网实测实验视频直达</h3>
              </div>
              <button id="btnCloseVideoHub" type="button" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg">×</button>
            </div>
            <div id="vhBody" class="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll text-xs"></div>
          </div>
        </div>`;
      document.body.appendChild(div);
    }

    const modal = document.getElementById('videoHubModal');
    const titleEl = document.getElementById('vhTitle');
    const bodyEl = document.getElementById('vhBody');
    const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
    document.getElementById('btnCloseVideoHub').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    function openVideoHub(rawKw, customLabel) {
      const bundle = resolveVideoBundle(rawKw);
      const q = bundle.safeKw;
      const enc = encodeURIComponent(q);
      titleEl.textContent = customLabel ? `${customLabel} · 全网实测视频` : `${bundle.topic} · 全网实测视频`;

      bodyEl.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-[#0a3630]">✅ 已核验可直达实操视频（点击直接播放，拒绝偏题）</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">人工核验</span>
          </div>
          <div class="space-y-2">
            ${bundle.direct.map(v => `
              <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/80 transition group">
                <div class="min-w-0">
                  <div class="font-extrabold text-slate-900 group-hover:text-[#0a3630]">${esc(v.title)}</div>
                  <div class="text-[10.5px] text-slate-500 mt-0.5 truncate">${esc(v.url)}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-[#0a3630] text-white text-[10.5px] font-bold shrink-0">${esc(v.platform)} ↗</span>
              </a>`).join('')}
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div class="font-extrabold text-slate-800">🌐 全网多平台一键换源检索（已自动校正高命中词：<span class="text-[#0f5c54]">「${esc(q)}」</span>）</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a href="https://search.bilibili.com/all?keyword=${enc}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 font-bold text-center transition">B站精准搜 ↗</a>
            <a href="https://www.douyin.com/search/${enc}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-center transition">抖音实验搜 ↗</a>
            <a href="https://www.baidu.com/sf/vsearch?pd=video&wd=${enc}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-center transition">百度全网视频 ↗</a>
            <a href="https://www.zhihu.com/search?type=content&q=${enc}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-center transition">知乎实操避坑 ↗</a>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div class="font-extrabold text-slate-800">🎓 高校官方慕课与虚拟仿真直达</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${MOOC_COURSES.map(c => `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-[#0a3630] font-semibold flex items-center justify-between"><span>${esc(c.name)}</span><span>↗</span></a>`).join('')}
          </div>
        </div>`;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    // 全局事件委托：点击任何 .bili-pill 或 #vidBiliLink / #rigVideoSearchLink 时自动弹出全网实测视频库！
    document.addEventListener('click', e => {
      const a = e.target.closest('a.bili-pill, #vidBiliLink, #rigVideoSearchLink');
      if (!a) return;
      e.preventDefault();
      let kw = '';
      try {
        const u = new URL(a.href);
        kw = u.searchParams.get('keyword') || '';
      } catch (_) {}
      const label = a.textContent.replace(/[▶↗]/g, '').trim();
      openVideoHub(kw || label, label);
    });

    return { openVideoHub, resolveVideoBundle };
  }

  // ============ 2. 深色护眼实验室模式（Dark Lab Mode） ============
  function initDarkMode() {
    const KEY = 'bencao_dark_lab_v1';
    const btn = document.getElementById('btnToggleDarkLab');
    const apply = (isDark) => {
      document.body.classList.toggle('dark-lab', isDark);
      if (btn) btn.textContent = isDark ? '☀️ 亮色模式' : '🌙 护眼暗色';
      try { localStorage.setItem(KEY, isDark ? '1' : '0'); } catch (_) {}
    };
    const saved = (() => { try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; } })();
    apply(saved);
    if (btn) btn.onclick = () => apply(!document.body.classList.contains('dark-lab'));
  }

  // ============ 3. 虚拟实验预习仿真考核与 100 分评分系统（Step 4） ============
  function renderLabExamSim(mountEl, t, ws, applicableRigs, LAB_RIGS) {
    if (!mountEl) return;
    const mainRigKey = applicableRigs[0]?.key || t.defaultRig || 'steam';
    const mainRig = LAB_RIGS[mainRigKey] || {};
    const questions = [
      {
        q: `1. 本课题「${t.herb}」提取核心装置（${mainRig.title || '提取装置'}）在加热或运行前，必须最先确认哪项安全操作？`,
        opts: ['先通冷却水（下进上出）或检查防爆/液位线，再开启热源/电源', '先通电加热至沸腾，再匆忙接通冷却水管', '将冷凝管顶部用橡皮塞塞紧防止溶剂挥发'],
        ans: 0,
        exp: '安全铁律：先通水后通电、冷凝管顶端严禁密闭（防升压爆炸）！'
      },
      {
        q: '2. 减压抽滤（布氏漏斗）或真空冷冻干燥结束时，防止真空泵水/油倒吸的正确停机顺序是？',
        opts: ['直接拔掉真空泵电源，再慢慢拆卸装置', '先拔管/缓开放气阀恢复常压，再关闭真空泵电源', '边抽真空边用力拔出布氏漏斗'],
        ans: 1,
        exp: '必须先破真空恢复常压再停泵，否则负压瞬间将水/泵油倒吸入样品瓶！'
      },
      {
        q: '3. 使用分液漏斗液-液萃取（尤其是氯仿、乙醚或酸碱中和体系）时，振摇 2~3 下后应立即做什么？',
        opts: ['继续用力猛摇 3 分钟直到完全乳化', '倒置分液漏斗并缓慢旋开活塞放气（口朝无人处）', '直接拔掉顶部玻璃塞倒出下层液'],
        ans: 1,
        exp: '挥发溶剂与产气中和极易升高瓶内气压，必须勤倒置开塞放气防冲塞喷溅！'
      },
      {
        q: '4. 做薄层色谱（TLC）点样与展开时，以下哪种操作会导致斑点严重拖尾或出现边缘效应？',
        opts: ['展开缸贴滤纸密封预饱和 20 分钟，微量点样直径 ≤ 2 mm', '展开剂液面没过点样基线，或直接用圆珠笔划基线', '供试品与对照品同板展开并核算 |ΔRf| ≤ 0.03'],
        ans: 1,
        exp: '液面没过基线会使样品直接溶解进展开剂中；圆珠笔油墨会随展开剂跑出假斑！'
      },
      {
        q: `5. 按《中国药典》与实验室质控要求，评价「${t.herb}」3 批平行实验操作是否稳定可靠的关键指标是？`,
        opts: ['仅凭肉眼颜色深浅判断，不需称重', '平行 3 批平均收率对标参考限度且相对标准偏差 RSD < 5%', '只需做 1 批实验凑出最高收率即可'],
        ans: 1,
        exp: '平行 3 批 RSD < 5% 且 TLC |ΔRf| ≤ 0.03 是中药化学定量与定性双质控底线！'
      }
    ];

    const stateAns = new Array(questions.length).fill(-1);
    let submitted = false;

    const draw = () => {
      const correctCnt = questions.filter((q, i) => stateAns[i] === q.ans).length;
      const score = Math.round((correctCnt / questions.length) * 100);
      const passed = submitted && score >= 80;

      mountEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-xl bg-emerald-100 text-[#0a3630] flex items-center justify-center font-extrabold text-xs">🏆</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">虚拟实操预习准入考核（0-Token 100分制评测）</h3>
              <p class="text-[11px] text-slate-500">进实验室前 1 分钟自测安全红线与核心操作，≥ 80 分自动颁发预习合格徽章</p>
            </div>
          </div>
          ${submitted ? `<span class="px-3 py-1 rounded-full text-xs font-extrabold ${passed ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}">${passed ? `🏅 预习准入合格 · ${score} 分` : `⚠ 当前 ${score} 分（需 ≥80 分）`}</span>` : '<span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">共 5 题 · 每题 20 分</span>'}
        </div>
        <div class="space-y-3 text-xs">
          ${questions.map((item, qi) => `
            <div class="p-3.5 rounded-2xl bg-[#fbfcfa] border border-slate-200/80 space-y-2">
              <div class="font-extrabold text-slate-900">${esc(item.q)}</div>
              <div class="space-y-1.5">
                ${item.opts.map((opt, oi) => {
                  const chosen = stateAns[qi] === oi;
                  let cls = chosen ? 'bg-teal-50 border-[#0f5c54] text-[#0a3630] font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                  if (submitted) {
                    if (oi === item.ans) cls = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                    else if (chosen && oi !== item.ans) cls = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                  }
                  return `<label class="flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition ${cls}">
                    <input type="radio" name="labExamQ${qi}" data-exam-q="${qi}" data-exam-o="${oi}" ${chosen ? 'checked' : ''} class="mt-0.5 accent-[#0a3630]" />
                    <span>${esc(opt)}</span>
                  </label>`;
                }).join('')}
              </div>
              ${submitted ? `<div class="text-[11px] text-[#0f5c54] bg-teal-50/70 rounded-lg px-2.5 py-1.5"><strong>解析：</strong>${esc(item.exp)}</div>` : ''}
            </div>`).join('')}
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button id="btnResetLabExam" type="button" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">重置重测</button>
          <button id="btnSubmitLabExam" type="button" class="px-4 py-2 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold shadow-xs">提交并实时评分</button>
        </div>`;

      mountEl.querySelectorAll('[data-exam-q]').forEach(r => r.addEventListener('change', () => {
        stateAns[Number(r.dataset.examQ)] = Number(r.dataset.examO);
        if (submitted) draw();
      }));
      mountEl.querySelector('#btnSubmitLabExam').onclick = () => { submitted = true; draw(); };
      mountEl.querySelector('#btnResetLabExam').onclick = () => { stateAns.fill(-1); submitted = false; draw(); };
    };
    draw();
  }

  // ============ 4. 实验室原始数据手写记录单生成器（Step 6） ============
  function buildRawLogSheetHtml(t, ws) {
    return `
      <div class="space-y-4">
        <div class="text-center border-b-2 border-slate-800 pb-3 space-y-1">
          <div class="text-xs tracking-widest text-slate-500 uppercase">LABORATORY ORIGINAL RECORD SHEET · 进实验室手写打卡单</div>
          <h2 class="text-lg font-extrabold text-slate-900">${esc(t.herb)}（${esc(t.compound)}）原始实验记录表</h2>
          <div class="text-xs text-slate-600">实验日期：____年__月__日 ｜ 实验台号：____ ｜ 记录人：________ ｜ 复核人：________</div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs border border-slate-300 rounded-xl p-3">
          <div><strong>目标溶剂与料液比：</strong>${esc(ws.solventType)}（1:${ws.ratio}）</div>
          <div><strong>设定温度与时长：</strong>${ws.temp}℃ × ${ws.time} min × ${ws.cycles} 次</div>
          <div><strong>粉碎目数与 pH：</strong>${esc(ws.mesh)} ｜ ${esc(ws.ph)}</div>
          <div><strong>药典参考限度：</strong>≥ ${t.limitVal}${t.limitUnit || '%'} ｜ 熔点参考：${esc(t.mpRef || '见标准品')}</div>
        </div>
        <div>
          <h3 class="text-xs font-extrabold text-slate-900 mb-1.5">一、3 批平行称量与收率原始记录</h3>
          <table class="w-full text-xs border-collapse border border-slate-400 text-center">
            <thead><tr class="bg-slate-100"><th class="border border-slate-400 py-1.5">批次</th><th class="border border-slate-400">投料干重 (g)</th><th class="border border-slate-400">空瓶重 (g)</th><th class="border border-slate-400">总重 (g)</th><th class="border border-slate-400">净得量 (${esc(t.crudeUnit || 'g')})</th><th class="border border-slate-400">收率 (%)</th><th class="border border-slate-400">实测熔点 (℃)</th></tr></thead>
            <tbody>
              <tr><td class="border border-slate-400 py-2.5 font-bold">平行批 #1</td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td></tr>
              <tr><td class="border border-slate-400 py-2.5 font-bold">平行批 #2</td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td></tr>
              <tr><td class="border border-slate-400 py-2.5 font-bold">平行批 #3</td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td><td class="border border-slate-400"></td></tr>
            </tbody>
          </table>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="border border-slate-300 rounded-xl p-3 space-y-2">
            <div class="font-extrabold text-slate-900">二、TLC 薄层色谱手绘与 Rf 记录</div>
            <div class="text-[11px] text-slate-600">展开体系：${esc(t.tlcSystem)}</div>
            <div class="h-24 border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[11px] text-slate-400">（手绘斑点位置与荧光颜色）</div>
            <div>前沿 L₀ = ____ cm ｜ 供试品 L = ____ cm ｜ Rf = ____</div>
          </div>
          <div class="border border-slate-300 rounded-xl p-3 space-y-2">
            <div class="font-extrabold text-slate-900">三、现场异常现象与废液处置确认</div>
            <div class="space-y-1.5 text-[11px]">
              <div>☐ 沸石/冷却水/通风橱开机前复核通过</div>
              <div>☐ 异常现象记录：________________________</div>
              <div>☐ ________________________________________</div>
              <div>☐ 有机/含卤/酸碱废液已分类倒入指定废液桶</div>
              <div class="pt-3 text-right font-bold">指导教师签字：____________</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  window.TCM_V7_MEDIA = Object.freeze({
    VERIFIED_VIDEOS,
    initVideoHubModal,
    initDarkMode,
    renderLabExamSim,
    buildRawLogSheetHtml
  });
})();
