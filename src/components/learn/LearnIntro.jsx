// ── F1 GUIDE · LearnIntro ───────────────────────────
// 科普页全屏开场动效
// 阶段：playing(0~2s) → collapsing(2~3s，y: '-100%' 向上滑走) → done
// 与 StandingsIntro 同一套状态机，内容主题为「知识/科普」

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import learnVideo from '../../assets/video/learn.mp4'
import HeroAtmosphere from '../ui/HeroAtmosphere'

// ── 本地视频（赛车技术特写/科普场景） ──────────────
const VIDEO_SRC = learnVideo

// ── 速度线（无视频时兜底） ────────────────────────
const SPEED_LINES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  top: `${5 + i * 5.8}%`,
  width: `${20 + Math.random() * 55}%`,
  left: `${Math.random() * 35}%`,
  delay: Math.random() * 1.8,
  duration: 0.8 + Math.random() * 1.1,
  opacity: 0.06 + Math.random() * 0.14,
}))

// ── 浮动关键词（无视频时兜底） ───────────────────
const KEYWORDS = [
  { text: 'DRS',          x: '7%',  y: '20%' },
  { text: 'AERODYNAMICS', x: '65%', y: '14%' },
  { text: 'PIT STOP',     x: '18%', y: '72%' },
  { text: 'TYRE STRATEGY',x: '58%', y: '68%' },
  { text: 'SAFETY CAR',   x: '80%', y: '38%' },
  { text: 'POWER UNIT',   x: '4%',  y: '50%' },
]

// ── 赛道弧线 SVG（无视频时兜底） ─────────────────
function TrackArcs() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
    >
      <path d="M-80 500 Q400 180 720 500 Q1040 820 1520 500"
        stroke="#00D2BE" strokeWidth="1.5" fill="none" />
      <path d="M-80 430 Q400 110 720 430 Q1040 750 1520 430"
        stroke="#00D2BE" strokeWidth="0.8" fill="none" strokeDasharray="5 14" />
      <path d="M-80 570 Q400 250 720 570 Q1040 890 1520 570"
        stroke="#00D2BE" strokeWidth="0.8" fill="none" strokeDasharray="5 14" />
      <circle cx="720" cy="500" r="180" stroke="#00D2BE" strokeWidth="0.5" fill="none" />
      <circle cx="720" cy="500" r="300" stroke="#00D2BE" strokeWidth="0.4" fill="none" strokeDasharray="3 18" />
      <line x1="0" y1="0" x2="300" y2="900" stroke="#00D2BE" strokeWidth="0.3" opacity="0.5" />
      <line x1="1440" y1="0" x2="1140" y2="900" stroke="#00D2BE" strokeWidth="0.3" opacity="0.5" />
    </svg>
  )
}

// ── 扫描线（无视频时兜底） ───────────────────────
function ScanLine() {
  return (
    <motion.div
      initial={{ top: '-2%' }}
      animate={{ top: '102%' }}
      transition={{ duration: 2.4, ease: 'linear', repeat: Infinity, repeatDelay: 0.2 }}
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,190,0.4) 30%, rgba(0,210,190,0.75) 50%, rgba(0,210,190,0.4) 70%, transparent 100%)',
        filter: 'blur(1px)',
        pointerEvents: 'none', zIndex: 2,
      }}
    />
  )
}

// ── 浮动关键词组件（无视频时兜底） ──────────────
function Keyword({ text, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 0.5, 0.35, 0.6, 0.4], y: 0 }}
      transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: 2 + Math.random() * 1.5 }}
      style={{
        position: 'absolute', left: x, top: y,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, fontWeight: 500,
        letterSpacing: '0.22em',
        color: 'rgba(0,210,190,0.55)',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </motion.div>
  )
}

// ── 主组件 ────────────────────────────────────────
export default function LearnIntro({ onDone }) {
  const [phase, setPhase] = useState('playing') // 'playing' | 'collapsing' | 'done'
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase('collapsing'), 2000)
    return () => clearTimeout(timerRef.current)
  }, [])

  function handleCollapseComplete() {
    setPhase('done')
    onDone?.()
  }

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="learn-intro-overlay"
        animate={phase === 'collapsing' ? { y: '-100%' } : { y: '0%' }}
        transition={phase === 'collapsing'
          ? { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
          : { duration: 0 }
        }
        onAnimationComplete={phase === 'collapsing' ? handleCollapseComplete : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#050505',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* ── 背景层：有视频用视频，无视频用代码动效兜底 ── */}
        {VIDEO_SRC ? (
          /* 视频背景 */
          <video
            autoPlay muted loop playsInline
            style={{
              position: 'absolute', inset: 0, zIndex: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          /* 代码动效兜底 */
          <>
            <TrackArcs />
            {SPEED_LINES.map(line => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, line.opacity, 0], scaleX: [0, 1, 1] }}
                transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, repeatDelay: 0.6 }}
                style={{
                  position: 'absolute',
                  top: line.top, left: line.left,
                  width: line.width, height: 1,
                  transformOrigin: 'left center',
                  background: 'linear-gradient(to right, transparent, rgba(0,210,190,0.55), transparent)',
                }}
              />
            ))}
            {KEYWORDS.map((kw, i) => (
              <Keyword key={kw.text} {...kw} delay={0.25 + i * 0.18} />
            ))}
            <ScanLine />
          </>
        )}

        {/* 径向遮罩（始终存在，有视频时增强文字可读性） */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 25%, rgba(5,5,5,0.72) 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── 赛车氛围装饰层 ── */}
        <HeroAtmosphere zIndex={2} variant="learn" />

        {/* ── 核心内容 ── */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>

          {/* eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12, letterSpacing: '0.6em' }}
            animate={{ opacity: 0.6, y: 0, letterSpacing: '0.28em' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600,
              color: '#00D2BE',
              marginBottom: 16, textTransform: 'uppercase',
            }}
          >
            F1 GUIDE · 知识中心
          </motion.div>

          {/* 主标题 */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              fontFamily: "'Titillium Web', sans-serif",
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1,
              textShadow: '0 0 60px rgba(0,210,190,0.18)',
            }}>
              科普指南
            </div>

            {/* 横线装饰 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                margin: '20px auto 0',
                height: 2, width: 160,
                background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>

          {/* 副文本 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: '0.18em',
              color: '#9BA8A5', marginTop: 20,
              textTransform: 'uppercase',
            }}
          >
            10 MODULES · FROM BEGINNER TO EXPERT
          </motion.div>
        </div>

        {/* 底部进度条 */}
        <motion.div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2, zIndex: 10,
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'linear' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00D2BE, rgba(0,210,190,0.4))',
              boxShadow: '0 0 8px rgba(0,210,190,0.6)',
            }}
          />
        </motion.div>

        {/* 四角装饰 */}
        {[
          { top: 24, left: 32 },
          { top: 24, right: 32 },
          { bottom: 24, left: 32 },
          { bottom: 24, right: 32 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.08 }}
            style={{
              position: 'absolute', ...pos,
              width: 20, height: 20,
              borderTop:    i < 2  ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderBottom: i >= 2 ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderLeft:  (i === 0 || i === 2) ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderRight: (i === 1 || i === 3) ? '1px solid rgba(0,210,190,0.5)' : 'none',
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
