// ── F1 GUIDE · Standings 积分榜页 ──────────────────
// 参考：stitch-pages/03-standings.html

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import useStandings from '../hooks/useStandings.js'
import { DriverStandingsTable, TeamStandingsTable } from '../components/standings/StandingsTable.jsx'
import StandingsChart from '../components/standings/StandingsChart.jsx'
import StandingsIntro from '../components/standings/StandingsIntro.jsx'
import useBreakpoint from '../hooks/useBreakpoint.js'

// ── 支持的年份 ─────────────────────────────────────
const YEARS = [2024, 2025, 2026]

// ── 年份最后一站信息（静态映射） ──────────────────
const YEAR_META = {
  2024: { round: 24, race: '阿布扎比' },
  2025: { round: 24, race: '阿布扎比' },
  2026: { round: 5,  race: '加拿大' },
}

// ── Tab 切换方向 ───────────────────────────────────
const TAB_ORDER = ['drivers', 'teams']

// ── Tab 按钮（含活跃态扫光） ───────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-title)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '14px 24px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: active ? '#FFFFFF' : '#9BA8A5',
        borderBottom: active ? '2px solid #00D2BE' : '2px solid transparent',
        marginBottom: -1,
        transition: 'color 0.25s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#ddd' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#9BA8A5' }}
    >
      {/* 活跃态底部辉光 */}
      {active && (
        <motion.span
          layoutId="tab-glow"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2, background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
            filter: 'blur(3px)',
          }}
        />
      )}
      {children}
    </button>
  )
}

// ── 年份选择器 ─────────────────────────────────────
function YearSelector({ year, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(0,210,190,0.5)', marginRight: 4 }}>
        SEASON
      </span>
      {YEARS.map(y => {
        const active = y === year
        return (
          <button
            key={y}
            onClick={() => onChange(y)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: active ? 700 : 400,
              letterSpacing: '0.1em',
              padding: '4px 12px',
              borderRadius: 3,
              border: active
                ? '1px solid rgba(0,210,190,0.55)'
                : '1px solid rgba(255,255,255,0.1)',
              background: active
                ? 'rgba(0,210,190,0.1)'
                : 'transparent',
              color: active ? '#00D2BE' : '#9BA8A5',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,210,190,0.3)'; e.currentTarget.style.color = '#ccc' }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9BA8A5' }}}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}

// ── 主页面 ─────────────────────────────────────────
export default function Standings() {
  const location = useLocation()
  const { isMobile } = useBreakpoint()
  // 从车队页等外部跳转时携带 skipIntro=true，直接跳过开场动效
  const skipIntro = location.state?.skipIntro === true

  const [tab,       setTab]       = useState('drivers')
  const [year,      setYear]      = useState(2026)
  const [introDone, setIntroDone] = useState(skipIntro)  // skipIntro=true 时初始即为完成
  const prevTabRef = useRef('drivers')

  const { drivers, teams, loading } = useStandings(year)

  function handleTabChange(newTab) {
    if (newTab === tab) return
    prevTabRef.current = tab
    setTab(newTab)
  }

  const direction = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(prevTabRef.current) ? 1 : -1
  const meta = YEAR_META[year] ?? { round: 0, race: '—' }

  const panelVariants = {
    enter:  (dir) => ({ opacity: 0, x: dir * 40, filter: 'blur(4px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
    exit:   (dir) => ({ opacity: 0, x: dir * -30, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }),
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, background: '#0D0D0D' }}>

      {/* ── 开场动效覆盖层（position:fixed，不占文档流） ── */}
      {!introDone && (
        <StandingsIntro onDone={() => setIntroDone(true)} />
      )}

      {/* ── PAGE HEADER ── */}
      {/* intro 结束后再滑入，避免被覆盖层遮住时触发动效 */}
      <motion.div
        initial={false}
        animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{
          background: 'linear-gradient(to bottom, rgba(0,210,190,0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px 20px' : '40px 32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

              {/* 标题区 */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${year}-${meta.race}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.22em', color: '#00D2BE', opacity: 0.7,
                      marginBottom: 10, textTransform: 'uppercase',
                    }}
                  >
                    {year} 赛季 / 第 {meta.round} 站 / {meta.race}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.h1
                    key={tab}
                    initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontFamily: 'var(--font-title)',
                      fontSize: 'clamp(32px, 5vw, 52px)',
                      fontWeight: 900, color: '#fff',
                      textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1,
                    }}
                  >
                    {tab === 'drivers' ? '车手' : '车队'} · 积分榜
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* 年份选择器 */}
              <YearSelector year={year} onChange={(y) => setYear(y)} />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 8px' : '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              <TabBtn active={tab === 'drivers'} onClick={() => handleTabChange('drivers')}>车手积分</TabBtn>
              <TabBtn active={tab === 'teams'}   onClick={() => handleTabChange('teams')}>车队积分</TabBtn>
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
                    color: 'rgba(0,210,190,0.6)',
                  }}
                >
                  <span style={{
                    display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                    background: '#00D2BE', animation: 'pulse 1.2s ease-in-out infinite',
                  }} />
                  同步中…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 内容区 ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 12px' : '0 32px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            {tab === 'drivers' ? (
              <motion.div
                key={`drivers-${year}`}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div style={{ paddingTop: 8 }}>
                  <DriverStandingsTable drivers={drivers} />
                </div>
                <StandingsChart entities={drivers} type="driver" maxQuick={5} year={year} />
              </motion.div>
            ) : (
              <motion.div
                key={`teams-${year}`}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div style={{ paddingTop: 8 }}>
                  <TeamStandingsTable teams={teams} />
                </div>
                <StandingsChart entities={teams} type="team" maxQuick={5} year={year} />
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ height: 64 }} />
        </div>
      </motion.div>
    </div>
  )
}
