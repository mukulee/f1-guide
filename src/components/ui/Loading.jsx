/**
 * Loading 加载状态组件
 * variant: 'spinner' | 'bar' | 'dots' | 'fullscreen'
 * text: 自定义加载文字，默认 '加载中...'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Loading({
  variant = 'spinner',
  text    = '加载中...',
  size    = 'md',
}) {
  const sizePx = { sm: 20, md: 36, lg: 56 }[size]
  const fontSize = { sm: '11px', md: '12px', lg: '13px' }[size]

  // ── spinner ───────────────────────────────────
  if (variant === 'spinner') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '14px',
      }}>
        <div style={{
          width: sizePx, height: sizePx,
          border: `2px solid rgba(0,210,190,0.15)`,
          borderTopColor: '#00D2BE',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        {text && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize,
            color: 'rgba(0,210,190,0.6)', letterSpacing: '0.16em',
          }}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // ── bar（赛道风进度条）──────────────────────
  if (variant === 'bar') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {text && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize,
            color: 'rgba(0,210,190,0.6)', letterSpacing: '0.14em',
          }}>
            {text}
          </span>
        )}
        <div style={{
          width: '100%', height: '2px',
          background: 'rgba(0,210,190,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #00D2BE, transparent)',
            animation: 'loadingBar 1.4s ease-in-out infinite',
          }} />
        </div>
      </div>
    )
  }

  // ── dots ──────────────────────────────────────
  if (variant === 'dots') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: sizePx / 4, height: sizePx / 4,
              borderRadius: '50%',
              background: '#00D2BE',
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
        {text && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize,
            color: 'rgba(0,210,190,0.6)', letterSpacing: '0.14em',
            marginLeft: '8px',
          }}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // ── fullscreen ────────────────────────────────
  if (variant === 'fullscreen') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(13,13,13,0.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px',
      }}>
        {/* F1 圆环 Spinner */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid rgba(0,210,190,0.12)',
            borderTopColor: '#00D2BE',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px solid rgba(0,210,190,0.07)',
            borderBottomColor: 'rgba(0,210,190,0.5)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite reverse',
          }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'rgba(0,210,190,0.7)', letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}>
          {text}
        </span>
      </div>
    )
  }

  return null
}
