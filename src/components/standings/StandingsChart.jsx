// ── F1 GUIDE · StandingsChart ──────────────────────
// Chart.js 渐变填充折线走势图
// 复选框【正方形】色块 + 快捷按钮强动效 + 图表入场动画

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBreakpoint from '../../hooks/useBreakpoint.js'
import {
  Chart,
  LineController, LineElement, PointElement, LinearScale,
  CategoryScale, Tooltip, Legend, Filler,
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

// ── 各年赛站简称映射 ────────────────────────────────
const RACE_LABELS = {
  2025: [
    'AUS','CHN','JPN','BHR','SAU','MIA','EMI','MON','CAN',
    'ESP','AUT','GBR','BEL','HUN','NED','ITA','AZE','SGP',
    'USA','MEX','BRA','LVG','QAT','ABU',
  ],
  2026: [
    'AUS','CHN','JPN','MIA','CAN','MON','ESP','AUT','GBR',
    'BEL','HUN','NED','ITA','ESP2','AZE','SGP','USA','MEX',
    'BRA','LVG','QAT','ABU',
  ],
}
// 通用降级标签（轮次编号）
function getRaceLabels(trendLength, year = 2026) {
  const labels = RACE_LABELS[year] ?? RACE_LABELS[2026]
  return labels.slice(0, trendLength)
}

// ── 为每条线建渐变填充 ─────────────────────────────
function buildGradient(ctx, chartArea, color) {
  if (!chartArea) return color + '20'
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradient.addColorStop(0,   color + '55')
  gradient.addColorStop(0.5, color + '18')
  gradient.addColorStop(1,   color + '00')
  return gradient
}

// ── Chart 配置 ────────────────────────────────────
function makeChartOptions(trendLength) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    // 入场动画：从左到右逐点绘制
    animation: {
      duration: 900,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top', align: 'end',
        labels: {
          color: '#E5E2E1', usePointStyle: true,
          pointStyle: 'rectRounded',
          pointStyleWidth: 10,
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10,10,10,0.97)',
        borderColor: 'rgba(0,210,190,0.3)', borderWidth: 1,
        titleColor: '#9BA8A5', bodyColor: '#E5E2E1',
        titleFont: { family: "'JetBrains Mono', monospace", size: 10 },
        bodyFont:  { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 10, cornerRadius: 6,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} pts`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9BA8A5', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#9BA8A5', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        grid:  { color: 'rgba(255,255,255,0.06)', lineWidth: 1 },
        beginAtZero: true,
      },
    },
  }
}

// 渐变 dataset（需要在图表创建后基于 chartArea 设置）
function buildDataset(entity) {
  return {
    label: entity.code,
    data: entity.trend,
    borderColor: entity.color,
    // backgroundColor 初始透明，resize 时更新
    backgroundColor: entity.color + '20',
    pointBackgroundColor: entity.color,
    pointBorderColor: '#0D0D0D',
    pointBorderWidth: 1.5,
    pointRadius: 3.5,
    pointHoverRadius: 7,
    pointHoverBackgroundColor: entity.color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
    tension: 0.4,
    fill: true,           // 填充到底部（走势感）
    borderWidth: 2.5,
    _color: entity.color, // 暂存颜色用于渐变重建
  }
}

// ── 快捷按钮（强动效版） ───────────────────────────
function ActionBtn({ active, onClick, children, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.93 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.12em',
        padding: '7px 16px',
        borderRadius: 4,
        border: active
          ? '1px solid rgba(0,210,190,0.6)'
          : '1px solid rgba(255,255,255,0.12)',
        background: active
          ? 'rgba(0,210,190,0.15)'
          : 'rgba(255,255,255,0.03)',
        color: active ? '#00D2BE' : '#9BA8A5',
        cursor: 'pointer',
        boxShadow: active ? '0 0 18px rgba(0,210,190,0.3), inset 0 0 12px rgba(0,210,190,0.08)' : 'none',
        transition: 'color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s',
      }}
    >
      {/* active 扫光 */}
      {active && (
        <motion.span
          initial={{ left: '-100%' }}
          animate={{ left: '160%' }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 0, width: '60%', height: '100%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(0,210,190,0.25) 50%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </motion.button>
  )
}

// ── 复选框项（正方形色块） ────────────────────────
function CheckItem({ entity, checked, onChange }) {
  return (
    <motion.label
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />

      {/* 正方形色块 */}
      <motion.span
        animate={checked ? {
          background: entity.color,
          borderColor: entity.color,
          boxShadow: `0 0 8px ${entity.color}88`,
        } : {
          background: 'transparent',
          borderColor: 'rgba(255,255,255,0.18)',
          boxShadow: 'none',
        }}
        transition={{ duration: 0.18 }}
        style={{
          width: 12, height: 12,
          borderRadius: 2,        // 正方形（圆角2px）
          flexShrink: 0,
          border: '2px solid',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15, type: 'spring', stiffness: 400 }}
              style={{ fontSize: 7, color: '#0D0D0D', fontWeight: 900, lineHeight: 1 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      {/* 标签 */}
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: '0.1em',
        color: checked ? '#E5E2E1' : '#9BA8A5',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        transition: 'color 0.15s',
      }}>
        {entity.code}
        <span style={{ color: checked ? '#9BA8A5' : '#555', marginLeft: 4 }}>
          {entity.name}
        </span>
      </span>
    </motion.label>
  )
}

// ── 空状态提示 ─────────────────────────────────────
function EmptyState({ isDriver }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: 360, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
      }}
    >
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="rgba(0,210,190,0.3)" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: '#444' }}>
        请选择{isDriver ? '车手' : '车队'}开始对比
      </span>
    </motion.div>
  )
}

// ── 主组件 ─────────────────────────────────────────
export default function StandingsChart({ entities, type = 'driver', maxQuick = 5, year = 2026 }) {
  const { isMobile } = useBreakpoint()
  const isDriver = type === 'driver'
  const hasTop10 = entities.length > 5

  const [selected,    setSelected]    = useState(() => new Set(entities.slice(0, maxQuick).map(e => e.code)))
  const [activeBtn,   setActiveBtn]   = useState('top5')
  const [isComparing, setIsComparing] = useState(false)

  // canvas 始终存在于 DOM，用 ref 直接拿
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  // entities / year 变化时重置状态
  useEffect(() => {
    setSelected(new Set(entities.slice(0, maxQuick).map(e => e.code)))
    setActiveBtn('top5')
    setIsComparing(false)
    // 销毁旧图表
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
  }, [entities, year, maxQuick])

  // ── 重建图表（canvasRef 一定已挂载） ──────────────
  const rebuildChart = useCallback((selectedSet) => {
    if (!canvasRef.current) return
    const canvas   = canvasRef.current
    const ctx      = canvas.getContext('2d')
    const filtered = entities.filter(e => selectedSet.has(e.code))

    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    if (!filtered.length) return

    const maxTrend = Math.max(...filtered.map(e => e.trend?.length ?? 0), 1)
    const labels   = getRaceLabels(maxTrend, year)
    const datasets = filtered.map(buildDataset)

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: makeChartOptions(maxTrend),
    })

    // 渐变填充（需要等 chartArea 可用）
    requestAnimationFrame(() => {
      if (!chartRef.current) return
      const { chartArea } = chartRef.current
      if (!chartArea) return
      chartRef.current.data.datasets.forEach((ds, i) => {
        ds.backgroundColor = buildGradient(ctx, chartArea, filtered[i]?.color ?? '#00D2BE')
      })
      chartRef.current.update('none')
    })
  }, [entities])

  // ── selected 变化时，如果已在对比则重建 ───────────
  useEffect(() => {
    if (!isComparing) return
    rebuildChart(selected)
    // 注意：不在此 cleanup 销毁，避免 selected 变化时闪烁
  }, [selected, rebuildChart]) // 不依赖 isComparing，避免循环

  // ── 组件卸载时销毁 ────────────────────────────────
  useEffect(() => {
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [])

  // 单选切换
  function toggle(code) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
    setActiveBtn(null)
  }

  // 快捷按钮
  function applyQuick(fn, btnKey) {
    const next = new Set(entities.filter((_, i) => fn(i)).map(e => e.code))
    setSelected(next)
    setActiveBtn(btnKey)
  }

  // 开始比较：先设状态，再在下一帧绘图（canvas 已在 DOM 中）
  function handleStartCompare() {
    if (isComparing) return
    setIsComparing(true)
    // 用 setTimeout 确保 React 状态刷新 + motion 动画启动后再绘制
    setTimeout(() => rebuildChart(selected), 50)
  }

  const raceCount = Math.max(...entities.map(e => (e.trend?.length ?? 1)), 1) - 1

  return (
    <div>
      {/* ── 走势图标题栏 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, padding: '20px 0 16px', marginTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9BA8A5',
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {isDriver ? '车手积分走势对比' : '车队积分走势对比'}
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', color: '#555' }}>
          {year} · 前 {raceCount} 站
        </span>
      </div>

      {/* ── 图表主体 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #111 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: isMobile ? 14 : 24,
      }}>
        {/* 快捷按钮行 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <ActionBtn active={activeBtn === 'top5'}  onClick={() => applyQuick(i => i < 5,  'top5')}  delay={0}>
            前 5 {isDriver ? '名' : '支'}
          </ActionBtn>
          {hasTop10 && (
            <ActionBtn active={activeBtn === 'top10'} onClick={() => applyQuick(i => i < 10, 'top10')} delay={0.04}>
              前 10 名
            </ActionBtn>
          )}
          <ActionBtn active={activeBtn === 'all'}   onClick={() => applyQuick(() => true,  'all')}   delay={0.08}>
            全部 {entities.length} {isDriver ? '名' : '支'}
          </ActionBtn>
          <ActionBtn active={activeBtn === 'clear'} onClick={() => applyQuick(() => false, 'clear')} delay={0.12}>
            清空
          </ActionBtn>

          <div style={{ flex: 1, minWidth: 8 }} />

          {/* 开始比较按钮 */}
          <motion.button
            onClick={handleStartCompare}
            whileHover={!isComparing ? { scale: 1.05, y: -2 } : {}}
            whileTap={!isComparing ? { scale: 0.93 } : {}}
            animate={isComparing ? {} : {
              boxShadow: [
                '0 0 0px rgba(0,210,190,0)',
                '0 0 22px rgba(0,210,190,0.55)',
                '0 0 8px rgba(0,210,190,0.25)',
                '0 0 22px rgba(0,210,190,0.55)',
                '0 0 0px rgba(0,210,190,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            style={{
              position: 'relative', overflow: 'hidden',
              fontFamily: 'var(--font-title)',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
              padding: '7px 20px', borderRadius: 4,
              border: isComparing ? '1px solid rgba(0,210,190,0.3)' : '1px solid #00D2BE',
              background: isComparing ? 'rgba(0,210,190,0.08)' : 'rgba(0,210,190,0.18)',
              color: isComparing ? 'rgba(0,210,190,0.6)' : '#00D2BE',
              cursor: isComparing ? 'default' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {!isComparing && (
              <motion.span
                initial={{ left: '-100%' }}
                animate={{ left: '160%' }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                style={{
                  position: 'absolute', top: 0, width: '60%', height: '100%',
                  background: 'linear-gradient(105deg, transparent 20%, rgba(0,210,190,0.3) 50%, transparent 80%)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isComparing ? '▶ 对比中' : '▶ 开始比较'}
          </motion.button>
        </div>

        {/* 复选框多选区 */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: isMobile ? '10px 12px' : '14px 16px',
          maxHeight: isMobile ? 160 : 192,
          overflowY: 'auto',
          marginBottom: 20,
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(120px, 1fr))' : 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '10px 8px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,210,190,0.25) transparent',
        }}>
          {entities.map(e => (
            <CheckItem
              key={e.code}
              entity={e}
              checked={selected.has(e.code)}
              onChange={() => toggle(e.code)}
            />
          ))}
        </div>

        {/* ── 图表区：canvas 始终挂载，切换可见性避免时序竞争 ── */}
        <div style={{ position: 'relative' }}>
          {/* 空状态提示（canvas 上方浮层，仅 !isComparing 时显示） */}
          <AnimatePresence>
            {!isComparing && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                  height: isMobile ? 240 : 380,
                }}
              >
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="rgba(0,210,190,0.25)" strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: '#3a3a3a' }}>
                  请选择{isDriver ? '车手' : '车队'}，再点击 ▶ 开始比较
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* canvas 始终渲染，isComparing 前透明隐藏 */}
          <motion.div
            animate={isComparing
              ? { opacity: 1, scaleY: 1, y: 0 }
              : { opacity: 0, scaleY: 0.9, y: 10 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative', height: isMobile ? 240 : 380,
              borderTop: isComparing ? '1px solid rgba(0,210,190,0.12)' : '1px solid transparent',
              paddingTop: 4,
            }}
          >
            {/* 顶部辉光线 */}
            {isComparing && (
              <div style={{
                position: 'absolute', top: -1, left: '10%', right: '10%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,210,190,0.4), transparent)',
                filter: 'blur(2px)',
              }} />
            )}
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
