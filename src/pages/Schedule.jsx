import { useState } from 'react'
import useSchedule  from '../hooks/useSchedule'
import ScheduleHero from '../components/schedule/ScheduleHero'
import RaceList     from '../components/schedule/RaceList'
import Loading      from '../components/ui/Loading'

// 当前年份 (2026)，作为默认年份
const CURRENT_YEAR = new Date().getFullYear()

export default function Schedule() {
  const [year,   setYear]   = useState(CURRENT_YEAR)
  const [filter, setFilter] = useState('all')

  const { races, nextRace, completedRaces, loading } = useSchedule(year)

  // 切换年份时重置过滤器
  function handleYearChange(y) {
    setYear(y)
    setFilter('all')
  }

  if (loading && races.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: '60px',
      }}>
        <Loading variant="fullscreen" text="加载赛程数据..." />
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '60px' }}>
      <ScheduleHero
        nextRace={nextRace}
        filter={filter}
        onFilterChange={setFilter}
        totalRaces={races.length}
        completedCount={completedRaces.length}
        selectedYear={year}
        onYearChange={handleYearChange}
      />
      <RaceList races={races} filter={filter} year={year} />
    </div>
  )
}
