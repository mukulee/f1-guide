// ── F1 GUIDE · StandingsIntro ──────────────────────
// 积分榜页全屏开场动效
// 阶段：playing(0~2s) → collapsing(2~3s) → done
// 收场方式：全屏幕向上折叠，下方页面内容随之显现

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import standingsVideo from '../../assets/video/standings.mp4'
import HeroAtmosphere from '../ui/HeroAtmosphere'

// ── 本地视频（颁奖台/积分揭晓场景） ──────────────
const VIDEO_SRC = standingsVideo

// ── 速度线数据（无视频时兜底） ────────────────────
const SPEED_LINES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: `${4 + i * 5.2}%`,
  width: `${30 + Math.random() * 50}%`,
  left: `${Math.random() * 40}%`,
  delay: Math.random() * 2,
  duration: 0.9 + Math.random() * 1.2,
  opacity: 0.08 + Math.random() * 0.18,
}))

// ── 数据流粒子（无视频时兜底） ────────────────────
const DATA_ITEMS = [
  { label: 'NOR', value: '146 PTS', x: '8%',  y: '22%' },
  { label: 'PIA', value: '135 PTS', x: '72%', y: '18%' },
  { label: 'RUS', value: '117 PTS', x: '20%', y: '68%' },
  { label: 'LEC', value: '113 PTS', x: '60%', y: '72%' },
  { label: 'VER', value: '107 PTS', x: '85%', y: '42%' },
  { label: 'HAM', value: '82 PTS',  x: '5%',  y: '48%' },
]

// ── 赛道弧线 SVG（无视频时兜底） ─────────────────
function TrackArcs() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
    >
      <path d="M-100 450 Q360 150 720 450 Q1080 750 1540 450"
        stroke="#00D2BE" strokeWidth="1.5" fill="none" />
      <path d="M-100 380 Q360 80 720 380 Q1080 680 1540 380"
        stroke="#00D2BE" strokeWidth="0.8" fill="none" strokeDasharray="6 12" />
      <path d="M-100 520 Q360 220 720 520 Q1080 820 1540 520"
        stroke="#00D2BE" strokeWidth="0.8" fill="none" strokeDasharray="6 12" />
      <circle cx="720" cy="450" r="200" stroke="#00D2BE" strokeWidth="0.6" fill="none" />
      <circle cx="720" cy="450" r="320" stroke="#00D2BE" strokeWidth="0.4" fill="none" strokeDasharray="4 16" />
    </svg>
  )
}

// ── 扫描线动效（无视频时兜底） ───────────────────
function ScanLine() {
  return (
    <motion.div
      initial={{ top: '-2%' }}
      animate={{ top: '102%' }}
      transition={{ duration: 2.2, ease: 'linear', repeat: Infinity, repeatDelay: 0.3 }}
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,190,0.5) 30%, rgba(0,210,190,0.8) 50%, rgba(0,210,190,0.5) 70%, transparent 100%)',
        filter: 'blur(1px)',
        pointerEvents: 'none', zIndex: 2,
      }}
    />
  )
}

// ── 数字闪烁组件（无视频时兜底） ────────────────
function DataItem({ label, value, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: [0, 0.7, 0.5, 0.8, 0.6], scale: 1 }}
      transition={{ duration: 0.6, delay, repeat: Infinity, repeatDelay: 1.8 + Math.random() }}
      style={{
        position: 'absolute', left: x, top: y,
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(0,210,190,0.5)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(0,210,190,0.7)' }}>
        {value}
      </div>
    </motion.div>
  )
}

// ── 主组件 ────────────────────────────────────────
export default function StandingsIntro({ onDone }) {
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
        key="intro-overlay"
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
                transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, repeatDelay: 0.5 }}
                style={{
                  position: 'absolute',
                  top: line.top, left: line.left,
                  width: line.width, height: 1,
                  transformOrigin: 'left center',
                  background: 'linear-gradient(to right, transparent, rgba(0,210,190,0.6), transparent)',
                }}
              />
            ))}
            {DATA_ITEMS.map((d, i) => (
              <DataItem key={d.label} {...d} delay={0.3 + i * 0.15} />
            ))}
            <ScanLine />
          </>
        )}

        {/* 径向遮罩（始终存在，有视频时增强文字可读性） */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(5,5,5,0.7) 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── 赛车氛围装饰层 ── */}
        <HeroAtmosphere zIndex={2} variant="standings" />

        {/* ── 核心内容：居中标题 ── */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>

          {/* eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12, letterSpacing: '0.6em' }}
            animate={{ opacity: 0.6, y: 0, letterSpacing: '0.3em' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600,
              color: '#00D2BE',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            F1 GUIDE · 2026 SEASON
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
              textShadow: '0 0 60px rgba(0,210,190,0.2)',
            }}>
              积分榜
            </div>

            {/* 副标题横线装饰 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                margin: '20px auto 0',
                height: 2,
                width: 160,
                background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>

          {/* 副文本 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: '0.18em',
              color: '#9BA8A5', marginTop: 20,
              textTransform: 'uppercase',
            }}
          >
            DRIVER &amp; CONSTRUCTOR STANDINGS
          </motion.div>
        </div>

        {/* 底部 loading 进度条 */}
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
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            style={{
              position: 'absolute', ...pos,
              width: 20, height: 20,
              borderTop: i < 2 ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderBottom: i >= 2 ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderLeft: (i === 0 || i === 2) ? '1px solid rgba(0,210,190,0.5)' : 'none',
              borderRight: (i === 1 || i === 3) ? '1px solid rgba(0,210,190,0.5)' : 'none',
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
