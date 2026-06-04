/**
 * DotGrid — 全局交互式点阵背景
 *
 * 默认几乎不可见，鼠标靠近时发出青绿光晕。
 * 自动排除页面中带 [data-no-dots] 属性的元素（卡片区域），
 * 仅在卡片外的空白区域绘制点。
 *
 * 层级：position:fixed, z-index:2, mix-blend-mode:screen, pointer-events:none
 */
import { useEffect, useRef, useCallback } from 'react'

const DOT_SPACING    = 18      // 点间距（px）
const DOT_RADIUS     = 1.2     // 点基础半径（px）
const BASE_ALPHA     = 0.06    // 默认透明度（近乎不可见）
const HOVER_ALPHA    = 0.90    // 鼠标最亮透明度
const CURSOR_RADIUS  = 150     // 光晕影响半径（px）
const BULGE_RADIUS   = 85      // 点膨胀半径（px）
const BULGE_SCALE    = 2.4     // 点膨胀最大倍数
const COLOR_FROM     = [0, 210, 190]    // #00D2BE — 主色
const COLOR_TO       = [120, 230, 210]  // 亮色端
const EXCLUDE_PAD    = 6       // 排除区域额外留白（px）
const RECT_REFRESH   = 45      // 每隔多少帧刷新一次排除矩形

function lerp(a, b, t)  { return a + (b - a) * t }
function easeOut(t)     { return 1 - (1 - t) * (1 - t) }

export default function DotGrid() {
  const canvasRef   = useRef(null)
  const mouse       = useRef({ x: -9999, y: -9999 })
  const rafRef      = useRef(null)
  const dotsRef     = useRef([])
  const excludeRef  = useRef([])   // 排除区域矩形列表（viewport 坐标）
  const frameRef    = useRef(0)

  /* ── 刷新排除区域（相对 viewport 的 getBoundingClientRect） ── */
  const refreshExclude = useCallback(() => {
    const els = document.querySelectorAll('[data-no-dots]')
    excludeRef.current = Array.from(els).map(el => {
      const r = el.getBoundingClientRect()
      return {
        left:   r.left   - EXCLUDE_PAD,
        right:  r.right  + EXCLUDE_PAD,
        top:    r.top    - EXCLUDE_PAD,
        bottom: r.bottom + EXCLUDE_PAD,
      }
    })
  }, [])

  /* ── 点是否在排除区域内 ── */
  function isExcluded(cx, cy) {
    for (const r of excludeRef.current) {
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return true
    }
    return false
  }

  /* ── 重建点阵 ── */
  const buildDots = useCallback((canvas) => {
    const { width: W, height: H } = canvas.getBoundingClientRect()
    canvas.width  = W
    canvas.height = H

    const cols = Math.ceil(W / DOT_SPACING) + 1
    const rows = Math.ceil(H / DOT_SPACING) + 1
    const dots = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          cx:    c * DOT_SPACING,
          cy:    r * DOT_SPACING,
          alpha: BASE_ALPHA,
          scale: 1,
        })
      }
    }
    dotsRef.current = dots
    refreshExclude()
  }, [refreshExclude])

  /* ── 主渲染循环 ── */
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x: mx, y: my } = mouse.current

    /* 周期性刷新排除区域（scroll / resize 之外的懒更新） */
    frameRef.current++
    if (frameRef.current % RECT_REFRESH === 0) refreshExclude()

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const dot of dotsRef.current) {
      /* 跳过卡片覆盖区域 */
      if (isExcluded(dot.cx, dot.cy)) continue

      const dx   = dot.cx - mx
      const dy   = dot.cy - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      /* 目标透明度 & 缩放 */
      const tAlpha = dist < CURSOR_RADIUS
        ? lerp(HOVER_ALPHA, BASE_ALPHA, easeOut(dist / CURSOR_RADIUS))
        : BASE_ALPHA

      const tScale = dist < BULGE_RADIUS
        ? lerp(BULGE_SCALE, 1, easeOut(dist / BULGE_RADIUS))
        : 1

      /* 平滑插值（惯性） */
      dot.alpha = lerp(dot.alpha, tAlpha, 0.12)
      dot.scale = lerp(dot.scale, tScale, 0.18)

      /* 颜色 */
      const t = Math.min(1, Math.max(0, 1 - dist / CURSOR_RADIUS))
      const r = Math.round(lerp(COLOR_FROM[0], COLOR_TO[0], t))
      const g = Math.round(lerp(COLOR_FROM[1], COLOR_TO[1], t))
      const b = Math.round(lerp(COLOR_FROM[2], COLOR_TO[2], t))

      ctx.beginPath()
      ctx.arc(dot.cx, dot.cy, DOT_RADIUS * dot.scale, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},${dot.alpha})`
      ctx.fill()
    }

    rafRef.current = requestAnimationFrame(render)
  }, [refreshExclude])

  /* ── 挂载 ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    buildDots(canvas)

    const onMove  = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }

    /* scroll 时刷新排除矩形（卡片位置随滚动变化） */
    const onScroll = () => refreshExclude()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => buildDots(canvas))
    ro.observe(document.body)

    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [buildDots, render, refreshExclude])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
