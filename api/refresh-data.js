// ── F1 GUIDE · Vercel Serverless Function: refresh-data ─────────────
// 路由：GET /api/refresh-data[?type=all|standings|races]
//
// 功能：
//   1. 从 Jolpica API 拉取当前赛季最新数据（车手榜、车队榜、赛历）
//   2. 以 JSON 返回，并设置 CDN 缓存头（s-maxage=3600 / stale-while-revalidate）
//   3. 由 Vercel Cron（每日 01:00 UTC）定时调用，保持 CDN 缓存新鲜
//   4. 前端也可直接调用，作为 Jolpica 的 Vercel CDN 代理层（中国友好）
//
// Vercel Cron 配置见 vercel.json > "crons"
// 外部备选：cron-job.org 每天 UTC 01:00 调用 https://<domain>/api/refresh-data
//
// ── 注意：不使用 Edge Runtime（需要并发 fetch + 较长超时）────────────

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1'
const TIMEOUT_MS   = 15_000

async function fetchJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}

export default async function handler(req, res) {
  const type = req.query.type || 'all'   // 'all' | 'standings' | 'races'

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const year = new Date().getFullYear()
  const startTime = Date.now()

  try {
    // ── 并发拉取所需数据 ──────────────────────────────────────────────
    const promises = []
    const keys     = []

    if (type === 'all' || type === 'standings') {
      promises.push(
        fetchJSON(`${JOLPICA_BASE}/current/driverStandings.json`),
        fetchJSON(`${JOLPICA_BASE}/current/constructorStandings.json`),
      )
      keys.push('_driverRaw', '_ctorRaw')
    }

    if (type === 'all' || type === 'races') {
      promises.push(
        fetchJSON(`${JOLPICA_BASE}/current/races.json?limit=30`),
      )
      keys.push('_racesRaw')
    }

    // 积分走势（仅 type=all 时拉取，数据量大，单独拉）
    if (type === 'all') {
      promises.push(
        fetchJSON(`${JOLPICA_BASE}/${year}/results.json?limit=500`),
      )
      keys.push('_resultsRaw')
    }

    const results = await Promise.allSettled(promises)

    // ── 解析各接口数据（部分失败不影响其他） ─────────────────────────
    const parsed = {}
    keys.forEach((key, i) => {
      parsed[key] = results[i].status === 'fulfilled' ? results[i].value : null
    })

    const driverStandings = parsed._driverRaw
      ?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []

    const constructorStandings = parsed._ctorRaw
      ?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []

    const races = parsed._racesRaw
      ?.MRData?.RaceTable?.Races ?? []

    // 已完成比赛（有 Results 字段）
    const completedRaces = parsed._resultsRaw
      ?.MRData?.RaceTable?.Races ?? []

    // ── 组装响应 ─────────────────────────────────────────────────────
    const payload = {
      ok: true,
      year,
      updatedAt    : new Date().toISOString(),
      elapsed      : Date.now() - startTime,
      driverStandings,
      constructorStandings,
      races,
      completedRaces,
      // 便于前端快速判断数据是否有效
      meta: {
        driverCount     : driverStandings.length,
        constructorCount: constructorStandings.length,
        raceCount       : races.length,
        completedCount  : completedRaces.length,
      },
    }

    // CDN 缓存 1h，最长 stale-while-revalidate 24h（保证即使 Jolpica 抖动用户也能拿到数据）
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
    return res.status(200).json(payload)

  } catch (err) {
    console.error('[refresh-data] fatal error:', err.message)
    return res.status(502).json({
      ok     : false,
      error  : err.message,
      elapsed: Date.now() - startTime,
    })
  }
}
