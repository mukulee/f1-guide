import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',           label: '首页' },
  { to: '/schedule',   label: '赛程' },
  { to: '/standings',  label: '积分' },
  { to: '/learn',      label: '科普' },
  { to: '/teams',      label: '车队' },
  { to: '/community',  label: '社区' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '60px',
        background: scrolled ? 'rgba(10,10,10,0.96)' : 'rgba(10,10,10,0.15)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'background 0.3s, border-bottom 0.3s',
      }}
    >
      <div className="page-container" style={{ height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <NavLink
          to="/"
          style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: 700, color: '#00D2BE', textDecoration: 'none', letterSpacing: '0.04em' }}
        >
          F1 GUIDE
        </NavLink>

        {/* 导航链接 */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid #00D2BE' : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'color 0.2s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* 图标区 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            title="搜索"
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button
            style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            title="用户"
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
