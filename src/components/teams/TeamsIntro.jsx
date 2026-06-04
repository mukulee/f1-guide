// ── F1 GUIDE · TeamsIntro ───────────────────────────
// 车队页全屏开场动效（与 StandingsIntro / LearnIntro 同状态机）
// 主题：车队阵列 / 发车网格 / 赛车轮廓

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 视频占位 ──────────────────────────────────────
// 待填入车队开场视频（建议：围场/Pit Lane 场景），留空则显示原有代码动效
const VIDEO_SRC = '' // ← 在此填入视频链接，例如 'https://example.com/teams-intro.mp4'

// ── 发车格速度线（无视频时兜底） ─────────────────
const SPEED_LINES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: `${6 + i * 6.2}%`,
  width: `${25 + Math.random() * 50}%`,
  left: `${Math.random() * 38}%`,
  delay: Math.random() * 1.6,
  duration: 0.7 + Math.random() * 1.0,
  opacity: 0.07 + Math.random() * 0.13,
}))

// ── 车队代表色光点（无视频时兜底） ──────────────
const TEAM_DOTS = [
  { color: '#FF8700', x: '12%', y: '25%' },  // McLaren
  { color: '#DC0000', x: '78%', y: '20%' },  // Ferrari
  { color: '#00D2BE', x: '25%', y: '65%' },  // Mercedes
  { color: '#3671C6', x: '68%', y: '70%' },  // Red Bull
  { color: '#006F62', x: '88%', y: '45%' },  // Aston
  { color: '#0090FF', x: '6%',  y: '50%' },  // Alpine
]

// ── 赛道网格线（无视频时兜底） ───────────────────
function GridLines() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
    >
      {[200, 400, 600, 720, 840, 1040, 1240].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="900"
          stroke="#00D2BE" strokeWidth="0.5" strokeDasharray="4 20" />
      ))}
      {[150, 300, 450, 600, 750].map(y => (
        <line key={y} x1="0" y1={y} x2="1440" y2={y}
          stroke="#00D2BE" strokeWidth="0.4" />
      ))}
      <ellipse cx="720" cy="450" rx="240" ry="150"
        stroke="#00D2BE" strokeWidth="0.6" fill="none" />
      <ellipse cx="720" cy="450" rx="380" ry="240"
        stroke="#00D2BE" strokeWidth="0.35" fill="none" strokeDasharray="6 20" />
    </svg>
  )
}

// ── 扫描线（无视频时兜底） ───────────────────────
function ScanLine() {
  return (
    <motion.div
      initial={{ top: '-2%' }}
      animate={{ top: '102%' }}
      transition={{ duration: 2.3, ease: 'linear', repeat: Infinity, repeatDelay: 0.25 }}
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,190,0.45) 30%, rgba(0,210,190,0.8) 50%, rgba(0,210,190,0.45) 70%, transparent 100%)',
        filter: 'blur(1px)', pointerEvents: 'none', zIndex: 2,
      }}
    />
  )
}

// ── 车队光点组件（无视频时兜底） ─────────────────
function TeamDot({ color, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.8, 0.5, 0.9, 0.6], scale: [0, 1.2, 1] }}
      transition={{ duration: 0.6, delay, repeat: Infinity, repeatDelay: 1.5 + Math.random() }}
      style={{
        position: 'absolute', left: x, top: y,
        width: 6, height: 6, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 12px ${color}`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ── 主组件 ────────────────────────────────────────
export default function TeamsIntro({ onDone }) {
  const [phase, setPhase] = useState('playing')
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
        key="teams-intro-overlay"
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
            <GridLines />
            {SPEED_LINES.map(line => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, line.opacity, 0], scaleX: [0, 1, 1] }}
                transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, repeatDelay: 0.5 }}
                style={{
                  position: 'absolute',
                  top: line.top, left: line.left,
                  width: line.width, height: 1,
                  transformOrigin: 'left center',
                  background: 'linear-gradient(to right, transparent, rgba(0,210,190,0.55), transparent)',
                }}
              />
            ))}
            {TEAM_DOTS.map((d, i) => (
              <TeamDot key={d.color} {...d} delay={0.2 + i * 0.15} />
            ))}
            <ScanLine />
          </>
        )}

        {/* 径向遮罩（始终存在，有视频时增强文字可读性） */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 28%, rgba(5,5,5,0.72) 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── 核心内容 ── */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>

          <motion.div
            initial={{ opacity: 0, y: 12, letterSpacing: '0.6em' }}
            animate={{ opacity: 0.6, y: 0, letterSpacing: '0.28em' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600,
              color: '#00D2BE', marginBottom: 16, textTransform: 'uppercase',
            }}
          >
            F1 GUIDE · 2026 SEASON
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 超大数字 */}
            <div style={{
              fontFamily: "'Titillium Web', sans-serif",
              fontSize: 'clamp(96px, 18vw, 200px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              textShadow: '0 0 80px rgba(0,210,190,0.22)',
            }}>
              11
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              style={{
                fontFamily: "'Titillium Web', sans-serif",
                fontSize: 'clamp(13px, 2vw, 18px)',
                fontWeight: 700, color: '#00D2BE',
                letterSpacing: '0.35em', textTransform: 'uppercase',
                marginTop: 10,
              }}
            >
              支车队参赛
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{
                margin: '18px auto 0', height: 2, width: 140,
                background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: '0.18em',
              color: '#9BA8A5', marginTop: 20, textTransform: 'uppercase',
            }}
          >
            2026 F1 WORLD CHAMPIONSHIP · CONSTRUCTORS
          </motion.div>
        </div>

        {/* 底部进度条 */}
        <motion.div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2, zIndex: 10, background: 'rgba(255,255,255,0.05)',
        }}>
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
          { top: 24, left: 32 }, { top: 24, right: 32 },
          { bottom: 24, left: 32 }, { bottom: 24, right: 32 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.08 }}
            style={{
              position: 'absolute', ...pos, width: 20, height: 20,
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
