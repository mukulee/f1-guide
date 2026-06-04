import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Modal 弹窗容器
 * Props:
 *   open     {bool}     — 控制显示
 *   onClose  {fn}       — 关闭回调（点击遮罩/ESC）
 *   title    {string}   — 标题栏文字（可选）
 *   size     'sm'|'md'|'lg'|'full' — 弹窗宽度
 *   children           — 弹窗内容
 */
const SIZE_MAP = {
  sm  : '360px',
  md  : '520px',
  lg  : '720px',
  full: '92vw',
}

export default function Modal({
  open    = false,
  onClose,
  title,
  size    = 'md',
  children,
}) {
  const panelRef = useRef(null)

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // 锁定 body 滚动
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        // ── 遮罩 ──
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9500,
            background: 'rgba(13,13,13,0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* ── 面板 ── */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: SIZE_MAP[size] || SIZE_MAP.md,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: '2px solid rgba(0,210,190,0.55)',
              borderRadius: '4px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,210,190,0.08)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 顶部扫光装饰 */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '80px',
              background: 'linear-gradient(to bottom, rgba(0,210,190,0.05), transparent)',
              pointerEvents: 'none',
              borderRadius: '4px 4px 0 0',
            }} />

            {/* 标题栏 */}
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', zIndex: 1,
              }}>
                <span style={{
                  fontFamily: 'var(--font-title)', fontSize: '16px',
                  fontWeight: 700, color: '#fff', letterSpacing: '0.05em',
                }}>
                  {title}
                </span>

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '2px', cursor: 'pointer',
                    color: 'rgba(229,226,225,0.5)', width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', lineHeight: 1,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,210,190,0.5)'
                    e.currentTarget.style.color = '#00D2BE'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'rgba(229,226,225,0.5)'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* 无标题时的关闭按钮 */}
            {!title && (
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '12px', right: '14px', zIndex: 2,
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '2px', cursor: 'pointer',
                  color: 'rgba(229,226,225,0.4)', width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', lineHeight: 1,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,210,190,0.5)'
                  e.currentTarget.style.color = '#00D2BE'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(229,226,225,0.4)'
                }}
              >
                ×
              </button>
            )}

            {/* 内容区 */}
            <div style={{ padding: title ? '20px' : '28px 20px 20px', position: 'relative', zIndex: 1 }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
