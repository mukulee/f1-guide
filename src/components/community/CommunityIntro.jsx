// ── F1 GUIDE · CommunityIntro ─────────────────────────
// 社区页全屏开场动效
// 阶段：playing(0~2s) → collapsing(2~3s) → done
// 主题：围场人群粒子 + 投票数字飞入 + 赛旗波纹

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 视频占位 ──────────────────────────────────────
// 待填入社区开场视频（建议：观众席/粉丝互动场景），留空则显示原有代码动效
const VIDEO_SRC = '' // ← 在此填入视频链接，例如 'https://example.com/community-intro.mp4'

// ── 粒子数据（无视频时兜底，模拟在线人群） ────────
const CROWD_DOTS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  x: `${5 + (i % 12) * 8.3 + (Math.random() - 0.5) * 6}%`,
  y: `${12 + Math.floor(i / 12) * 28 + (Math.random() - 0.5) * 10}%`,
  r: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 1.8,
  color: i % 5 === 0 ? '#FF8700' : i % 7 === 0 ? '#DC0000' : '#00D2BE',
  opacity: 0.3 + Math.random() * 0.5,
}))

// ── 速度线（无视频时兜底） ────────────────────────
const SPEED_LINES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: `${6 + i * 6.5}%`,
  width: `${20 + Math.random() * 45}%`,
  left: `${Math.random() * 35}%`,
  delay: Math.random() * 2,
  duration: 1 + Math.random() * 1.2,
  opacity: 0.06 + Math.random() * 0.12,
}))

// ── 投票数字（无视频时兜底） ─────────────────────
const VOTE_ITEMS = [
  { label: '热门辩论',  value: '4场',    x: '10%', y: '30%', color: '#00D2BE' },
  { label: '社区成员',  value: '12,847', x: '68%', y: '22%', color: '#00D2BE' },
  { label: '本周投票',  value: '16,044', x: '22%', y: '65%', color: '#FF8700' },
  { label: '活跃车迷',  value: '2,391',  x: '62%', y: '68%', color: '#FF8700' },
  { label: '讨论话题',  value: '48',     x: '80%', y: '48%', color: '#00D2BE' },
]

// ── 赛旗波纹 SVG（无视频时兜底） ─────────────────
function FlagRipple() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
    >
      <path d="M-80 450 Q360 120 720 450 Q1080 780 1520 450"
        stroke="#00D2BE" strokeWidth="1.5" fill="none" />
      <path d="M-80 380 Q360 50 720 380 Q1080 710 1520 380"
        stroke="#00D2BE" strokeWidth="0.7" fill="none" strokeDasharray="8 16" />
      <circle cx="720" cy="450" r="120" stroke="#00D2BE" strokeWidth="0.5" fill="none" />
      <circle cx="720" cy="450" r="220" stroke="#00D2BE" strokeWidth="0.4" fill="none" strokeDasharray="4 14" />
      <circle cx="720" cy="450" r="340" stroke="#00D2BE" strokeWidth="0.3" fill="none" strokeDasharray="3 20" />
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 12 }, (_, c) => (
          (r + c) % 2 === 0 &&
          <rect key={`${r}-${c}`} x={c * 12} y={r * 12} width={12} height={12}
            fill="#FFFFFF" opacity="0.4" />
        ))
      )}
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
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,190,0.5) 30%, rgba(0,210,190,0.9) 50%, rgba(0,210,190,0.5) 70%, transparent 100%)',
        filter: 'blur(1px)',
        pointerEvents: 'none', zIndex: 2,
      }}
    />
  )
}

// ── 主组件 ────────────────────────────────────────
export default function CommunityIntro({ onDone }) {
  const [phase, setPhase] = useState('playing') // 'playing' | 'collapsing' | 'done'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('collapsing'), 2000)
    const t2 = setTimeout(() => {
      setPhase('done')
      onDone?.()
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="community-intro"
          initial={{ y: 0 }}
          animate={phase === 'collapsing' ? { y: '-100%' } : { y: 0 }}
          transition={{ duration: 0.88, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed', inset: 0,
            background: '#0D0D0D',
            zIndex: 9999, overflow: 'hidden',
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
              <FlagRipple />
              {SPEED_LINES.map(l => (
                <motion.div
                  key={l.id}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: l.opacity }}
                  transition={{ delay: l.delay, duration: l.duration, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: l.top, left: l.left,
                    width: l.width, height: 1,
                    background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
                    transformOrigin: 'left',
                  }}
                />
              ))}
              <ScanLine />
              {CROWD_DOTS.map(d => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: d.opacity, scale: 1 }}
                  transition={{ delay: d.delay, duration: 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: d.x, top: d.y,
                    width: d.r * 2, height: d.r * 2,
                    borderRadius: '50%',
                    background: d.color,
                    filter: 'blur(0.5px)',
                  }}
                />
              ))}
              {VOTE_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.14, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', left: item.x, top: item.y,
                    fontFamily: 'var(--font-mono)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color, letterSpacing: '0.04em' }}>
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {/* 径向遮罩（始终存在，有视频时增强文字可读性） */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 28%, rgba(13,13,13,0.75) 100%)',
            pointerEvents: 'none',
          }} />

          {/* 四角装饰 */}
          {[
            { top: 20, left: 20 }, { top: 20, right: 20 },
            { bottom: 20, left: 20 }, { bottom: 20, right: 20 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos, zIndex: 10,
              width: 20, height: 20,
              borderTop: i < 2 ? '1.5px solid rgba(0,210,190,0.4)' : 'none',
              borderBottom: i >= 2 ? '1.5px solid rgba(0,210,190,0.4)' : 'none',
              borderLeft: (i === 0 || i === 2) ? '1.5px solid rgba(0,210,190,0.4)' : 'none',
              borderRight: (i === 1 || i === 3) ? '1.5px solid rgba(0,210,190,0.4)' : 'none',
            }} />
          ))}

          {/* 进度条 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: 'linear' }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 2, zIndex: 10,
              background: 'linear-gradient(90deg, #00D2BE, #FF8700)',
              transformOrigin: 'left',
            }}
          />

          {/* 中央主文字 */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 0,
          }}>
            {/* 眉标 */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.24em', color: 'rgba(0,210,190,0.7)',
                marginBottom: 18, textTransform: 'uppercase',
              }}
            >
              2026 · 围场俱乐部
            </motion.div>

            {/* 大标题行1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(52px, 10vw, 110px)',
                fontWeight: 900,
                color: '#00D2BE',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.95,
              }}
            >
              围场
            </motion.div>

            {/* 大标题行2 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(52px, 10vw, 110px)',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.95,
                marginBottom: 20,
              }}
            >
              俱乐部
            </motion.div>

            {/* 副标签 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.35em', color: 'rgba(0,210,190,0.7)',
                textTransform: 'uppercase',
              }}
            >
              车迷社区 · 实时辩论
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
