// ── F1 GUIDE · HeroAtmosphere ──────────────────────
// 通用 Hero 区赛车氛围装饰层
// 包含：速度线 + 遥测 HUD 数据 + 扫描线
// 用法：叠加在视频层上方，pointerEvents: 'none'
// Props:
//   zIndex  {number} 默认 3，确保在视频层之上、文字层之下
//   variant {'schedule'|'standings'|'learn'|'teams'|'community'}
//            控制遥测数据内容，默认 'schedule'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

// ── 各页面遥测数据（右侧两列，上下各一组）─────────
const TELEMETRY = {
  schedule: {
    topLeft:    [{ label: 'SPEED',   value: '312 KM/H' }, { label: 'GEAR',    value: '8' }],
    topRight:   [{ label: 'ENGINE',  value: '15,000 RPM' }, { label: 'THROTTLE', value: '98%' }],
    bottomLeft: [{ label: 'DRS',     value: 'ACTIVE',   pulse: true }],
    bottomRight:[{ label: 'LAP TIME',value: '1:23.456' }, { label: 'SECTOR 3',value: '32.1' }],
  },
  standings: {
    topLeft:    [{ label: 'LEADER',  value: 'NOR' }, { label: 'POINTS',  value: '146 PTS' }],
    topRight:   [{ label: 'SEASON',  value: '2026' }, { label: 'ROUNDS',  value: '24' }],
    bottomLeft: [{ label: 'STATUS',  value: 'LIVE',  pulse: true }],
    bottomRight:[{ label: 'GAP',     value: '+0.3 S' }, { label: 'FASTEST', value: '1:20.123' }],
  },
  learn: {
    topLeft:    [{ label: 'MODULE',  value: '10 TOTAL' }, { label: 'LEVEL',   value: 'BEGINNER' }],
    topRight:   [{ label: 'DRS',     value: 'OPEN' }, { label: 'AERO',    value: 'GROUND FX' }],
    bottomLeft: [{ label: 'LOADING', value: 'READY',  pulse: true }],
    bottomRight:[{ label: 'LAP REC', value: '1:10.457' }, { label: 'ENGINE',  value: 'HYBRID' }],
  },
  teams: {
    topLeft:    [{ label: 'TEAMS',   value: '10 TOTAL' }, { label: 'SEASON',  value: '2026' }],
    topRight:   [{ label: 'ENGINES', value: '4 SUPPLIERS' }, { label: 'DRIVERS', value: '20' }],
    bottomLeft: [{ label: 'RACE MODE',value: 'ON',  pulse: true }],
    bottomRight:[{ label: 'WCC LEAD', value: 'MCL' }, { label: 'POINTS GAP',value: '46 PTS' }],
  },
  community: {
    topLeft:    [{ label: 'FANS',    value: 'ONLINE' }, { label: 'DEBATE',  value: 'LIVE' }],
    topRight:   [{ label: 'VOTES',   value: '2,048' }, { label: 'SEASON',  value: '2026' }],
    bottomLeft: [{ label: 'FEED',    value: 'LIVE',   pulse: true }],
    bottomRight:[{ label: 'NEXT RACE',value: 'CAN GP' }, { label: 'ROUND',   value: '6/24' }],
  },
}

// ── 速度线配置（固定种子，避免 SSR 不一致）────────
const SPEED_LINES = [
  { top: '18%', width: '38%', duration: 2.2, delay: 0.0, opacity: 0.38 },
  { top: '34%', width: '55%', duration: 2.8, delay: 0.7, opacity: 0.28 },
  { top: '51%', width: '28%', duration: 1.9, delay: 1.4, opacity: 0.42 },
  { top: '67%', width: '45%', duration: 3.1, delay: 0.3, opacity: 0.22 },
  { top: '82%', width: '33%', duration: 2.4, delay: 1.1, opacity: 0.32 },
]

