// ── useBreakpoint — 全局响应式断点 Hook ──────────────
// 用法：const { isMobile, isTablet, isDesktop, w } = useBreakpoint()
// isMobile  : width < 768
// isTablet  : 768 <= width < 1024
// isDesktop : width >= 1024

import { useState, useEffect } from 'react'

function getBreakpoint(w) {
  return {
    w,
    isMobile:  w < 768,
    isTablet:  w >= 768 && w < 1024,
    isDesktop: w >= 1024,
  }
}

export default function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  ))

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth))
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  return bp
}
