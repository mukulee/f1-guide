// ── F1 GUIDE · useStandings Hook ──────────────────
// 支持多年份：静态 JSON 优先（仅2025），其余年份全量走 API
// trend[] 数据自动从 Jolpica 历史成绩计算，无需手动维护
// 切换年份时自动重新拉取

import { useState, useEffect, useRef } from 'react'
import { fetchDriverStandings, fetchConstructorStandings, fetchTrendData } from '../services/api.js'
import staticDrivers2025 from '../data/drivers2025.json'
import staticTeams2025   from '../data/teams2025.json'
import staticDrivers2026 from '../data/drivers2026.json'
import staticTeams2026   from '../data/teams2026.json'

// ── 静态数据映射 ──────────────────────────────────
const STATIC_DRIVERS = { 2025: staticDrivers2025, 2026: staticDrivers2026 }
const STATIC_TEAMS   = { 2025: staticTeams2025,   2026: staticTeams2026 }

// ── 车队颜色映射（含 2026 新队 Audi / Cadillac） ──
const TEAM_COLORS = {
  'mclaren':      '#FF8700',
  'ferrari':      '#DC0000',
  'mercedes':     '#00D2BE',
  'red_bull':     '#3671C6',
  'red bull':     '#3671C6',
  'redbull':      '#3671C6',
  'aston_martin': '#006F62',
  'aston martin': '#006F62',
  'alpine':       '#0090FF',
  'williams':     '#005AFF',
  'rb':           '#6692FF',
  'alphatauri':   '#6692FF',
  'haas':         '#B8B8B8',
  'audi':         '#E8002D',   // 2026 奥迪（原 Kick Sauber）
  'cadillac':     '#C0C0C0',   // 2026 凯迪拉克（原 Andretti）
  'sauber':       '#00D4AA',
  'kick_sauber':  '#00D4AA',
  'alfa':         '#B42136',
  'renault':      '#FFF500',
  'racing_point': '#F596C8',
}

function colorForTeam(constructorId) {
  const id = (constructorId ?? '').toLowerCase()
  for (const [key, val] of Object.entries(TEAM_COLORS)) {
    if (id.includes(key)) return val
  }
  return '#9BA8A5'
}

// ── 国旗 fallback（API 无旗帜） ────────────────────
const NAT_FLAGS = {
  'British':'🇬🇧','Dutch':'🇳🇱','German':'🇩🇪','Spanish':'🇪🇸','Finnish':'🇫🇮',
  'French':'🇫🇷','Australian':'🇦🇺','Canadian':'🇨🇦','Mexican':'🇲🇽','Monegasque':'🇲🇨',
  'Thai':'🇹🇭','Japanese':'🇯🇵','Danish':'🇩🇰','Chinese':'🇨🇳','American':'🇺🇸',
  'Brazilian':'🇧🇷','Italian':'🇮🇹','New Zealander':'🇳🇿','Argentine':'🇦🇷',
  'South African':'🇿🇦','Swiss':'🇨🇭','Portuguese':'🇵🇹','Polish':'🇵🇱',
}
const NAT_ZH = {
  'British':'英国','Dutch':'荷兰','German':'德国','Spanish':'西班牙','Finnish':'芬兰',
  'French':'法国','Australian':'澳大利亚','Canadian':'加拿大','Mexican':'墨西哥',
  'Monegasque':'摩纳哥','Thai':'泰国','Japanese':'日本','Danish':'丹麦','Chinese':'中国',
  'American':'美国','Brazilian':'巴西','Italian':'意大利','New Zealander':'新西兰',
  'Argentine':'阿根廷','South African':'南非','Swiss':'瑞士','Portuguese':'葡萄牙','Polish':'波兰',
}

