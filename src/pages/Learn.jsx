// ── F1 GUIDE · Learn 科普页 ─────────────────────────
// 参考：stitch-pages/04-learn.html
// 布局：LearnIntro 开场 → Hero → 吸顶 Tab 栏 → 卡片网格 → 进阶引导横幅
// 功能：Tab 切换（方向感动效）+ VideoModal 弹窗

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LearnCard  from '../components/learn/LearnCard.jsx'
import VideoModal from '../components/learn/VideoModal.jsx'
import LearnIntro from '../components/learn/LearnIntro.jsx'
import useBreakpoint from '../hooks/useBreakpoint.js'

// ── Tab 顺序 ───────────────────────────────────────
const TAB_ORDER = ['beginner', 'advanced']

// ── 模块数据（使用 Bilibili 视频，国内可正常访问）──────
// 视频来源：三驱兄弟系列（BV1qhXnYoEjk 等）+ 虾哥方程式
// thumbUrl 为 Bilibili CDN 封面图，embedUrl 为 B站 player 地址
const MODULES = {
  beginner: [
    {
      num: 1, bvid: 'BV1qhXnYoEjk',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1qhXnYoEjk&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i2.hdslb.com/bfs/archive/06cd534fe877497b323a4f8f92e4f61ebe123d9d.jpg',
      title: '什么是 F1？',
      desc: '16 分钟带你快速入门！了解 Formula 1 的基本概念：赛车规格、速度极限、全球赛程，以及它为何是汽车工程的顶点。',
      level: '基础入门', duration: 16, advanced: false,
    },
    {
      num: 2, bvid: 'BV1vAvZBgEGT',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1vAvZBgEGT&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i0.hdslb.com/bfs/archive/b3febe27dab509b6423aa76884ce5612e802653e.jpg',
      title: '比赛周末全流程',
      desc: '一堆赛车绕圈跑好看在哪？练习赛 → 排位赛 → 冲刺赛（部分站）→ 正赛，每个环节的目的与规则详解，还有2026新规解读。',
      level: '基础入门', duration: 20, advanced: false,
    },
    {
      num: 3, bvid: 'BV1GrwFzGEWt',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1GrwFzGEWt&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i2.hdslb.com/bfs/archive/b2cd583cc5f8eac20781d47531c44636ac17312a.jpg',
      title: '认识 11 支车队',
      desc: 'McLaren、Red Bull、Ferrari、Mercedes、Audi、Cadillac……11支车队的代表色、主场、引擎供应商与2026赛季阵容一次讲清。',
      level: '基础入门', duration: 27, advanced: false,
    },
    {
      num: 4, bvid: 'BV15FcDzJE19',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV15FcDzJE19&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i0.hdslb.com/bfs/archive/b09cae37b98c2541899e6e9ff1dd5a3ce27c5273.jpg',
      title: '积分怎么算？',
      desc: '前10名积分：25-18-15-12-10-8-6-4-2-1 分。最快圈速额外 +1 分（须在前10名内）。17分钟看懂F1正赛直播积分规则。',
      level: '基础入门', duration: 17, advanced: false,
    },
    {
      num: 5, bvid: 'BV1DKWfzdEKg',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1DKWfzdEKg&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/b5254f9ec842ccb00af5f7eff064acfba6a4d3e0.jpg',
      title: '比赛术语速查',
      desc: 'DRS / Pit Stop / Undercut / Overcut / SC / VSC / DNF……最常用术语全覆盖，超详细F1入门攻略，一次看懂。',
      level: '基础入门', duration: 15, advanced: false,
    },
  ],
  advanced: [
    {
      num: 6, bvid: 'BV1wL41117d9',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1wL41117d9&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/1b08fcc0adf75b6f8eedcb7f0d8204ac4398c6d8.jpg',
      title: 'DRS 减阻系统与进站策略',
      desc: '虾哥方程式讲解：F1进站策略到底是什么？后翼可动翼片打开后减少空气阻力，车速可提高约 10-15 km/h，须在 1 秒内跟车才能激活。',
      level: '进阶内容', duration: 5, advanced: true,
    },
    {
      num: 7, bvid: 'BV1ib2WBCEfi',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1ib2WBCEfi&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/595bd589f4727ec9e3418ef94fb308ab0e6a3d27.jpg',
      title: '轮胎策略与车队经济',
      desc: '倍耐力轮胎：软、中、硬三种化合物各有不同的抓地力与耐久性；法拉利、奔驰、红牛车队每年能赚多少钱？策略背后的商业逻辑。',
      level: '进阶内容', duration: 21, advanced: true,
    },
    {
      num: 8, bvid: 'BV1tfzDBpEm6',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1tfzDBpEm6&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/3a2e6734427faef185490f7b3b2616cafcbaf805.jpg',
      title: '2026 新规全解析',
      desc: '2025赛季回顾 + 26赛季新车新规详解：安全车/VSC规则变化、地效空气动力学、混合动力全电化——影响整个赛季走势的关键规则。',
      level: '进阶内容', duration: 29, advanced: true,
    },
    {
      num: 9, bvid: 'BV16aSUBbEeo',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV16aSUBbEeo&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/e29d33a43698525a33bc7383b4f3545b101a7889.jpg',
      title: '赛道类型与赛车技术',
      desc: '街道赛（摩纳哥）/ 传统赛道（银石）/ 夜间赛（新加坡）各有特色。给你用不完的钱造一台F1赛车，会发生什么？深入赛车技术细节。',
      level: '进阶内容', duration: 16, advanced: true,
    },
    {
      num: 10, bvid: 'BV1TU92ByEBm',
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1TU92ByEBm&page=1&as_wide=1&high_quality=1',
      thumbUrl: 'https://i1.hdslb.com/bfs/archive/febe7b5eb0a82b8845ad3d0f008e0cdd26574871.jpg',
      title: '技术极限与发展史',
      desc: '凭啥1亿的F1直线被小米秒？F1 vs 超跑 vs 性能车的差距究竟有多大？自然吸气→涡轮增压→混合动力→地效赛车，技术进化史深度解析。',
      level: '进阶内容', duration: 13, advanced: true,
    },
  ],
}

