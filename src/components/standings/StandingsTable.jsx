// ── F1 GUIDE · StandingsTable ──────────────────────
// 车手榜 / 车队榜 通用表格组件

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 车队 logo URL 映射（使用 F1 官网 2026 赛季 logo）─
const TEAM_LOGO = {
  mercedes:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
  ferrari:      'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
  mclaren:      'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
  red_bull:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
  redbull:      'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
  alpine:       'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
  rb:           'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
  racingbulls:  'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
  haas:         'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/haas/2026haaslogowhite.webp',
  williams:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
  audi:         'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
  cadillac:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp',
  aston_martin: 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
  aston:        'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
}

function getTeamLogo(code, name, teamId) {
  // 1. 先用完整 constructorId（最准确）
  const idKey = (teamId ?? '').toLowerCase()
  if (idKey && TEAM_LOGO[idKey]) return TEAM_LOGO[idKey]
  for (const [k, v] of Object.entries(TEAM_LOGO)) {
    if (idKey && idKey.includes(k)) return v
  }
  // 2. 再用 code 缩写
  const key = (code ?? '').toLowerCase()
  if (TEAM_LOGO[key]) return TEAM_LOGO[key]
  // 3. 最后用车队名称模糊匹配
  const nameKey = (name ?? '').toLowerCase()
  for (const [k, v] of Object.entries(TEAM_LOGO)) {
    if (nameKey.includes(k)) return v
  }
  return null
}

// ── 车手头像（真实图片 + onError 降级） ───────────
function DriverAvatar({ driver }) {
  const [failed, setFailed] = useState(false)
  const showImg = driver.img && !failed

  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: `2px solid ${driver.color}55`,
      flexShrink: 0, overflow: 'hidden',
      background: showImg ? 'rgba(255,255,255,0.06)' : '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {showImg ? (
        <img
          src={driver.img}
          alt={driver.name}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'top',
          }}
        />
      ) : (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          fontWeight: 700, color: '#fff',
        }}>
          {driver.code}
        </span>
      )}
    </div>
  )
}

// ── 车队 Logo 头像（图片 + 降级色块） ────────────
function TeamAvatar({ team }) {
  const [failed, setFailed] = useState(false)
  const logoUrl = getTeamLogo(team.code, team.name, team.teamId)
  const showImg = logoUrl && !failed

  return (
    <div style={{
      width: 40, height: 40, borderRadius: 6,
      border: `2px solid ${team.color}55`,
      flexShrink: 0, overflow: 'hidden',
      background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: showImg ? 3 : 0,
    }}>
      {showImg ? (
        <img
          src={logoUrl}
          alt={team.name}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: team.color,
          borderRadius: 4,
        }} />
      )}
    </div>
  )
}

// ── 排名颜色 ────────────────────────────────────────
function rankColor(rank) {
  if (rank === 1) return '#00D2BE'  // 青
  if (rank === 2) return '#FF8700'  // 橙
  if (rank === 3) return '#DC0000'  // 红
  return '#E5E2E1'
}

// ── 变化箭头 ────────────────────────────────────────
function ChangeArrow({ rank, prev }) {
  const diff = prev - rank
  if (diff > 0) return (
    <td style={{ width: 36, textAlign: 'center', verticalAlign: 'middle', padding: '12px 4px' }}>
      <span style={{ color: '#00E676', fontSize: 11, display: 'block', lineHeight: 1 }}>▲</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00E676', display: 'block', lineHeight: 1, marginTop: 2 }}>+{diff}</span>
    </td>
  )
  if (diff < 0) return (
    <td style={{ width: 36, textAlign: 'center', verticalAlign: 'middle', padding: '12px 4px' }}>
      <span style={{ color: '#FF1744', fontSize: 11, display: 'block', lineHeight: 1 }}>▼</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#FF1744', display: 'block', lineHeight: 1, marginTop: 2 }}>{diff}</span>
    </td>
  )
  return (
    <td style={{ width: 36, textAlign: 'center', verticalAlign: 'middle', padding: '12px 4px' }}>
      <span style={{ color: '#444', fontSize: 11, display: 'block', lineHeight: 1 }}>—</span>
    </td>
  )
}

