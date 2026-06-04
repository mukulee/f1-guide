// ── F1 GUIDE · CountdownWidget ──────────────────────
// 下一站大奖赛倒计时
// 从 races2026.json 中读取下一场未来比赛，实时倒计时

import { useState, useEffect } from 'react'
import races2026 from '../../data/races2026.json'

// ── 找下一场比赛 ──────────────────────────────────
function getNextRace() {
  const now = Date.now()
  const upcoming = races2026
    .map(r => {
      // races2026 数据格式：r.raceDate 为完整 ISO 字符串
      const raceDate = new Date(r.raceDate)
      return { ...r, raceDateObj: raceDate }
    })
    .filter(r => r.raceDateObj > now)
    .sort((a, b) => a.raceDateObj - b.raceDateObj)

  return upcoming[0] || null
}

// ── 格式化倒计时 ──────────────────────────────────
function calcCountdown(target) {
  let diff = Math.max(0, target - Date.now())
  const d = Math.floor(diff / 86400000); diff %= 86400000
  const h = Math.floor(diff / 3600000);  diff %= 3600000
  const m = Math.floor(diff / 60000);    diff %= 60000
  const s = Math.floor(diff / 1000)
  return {
    d: String(d).padStart(2, '0'),
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  }
}

// ── 数字格子 ──────────────────────────────────────
function DigitBox({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-title)', fontSize: 30, fontWeight: 900, color: '#FFFFFF',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4, padding: '6px 4px',
        display: 'block', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9BA8A5',
        marginTop: 5, letterSpacing: '0.12em',
      }}>
        {label}
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────
export default function CountdownWidget() {
  const nextRace = getNextRace()
  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00' })

  useEffect(() => {
    if (!nextRace) return
    const target = nextRace.raceDateObj.getTime()

    function tick() { setCd(calcCountdown(target)) }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [nextRace?.raceDate])

  if (!nextRace) return null

  return (
    <div
      data-no-dots
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8, overflow: 'hidden',
      }}
    >
      {/* 顶部：比赛信息 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,210,190,0.12) 0%, rgba(0,210,190,0.03) 100%)',
        borderBottom: '1px solid rgba(0,210,190,0.1)',
        padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.22em', color: '#00D2BE', opacity: 0.8, marginBottom: 4,
        }}>
          下一站倒计时
        </div>
        <div style={{
          fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, color: '#FFFFFF',
        }}>
          {nextRace.name || nextRace.raceName || '2026 大奖赛'}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(255,255,255,0.4)', marginTop: 2,
        }}>
          {nextRace.circuit || nextRace.Circuit?.circuitName || ''}
          {nextRace.round ? ` · 第 ${nextRace.round} 站` : ''}
        </div>
      </div>

      {/* 倒计时数字 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8, padding: '16px 20px',
      }}>
        <DigitBox value={cd.d} label="天" />
        <DigitBox value={cd.h} label="时" />
        <DigitBox value={cd.m} label="分" />
        <DigitBox value={cd.s} label="秒" />
      </div>
    </div>
  )
}
