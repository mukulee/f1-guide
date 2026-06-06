// ── F1 GUIDE · Teams 车队页 ─────────────────────────
// 参考：stitch-pages/05-teams.html
// 布局：TeamsIntro 开场 → Hero → 2列网格 → 右侧抽屉面板

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import TEAMS from '../data/teams2026detail.json'
import TeamCard   from '../components/teams/TeamCard.jsx'
import TeamPanel  from '../components/teams/TeamPanel.jsx'
import TeamsIntro from '../components/teams/TeamsIntro.jsx'
import useBreakpoint from '../hooks/useBreakpoint.js'

export default function Teams() {
  const { isMobile } = useBreakpoint()
  const [activeId,  setActiveId]  = useState(null)
  const [introDone, setIntroDone] = useState(false)

  const navigate = useNavigate()

  const activeTeam = TEAMS.find(t => t.id === activeId) ?? null

  function handleCardClick(id) {
    setActiveId(prev => prev === id ? null : id)
  }

  function handlePanelClose() {
    setActiveId(null)
  }

  // 跳转积分榜，携带 skipIntro=true，跳过开场动效
  function handleGoStandings() {
    setActiveId(null)
    navigate('/standings', { state: { skipIntro: true } })
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, background: '#0D0D0D' }}>

      {/* ── 开场动效 ── */}
      {!introDone && (
        <TeamsIntro onDone={() => setIntroDone(true)} />
      )}

      {/* ── 页面主体：intro 后滑入 ── */}
      <motion.div
        initial={false}
        animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* PAGE HEADER */}
        <div style={{
          background: 'linear-gradient(to bottom, rgba(0,210,190,0.04) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '28px 16px 24px' : '48px 32px 32px' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={introDone ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.22em', color: '#00D2BE', opacity: 0.7,
                marginBottom: 10, textTransform: 'uppercase',
              }}>
                车队冠军积分榜
              </div>
              <h1 style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 900, color: '#FFFFFF',
                textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1,
              }}>
                2026 发车格
              </h1>
            </motion.div>
          </div>
        </div>

        {/* ── 2列卡片网格（移动端单列） ── */}
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: isMobile ? '20px 16px 60px' : '32px 32px 80px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? 12 : 16,
        }}>
          {TEAMS.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              index={i}
              isActive={activeId === team.id}
              onClick={() => handleCardClick(team.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* ── 右侧抽屉面板 ── */}
      <TeamPanel
        team={activeTeam}
        onClose={handlePanelClose}
        onGoStandings={handleGoStandings}
      />
    </div>
  )
}
