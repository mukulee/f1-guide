// ── F1 GUIDE · API 服务层 ──────────────────────
// 数据来源（优先级）：
//   1. localStorage 缓存（24h TTL）
//   2. /api/refresh-data（Vercel CDN 代理，中国友好，每日 cron 预热）
//   3. Jolpica 直连（备用，可能在中国较慢）

import { toChineseName, toChineseTeam } from '../data/drivers.js'

const BASE         = 'https://api.jolpi.ca/ergast/f1'
const CACHE_TTL    = 24 * 60 * 60 * 1000 // 24h ms
const TREND_TTL    =  2 * 60 * 60 * 1000 //  2h ms（赛季中更新频率更高）

// ── Vercel CDN 代理：尝试从 /api/refresh-data 获取预热数据 ─────────
// 成功时返回完整 payload，失败（如本地开发无此端点）时返回 null
let _refreshCache = null   // 内存缓存，避免同一页面周期内重复请求
let _refreshTime  = 0

async function tryRefreshEndpoint() {
  // 内存缓存：5 分钟内不重复请求
  if (_refreshCache && Date.now() - _refreshTime < 5 * 60 * 1000) {
    return _refreshCache
  }
  try {
    const res = await fetch('/api/refresh-data', { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.ok) return null
    _refreshCache = data
    _refreshTime  = Date.now()
    return data
  } catch {
    return null   // 本地开发无此端点，静默失败
  }
}

// ── 通用缓存工具 ───────────────────────────────
function cacheGet(key, ttl = CACHE_TTL) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > ttl) { localStorage.removeItem(key); return null }
    return data
  } catch { return null }
}

function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

// ── 获取指定年份赛历 ───────────────────────────
export async function fetchRacesByYear(year) {
  const isCurrentYear = year === new Date().getFullYear()
  const endpoint = isCurrentYear ? 'current' : String(year)
  const cacheKey = `f1_races_${year}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    const res  = await fetch(`${BASE}/${endpoint}/races.json`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = json.MRData.RaceTable.Races
    cacheSet(cacheKey, data)
    return data
  } catch (err) {
    console.warn(`[API] fetchRacesByYear(${year}) failed:`, err.message)
    return null
  }
}

// ── 兼容旧调用 ─────────────────────────────────
export async function fetchRaces() {
  return fetchRacesByYear(new Date().getFullYear())
}

// ── 获取单场比赛颁奖台成绩（真实数据） ────────
export async function fetchRaceResult(year, round) {
  const cacheKey = `f1_result_${year}_r${round}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    const res  = await fetch(`${BASE}/${year}/${round}/results.json`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const results = json.MRData.RaceTable.Races[0]?.Results ?? []

    const podium = results.slice(0, 3).map(r => ({
      pos   : parseInt(r.position, 10),
      driver: toChineseName(r.Driver),
      team  : toChineseTeam(r.Constructor.name),
      points: `${r.points} 分`,
    }))

    // 只有当有真实成绩时才缓存
    if (podium.length > 0) cacheSet(cacheKey, podium)
    return podium.length > 0 ? podium : null
  } catch (err) {
    console.warn(`[API] fetchRaceResult(${year}, ${round}) failed:`, err.message)
    return null
  }
}

