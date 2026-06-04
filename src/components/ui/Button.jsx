import { useState } from 'react'

/**
 * Button 通用按钮
 * variant: 'primary' | 'outline' | 'action'
 * size:    'sm' | 'md' | 'lg'
 * disabled, loading, onClick, children, style, ...rest
 */
export default function Button({
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // ── 尺寸 ──────────────────────────────────────
  const sizeStyles = {
    sm: { fontSize: '12px', padding: '8px 18px', letterSpacing: '0.14em' },
    md: { fontSize: '13px', padding: '12px 28px', letterSpacing: '0.16em' },
    lg: { fontSize: '14px', padding: '16px 40px', letterSpacing: '0.18em' },
  }

  // ── 变体颜色 ──────────────────────────────────
  const getVariantStyle = () => {
    const isActive = hovered && !disabled && !loading

    if (variant === 'primary') {
      return {
        background   : isActive ? 'rgba(0,210,190,0.18)' : 'rgba(0,210,190,0.10)',
        border       : `1px solid ${isActive ? 'rgba(0,210,190,0.8)' : 'rgba(0,210,190,0.45)'}`,
        color        : '#00D2BE',
        boxShadow    : isActive
          ? '0 0 12px rgba(0,210,190,0.25), 0 4px 20px rgba(0,210,190,0.15)'
          : 'none',
      }
    }

    if (variant === 'outline') {
      return {
        background   : isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        border       : `1px solid ${isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}`,
        color        : isActive ? '#fff' : 'rgba(229,226,225,0.75)',
        boxShadow    : 'none',
      }
    }

    if (variant === 'action') {
      return {
        background   : isActive ? '#00BCB0' : '#00D2BE',
        border       : '1px solid transparent',
        color        : '#0D0D0D',
        boxShadow    : isActive
          ? '0 6px 24px rgba(0,210,190,0.4)'
          : '0 4px 16px rgba(0,210,190,0.25)',
        fontWeight   : 700,
      }
    }

    return {}
  }

  const baseStyle = {
    display       : 'inline-flex',
    alignItems    : 'center',
    justifyContent: 'center',
    gap           : '8px',
    fontFamily    : 'var(--font-mono)',
    fontWeight    : 600,
    textTransform : 'uppercase',
    borderRadius  : '2px',
    cursor        : disabled || loading ? 'not-allowed' : 'pointer',
    opacity       : disabled ? 0.4 : 1,
    transform     : pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    transition    : 'all 0.25s ease',
    textDecoration: 'none',
    whiteSpace    : 'nowrap',
    userSelect    : 'none',
    ...sizeStyles[size],
    ...getVariantStyle(),
    ...style,
  }

  return (
    <button
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...rest}
    >
      {loading && (
        <span style={{
          display: 'inline-block',
          width: '12px', height: '12px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
    </button>
  )
}
