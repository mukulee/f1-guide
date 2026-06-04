import { useEffect, useState } from 'react'
import { fetchRacesByYear } from '../services/api'
import staticRaces2025 from '../data/races2025.json'
import staticRaces2026 from '../data/races2026.json'

// 静态数据映射
const STATIC_DATA = {
  2025: staticRaces2025,
  2026: staticRaces2026,
}

// 简单国家名→ISO2 映射
const COUNTRY_MAP = {
  'Bahrain':'bh','Saudi Arabia':'sa','Australia':'au','Japan':'jp',
  'China':'cn','USA':'us','Italy':'it','Monaco':'mc','Spain':'es',
  'Canada':'ca','Austria':'at','UK':'gb','United Kingdom':'gb',
  'Belgium':'be','Hungary':'hu','Netherlands':'nl','Azerbaijan':'az',
  'Singapore':'sg','Mexico':'mx','Brazil':'br','Qatar':'qa','UAE':'ae',
}
function getCountryCode(country) {
  return COUNTRY_MAP[country] ?? 'un'
}

// 把 Jolpica API 返回格式映射成与静态 JSON 一致的结构
function mapApiRace(apiRace) {
  const raceDateTime = `${apiRace.date}T${apiRace.time ?? '14:00:00Z'}`
  const now = new Date()
  const rd  = new Date(raceDateTime)
  const status = rd < now ? 'completed' : 'upcoming'

  return {
    round     : parseInt(apiRace.round, 10),
    id        : `r${String(apiRace.round).padStart(2, '0')}`,
    name      : apiRace.raceName,
    circuit   : apiRace.Circuit.circuitName,
    location  : apiRace.Circuit.Location.locality,
    country   : apiRace.Circuit.Location.country,
    flag      : `https://flagcdn.com/w40/${getCountryCode(apiRace.Circuit.Location.country)}.png`,
    dates     : apiRace.date,
    raceDate  : raceDateTime,
    status,
    podium    : null,
    fastestLap: null,
    sessions  : [],
  }
}

// 标记下一场比赛
function markNextRace(races) {
  const now = new Date()
  let nextMarked = false
  return races.map(race => {
    const rd = new Date(race.raceDate)
    if (!nextMarked && rd > now) {
      nextMarked = true
      return { ...race, status: 'next' }
    }
    return race
  })
}

export default function useSchedule(year = 2026) {
  const [races,   setRaces]   = useState([])
  const [loading, setLoading] = useState(true)
  const [source,  setSource]  = useState('static')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setRaces([])

    async function load() {
      // ① 优先用本地静态数据立即渲染
      const staticData = STATIC_DATA[year]
      if (staticData) {
        const marked = markNextRace(staticData)
        if (!cancelled) { setRaces(marked); setLoading(false) }
      }

      // ② 后台尝试 API 覆盖（获取最新状态）
      const apiData = await fetchRacesByYear(year)
      if (cancelled || !apiData) return

      // 合并：API 提供基础信息，静态数据提供 podium/sessions 等
      const staticMap = {}
      if (staticData) {
        staticData.forEach(r => { staticMap[r.round] = r })
      }

      const merged = apiData.map(apiRace => {
        const mapped  = mapApiRace(apiRace)
        const staticR = staticMap[mapped.round]
        return {
          ...mapped,
          // 优先保留静态数据中更丰富的字段
          name       : staticR?.name       ?? mapped.name,
          circuit    : staticR?.circuit    ?? mapped.circuit,
          podium     : staticR?.podium     ?? null,
          fastestLap : staticR?.fastestLap ?? null,
          sessions   : staticR?.sessions   ?? [],
          trackLength: staticR?.trackLength,
          laps       : staticR?.laps,
          lapRecord  : staticR?.lapRecord,
          recordHolder: staticR?.recordHolder,
        }
      })

      const markedApi = markNextRace(merged)
      if (!cancelled) { setRaces(markedApi); setSource('api'); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [year])

  const nextRace       = races.find(r => r.status === 'next') ?? null
  const completedRaces = races.filter(r => r.status === 'completed')
  const upcomingRaces  = races.filter(r => r.status === 'upcoming')

  return { races, nextRace, completedRaces, upcomingRaces, loading, source }
}
