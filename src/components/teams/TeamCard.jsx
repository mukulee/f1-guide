// ── F1 GUIDE · TeamCard ─────────────────────────────
// 车队网格卡片：左侧 3px 彩色竖条 + 积分/胜场 + 车手行
// Props:
//   team: 车队数据对象
//   index: 入场动效延迟
//   isActive: 是否当前选中（面板已打开）
//   onClick: 点击回调

import { useState } from 'react'
import { motion } from 'framer-motion'

// ── 车队 Logo（真实图片 + 失败降级） ─────────────
function TeamLogo({ logo, color, name }) {
  const [failed, setFailed] = useState(false)
  if (!logo || failed) {
    // 降级：用队名首字母 SVG 占位
    return (
      <div style={{
        width: 32, height: 32,
        borderRadius: 4,
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900,
        color,
      }}>
        {name?.[0] || 'F'}
      </div>
    )
  }
  return (
    <img
      src={logo}
      alt={name}
      onError={() => setFailed(true)}
      style={{ width: 36, height: 36, objectFit: 'contain' }}
    />
  )
}

// ── 积分图标 ──────────────────────────────────────
function PtsIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" opacity="0.8">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ── 奖杯图标 ──────────────────────────────────────
function TrophyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#9BA8A5" strokeWidth="2">
      <path d="M8 21h8M12 17v4M17 4H7l-2 7h12l-2-7z" />
      <path d="M5 11s-1 7 7 7 7-7 7-7" />
    </svg>
  )
}

// ── 展开箭头图标 ──────────────────────────────────
function ChevronIcon({ active, color }) {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke={active ? color : '#9BA8A5'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{
        transform: active ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease, stroke 0.2s',
        flexShrink: 0,
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function TeamCard({ team, index, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  const { color } = team
  const rankStr = String(team.rank).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        background: isActive ? '#131313' : hovered ? '#141414' : '#111111',
        border: `1px solid ${
          isActive  ? `${color}59` :
          hovered   ? 'rgba(0,210,190,0.55)' :
                      'rgba(255,255,255,0.07)'
        }`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.25s',
        boxShadow: hovered || isActive
          ? '0 0 0 1px rgba(0,210,190,0.12), 0 8px 32px rgba(0,0,0,0.5), 0 0 28px rgba(0,210,190,0.14)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        transform: hovered && !isActive ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* ── 左侧彩色竖条 ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: color, zIndex: 2,
      }} />

      {/* ── 水印大数字 ── */}
      <div style={{
        position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'var(--font-title)', fontSize: 96, fontWeight: 900,
        color: 'rgba(255,255,255,0.04)', lineHeight: 1,
        pointerEvents: 'none', letterSpacing: '-0.04em',
      }}>
        {rankStr}
      </div>

      {/* ── 卡片主体 ── */}
      <div style={{ padding: '20px 22px 18px 26px', position: 'relative', zIndex: 1 }}>

        {/* 顶部行：Logo + 车队名 + 排名徽章 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          {/* Logo 容器 */}
          <div style={{
            width: 48, height: 48, borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            padding: 4,
          }}>
            <TeamLogo logo={team.logo} color={color} name={team.name} />
          </div>

          {/* 车队名称 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.2em', color, opacity: 0.65,
              marginBottom: 4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {team.tag}
            </div>
            <div style={{
              fontFamily: 'var(--font-title)', fontSize: 17,
              fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15,
            }}>
              {team.name}
            </div>
          </div>

          {/* P排名徽章 */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            padding: '3px 8px', borderRadius: 2, flexShrink: 0,
            alignSelf: 'flex-start', marginTop: 2,
            background: `${color}1A`,
            color,
            border: `1px solid ${color}40`,
          }}>
            P{team.rank}
          </div>
        </div>

        {/* 技术规格行：底盘 / 动力 */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.15em', color: '#9BA8A5', marginBottom: 2,
            }}>底盘</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: '#E5E2E1', fontWeight: 500,
            }}>{team.chassis}</div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.15em', color: '#9BA8A5', marginBottom: 2,
            }}>动力单元</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: '#E5E2E1', fontWeight: 500,
            }}>{team.engine}</div>
          </div>
        </div>

        {/* 积分 / 胜场统计 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PtsIcon color={color} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 14,
              fontWeight: 700, color,
            }}>{team.pts}</span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              color: '#9BA8A5',
            }}>分</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrophyIcon />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 14,
              fontWeight: 700, color: '#E5E2E1',
            }}>{team.wins}</span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              color: '#9BA8A5',
            }}>胜</span>
          </div>
        </div>

        {/* 分隔线 */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />

        {/* 车手行 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {team.drivers.map((d, i) => (
              <div key={d.num}>
                {i > 0 && (
                  <span style={{
                    color: 'rgba(255,255,255,0.18)', fontSize: 10,
                    marginRight: 16, marginLeft: -12,
                  }}>·</span>
                )}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  fontWeight: 700, color, marginRight: 5,
                }}>{d.num}</span>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 12,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {d.name.split('·').pop()}
                </span>
              </div>
            ))}
          </div>
          <ChevronIcon active={isActive} color={color} />
        </div>
      </div>
    </motion.div>
  )
}