// ── 把 API 车手数据标准化 ─────────────────────────
function normalizeDrivers(apiList, staticList, trendData) {
  if (!apiList?.length) return staticList ?? []
  return apiList.map((item, idx) => {
    const code  = item.Driver?.code ?? item.Driver?.driverId?.toUpperCase().slice(0, 3) ?? `D${idx+1}`
    const found = staticList?.find(d => d.code === code) ?? {}
    const nat   = item.Driver?.nationality ?? ''
    return {
      rank    : parseInt(item.positionText, 10) || idx + 1,
      prev    : found.prev ?? (parseInt(item.positionText, 10) || idx + 1),
      code,
      name    : found.name ?? `${item.Driver?.givenName ?? ''} ${item.Driver?.familyName ?? ''}`.trim(),
      nat     : found.nat  ?? NAT_ZH[nat]  ?? nat,
      flag    : found.flag ?? NAT_FLAGS[nat] ?? '🏁',
      team    : item.Constructor?.constructorId ?? '',
      tname   : found.tname ?? item.Constructor?.name ?? '',
      wins    : parseInt(item.wins, 10) || 0,
      podiums : found.podiums ?? 0,
      pts     : parseFloat(item.points) || 0,
      color   : found.color ?? colorForTeam(item.Constructor?.constructorId),
      img     : found.img ?? null,
      // trend 优先用 API 自动计算的走势，其次静态数据，最终降级为空数组
      trend   : trendData?.drivers?.[code] ?? found.trend ?? [],
    }
  })
}

// ── 把 API 车队数据标准化 ─────────────────────────
function normalizeTeams(apiList, staticList, trendData) {
  if (!apiList?.length) return staticList ?? []
  return apiList.map((item, idx) => {
    const cid   = item.Constructor?.constructorId ?? ''
    const code  = cid.toUpperCase().slice(0, 3)
    const found = staticList?.find(t => t.code === code || cid.includes(t.code?.toLowerCase())) ?? {}
    return {
      rank    : parseInt(item.positionText, 10) || idx + 1,
      prev    : found.prev ?? (parseInt(item.positionText, 10) || idx + 1),
      code    : found.code ?? code,
      teamId  : cid,
      name    : found.name ?? item.Constructor?.name ?? cid,
      wins    : parseInt(item.wins, 10) || 0,
      podiums : found.podiums ?? 0,
      pts     : parseFloat(item.points) || 0,
      color   : found.color ?? colorForTeam(cid),
      // trend 优先用 API 走势
      trend   : trendData?.teams?.[cid] ?? found.trend ?? [],
    }
  })
}

// ── Hook ──────────────────────────────────────────
export default function useStandings(year = 2026) {
  const staticDrivers = STATIC_DRIVERS[year] ?? null
  const staticTeams   = STATIC_TEAMS[year]   ?? null

  const [drivers,       setDrivers]       = useState(staticDrivers ?? [])
  const [teams,         setTeams]         = useState(staticTeams   ?? [])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [completedRnds, setCompletedRnds] = useState(0) // 已完成轮次数

  // 用 ref 追踪当前年份，避免竞态
  const activeYearRef = useRef(year)

  useEffect(() => {
    activeYearRef.current = year

    // 立即用静态数据填充（若有），先不含 trend（trend 为 []）
    setDrivers(staticDrivers ?? [])
    setTeams(staticTeams ?? [])
    setLoading(true)
    setError(null)

    // ── 三路并发：车手榜 + 车队榜 + 逐站趋势 ────────
    Promise.all([
      fetchDriverStandings(year),
      fetchConstructorStandings(year),
      fetchTrendData(year),
    ]).then(([driverData, teamData, trendData]) => {
      if (activeYearRef.current !== year) return

      if (trendData?.completedRnds) setCompletedRnds(trendData.completedRnds)

      // 将 trend 合并进标准化数据（若 API trend 为 null 则保留静态 JSON 中的值）
      if (driverData) setDrivers(normalizeDrivers(driverData, staticDrivers, trendData))
      if (teamData)   setTeams(normalizeTeams(teamData, staticTeams, trendData))

      // 若积分榜 API 失败但趋势数据成功，仍把趋势写入静态数据
      if (!driverData && trendData && staticDrivers) {
        setDrivers(prev => prev.map(d => ({
          ...d,
          trend: trendData.drivers?.[d.code] ?? d.trend ?? [],
        })))
      }
      if (!teamData && trendData && staticTeams) {
        setTeams(prev => prev.map(t => ({
          ...t,
          trend: trendData.teams?.[t.teamId] ?? trendData.teams?.[t.code?.toLowerCase()] ?? t.trend ?? [],
        })))
      }
    }).catch(err => {
      if (activeYearRef.current !== year) return
      console.warn(`[useStandings(${year})] failed:`, err)
      setError(err.message)
    }).finally(() => {
      if (activeYearRef.current === year) setLoading(false)
    })
  }, [year]) // eslint-disable-line react-hooks/exhaustive-deps

  return { drivers, teams, loading, error, completedRnds }
}