// ── 车手行 ─────────────────────────────────────────
function DriverRow({ d, index }) {
  const isFirst = d.rank === 1
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.025 }}
      style={{
        borderRadius: 4,
        cursor: 'default',
        background: isFirst ? 'rgba(0,210,190,0.04)' : 'transparent',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      className="standings-row"
    >
      {/* 名次 */}
      <td style={{
        width: 52, minWidth: 52,
        fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900,
        color: rankColor(d.rank), padding: '12px 16px', verticalAlign: 'middle',
      }}>
        {String(d.rank).padStart(2, '0')}
      </td>

      {/* 变化箭头 */}
      <ChangeArrow rank={d.rank} prev={d.prev} />

      {/* 车手信息 */}
      <td style={{ minWidth: 180, padding: '12px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 车手头像 */}
          <DriverAvatar driver={d} />
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              {d.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#9BA8A5', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{d.flag}</span>{d.nat}
            </div>
          </div>
        </div>
      </td>

      {/* 车队 */}
      <td style={{ minWidth: 140, padding: '12px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E5E2E1' }}>
            {d.tname}
          </span>
        </div>
      </td>

      {/* 胜场 */}
      <td style={{ textAlign: 'right', minWidth: 52, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#E5E2E1' }}>{d.wins}</span>
      </td>

      {/* 登台 */}
      <td style={{ textAlign: 'right', minWidth: 52, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#E5E2E1' }}>{d.podiums}</span>
      </td>

      {/* 积分 */}
      <td style={{ textAlign: 'right', minWidth: 72, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900,
          color: isFirst ? '#00D2BE' : '#E5E2E1',
        }}>
          {d.pts}
        </span>
      </td>
    </motion.tr>
  )
}

// ── 车队行 ─────────────────────────────────────────
function TeamRow({ t, index }) {
  const isFirst = t.rank === 1
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      style={{
        borderRadius: 4,
        cursor: 'default',
        background: isFirst ? 'rgba(0,210,190,0.04)' : 'transparent',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      className="standings-row"
    >
      {/* 名次 */}
      <td style={{
        width: 52, minWidth: 52,
        fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900,
        color: rankColor(t.rank), padding: '12px 16px', verticalAlign: 'middle',
      }}>
        {String(t.rank).padStart(2, '0')}
      </td>

      {/* 变化箭头 */}
      <ChangeArrow rank={t.rank} prev={t.prev} />

      {/* 车队信息 */}
      <td style={{ minWidth: 200, padding: '12px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TeamAvatar team={t} />
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              {t.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9BA8A5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t.code}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* 胜场 */}
      <td style={{ textAlign: 'right', minWidth: 52, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#E5E2E1' }}>{t.wins}</span>
      </td>

      {/* 登台 */}
      <td style={{ textAlign: 'right', minWidth: 52, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#E5E2E1' }}>{t.podiums}</span>
      </td>

      {/* 积分 */}
      <td style={{ textAlign: 'right', minWidth: 72, padding: '12px 16px', verticalAlign: 'middle' }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900,
          color: isFirst ? '#00D2BE' : '#E5E2E1',
        }}>
          {t.pts}
        </span>
      </td>
    </motion.tr>
  )
}

// ── 表格 thead 通用样式 ───────────────────────────
const thStyle = {
  fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8A5',
  padding: '12px 16px', textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap',
}
const thRight = { ...thStyle, textAlign: 'right' }

// ── 车手积分表格 ───────────────────────────────────
export function DriverStandingsTable({ drivers }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 52 }}>名次</th>
            <th style={{ ...thStyle, width: 36, padding: '12px 4px' }}></th>
            <th style={thStyle}>车手</th>
            <th style={thStyle}>车队</th>
            <th style={thRight}>胜场</th>
            <th style={thRight}>登台</th>
            <th style={thRight}>积分</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {drivers.map((d, i) => (
              <DriverRow key={d.code} d={d} index={i} />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

// ── 车队积分表格 ───────────────────────────────────
export function TeamStandingsTable({ teams }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 52 }}>名次</th>
            <th style={{ ...thStyle, width: 36, padding: '12px 4px' }}></th>
            <th style={thStyle}>车队</th>
            <th style={thRight}>胜场</th>
            <th style={thRight}>登台</th>
            <th style={thRight}>积分</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {teams.map((t, i) => (
              <TeamRow key={t.code} t={t} index={i} />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
