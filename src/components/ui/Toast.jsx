import { createContext, useContext, useCallback, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ── Context ───────────────────────────────────
const ToastContext = createContext(null)

// ── 单条 Toast ─────────────────────────────────
const TYPE_STYLES = {
  success: { accent: '#00D2BE', icon: '✓' },
  error  : { accent: '#E8002D', icon: '✕' },
  warning: { accent: '#FFC906', icon: '⚠' },
  info   : { accent: 'rgba(229,226,225,0.6)', icon: 'ℹ' },
}

function ToastItem({ id, type = 'info', message, onClose }) {
  const { accent, icon } = TYPE_STYLES[type] || TYPE_STYLES.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '14px 16px',
        background: 'rgba(17,17,17,0.97)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accent}44`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: '4px',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${accent}18`,
        minWidth: '260px', maxWidth: '380px',
        pointerEvents: 'all',
      }}
    >
      {/* 图标 */}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '13px',
        color: accent, lineHeight: 1.4, flexShrink: 0,
      }}>
        {icon}
      </span>

      {/* 文字 */}
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: 'rgba(229,226,225,0.9)', lineHeight: 1.5, flex: 1,
      }}>
        {message}
      </span>

      {/* 关闭按钮 */}
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(229,226,225,0.3)', fontSize: '14px',
          padding: '0 2px', lineHeight: 1, flexShrink: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(229,226,225,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(229,226,225,0.3)'}
      >
        ×
      </button>
    </motion.div>
  )
}

// ── Provider ──────────────────────────────────
let uidCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'info', message, duration = 3500 }) => {
    const id = ++uidCounter
    setToasts(prev => [...prev, { id, type, message }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* 固定在右下角 */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9000, display: 'flex', flexDirection: 'column',
        gap: '10px', alignItems: 'flex-end', pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} {...t} onClose={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ── useToast Hook ─────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
