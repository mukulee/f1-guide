import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useBreakpoint from '../../hooks/useBreakpoint'

const NAV_LINKS = [
  { to: '/',           label: '首页' },
  { to: '/schedule',   label: '赛程' },
  { to: '/standings',  label: '积分' },
  { to: '/learn',      label: '科普' },
  { to: '/teams',      label: '车队' },
  { to: '/community',  label: '社区' },
]

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 移动端菜单打开时禁止页面滚动
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // 切换到桌面端时自动关闭菜单
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '60px',
          background: (scrolled || menuOpen) ? 'rgba(10,10,10,0.98)' : 'rgba(10,10,10,0.15)',
          backdropFilter: 'blur(12px)',
          borderBottom: (scrolled || menuOpen) ? '1px solid rgba(255,255,255,0.07)' : 'none',
          transition: 'background 0.3s, border-bottom 0.3s',
        }}
      >
        <div className="page-container" style={{ height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: 700, color: '#00D2BE', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            F1 GUIDE
          </NavLink>

          {/* 桌面端导航链接 */}
          {!isMobile && (
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
          )}

          {/* 桌面端图标 / 移动端汉堡按钮 */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {!isMobile && (
              <>
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
              </>
            )}

            {/* 汉堡按钮（仅移动端） */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px', display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', gap: '5px',
                  width: '36px', height: '36px',
                }}
              >
                {/* 三条线动画变成 X */}
                <span style={{
                  display: 'block', width: '22px', height: '2px',
                  background: '#fff', borderRadius: '2px',
                  transformOrigin: 'center',
                  transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                  transition: 'transform 0.28s ease',
                }} />
                <span style={{
                  display: 'block', width: '22px', height: '2px',
                  background: '#fff', borderRadius: '2px',
                  opacity: menuOpen ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }} />
                <span style={{
                  display: 'block', width: '22px', height: '2px',
                  background: '#fff', borderRadius: '2px',
                  transformOrigin: 'center',
                  transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                  transition: 'transform 0.28s ease',
                }} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── 移动端全屏菜单抽屉 ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '60px', left: 0, right: 0, bottom: 0,
              zIndex: 99,
              background: 'rgba(8,8,8,0.98)',
              backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column',
              padding: '32px 24px 48px',
              overflowY: 'auto',
            }}
          >
            {/* 菜单链接列表 */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {NAV_LINKS.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-title)',
                      fontSize: '28px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: isActive ? '#00D2BE' : 'rgba(255,255,255,0.85)',
                    })}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: '16px', opacity: 0.4 }}>→</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* 底部 logo 水印 */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '0.22em', color: 'rgba(0,210,190,0.3)',
              textTransform: 'uppercase', marginTop: '32px',
            }}>
              F1 GUIDE · 2026 SEASON
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
