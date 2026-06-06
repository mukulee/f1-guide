import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import scheduleVideo from '../../assets/video/schedule.mp4'
import useBreakpoint from '../../hooks/useBreakpoint'
import HeroAtmosphere from '../ui/HeroAtmosphere'

// ── 可切换的年份 ──────────────────────────────
const YEARS = [2024, 2025, 2026]
const DEFAULT_YEAR = 2026

// ── 倒计时 Hook ───────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now()
    if (diff <= 0) return { days: 0, hrs: 0, min: 0, sec: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hrs : Math.floor((diff % 86400000) / 3600000),
      min : Math.floor((diff % 3600000) / 60000),
      sec : Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

// ── 单个倒计时数字方块（上翻动效） ────────────
function CdBox({ value, label, index, compact }) {
  const display = String(value).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.08 }}
      style={{
        width: compact ? '72px' : '96px',
        padding: compact ? '12px 4px 10px' : '18px 8px 14px',
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(0,210,190,0.3)',
        borderRadius: '6px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* 顶部 cyan 条 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px', background: 'rgba(0,210,190,0.5)',
      }} />
      {/* 中间切割线 */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '1px', background: 'rgba(0,0,0,0.4)', pointerEvents: 'none',
      }} />

      {/* 数字区域 — overflow:hidden 裁剪翻牌 */}
      <div style={{ position: 'relative', height: compact ? '38px' : '52px', width: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={display}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', width: '100%', textAlign: 'center',
              fontFamily: 'var(--font-mono)', fontSize: compact ? '30px' : '44px', fontWeight: 700,
              color: '#00D2BE', lineHeight: compact ? '38px' : '52px', letterSpacing: '-0.02em',
              userSelect: 'none',
            }}
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 单位标签 */}
      <div style={{
        fontFamily: 'var(--font-title)', fontSize: compact ? '9px' : '10px', fontWeight: 600,
        letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)',
        marginTop: compact ? '5px' : '8px', textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </motion.div>
  )
}