// ── 获取最快圈速（真实数据） ───────────────────
export async function fetchFastestLap(year, round) {
  const cacheKey = `f1_fastest_${year}_r${round}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    const res  = await fetch(`${BASE}/${year}/${round}/fastest/1/results.json`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const r    = json.MRData.RaceTable.Races[0]?.Results?.[0]
    if (!r) return null
    const fl = r.FastestLap
    const data = {
      driver: toChineseName(r.Driver),
      time  : fl?.Time?.time ?? '--',
      lap   : fl?.lap ?? '--',
    }
    cacheSet(cacheKey, data)
    return data
  } catch (err) {
    console.warn(`[API] fetchFastestLap(${year}, ${round}) failed:`, err.message)
    return null
  }
}

// ── 获取指定年份车手积分榜 ────────────────────
export async function fetchDriverStandings(year) {
  const currentYear = new Date().getFullYear()
  const y = year ?? currentYear
  const cacheKey = `f1_driver_standings_${y}`
  const cached   = cacheGet(cacheKey)
  if (cached) return cached

  // 策略一：Vercel CDN 代理（生产环境，中国友好，cron 每日预热）
  if (y === currentYear) {
    const refreshData = await tryRefreshEndpoint()
    if (refreshData?.driverStandings?.length) {
      cacheSet(cacheKey, refreshData.driverStandings)
      return refreshData.driverStandings
    }
  }

  // 策略二：直连 Jolpica
  try {
    const endpoint = y === currentYear ? 'current' : String(y)
    const res  = await fetch(`${BASE}/${endpoint}/driverStandings.json`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = json.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
    if (data.length) cacheSet(cacheKey, data)
    return data.length ? data : null
  } catch (err) {
    console.warn(`[API] fetchDriverStandings(${y}) failed:`, err.message)
    return null
  }
}

// ── 获取指定年份车队积分榜 ────────────────────
export async function fetchConstructorStandings(year) {
  const currentYear = new Date().getFullYear()
  const y = year ?? currentYear
  const cacheKey = `f1_constructor_standings_${y}`
  const cached   = cacheGet(cacheKey)
  if (cached) return cached

  // 策略一：Vercel CDN 代理（生产环境，中国友好，cron 每日预热）
  if (y === currentYear) {
    const refreshData = await tryRefreshEndpoint()
    if (refreshData?.constructorStandings?.length) {
      cacheSet(cacheKey, refreshData.constructorStandings)
      return refreshData.constructorStandings
    }
  }

  // 策略二：直连 Jolpica
  try {
    const endpoint = y === currentYear ? 'current' : String(y)
    const res  = await fetch(`${BASE}/${endpoint}/constructorStandings.json`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = json.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
    if (data.length) cacheSet(cacheKey, data)
    return data.length ? data : null
  } catch (err) {
    console.warn(`[API] fetchConstructorStandings(${y}) failed:`, err.message)
    return null
  }
}

// ── 获取全年逐站积分走势（自动计算 trend[]） ──
// 同时拉取正赛 + 冲刺赛积分，按 round 排序后累加
// 返回：{ drivers: { CODE: [pts_r1, pts_r2, ...] }, teams: { constructorId: [...] } }
// 缓存 TTL 2h（赛季中每两小时刷新一次）
export async function fetchTrendData(year) {
  const y        = year ?? new Date().getFullYear()
  const cacheKey = `f1_trend_${y}`
  const cached   = cacheGet(cacheKey, TREND_TTL)
  if (cached) return cached

  try {
    // 并发拉取正赛成绩 + 冲刺赛成绩
    const [mainRes, sprintRes] = await Promise.all([
      fetch(`${BASE}/${y}/results.json?limit=500`, { signal: AbortSignal.timeout(15000) }),
      fetch(`${BASE}/${y}/sprint.json?limit=200`,  { signal: AbortSignal.timeout(15000) }),
    ])

    if (!mainRes.ok) throw new Error(`results HTTP ${mainRes.status}`)
    const mainJson   = await mainRes.json()
    const mainRaces  = mainJson.MRData.RaceTable.Races ?? []

    // 冲刺赛失败不阻断（可能该年没有冲刺赛）
    let sprintRaces = []
    if (sprintRes.ok) {
      const sprintJson = await sprintRes.json()
      sprintRaces = sprintJson.MRData.RaceTable.Races ?? []
    }

    if (!mainRaces.length) {
      console.warn(`[API] fetchTrendData(${y}): 暂无比赛成绩，跳过`)
      return null
    }

    // 按 round 编号排序
    const sortByRound = arr => [...arr].sort((a, b) => parseInt(a.round) - parseInt(b.round))
    const sortedMain   = sortByRound(mainRaces)

    // 把冲刺赛按 round 建立索引（一个 round 至多一场冲刺赛）
    const sprintByRound = {}
    for (const race of sprintRaces) {
      sprintByRound[parseInt(race.round)] = race.SprintResults ?? []
    }

    // ── 第一遍：收集所有车手 code & 车队 id ─────────
    const allDriverCodes = new Set()
    const allTeamIds     = new Set()

    for (const race of sortedMain) {
      for (const r of (race.Results ?? [])) {
        const code = r.Driver?.code || r.Driver?.driverId?.toUpperCase().slice(0, 3)
        if (code) allDriverCodes.add(code)
        if (r.Constructor?.constructorId) allTeamIds.add(r.Constructor.constructorId)
      }
    }
    // 冲刺赛也可能有新车手（理论上不会，但保险起见）
    for (const race of sprintRaces) {
      for (const r of (race.SprintResults ?? [])) {
        const code = r.Driver?.code || r.Driver?.driverId?.toUpperCase().slice(0, 3)
        if (code) allDriverCodes.add(code)
        if (r.Constructor?.constructorId) allTeamIds.add(r.Constructor.constructorId)
      }
    }

    // ── 初始化累积积分 & trend 数组 ─────────────────
    const driverCum   = Object.fromEntries([...allDriverCodes].map(c => [c, 0]))
    const teamCum     = Object.fromEntries([...allTeamIds].map(id => [id, 0]))
    const driverTrend = Object.fromEntries([...allDriverCodes].map(c => [c, []]))
    const teamTrend   = Object.fromEntries([...allTeamIds].map(id => [id, []]))

    // ── 第二遍：按 round 逐站累加 ───────────────────
    for (const race of sortedMain) {
      const rnd = parseInt(race.round)

      // 本轮正赛积分（每名车手/车队）
      const raceDriverPts = {}
      const raceTeamPts   = {}

      for (const r of (race.Results ?? [])) {
        const code = r.Driver?.code || r.Driver?.driverId?.toUpperCase().slice(0, 3)
        const cid  = r.Constructor?.constructorId
        const pts  = parseFloat(r.points) || 0
        if (code) raceDriverPts[code] = (raceDriverPts[code] || 0) + pts
        if (cid)  raceTeamPts[cid]   = (raceTeamPts[cid]   || 0) + pts
      }

      // 若本轮有冲刺赛，合并冲刺积分
      for (const r of (sprintByRound[rnd] ?? [])) {
        const code = r.Driver?.code || r.Driver?.driverId?.toUpperCase().slice(0, 3)
        const cid  = r.Constructor?.constructorId
        const pts  = parseFloat(r.points) || 0
        if (code) raceDriverPts[code] = (raceDriverPts[code] || 0) + pts
        if (cid)  raceTeamPts[cid]   = (raceTeamPts[cid]   || 0) + pts
      }

      // 累加并记录快照（未参赛则 +0，保持连续数组长度一致）
      for (const code of allDriverCodes) {
        driverCum[code] += raceDriverPts[code] || 0
        driverTrend[code].push(Math.round(driverCum[code] * 10) / 10)
      }
      for (const cid of allTeamIds) {
        teamCum[cid] += raceTeamPts[cid] || 0
        teamTrend[cid].push(Math.round(teamCum[cid] * 10) / 10)
      }
    }

    const data = {
      drivers      : driverTrend,
      teams        : teamTrend,
      completedRnds: sortedMain.length,   // 已完成的正赛轮次数，供 chart 使用
    }

    // 有实际数据才缓存
    if (sortedMain.length > 0) cacheSet(cacheKey, data)
    console.info(`[API] fetchTrendData(${y}) 成功：${sortedMain.length} 轮，${allDriverCodes.size} 名车手，${allTeamIds.size} 支车队`)
    return data

  } catch (err) {
    console.warn(`[API] fetchTrendData(${y}) 失败:`, err.message)
    return null
  }
}
