// ── F1 GUIDE · TeamPanel ────────────────────────────
// 右侧抽屉详情面板
// Props:
//   team: 当前选中车队数据 | null
//   onClose: 关闭回调
//   onGoStandings: 跳转积分榜回调（跳过 intro）

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 关闭图标 ──────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Section 标题 ──────────────────────────────────
function SectionLabel({ children, color }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 9,
      letterSpacing: '0.22em', color,
      marginBottom: 14, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

// ── 2×2 技术规格表格 ──────────────────────────────
function SpecGrid({ team }) {
  const cells = [
    { label: '总部',     value: team.base },
    { label: '车队负责人', value: team.principal },
    { label: '底盘',     value: team.chassis },
    { label: '动力单元', value: team.engine },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 4, overflow: 'hidden',
      marginBottom: 28,
    }}>
      {cells.map(c => (
        <div key={c.label} style={{ background: '#111111', padding: '14px 16px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.14em', color: '#9BA8A5', marginBottom: 5,
          }}>{c.label}</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            fontWeight: 500, color: '#FFFFFF',
          }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

// ── 车手头像（真实图片 + 失败降级） ──────────────
function DriverAvatar({ driver, teamColor }) {
  const [failed, setFailed] = useState(false)

  if (!driver.img || failed) {
    return (
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: teamColor,
        margin: '0 auto 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-title)', fontSize: 20,
        fontWeight: 900, color: '#0D0D0D',
      }}>
        {driver.initials}
      </div>
    )
  }

  return (
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      margin: '0 auto 12px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.06)',
      border: `2px solid ${teamColor}44`,
    }}>
      <img
        src={driver.img}
        alt={driver.name}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
      />
    </div>
  )
}

// ── 车手阵容 ──────────────────────────────────────
function DriverRoster({ team }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 12, marginBottom: 28,
    }}>
      {team.drivers.map((d, i) => (
        <div key={d.num} style={{
          background: '#0D0D0D',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 4, padding: '18px 16px', textAlign: 'center',
        }}>
          {/* 车手真实头像 */}
          <DriverAvatar driver={d} teamColor={team.color} />

          {/* 车号徽章 */}
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: team.color,
            background: `${team.color}18`,
            border: `1px solid ${team.color}40`,
            borderRadius: 3, padding: '1px 8px',
            marginBottom: 6,
          }}>
            #{d.num}
          </div>

          <div style={{
            fontFamily: 'var(--font-title)', fontSize: 13,
            fontWeight: 700, color: '#FFFFFF',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            marginBottom: 4,
          }}>{d.name}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.14em', color: '#9BA8A5',
          }}>{d.initials}</div>
        </div>
      ))}
    </div>
  )
}

// ── 荣誉殿堂 ──────────────────────────────────────
function TitlesRow({ team }) {
  const boxes = [
    { num: team.titles.driver,      label: '车手冠军' },
    { num: team.titles.constructor, label: '车队冠军' },
    { num: team.titles.wins,        label: '历史胜场' },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10, marginBottom: 28,
    }}>
      {boxes.map(b => (
        <div key={b.label} style={{
          background: '#0D0D0D',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 4, padding: '14px 12px', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-title)', fontSize: 26,
            fontWeight: 900, color: team.color,
            lineHeight: 1, marginBottom: 4,
          }}>{b.num}</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            color: '#9BA8A5',
          }}>{b.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── 近年战绩表 ────────────────────────────────────
function HistoryTable({ team }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
      <thead>
        <tr>
          {['赛季', '排名', '积分', '胜场'].map(h => (
            <th key={h} style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.14em', color: '#9BA8A5',
              textAlign: 'left', padding: '8px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {team.history.map(h => (
          <tr key={h.y} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E5E2E1', padding: '9px 10px' }}>{h.y}</td>
            <td style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, padding: '9px 10px',
              color: h.pos === 'P1' ? team.color : '#E5E2E1',
              fontWeight: h.pos === 'P1' ? 700 : 400,
            }}>
              {h.pos === 'P1' ? `🏆 ${h.pos}` : h.pos}
            </td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E5E2E1', padding: '9px 10px' }}>{h.pts}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E5E2E1', padding: '9px 10px' }}>{h.w}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── 主组件 ────────────────────────────────────────
export default function TeamPanel({ team, onClose, onGoStandings }) {
  // ESC 键关闭
  useEffect(() => {
    if (!team) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [team, onClose])

  // 打开时锁定页面滚动
  useEffect(() => {
    document.body.style.overflow = team ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [team])

  return (
    <AnimatePresence>
      {team && (
        <>
          {/* 遮罩：毛玻璃 + 渐变 */}
          <motion.div
            key="panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* 抽屉面板：弹簧入场 */}
          <motion.aside
            key="panel-body"
            initial={{ x: '100%', boxShadow: 'none' }}
            animate={{
              x: 0,
              boxShadow: `-24px 0 80px rgba(0,0,0,0.6), -1px 0 0 rgba(255,255,255,0.06)`,
            }}
            exit={{ x: '100%', boxShadow: 'none' }}
            transition={{
              x: {
                type: 'spring',
                stiffness: 340,
                damping: 32,
                mass: 0.9,
              },
              boxShadow: { duration: 0.35 },
            }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              zIndex: 201,
              width: 'min(560px, 90vw)',
              background: '#111111',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 顶部主题色条 */}
            <div style={{
              height: 4, width: '100%', flexShrink: 0,
              background: team.color,
              boxShadow: `0 0 20px ${team.color}80`,
            }} />

            {/* 面板 Header */}
            <div style={{
              padding: '28px 32px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
              display: 'flex', alignItems: 'flex-start', gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  letterSpacing: '0.22em', color: team.color,
                  opacity: 0.7, marginBottom: 8, textTransform: 'uppercase',
                }}>
                  {team.tag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 'clamp(22px, 3.5vw, 30px)',
                  fontWeight: 900, color: '#FFFFFF',
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                  lineHeight: 1,
                }}>
                  {team.name}
                </div>
              </div>

              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ color: '#FFFFFF' }}
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)',
                  padding: 4, flexShrink: 0, marginTop: -4,
                  transition: 'color 0.2s',
                }}
              >
                <CloseIcon />
              </motion.button>
            </div>

            {/* 可滚动内容区 */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '24px 32px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}>
              {/* 技术规格 */}
              <SectionLabel color={team.color}>技术规格</SectionLabel>
              <SpecGrid team={team} />

              {/* 车手阵容 */}
              <SectionLabel color={team.color}>现役车手</SectionLabel>
              <DriverRoster team={team} />

              {/* 荣誉殿堂 */}
              <SectionLabel color={team.color}>荣誉殿堂</SectionLabel>
              <TitlesRow team={team} />

              {/* 车队历史 */}
              <SectionLabel color={team.color}>车队历史</SectionLabel>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                marginBottom: 28,
              }}>
                {team.desc}
              </p>

              {/* 近年战绩 */}
              <SectionLabel color={team.color}>近年战绩</SectionLabel>
              <HistoryTable team={team} />
            </div>

            {/* 底部 CTA */}
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}>
              <motion.button
                whileHover={{
                  filter: 'brightness(0.88)',
                  boxShadow: `0 0 24px ${team.color}66`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={onGoStandings}
                style={{
                  display: 'block', width: '100%', padding: 14,
                  background: team.color, color: '#0D0D0D',
                  border: 'none', borderRadius: 2, cursor: 'pointer',
                  fontFamily: 'var(--font-title)', fontSize: 13,
                  fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  transition: 'box-shadow 0.2s',
                }}
              >
                查看积分榜详情 →
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