// ── 过滤器按钮组 ──────────────────────────────
function FilterTabs({ active, onChange }) {
  const tabs = [
    { key: 'all',       label: '全部' },
    { key: 'upcoming',  label: '即将到来' },
    { key: 'completed', label: '已完赛' },
  ]
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {tabs.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: 'var(--font-title)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '8px 18px', border: 'none', cursor: 'pointer',
              borderRadius: '3px',
              background: isActive ? '#00D2BE' : 'rgba(255,255,255,0.07)',
              color:      isActive ? '#0A0A0A' : '#9BA8A5',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9BA8A5' } }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── 年份选择器 ────────────────────────────────
function YearSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {YEARS.map(y => {
        const isActive = y === value
        return (
          <button
            key={y}
            onClick={() => onChange(y)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '6px 14px', border: '1px solid', cursor: 'pointer',
              borderRadius: '3px',
              borderColor: isActive ? '#00D2BE' : 'rgba(255,255,255,0.12)',
              background: isActive ? 'rgba(0,210,190,0.12)' : 'transparent',
              color: isActive ? '#00D2BE' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(0,210,190,0.4)'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}

// ── 主组件 ─────────────────────────────────────
export default function ScheduleHero({
  nextRace, filter, onFilterChange,
  totalRaces, completedCount,
  selectedYear, onYearChange,
}) {
  const countdown = useCountdown(nextRace?.raceDate ?? new Date(Date.now() + 86400000 * 365))
  const { isMobile } = useBreakpoint()

  // 滚动视差（对齐首页 Hero 效果）
  const { scrollY } = useScroll()
  const contentY       = useTransform(scrollY, [0, 500], [0, -110])
  const contentOpacity = useTransform(scrollY, [0, 380], [1, 0])
  const contentScale   = useTransform(scrollY, [0, 420], [1, 0.88])
  const contentBlur    = useTransform(scrollY, [0, 300], ['blur(0px)', 'blur(10px)'])
  const bgScale        = useTransform(scrollY, [0, 700], [1, 1.15])

  // 滚动到赛事列表
  function scrollToList(e) {
    e.preventDefault()
    const el = document.getElementById('race-list')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 当年份发生变化且没有下一站时，Hero 显示赛季总结或已结束状态
  const hasNextRace = !!nextRace && selectedYear === new Date().getFullYear()

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: '#0D0D0D',
    }}>
      {/* ── 本地背景视频（静音自动播放循环） ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1020 100%)',
      }} />
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center center',
          zIndex: 1, pointerEvents: 'none',
          filter: 'brightness(0.35) saturate(1.1)',
        }}
      >
        <source src={scheduleVideo} type="video/mp4" />
      </video>

      {/* 渐变遮罩（保留底部过渡到内容区的效果） */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: [
          'linear-gradient(to bottom, rgba(13,13,13,0.1) 0%, rgba(13,13,13,0.3) 50%, rgba(13,13,13,0.92) 90%, #0D0D0D 100%)',
          'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,210,190,0.04) 0%, transparent 70%)',
        ].join(', '),
      }} />

      {/* ── 赛车氛围装饰层（速度线 + 遥测HUD + 扫描线）── */}
      <HeroAtmosphere zIndex={3} variant="schedule" />

      {/* 赛道线条装饰 */}
      <div style={{
        position: 'absolute', bottom: '120px', left: 0, right: 0, zIndex: 1,
        height: '1px',
        background: 'linear-gradient(to right, transparent 0%, rgba(0,210,190,0.15) 20%, rgba(0,210,190,0.3) 50%, rgba(0,210,190,0.15) 80%, transparent 100%)',
        animation: 'trackLineIn 1.2s ease 0.8s both',
      }} />

      {/* 主内容（带视差：上移 + 淡出 + 缩小 + 模糊） */}
      <motion.div
        style={{
          position: 'relative', zIndex: 5, textAlign: 'center',
          padding: '0 24px', width: '100%', maxWidth: '860px',
          y: contentY,
          opacity: contentOpacity,
          scale: contentScale,
          filter: contentBlur,
        }}
      >
        {/* 遥测 badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            border: '1px solid #00D2BE', borderRadius: '4px',
            padding: '7px 18px', marginBottom: '28px',
            fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.2em', color: '#00D2BE', textTransform: 'uppercase',
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00D2BE',
            animation: 'dotBounce 1.8s ease-in-out infinite',
          }} />
          {selectedYear} 赛季 · {hasNextRace ? '下一站' : '赛历'}
        </motion.div>

        {/* 赛事名称 */}
        <motion.h1
          key={`title-${selectedYear}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(28px, 5.5vw, 64px)',
            fontWeight: 900, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.03em',
            lineHeight: 1, marginBottom: '48px',
          }}
        >
          {hasNextRace
            ? nextRace.name
            : selectedYear < new Date().getFullYear()
              ? `${selectedYear} 赛季回顾`
              : '赛季进行中'}
        </motion.h1>

        {/* 倒计时 — 仅在有下一站时显示 */}
        {hasNextRace && (
          <>
            <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', justifyContent: 'center', marginBottom: '32px' }}>
              <CdBox value={countdown.days} label="天" index={0} compact={isMobile} />
              <CdBox value={countdown.hrs}  label="时" index={1} compact={isMobile} />
              <CdBox value={countdown.min}  label="分" index={2} compact={isMobile} />
              <CdBox value={countdown.sec}  label="秒" index={3} compact={isMobile} />
            </div>

            {/* 赛道附加信息 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: 'rgba(229,226,225,0.45)', letterSpacing: '0.12em',
                marginBottom: '32px',
              }}
            >
              {nextRace.circuit} · {nextRace.location} · 第 {nextRace.round} 站
            </motion.div>
          </>
        )}

        {/* 查看赛程 CTA 按钮 — 与首页完全一致的 hero-cta 样式 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          style={{ display: 'inline-block' }}
        >
          <a
            href="#race-list"
            className="hero-cta"
            onClick={scrollToList}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            查看赛程
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
        </motion.div>
      </motion.div>

      {/* 底部 meta + 过滤器栏 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6,
        background: 'linear-gradient(to top, rgba(13,13,13,1) 0%, rgba(13,13,13,0.85) 60%, transparent 100%)',
        padding: '20px 0 0',
      }}>
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 0', flexWrap: 'wrap', gap: '12px',
            }}
          >
            {/* 左侧：过滤器 */}
            <FilterTabs active={filter} onChange={onFilterChange} />

            {/* 右侧：年份选择器 + 统计 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <YearSelector value={selectedYear} onChange={onYearChange} />

              <span style={{
                fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                已完赛 {completedCount} / 共 {totalRaces} 站
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