// ── Tab 按钮 ───────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden',
        fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '14px 24px', border: 'none', background: 'none',
        cursor: 'pointer',
        color: active ? '#FFFFFF' : '#9BA8A5',
        borderBottom: active ? '2px solid #00D2BE' : '2px solid transparent',
        marginBottom: -1,
        transition: 'color 0.25s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#ddd' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#9BA8A5' }}
    >
      {active && (
        <motion.span
          layoutId="learn-tab-glow"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
            filter: 'blur(3px)',
          }}
        />
      )}
      {children}
    </button>
  )
}

// ── 面板过渡变体 ───────────────────────────────────
const panelVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir * 40, filter: 'blur(4px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir * -30, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }),
}

// ── 进阶引导横幅 ──────────────────────────────────
function NextBanner({ onSwitch, isMobile }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 60px' : '0 32px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          textAlign: 'center', padding: '28px 24px',
          background: 'rgba(0,210,190,0.04)',
          border: '1px solid rgba(0,210,190,0.15)',
          borderRadius: 8,
        }}
      >
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15,
          color: '#9BA8A5', marginBottom: 16,
        }}>
          新手 5 个模块看完了？进阶课堂等你来！
        </p>
        <motion.button
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileTap={{ scale: 0.97 }}
          animate={hovered
            ? { background: '#00BFB0', boxShadow: '0 0 24px rgba(0,210,190,0.45)' }
            : { background: '#00D2BE', boxShadow: '0 0 0px rgba(0,210,190,0)' }
          }
          onClick={onSwitch}
          style={{
            fontFamily: 'var(--font-title)', fontSize: 13,
            fontWeight: 700, letterSpacing: '0.1em',
            color: '#0D0D0D', border: 'none', borderRadius: 2,
            padding: '11px 32px', cursor: 'pointer',
          }}
        >
          进入进阶课堂 →
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── 主页面 ─────────────────────────────────────────
export default function Learn() {
  const { isMobile } = useBreakpoint()
  const [tab,          setTab]          = useState('beginner')
  const [activeModule, setActiveModule] = useState(null)     // 当前打开的视频模块
  const [introDone,    setIntroDone]    = useState(false)    // 开场动效是否完成
  const prevTabRef = useRef('beginner')

  function handleTabChange(newTab) {
    if (newTab === tab) return
    prevTabRef.current = tab
    setTab(newTab)
  }

  const direction = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(prevTabRef.current) ? 1 : -1
  const modules   = MODULES[tab]

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, background: '#0D0D0D' }}>

      {/* ── 开场动效覆盖层 ── */}
      {!introDone && (
        <LearnIntro onDone={() => setIntroDone(true)} />
      )}

      {/* ── 页面主体：intro 完成后滑入 ── */}
      <motion.div
        initial={false}
        animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* PAGE HERO */}
        <div style={{
          background: 'linear-gradient(to bottom, rgba(0,210,190,0.04) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '28px 16px 24px' : '48px 32px 36px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.22em', color: '#00D2BE', opacity: 0.7,
              marginBottom: 10, textTransform: 'uppercase',
            }}>
              2026 赛季 / 科普中心
            </div>
            <h1 style={{
              fontFamily: 'var(--font-title)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900, color: '#FFFFFF',
              textTransform: 'uppercase', letterSpacing: '0.03em',
              lineHeight: 1, marginBottom: 12,
            }}>
              F1 科普指南
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15,
              color: '#9BA8A5',
            }}>
              从新手到懂车 · 10 个核心模块，每个模块含图文说明 + 精选视频
            </p>
          </div>
        </div>

        {/* 吸顶 Tab 栏 */}
        <div style={{
          position: 'sticky', top: 60, zIndex: 40,
          background: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 8px' : '0 32px', display: 'flex' }}>
            <TabBtn active={tab === 'beginner'} onClick={() => handleTabChange('beginner')}>新手必读</TabBtn>
            <TabBtn active={tab === 'advanced'} onClick={() => handleTabChange('advanced')}>进阶课堂</TabBtn>

            {/* 右侧时长提示（移动端隐藏） */}
            {!isMobile && (
              <div style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.15em', color: 'rgba(0,210,190,0.45)',
              }}>
                5 个模块 · {tab === 'beginner' ? '约 45 分钟' : '约 50 分钟'}
              </div>
            )}
          </div>
        </div>

        {/* 内容区（带方向感切换） */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={tab}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* 卡片网格 */}
              <div style={{
                maxWidth: 1200, margin: '0 auto',
                padding: isMobile ? '20px 16px 0' : '32px 32px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: isMobile ? 12 : 16,
              }}>
                {modules.map((mod, i) => (
                  <LearnCard
                    key={mod.num}
                    module={mod}
                    index={i}
                    onClick={() => setActiveModule(mod)}
                  />
                ))}
              </div>

              {/* 新手面板：底部引导横幅 */}
              {tab === 'beginner' && (
                <div style={{ marginTop: isMobile ? 32 : 48 }}>
                  <NextBanner onSwitch={() => handleTabChange('advanced')} isMobile={isMobile} />
                </div>
              )}

              {/* 进阶面板：底部留白 */}
              {tab === 'advanced' && <div style={{ height: 80 }} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── 视频弹窗（始终在最外层，不受 intro motion 影响） ── */}
      <VideoModal
        module={activeModule}
        onClose={() => setActiveModule(null)}
      />
    </div>
  )
}
