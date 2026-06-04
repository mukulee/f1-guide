import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ── 卡片数据 ──────────────────────────────────
// module 字段 = 右上角角标，区别于主标题文字
// 图片来源：F1 官网 media.formula1.com CDN（trackside-images / fom-website / Racehub）
// 01 赛程：澳大利亚赛道 Racehub 头图（Albert Park 赛道风景）
// 02 积分榜：2026 中国站颁奖台（Antonelli 首胜庆祝）
// 03 科普：澳大利亚站 Aston Martin 技术升级特写
// 04 车队：澳大利亚站围场指导人员（Red Bull 围场）
// 05 社区：2026 中国站赛场氛围（Colapinto/Alpine 赛中）
const NAV_CARDS = [
  {
    tag: '01', module: '赛历', name: '赛程', desc: '2026 赛季全程赛历',
    to: '/schedule',
    img: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1200/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Australia.webp',
  },
  {
    tag: '02', module: '排名', name: '积分榜', desc: '车手 & 车队积分实时排名',
    to: '/standings',
    img: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1200/trackside-images/2026/F1_Grand_Prix_Of_China/2267026176.webp',
  },
  {
    tag: '03', module: '入门', name: '科普', desc: '从新手到懂车，10 个模块',
    to: '/learn',
    img: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1200/fom-website/2026/Miscellaneous/Tech/GettyImages-2265191085.webp',
  },
  {
    tag: '04', module: '围场', name: '车队', desc: '10 支车队详情与历史',
    to: '/teams',
    img: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1200/trackside-images/2026/F1_Grand_Prix_Of_Australia___Practice/2265011877.webp',
  },
  {
    tag: '05', module: '粉丝区', name: '社区', desc: '车手 & 车队人气投票',
    to: '/community',
    img: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1200/trackside-images/2026/F1_Grand_Prix_Of_China/2267025860.webp',
  },
]

// ── 卡片入场动效 variants ─────────────────────
const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    y: 50,
    scale: 0.9,
    rotateY: i % 2 === 0 ? -8 : 8,
  }),
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.12,
    },
  }),
}

// ── 单张卡片 ──────────────────────────────────
function NavCard({ tag, module: mod, name, desc, to, img, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      style={{ perspective: '600px' }}
    >
      <Link
        to={to}
        data-no-dots
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
          border: hovered
            ? '1px solid rgba(0,210,190,0.85)'
            : '1px solid rgba(255,255,255,0.07)',
          aspectRatio: '3/4',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          textDecoration: 'none',
          background: '#0d0d0d',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 0 0 1px rgba(0,210,190,0.3), 0 8px 32px rgba(0,210,190,0.25), 0 20px 60px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* 背景图 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: hovered ? 'brightness(0.65) saturate(1.1)' : 'brightness(0.35) saturate(0.9)',
          transform: hovered ? 'scale(1.14)' : 'scale(1)',
          transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease',
        }} />

        {/* 渐变遮罩 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.2) 55%, transparent 100%)'
            : 'linear-gradient(to top, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.4) 60%, transparent 100%)',
          transition: 'background 0.4s ease',
        }} />

        {/* hover 时顶部 cyan 条 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(to right, transparent, #00D2BE, transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }} />

        {/* hover 扫光 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'linear-gradient(135deg, transparent 30%, rgba(0,210,190,0.12) 50%, transparent 70%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }} />

        {/* 左上角编号 */}
        <div style={{
          position: 'absolute', top: '14px', left: '14px', zIndex: 4,
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.18em',
          color: hovered ? 'rgba(0,210,190,0.9)' : 'rgba(255,255,255,0.25)',
          transition: 'color 0.35s ease',
        }}>
          {tag}
        </div>

        {/* 右上角模块图标 */}
        <div style={{
          position: 'absolute', top: '12px', right: '14px', zIndex: 4,
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          padding: '3px 7px',
          border: '1px solid',
          borderColor: hovered ? 'rgba(0,210,190,0.6)' : 'rgba(255,255,255,0.1)',
          color: hovered ? '#00D2BE' : 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          transition: 'all 0.35s ease',
        }}>
          {mod}
        </div>

        {/* 文字内容 */}
        <div style={{
          position: 'relative', zIndex: 4,
          padding: '20px',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}>
          {/* 标题 */}
          <div style={{
            fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 700,
            color: hovered ? '#00D2BE' : '#fff',
            marginBottom: '6px',
            transition: 'color 0.3s ease',
            letterSpacing: '0.04em',
          }}>
            {name}
          </div>

          {/* 描述 */}
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: hovered ? 'rgba(229,226,225,0.75)' : 'rgba(229,226,225,0.4)',
            transition: 'color 0.3s ease',
            lineHeight: 1.5,
          }}>
            {desc}
          </div>

          {/* hover 时出现的箭头 */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                  marginTop: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: '#00D2BE', letterSpacing: '0.14em',
                }}
              >
                <span>进入</span>
                <span style={{ fontSize: '14px' }}>→</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右下角三角装饰 */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 0, height: 0,
          borderLeft: '28px solid transparent',
          borderBottom: hovered
            ? '28px solid rgba(0,210,190,0.2)'
            : '28px solid rgba(255,255,255,0.03)',
          transition: 'border-bottom-color 0.35s ease',
        }} />
      </Link>
    </motion.div>
  )
}

// ── 主组件 ──────────────────────────────────
export default function NavigationCards() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="modules" style={{
      padding: '80px 0 100px',
      background: 'linear-gradient(to bottom, #0D0D0D, #0a0a0a)',
    }}>
      <div className="page-container">

        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '40px' }}
        >
          {/* 上方细线装饰 */}
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: '40px' } : { width: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '2px',
              background: '#00D2BE',
              marginBottom: '16px',
              borderRadius: '2px',
            }}
          />

          <h2 style={{
            fontFamily: 'var(--font-title)', fontSize: 'clamp(26px, 4vw, 44px)',
            fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase',
            color: '#fff', marginBottom: '10px',
          }}>
            <span style={{ color: '#00D2BE' }}>探索</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'rgba(229,226,225,0.4)', letterSpacing: '0.02em',
          }}>
            选择你感兴趣的模块，深入了解 F1 的方方面面
          </p>
        </motion.div>

        {/* 卡片网格 */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '14px',
          }}
        >
          {NAV_CARDS.map((card, idx) => (
            <NavCard key={card.to} {...card} index={idx} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
