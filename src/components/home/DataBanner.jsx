import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import useBreakpoint from '../../hooks/useBreakpoint'

// ── easeOutExpo CountUp Hook ─────────────────
function useCountUp(target, duration = 1400, trigger = false) {
  const [value, setValue] = useState(0)
  const [done, setDone]   = useState(false)

  useEffect(() => {
    if (!trigger) return
    setDone(false)
    const startTime = performance.now()
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    }
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      setValue(Math.round(easeOutExpo(progress) * target))
      if (progress < 1) requestAnimationFrame(update)
      else { setValue(target); setDone(true) }
    }
    requestAnimationFrame(update)
  }, [trigger, target, duration])

  return { value, done }
}

// ── 单个数据项 ─────────────────────────────────
function DataItem({ eyebrow, target, suffix, label, delay, accentWidth = '48px' }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState(false)
  const { value, done } = useCountUp(target, 1400, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '52px 0',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
        cursor: 'default',
        transition: 'transform 0.4s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* 顶部 cyan 展开线 */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        height: '2px',
        width: hovered ? '100%' : '0%',
        background: 'linear-gradient(to right, #00D2BE, rgba(0,210,190,0.2))',
        transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }} />

      {/* 标签 */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.15 }}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.24em',
          color: hovered ? '#00D2BE' : 'rgba(0,210,190,0.65)',
          textTransform: 'uppercase', marginBottom: '12px',
          transition: 'color 0.3s ease',
        }}
      >
        {eyebrow}
      </motion.div>

      {/* 数字 — 计数时发光脉冲 */}
      <div style={{
        fontFamily: 'var(--font-title)', fontSize: '76px', fontWeight: 900,
        color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '6px',
        textShadow: (!done && inView)
          ? '0 0 40px rgba(0,210,190,0.5), 0 0 80px rgba(0,210,190,0.2)'
          : hovered
            ? '0 0 30px rgba(0,210,190,0.4), 0 0 60px rgba(0,210,190,0.15)'
            : 'none',
        transition: 'text-shadow 0.4s ease',
      }}>
        {value.toLocaleString()}
        <span style={{
          color: '#00D2BE',
          fontSize: '0.55em',
          fontWeight: 700,
          marginLeft: '4px',
          opacity: 0.9,
        }}>
          {suffix}
        </span>
      </div>

      {/* 底部 accent 进度条 */}
      <div style={{ marginBottom: '12px', height: '2px', width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: accentWidth } : { width: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: delay + 0.35 }}
          style={{
            height: '100%',
            background: hovered
              ? 'linear-gradient(to right, #00D2BE, rgba(0,210,190,0.4))'
              : 'linear-gradient(to right, rgba(0,210,190,0.7), rgba(0,210,190,0.2))',
            borderRadius: '2px',
            transition: 'background 0.3s ease',
          }}
        />
      </div>

      {/* 说明文字 */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: hovered ? 'rgba(229,226,225,0.65)' : 'rgba(229,226,225,0.4)',
        lineHeight: 1.6,
        transition: 'color 0.3s ease',
        whiteSpace: 'pre-line',
      }}>
        {label}
      </div>

      {/* 右下三角装饰 */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderLeft: '20px solid transparent',
        borderBottom: hovered ? '20px solid rgba(0,210,190,0.15)' : '20px solid transparent',
        transition: 'border-bottom-color 0.35s ease',
      }} />
    </motion.div>
  )
}

// ── 主组件 ─────────────────────────────────────
const STATS = [
  {
    eyebrow: '极速纪录',
    target: 373,
    suffix: ' km/h',
    label: 'F1 赛车最高时速纪录\n由威廉姆斯创下于 2016 年',
    delay: 0,
    accentWidth: '55%',
  },
  {
    eyebrow: '2026 赛季',
    target: 22,
    suffix: ' 站',
    label: '横跨五大洲 · 共 22 名车手\n11 支车队激烈角逐',
    delay: 0.14,
    accentWidth: '25%',
  },
  {
    eyebrow: '引擎功率',
    target: 1000,
    suffix: ' hp',
    label: '混合动力单元总输出功率\n内燃机 + MGU-K 协同驱动',
    delay: 0.28,
    accentWidth: '80%',
  },
]

export default function DataBanner() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { isMobile } = useBreakpoint()

  return (
    <section id="explore" style={{
      background: '#0D0D0D',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景辉光 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '200px',
          background: 'radial-gradient(ellipse, rgba(0,210,190,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={ref}
        className="page-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          position: 'relative',
        }}
      >
        {STATS.map((stat, idx) => (
          <div
            key={stat.eyebrow}
            style={{
              paddingLeft:  isMobile ? 0 : (idx > 0 ? '48px' : 0),
              paddingRight: isMobile ? 0 : (idx < STATS.length - 1 ? '48px' : 0),
              borderRight: (!isMobile && idx < STATS.length - 1)
                ? '1px solid rgba(255,255,255,0.05)'
                : 'none',
              borderBottom: (isMobile && idx < STATS.length - 1)
                ? '1px solid rgba(255,255,255,0.05)'
                : 'none',
            }}
          >
            <DataItem {...stat} />
          </div>
        ))}
      </div>
    </section>
  )
}
