import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { fetchRaceResult, fetchFastestLap } from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint.js'
import TrackMap from './TrackMap.jsx'

// ── 状态 Badge ────────────────────────────────
const BADGE_STYLES = {
  completed: { background: 'rgba(255,255,255,0.06)', color: '#9BA8A5',  border: 'none',                              label: '已完赛' },
  next:      { background: 'rgba(255,23,68,0.1)',    color: '#FF1744',  border: '1px solid rgba(255,23,68,0.5)',     label: '下一站' },
  upcoming:  { background: 'rgba(0,210,190,0.08)',   color: '#00D2BE',  border: '1px solid rgba(0,210,190,0.3)',     label: '即将到来' },
}
function Badge({ status }) {
  const s = BADGE_STYLES[status] ?? BADGE_STYLES.upcoming
  return (
    <span style={{
      fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: '3px', whiteSpace: 'nowrap',
      ...s,
    }}>
      {s.label}
    </span>
  )
}

// ── 颁奖台卡片 ────────────────────────────────
const POS_STYLES = {
  1: { color: '#FFD700', borderColor: 'rgba(255,215,0,0.3)' },
  2: { color: '#C0C0C0', borderColor: 'rgba(192,192,192,0.2)' },
  3: { color: '#CD7F32', borderColor: 'rgba(205,127,50,0.2)' },
}
function PodiumCard({ pos, driver, team, points }) {
  const s = POS_STYLES[pos]
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${s.borderColor}`,
      borderRadius: '8px', padding: '16px 12px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '6px' }}>
        {String(pos).padStart(2, '0')}
      </div>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginBottom: '3px' }}>
        {driver}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9BA8A5' }}>
        {team} · {points}
      </div>
    </div>
  )
}

// ── 成绩加载占位 ──────────────────────────────
function ResultSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px', padding: '16px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ width: '28px', height: '22px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', animation: 'dotBounce 1.4s ease-in-out infinite' }} />
          <div style={{ width: '70%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
          <div style={{ width: '50%', height: '8px',  background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }} />
        </div>
      ))}
    </div>
  )
}

// ── 展开详情面板（含懒加载） ──────────────────
function RaceDetail({ race, year }) {
  const { isMobile } = useBreakpoint()
  const isCompleted = race.status === 'completed'

  // 懒加载状态：
  // 静态 JSON 已有 podium → 不需要拉取；2024 / API 来的 → podium 为 null 时拉取
  const [podium,     setPodium]     = useState(race.podium ?? null)
  const [fastestLap, setFastestLap] = useState(race.fastestLap ?? null)
  const [loadingResult, setLoadingResult] = useState(false)
  const [resultError,   setResultError]   = useState(false)
  const fetchedRef = useRef(false) // 避免重复拉取

  useEffect(() => {
    if (!isCompleted || podium !== null || fetchedRef.current) return
    fetchedRef.current = true
    setLoadingResult(true)
    setResultError(false)

    Promise.all([
      fetchRaceResult(year, race.round),
      fetchFastestLap(year, race.round),
    ]).then(([p, fl]) => {
      if (p)  setPodium(p)
      if (fl) setFastestLap(fl)
      if (!p) setResultError(true)
    }).finally(() => setLoadingResult(false))
  }, [race.round, year, isCompleted]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: 'hidden' }}
    >
      {/* 展开详情容器 — 明显区别于列表行背景 */}
      <div style={{
        margin: '2px 0 6px',
        background: 'linear-gradient(135deg, rgba(0,18,16,0.95) 0%, rgba(0,8,7,0.98) 100%)',
        border: '1px solid rgba(0,210,190,0.22)',
        borderLeft: '3px solid rgba(0,210,190,0.6)',
        borderRadius: '0 6px 6px 6px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,210,190,0.06), inset 0 1px 0 rgba(0,210,190,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 顶部 cyan 渐变高亮线 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(to right, rgba(0,210,190,0.6) 0%, rgba(0,210,190,0.2) 40%, transparent 100%)',
        }} />
        {/* 右上角辉光 */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px',
          background: 'radial-gradient(circle, rgba(0,210,190,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      <div style={{ padding: isMobile ? '16px 16px' : '24px 28px' }}>

        {/* 已完赛：颁奖台 + 最快圈速 */}
        {isCompleted && (
          <>
            {/* 加载中骨架 */}
            {loadingResult && <ResultSkeleton />}

            {/* 无数据（API 拉不到） */}
            {!loadingResult && resultError && (
              <div style={{
                padding: '20px', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: 'rgba(229,226,225,0.3)', letterSpacing: '0.12em',
                marginBottom: '14px',
              }}>
                暂无成绩数据
              </div>
            )}

            {/* 颁奖台 */}
            {!loadingResult && podium && podium.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  {podium.map(p => <PodiumCard key={p.pos} {...p} />)}
                </div>

                {fastestLap && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(0,210,190,0.05)', border: '1px solid rgba(0,210,190,0.15)',
                    borderRadius: '6px', marginBottom: '14px',
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#00D2BE" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#9BA8A5' }}>最快圈速</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#00D2BE' }}>
                        {fastestLap.time} — {fastestLap.driver}（第 {fastestLap.lap} 圈）
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 两列：赛道信息 + 周末赛程（移动端单列） */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '20px' }}>

          {/* 赛道参数 */}
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: '#9BA8A5', marginBottom: '10px', textTransform: 'uppercase' }}>
              赛道信息
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: '赛道长度',  value: race.trackLength },
                { label: '圈数',      value: race.laps ? `${race.laps} 圈` : null },
                { label: '圈速纪录',  value: race.lapRecord, cyan: true },
                { label: '纪录保持者', value: race.recordHolder },
              ].filter(i => i.value).map(({ label, value, cyan }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#9BA8A5', marginBottom: '3px', letterSpacing: '0.12em' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: cyan ? '#00D2BE' : '#fff' }}>{value}</div>
                </div>
              ))}
              {/* 如果没有赛道数据 */}
              {!race.trackLength && !race.laps && (
                <div style={{ gridColumn: '1 / -1', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(229,226,225,0.25)', letterSpacing: '0.1em' }}>
                  赛道数据待补充
                </div>
              )}
            </div>
          </div>

          {/* 周末赛程 */}
          {race.sessions?.length > 0 ? (
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: '#9BA8A5', marginBottom: '10px', textTransform: 'uppercase' }}>
                周末赛程
              </div>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                {race.sessions.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px',
                      borderBottom: idx < race.sessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: s.isRace ? 'rgba(0,210,190,0.07)' : s.highlight ? 'rgba(0,210,190,0.03)' : 'transparent',
                      borderTop: s.isRace ? '1px solid rgba(0,210,190,0.2)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: s.highlight ? '#00D2BE' : '#E5E2E1', fontWeight: s.isRace ? 600 : 400 }}>
                        {s.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#9BA8A5', marginTop: '1px' }}>
                        {s.day}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: s.isRace ? '17px' : '14px',
                      fontWeight: 700,
                      color: s.highlight ? '#00D2BE' : '#E5E2E1',
                    }}>
                      {s.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9BA8A5', letterSpacing: '0.12em' }}>赛程待公布</span>
            </div>
          )}
        </div>

        {/* 赛道地图 */}
        <div style={{ marginTop: isMobile ? '16px' : '20px' }}>
          <div style={{
            fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.15em', color: '#9BA8A5', marginBottom: '10px',
            textTransform: 'uppercase',
          }}>
            赛道地图
          </div>
          <TrackMap location={race.location} circuit={race.circuit} />
        </div>

      </div>{/* padding div */}
      </div>{/* 容器 div */}
    </motion.div>
  )
}

// ── 单行赛事 ──────────────────────────────────
function RaceRow({ race, index, year }) {
  const { isMobile } = useBreakpoint()
  const [open, setOpen] = useState(race.status === 'next')
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const isNext = race.status === 'next'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(index * 0.04, 0.4) }}
      style={{ marginBottom: '4px' }}
    >
      {/* 行本体 */}
      <div
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 14px' : '18px 22px',
          background: isNext
            ? hovered ? 'rgba(0,210,190,0.09)' : 'rgba(0,210,190,0.05)'
            : hovered ? 'rgba(0,210,190,0.04)' : 'rgba(255,255,255,0.02)',
          border: isNext
            ? `1px solid ${hovered ? 'rgba(0,210,190,0.6)' : 'rgba(0,210,190,0.35)'}`
            : `1px solid ${hovered ? 'rgba(0,210,190,0.4)' : 'rgba(255,255,255,0.06)'}`,
          borderLeft: isNext ? '3px solid #00D2BE' : undefined,
          borderRadius: '6px',
          cursor: 'pointer', gap: '16px',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered
            ? isNext
              ? '0 0 0 1px rgba(0,210,190,0.15), 0 6px 24px rgba(0,0,0,0.45), 0 0 24px rgba(0,210,190,0.18)'
              : '0 0 0 1px rgba(0,210,190,0.10), 0 6px 24px rgba(0,0,0,0.45), 0 0 20px rgba(0,210,190,0.10)'
            : 'none',
          transition: 'all 0.22s ease',
        }}
      >
        {/* 左侧 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '18px', flex: 1, minWidth: 0 }}>
          {/* 场次编号 */}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: isMobile ? '10px' : '11px', fontWeight: 700,
            letterSpacing: '0.06em', minWidth: isMobile ? '32px' : '40px', flexShrink: 0,
            color: isNext ? '#00D2BE' : '#9BA8A5',
          }}>
            第{String(race.round).padStart(2, '0')}站
          </span>

          {/* 国旗 */}
          <img
            src={race.flag} alt={race.country}
            width={isMobile ? 28 : 36} height={isMobile ? 19 : 24}
            style={{
              objectFit: 'cover', borderRadius: '2px', flexShrink: 0,
              boxShadow: isNext ? '0 0 8px rgba(0,210,190,0.4)' : 'none',
            }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />

          {/* 名称 */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-title)', fontSize: isMobile ? '13px' : '15px', fontWeight: 700,
              color: isNext ? '#00D2BE' : '#fff',
              textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {race.name}
            </div>
            {!isMobile && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: isNext ? 'rgba(0,210,190,0.7)' : '#9BA8A5', marginTop: '2px',
              }}>
                {race.circuit}
              </div>
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '22px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? '11px' : '12px', color: isNext ? '#00D2BE' : '#E5E2E1' }}>
              {race.dates}
            </div>
            {!isMobile && race.status === 'completed' && race.podium?.[0] && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#00D2BE', marginTop: '2px' }}>
                ↳ {race.podium[0].driver}
              </div>
            )}
            {!isMobile && race.status === 'next' && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9BA8A5', marginTop: '2px' }}>
                正赛 {race.sessions?.find(s => s.isRace)?.time ?? ''} 本地时间
              </div>
            )}
          </div>

          {!isMobile && <Badge status={race.status} />}

          {/* 展开箭头 */}
          <div style={{
            color: '#9BA8A5', fontSize: '12px',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* 展开详情（传入 year 用于懒加载） */}
      <AnimatePresence>
        {open && <RaceDetail key="detail" race={race} year={year} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ── 主组件 ─────────────────────────────────────
export default function RaceList({ races, filter, year }) {
  const filtered = races.filter(r => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return r.status === 'next' || r.status === 'upcoming'
    if (filter === 'completed') return r.status === 'completed'
    return true
  })

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(229,226,225,0.3)', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.15em' }}>
        暂无数据
      </div>
    )
  }

  return (
    <section id="race-list" style={{ padding: '24px 0 80px' }}>
      <div className="page-container">
        {filtered.map((race, idx) => (
          <RaceRow key={`${year}-${race.id}`} race={race} index={idx} year={year} />
        ))}
      </div>
    </section>
  )
}
