import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// ── 配置 ──────────────────────────────────────
const EYEBROW_TEXT  = '◆ 2026 一级方程式世界锦标赛 ◆'
const FORMULA_CHARS = ['F','O','R','M','U','L','A']
const BASE_DELAY    = 900
const CHAR_DELAY    = 68

// ── YouTube 背景视频 ──────────────────────────
// 视频：https://www.youtube.com/watch?v=Cs54R2Ks61s
const YT_VIDEO_ID = 'Cs54R2Ks61s'

export default function HeroSection() {
  const [eyebrow, setEyebrow] = useState('')
  const [ytReady, setYtReady] = useState(false)
  const speedLinesRef         = useRef(null)

  // ── 滚动视差 ──────────────────────────────────
  const { scrollY } = useScroll()

  // 文字整体：上移 + 淡出 + 缩小 + 模糊（三种变化叠加，有层次感）
  const contentY       = useTransform(scrollY, [0, 500], [0, -120])
  const contentOpacity = useTransform(scrollY, [0, 360],  [1, 0])
  const contentScale   = useTransform(scrollY, [0, 420],  [1, 0.86])
  const contentBlur    = useTransform(scrollY, [0, 300],  ['blur(0px)', 'blur(10px)'])

  // h1 标题额外：字间距展开（速度感散开）
  const titleSpread    = useTransform(scrollY, [0, 320],  ['0.05em', '0.42em'])

  // 遮罩随滚动加深（沉浸感）
  const overlayOpacity = useTransform(scrollY, [0, 400],  [0, 0.45])

  // ── 打字机 ─────────────────────────────────────
  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setEyebrow(EYEBROW_TEXT.slice(0, i))
        if (i >= EYEBROW_TEXT.length) clearInterval(interval)
      }, 55)
      return () => clearInterval(interval)
    }, 500)
    return () => clearTimeout(timeout)
  }, [])

  // ── 速度线 ─────────────────────────────────────
  useEffect(() => {
    const container = speedLinesRef.current
    if (!container) return
    for (let i = 0; i < 14; i++) {
      const line = document.createElement('div')
      line.className = 'speed-line'
      line.style.top               = `${Math.random() * 100}%`
      line.style.width             = `${80 + Math.random() * 240}px`
      line.style.animationDuration = `${2.2 + Math.random() * 1.8}s`
      line.style.animationDelay    = `${Math.random() * 5}s`
      container.appendChild(line)
    }
    return () => { if (container) container.innerHTML = '' }
  }, [])

  // CTA 滚动到数字+探索区
  const handleCTA = (e) => {
    e.preventDefault()
    document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={{
      position: 'relative',
      height: '100vh', minHeight: '640px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* ── YouTube 背景视频（全屏覆盖，静音自动播放循环） ── */}
      {/* 降级兜底：视频加载前显示深色背景 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #18080a 50%, #080a14 100%)',
      }} />

      {/* YouTube iframe — 16:9 等比覆盖技巧：
          宽至少 177.78vh（= 16/9 × 100vh），高至少 56.25vw（= 9/16 × 100vw）
          translate(-50%,-50%) 居中，pointer-events:none 防止点击 */}
      <iframe
        src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${YT_VIDEO_ID}&playsinline=1&enablejsapi=1`}
        allow="autoplay; encrypted-media"
        onLoad={() => setYtReady(true)}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          // 保持 16:9，同时完全覆盖容器
          width: 'max(177.78vh, 100%)',
          height: 'max(56.25vw, 100%)',
          border: 'none',
          pointerEvents: 'none',
          zIndex: 1,
          // 视频淡入
          opacity: ytReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
          // 暗化视频亮度
          filter: 'brightness(0.38) saturate(1.1)',
        }}
      />

      {/* ── 渐变叠加 ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: [
          'linear-gradient(to top, #0D0D0D 0%, rgba(13,13,13,0.55) 38%, rgba(13,13,13,0.08) 100%)',
          'linear-gradient(to right, rgba(13,13,13,0.25) 0%, transparent 50%)',
          'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,210,190,0.06) 0%, transparent 70%)',
        ].join(', '),
      }} />

      {/* ── 滚动时加深遮罩（沉浸感） ── */}
      <motion.div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: '#0D0D0D',
        opacity: overlayOpacity,
        pointerEvents: 'none',
      }} />

      {/* ── 速度线 ── */}
      <div
        ref={speedLinesRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}
      />

      {/* ── 大扫光 ── */}
      <div className="hero-sweeper" />

      {/* ── 赛道装饰底线 ── */}
      <div className="hero-track-line" />

      {/* ── 左上角数字装饰 ── */}
      <div className="hero-race-badge">
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '54px', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, letterSpacing: '-0.03em' }}>22</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,210,190,0.5)', letterSpacing: '0.18em', lineHeight: 1.7 }}>ROUNDS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,210,190,0.5)', letterSpacing: '0.18em' }}>2026 SEASON</div>
      </div>

      {/* ── 主内容（滚动：上移 + 淡出 + 缩小 + 模糊） ── */}
      <motion.div style={{
        position: 'relative', zIndex: 5,
        textAlign: 'center', padding: '0 24px',
        y: contentY,
        opacity: contentOpacity,
        scale: contentScale,
        filter: contentBlur,
      }}>

        {/* 打字机 eyebrow */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.28em',
          color: '#00D2BE', marginBottom: '22px', textTransform: 'uppercase',
          minHeight: '1.5em',
        }}>
          {eyebrow}
        </div>

        {/* SplitText — FORMULA 1（滚动时字间距展开） */}
        <motion.h1
          aria-label="FORMULA 1"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(64px, 11vw, 120px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: titleSpread,
            lineHeight: 1, textTransform: 'uppercase',
            marginBottom: '20px',
            display: 'flex', justifyContent: 'center', gap: '0.03em',
            perspective: '800px',
          }}
        >
          {FORMULA_CHARS.map((char, idx) => (
            <span
              key={idx}
              className="hero-char"
              style={{ animationDelay: `${BASE_DELAY + idx * CHAR_DELAY}ms` }}
            >
              {char}
            </span>
          ))}
          <span style={{ display: 'inline-block', width: '0.28em' }} />
          <span
            className="hero-char"
            style={{ animationDelay: `${BASE_DELAY + 8 * CHAR_DELAY}ms` }}
          >
            1
          </span>
        </motion.h1>

        {/* 副标题 */}
        <p style={{
          fontFamily: 'var(--font-title)', fontSize: 'clamp(14px, 2.5vw, 22px)',
          fontWeight: 600, color: '#00D2BE', letterSpacing: '0.14em',
          textTransform: 'uppercase', marginBottom: '12px',
          animation: 'fadeSlideUp 0.6s ease 1.6s both',
        }}>
          从围场到颁奖台
        </p>

        {/* 描述 */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px',
          color: 'rgba(229,226,225,0.5)', marginBottom: '52px',
          animation: 'fadeSlideUp 0.6s ease 1.85s both',
        }}>
          F1 科普与数据站 · 解码速度与激情
        </p>

        {/* CTA — 滚动到 #explore */}
        <div style={{ animation: 'fadeSlideUp 0.6s ease 2.05s both', display: 'inline-block' }}>
          <a href="#explore" className="hero-cta" onClick={handleCTA}>
            开始探索 →
          </a>
        </div>
      </motion.div>

      {/* ── 底部箭头提示 ── */}
      <motion.div style={{
        position: 'absolute', bottom: '32px', left: '50%',
        x: '-50%', zIndex: 5,
        opacity: contentOpacity,
        animation: 'fadeSlideUp 0.6s ease 2.5s both',
      }}>
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, rgba(0,210,190,0.7), transparent)',
          margin: '0 auto',
          animation: 'scrollPulse 2s ease-in-out infinite',
        }} />
      </motion.div>

    </section>
  )
}
