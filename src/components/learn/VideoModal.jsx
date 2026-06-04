// ── F1 GUIDE · VideoModal ───────────────────────────
// 视频弹窗：Bilibili player iframe 嵌入 + Framer Motion 动效
// 使用方式：<VideoModal module={activeModule} onClose={() => setActiveModule(null)} />
// module: { num, bvid, embedUrl, title, desc } | null

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 播放图标 ───────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

// ── 关闭图标 ───────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function VideoModal({ module, onClose }) {
  // ESC 关闭
  useEffect(() => {
    if (!module) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [module, onClose])

  // 打开时锁定滚动
  useEffect(() => {
    document.body.style.overflow = module ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [module])

  const numStr = module ? String(module.num).padStart(2, '0') : '01'
  const accentColor = module?.advanced ? '#0090FF' : '#00D2BE'

  return (
    <AnimatePresence>
      {module && (
        // 遮罩层
        <motion.div
          key="video-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* 内容面板 — 阻止冒泡 */}
          <motion.div
            key="video-modal-content"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 960,
              background: '#111111',
              borderRadius: 8,
              border: `1px solid ${accentColor}4D`, // 30% 透明度
              overflow: 'hidden',
              boxShadow: `0 0 60px ${accentColor}26, 0 24px 64px rgba(0,0,0,0.7)`,
            }}
          >
            {/* 顶部主题色细线 */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              zIndex: 5,
            }} />

            {/* 关闭按钮 */}
            <motion.button
              whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                color: '#E5E2E1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <CloseIcon />
            </motion.button>

            {/* iframe 区域（Bilibili player，国内可正常访问） */}
            <div style={{ aspectRatio: '16/9', width: '100%', background: '#000' }}>
              <iframe
                key={module.bvid || module.embedUrl}
                src={module.bvid
                  ? `https://player.bilibili.com/player.html?bvid=${module.bvid}&page=1&as_wide=1&high_quality=1&danmaku=0`
                  : module.embedUrl}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                scrolling="no"
                frameBorder="0"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </div>

            {/* 底部信息区 */}
            <div style={{ padding: '20px 28px 24px' }}>
              {/* 模块编号 */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.22em', color: accentColor,
                marginBottom: 8, textTransform: 'uppercase',
              }}>
                模块 {numStr} · {module.advanced ? '进阶课堂' : '新手必读'}
              </div>

              {/* 标题 */}
              <h3 style={{
                fontFamily: 'var(--font-title)', fontSize: 22,
                fontWeight: 700, color: '#FFFFFF',
                marginBottom: 8, lineHeight: 1.2,
              }}>
                {module.title}
              </h3>

              {/* 描述 + B站备用链接 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: '#9BA8A5', lineHeight: 1.65, flex: 1,
                }}>
                  {module.desc}
                </p>
                {module.bvid && (
                  <a
                    href={`https://www.bilibili.com/video/${module.bvid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px',
                      background: 'rgba(0,210,190,0.08)',
                      border: '1px solid rgba(0,210,190,0.25)',
                      borderRadius: 4,
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: '#00D2BE', letterSpacing: '0.08em',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,210,190,0.15)'
                      e.currentTarget.style.borderColor = 'rgba(0,210,190,0.5)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0,210,190,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(0,210,190,0.25)'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    在 B 站观看
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
