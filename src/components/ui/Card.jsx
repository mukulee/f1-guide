import { useState } from 'react'

/**
 * Card 通用卡片壳
 * variant:  'default' | 'glass' | 'flat'
 * hoverable: bool — 是否启用全站 hover 规范（cyan 边框上浮）
 * padding:  '16px' 等 CSS 字符串，默认 '24px'
 */
export default function Card({
  variant   = 'default',
  hoverable = true,
  padding   = '24px',
  style,
  children,
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = useState(false)
  const isHov = hovered && hoverable && !onClick === false

  // ── 变体基础样式 ──────────────────────────────
  const variantStyle = {
    default: {
      background: '#111111',
      border    : isHov
        ? '1px solid rgba(0,210,190,0.55)'
        : '1px solid rgba(255,255,255,0.07)',
    },
    glass: {
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border    : isHov
        ? '1px solid rgba(0,210,190,0.55)'
        : '1px solid rgba(255,255,255,0.08)',
    },
    flat: {
      background: '#0D0D0D',
      border    : isHov
        ? '1px solid rgba(0,210,190,0.55)'
        : '1px solid rgba(255,255,255,0.05)',
    },
  }

  const baseStyle = {
    borderRadius   : '4px',
    overflow       : 'hidden',
    padding,
    transition     : 'border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease',
    cursor         : onClick ? 'pointer' : 'default',
    ...variantStyle[variant],
    transform      : hoverable && hovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow      : hoverable && hovered
      ? '0 2px 12px rgba(0,210,190,0.08), 0 8px 32px rgba(0,210,190,0.15), 0 0 0 1px rgba(0,210,190,0.12)'
      : 'none',
    position: 'relative',
    ...style,
  }

  return (
    <div
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      {...rest}
    >
      {/* hover 扫光层 */}
      {hoverable && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(115deg, transparent 30%, rgba(0,210,190,0.05) 50%, transparent 70%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          borderRadius: '4px',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