// ── 遥测数字随机闪烁（模拟实时数据跳动）────────────
function TelemetryItem({ label, value, pulse = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      style={{ marginBottom: '8px', lineHeight: 1 }}
    >
      {/* label 行 */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px', fontWeight: 500,
        letterSpacing: '0.22em',
        color: 'rgba(0,210,190,0.5)',
        textTransform: 'uppercase',
        marginBottom: '3px',
      }}>
        {label}
      </div>

      {/* value 行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {pulse && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#00D2BE',
              boxShadow: '0 0 6px rgba(0,210,190,0.8)',
              flexShrink: 0,
            }}
          />
        )}
        <motion.span
          animate={{ opacity: [1, 0.75, 1] }}
          transition={{ duration: 2.8 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#00D2BE',
          }}
        >
          {value}
        </motion.span>
      </div>
    </motion.div>
  )
}

// ── 一组遥测项（一个角落）────────────────────────
function TelemetryGroup({ items = [], style = {}, baseDelay = 0 }) {
  if (!items.length) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: baseDelay }}
      style={{
        position: 'absolute',
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(0,210,190,0.18)',
        borderRadius: '3px',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      {items.map((item, i) => (
        <TelemetryItem
          key={item.label}
          {...item}
          delay={baseDelay + i * 0.12}
        />
      ))}
    </motion.div>
  )
}

// ── 扫描线 ────────────────────────────────────────
function ScanLine() {
  return (
    <motion.div
      initial={{ top: '-1%' }}
      animate={{ top: '101%' }}
      transition={{ duration: 4.5, ease: 'linear', repeat: Infinity, repeatDelay: 1.5 }}
      style={{
        position: 'absolute', left: 0, right: 0,
        height: '1px', zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,190,0.25) 20%, rgba(0,210,190,0.55) 50%, rgba(0,210,190,0.25) 80%, transparent 100%)',
        filter: 'blur(0.5px)',
      }}
    />
  )
}

// ── 主组件 ────────────────────────────────────────
export default function HeroAtmosphere({ zIndex = 3, variant = 'schedule' }) {
  const tele = TELEMETRY[variant] ?? TELEMETRY.schedule

  return (
    <div style={{
      position: 'absolute', inset: 0,
      zIndex, pointerEvents: 'none',
      overflow: 'hidden',
    }}>

      {/* ── 速度线（从左侧飞入）── */}
      {SPEED_LINES.map((line, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 1, 0],
            opacity: [0, line.opacity, line.opacity * 0.8, 0],
          }}
          transition={{
            duration: line.duration,
            delay: line.delay,
            repeat: Infinity,
            repeatDelay: 2.5 + i * 0.6,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: line.top,
            left: 0,
            width: line.width,
            height: '1px',
            transformOrigin: 'left center',
            background: 'linear-gradient(to right, rgba(0,210,190,0.8), rgba(0,210,190,0.4), transparent)',
            boxShadow: '0 0 4px rgba(0,210,190,0.3)',
          }}
        />
      ))}

      {/* ── 扫描线 ── */}
      <ScanLine />

      {/* ── 遥测 HUD — 四个角落 ── */}
      <TelemetryGroup
        items={tele.topLeft}
        style={{ top: '88px', left: '32px' }}
        baseDelay={0.4}
      />
      <TelemetryGroup
        items={tele.topRight}
        style={{ top: '88px', right: '32px', textAlign: 'right', alignItems: 'flex-end' }}
        baseDelay={0.55}
      />
      <TelemetryGroup
        items={tele.bottomLeft}
        style={{ bottom: '96px', left: '32px' }}
        baseDelay={0.7}
      />
      <TelemetryGroup
        items={tele.bottomRight}
        style={{ bottom: '96px', right: '32px', textAlign: 'right' }}
        baseDelay={0.85}
      />

      {/* ── 左侧竖向细线 ── */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.2 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: '24px', top: '10%', bottom: '10%',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(0,210,190,0.6), rgba(0,210,190,0.6), transparent)',
          transformOrigin: 'top center',
        }}
      />
      {/* ── 右侧竖向细线 ── */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.2 }}
        transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          right: '24px', top: '10%', bottom: '10%',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(0,210,190,0.6), rgba(0,210,190,0.6), transparent)',
          transformOrigin: 'top center',
        }}
      />
    </div>
  )
}
