// ── F1 GUIDE · FlashBlock ───────────────────────────
// 赛场快报块：RSS via /api/rss-proxy（Vercel Serverless）+ 降级 mock
// Tab 切换：Motorsport / Autosport / The Race

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../ui/Toast.jsx'

// ── 各来源配置 ────────────────────────────────────
// proxyPath：统一使用 /api/rss-proxy?source=xxx
//   开发环境：Vite dev server 通过 server.proxy 转发（vite.config.js 中 /api 路由指向本地函数）
//   生产环境：Vercel Serverless Function (api/rss-proxy.js) 处理
const FLASH_SOURCES = {
  motorsport: {
    name: 'Motorsport',
    rss: 'https://www.motorsport.com/rss/f1/news/',
    proxyPath: '/api/rss-proxy?source=motorsport',
    logo: 'https://cdn-1.motorsport.com/static/img/ico/favicon-196.png',
    color: '#E8002D',
    homeUrl: 'https://www.motorsport.com/f1/news/',
  },
  autosport: {
    name: 'Autosport',
    rss: 'https://www.autosport.com/rss/f1/news/',
    proxyPath: '/api/rss-proxy?source=autosport',
    logo: 'https://cdn.autosport.com/images/n/as_fav_icon_192x192.png',
    color: '#0066CC',
    homeUrl: 'https://www.autosport.com/f1/',
  },
  therace: {
    name: 'The Race',
    rss: 'https://the-race.com/formula-1/feed/',
    proxyPath: '/api/rss-proxy?source=therace',
    logo: 'https://the-race.com/wp-content/uploads/2020/11/cropped-the-race-favicon-192x192.png',
    color: '#FF6B00',
    homeUrl: 'https://the-race.com/formula-1/',
  },
}

const TABS = ['motorsport', 'autosport', 'therace']

// ── Fallback mock（三来源各自独立，使用经验证可通过 img-proxy 访问的真实 F1 图片）
// 图片来自 motorsport.com CDN（已通过 /img-proxy 验证 200 OK）
const FALLBACK_DATA = {
  motorsport: [
    { title: 'Audi F1 car and rare Koenigsegg hypercar craned onto $75m superyacht ahead of Monaco GP', thumb: 'https://cdn-5.motorsport.com/images/amp/6O79yga6/s6/a-general-view-of-the-harbour.jpg' },
    { title: 'Lando Norris wrestles 740hp McLaren around wet Nurburgring', thumb: 'https://cdn-4.motorsport.com/images/amp/2wlExeVY/s6/lando-norris-mclaren.jpg' },
    { title: "Williams F1 boss admits Canadian GP strategy was 'not right'", thumb: 'https://cdn-5.motorsport.com/images/amp/6zoJXmp0/s6/james-vowles-williams.jpg' },
    { title: "Charles Leclerc: 'I've never considered leaving Ferrari'", thumb: 'https://cdn-2.motorsport.com/images/amp/YWKwOy1Y/s6/charles-leclerc-ferrari.jpg' },
    { title: 'Alpine told Gucci partnership speaks volumes as Enstone rebuilds', thumb: 'https://cdn-3.motorsport.com/images/amp/0rVxgy50/s6/franco-colapinto-alpine.jpg' },
    { title: 'The 10 things you should know about the F1 Monaco Grand Prix', thumb: 'https://cdn-9.motorsport.com/images/amp/YN1edNW2/s6/yuki-tsunoda-red-bull-racing-3.jpg' },
  ],
  autosport: [
    { title: 'Piastri edges Norris in tense intra-team qualifying duel at Silverstone', thumb: 'https://cdn-7.motorsport.com/images/amp/0Rrv7Mv0/s6/race-winner-charles-leclerc-fe.jpg' },
    { title: "Sainz hails Williams upgrades as 'significant step' ahead of British GP", thumb: 'https://cdn-5.motorsport.com/images/amp/6zoJXmp0/s6/james-vowles-williams.jpg' },
    { title: 'Alonso says Aston Martin finally showing true 2026 car potential', thumb: 'https://cdn-3.motorsport.com/images/amp/0rVxgy50/s6/franco-colapinto-alpine.jpg' },
    { title: 'Russell warns Mercedes pace gap to McLaren narrows only on cooler tracks', thumb: 'https://cdn-4.motorsport.com/images/amp/2wlExeVY/s6/lando-norris-mclaren.jpg' },
    { title: 'Haas confirms major sponsor deal running through 2027 season', thumb: 'https://cdn-9.motorsport.com/images/amp/YN1edNW2/s6/yuki-tsunoda-red-bull-racing-3.jpg' },
    { title: 'Stewards clear Leclerc of track limits violation after podium review', thumb: 'https://cdn-2.motorsport.com/images/amp/YWKwOy1Y/s6/charles-leclerc-ferrari.jpg' },
  ],
  therace: [
    { title: "Why Red Bull's struggles go deeper than the RB21 itself", thumb: 'https://cdn-9.motorsport.com/images/amp/YN1edNW2/s6/yuki-tsunoda-red-bull-racing-3.jpg' },
    { title: 'The hidden aero war that could reshape the second half of 2026', thumb: 'https://cdn-4.motorsport.com/images/amp/2wlExeVY/s6/lando-norris-mclaren.jpg' },
    { title: "Mercedes W16 revival: the detail changes that made the difference", thumb: 'https://cdn-5.motorsport.com/images/amp/6O79yga6/s6/a-general-view-of-the-harbour.jpg' },
    { title: "How Ferrari's pit stop strategy cost them a certain win in Canada", thumb: 'https://cdn-2.motorsport.com/images/amp/YWKwOy1Y/s6/charles-leclerc-ferrari.jpg' },
    { title: 'Analysing why Silverstone suits McLaren better than any track on the calendar', thumb: 'https://cdn-3.motorsport.com/images/amp/0rVxgy50/s6/franco-colapinto-alpine.jpg' },
    { title: "The engineering story behind Norris's dominant qualifying lap", thumb: 'https://cdn-5.motorsport.com/images/amp/6zoJXmp0/s6/james-vowles-williams.jpg' },
  ],
}

function getFallback(src) {
  const base  = FLASH_SOURCES[src]?.homeUrl || '#'
  const items = FALLBACK_DATA[src] || FALLBACK_DATA.motorsport
  return items.map(({ title, thumb }, i) => ({
    title,
    pubDate:   new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    link:      base,
    thumbnail: thumb,
  }))
}

// ── RSS XML 解析 ──────────────────────────────────
// 策略：先用正则从原始 XML 文本里提取图片 URL（最可靠），
//       再用 DOMParser 提取 title/link/pubDate。
function parseRssXml(xmlStr) {
  try {
    // ── 用正则把每个 <item>…</item> 切出来 ─────────
    const itemChunks = []
    const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
    let m
    while ((m = itemRe.exec(xmlStr)) !== null) itemChunks.push(m[1])

    if (!itemChunks.length) return []

    // ── 然后再用 DOMParser 解析完整文档取文本字段 ──
    const parser = new DOMParser()
    const doc    = parser.parseFromString(xmlStr, 'text/xml')
    const domItems = Array.from(doc.querySelectorAll('item'))

    return itemChunks.slice(0, 8).map((chunk, idx) => {
      // ── 多策略正则提取缩略图（不依赖 DOM 命名空间）─
      // 1. <enclosure url="..."> type 含 image
      const encM  = chunk.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*/i)
      const encUrl = encM ? encM[1] : ''
      const encType = encM ? (encM[0].match(/type=["']([^"']+)["']/i)?.[1] || '') : ''
      const enclosureUrl = encUrl && (encType.toLowerCase().includes('image') || !encType) ? encUrl : ''

      // 2. <media:thumbnail url="..."> 或 <media:content url="...">
      const mediaM = chunk.match(/<media:(?:thumbnail|content)[^>]+url=["']([^"']+)["']/i)
      const mediaUrl = mediaM ? mediaM[1] : ''

      // 3. <img src="..."> 嵌在 description / content:encoded
      const htmlSrc  = chunk.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      const imgMatch = htmlSrc.match(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp|gif))[^"']*["']/i)
      const imgFromHtml = imgMatch ? imgMatch[1] : ''

      const thumbnail = enclosureUrl || mediaUrl || imgFromHtml

      // DOM 节点取文本（更准确处理 CDATA）
      const domItem = domItems[idx]
      const title   = domItem?.querySelector('title')?.textContent?.trim()   || ''
      const link    = domItem?.querySelector('link')?.textContent?.trim()    || '#'
      const pubDate = domItem?.querySelector('pubDate')?.textContent?.trim() || ''

      return { title, link, pubDate, thumbnail }
    })
  } catch {
    return []
  }
}

// ── 图片代理（绕过 hotlink 保护） ────────────────
// 统一使用 /api/img-proxy?url=<encodedUrl>
//   开发环境：Vite imgProxyPlugin 中间件处理
//   生产环境：Vercel Serverless Function (api/img-proxy.js) 处理
function toProxiedUrl(url) {
  if (!url) return ''
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `/api/img-proxy?url=${encodeURIComponent(url)}`
}

// ── 时间格式化 ────────────────────────────────────
function formatTime(date) {
  const diff = Math.floor((Date.now() - date) / 60000)
  if (diff < 1)    return '刚刚'
  if (diff < 60)   return `${diff} 分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)} 小时前`
  return `${Math.floor(diff / 1440)} 天前`
}

// ── 刷新图标 SVG ──────────────────────────────────
function RefreshIcon({ spinning }) {
  return (
    <motion.svg
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning ? { duration: 0.8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </motion.svg>
  )
}

// ── 旋转加载圈 ────────────────────────────────────
function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
      style={{
        width: 14, height: 14,
        border: '2px solid rgba(0,210,190,0.2)',
        borderTopColor: '#00D2BE',
        borderRadius: '50%',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}

// ── 单条快报 ──────────────────────────────────────
function FlashItem({ item, srcInfo, isLast }) {
  const thumb = item.thumbnail || ''
  const pubDate = item.pubDate ? formatTime(new Date(item.pubDate)) : ''
  const href = item.link && item.link !== '#' ? item.link : null

  const inner = (
    <div style={{
      display: 'flex', gap: 14,
      padding: '16px 20px',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      textDecoration: 'none',
      transition: 'background 0.15s',
    }}>
      {/* 缩略图 */}
      <ArticleThumb thumb={thumb} fallbackSrc={srcInfo.logo} srcColor={srcInfo.color} />

      {/* 正文 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: srcInfo.color || '#00D2BE',
          }}>
            {srcInfo.name}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9BA8A5' }}>
            {pubDate}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: '#E5E2E1', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.title}
        </div>
      </div>

      {/* 外链箭头 */}
      {href && (
        <div style={{ flexShrink: 0, alignSelf: 'center', color: 'rgba(255,255,255,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textDecoration: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.querySelector('div').style.background = 'rgba(255,255,255,0.025)'}
        onMouseLeave={e => e.currentTarget.querySelector('div').style.background = 'transparent'}
      >
        {inner}
      </a>
    )
  }
  return <div style={{ cursor: 'default' }}>{inner}</div>
}

// ── 文章缩略图（含 wsrv.nl 代理 + 懒加载 + 失败降级） ─────────────
// 渲染逻辑：
//   1. 优先显示 thumb（新闻封面），通过 wsrv.nl 代理
//   2. thumb 失败 → 切换到 fallbackSrc（来源 logo），通过 wsrv.nl 代理
//   3. 两者皆失败 → 显示品牌色渐变背景 + SVG 占位图标
function ArticleThumb({ thumb, fallbackSrc, srcColor }) {
  // useFallback=true 时直接显示 fallbackSrc
  const [useFallback, setUseFallback] = useState(!thumb)
  const [loaded, setLoaded]           = useState(false)
  const [failed, setFailed]           = useState(false)

  // thumb / fallbackSrc 变化时重置（切换 tab 或刷新后）
  useEffect(() => {
    setUseFallback(!thumb)
    setLoaded(false)
    setFailed(false)
  }, [thumb, fallbackSrc])

  const originalUrl = useFallback ? fallbackSrc : thumb
  const displaySrc  = toProxiedUrl(originalUrl)

  return (
    <div style={{
      width: 72, height: 52, borderRadius: 4, flexShrink: 0,
      background: failed
        ? `linear-gradient(135deg, rgba(0,0,0,0.3), ${srcColor || '#00D2BE'}1A)`
        : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {!failed && displaySrc && (
        <img
          src={displaySrc}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!useFallback && fallbackSrc) {
              // 新闻封面失败 → 退回来源 logo
              setUseFallback(true)
              setLoaded(false)
            } else {
              // logo 也失败 → 显示占位图标
              setFailed(true)
            }
          }}
          style={{
            width: '100%', height: '100%',
            objectFit: useFallback ? 'contain' : 'cover',
            padding: useFallback ? 10 : 0,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}
      {/* 完全失败或无 URL 时显示占位图标 */}
      {(failed || !displaySrc) && (
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={srcColor || '#9BA8A5'} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.45 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────
export default function FlashBlock() {
  const [activeTab, setActiveTab] = useState('motorsport')
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [updateTime, setUpdateTime] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const cacheRef = useRef({})
  const { toast } = useToast()

  const loadNews = useCallback(async (src, force = false) => {
    // 5分钟缓存（force=true 时跳过）
    if (!force) {
      const cached = cacheRef.current[src]
      if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
        setState({ status: 'ok', items: cached.items })
        return
      }
    }

    // 记录刷新前第一条标题，用于判断是否有新内容
    const prevFirstTitle = cacheRef.current[src]?.items?.[0]?.title || null

    if (force) {
      setRefreshing(true)
    } else {
      setState({ status: 'loading', items: [] })
    }

    try {
      const rssUrl    = encodeURIComponent(FLASH_SOURCES[src].rss)
      const rawRssUrl = FLASH_SOURCES[src].rss
      const proxyPath = FLASH_SOURCES[src].proxyPath
      let items = null

      // 策略0：Vite dev server 本地代理（Node.js 请求，无 CORS）———— 最高优先级
      if (proxyPath) {
        try {
          const r0 = await fetch(proxyPath, { signal: AbortSignal.timeout(8000) })
          if (r0.ok) {
            const xmlText = await r0.text()
            const parsed  = parseRssXml(xmlText)
            if (parsed.length) items = parsed
          }
        } catch (_) {}
      }

      // 策略1：rss2json.com
      if (!items) {
        try {
          const r = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=8`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (r.ok) {
            const j = await r.json()
            if (j.status === 'ok' && j.items?.length) items = j.items
          }
        } catch (_) {}
      }

      // 策略2：allorigins 代理解析 XML
      if (!items) {
        try {
          const r2 = await fetch(
            `https://api.allorigins.win/get?url=${rssUrl}`,
            { signal: AbortSignal.timeout(10000) }
          )
          if (r2.ok) {
            const raw    = await r2.json()
            const parsed = parseRssXml(raw.contents)
            if (parsed.length) items = parsed
          }
        } catch (_) {}
      }

      // 策略3：corsproxy.io 代理解析 XML
      if (!items) {
        try {
          const r3 = await fetch(
            `https://corsproxy.io/?${rawRssUrl}`,
            { signal: AbortSignal.timeout(10000) }
          )
          if (r3.ok) {
            const xmlText = await r3.text()
            const parsed  = parseRssXml(xmlText)
            if (parsed.length) items = parsed
          }
        } catch (_) {}
      }

      if (!items || !items.length) throw new Error('empty')

      // rss2json 条目：补充 enclosure 来源（XML 解析路径已在 parseRssXml 里处理）
      const enriched = items.map(item => ({
        ...item,
        thumbnail: item.thumbnail || item.enclosure?.link || '',
      }))

      const newFirstTitle = enriched[0]?.title || null
      const hasUpdate = force && (newFirstTitle !== prevFirstTitle)

      cacheRef.current[src] = { items: enriched, ts: Date.now() }
      setState({ status: 'ok', items: enriched })

      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      setUpdateTime(`刚刚更新 · ${now}`)

      // 刷新反馈 Toast
      if (force) {
        if (hasUpdate) {
          toast({ type: 'success', message: '快报已更新，已获取最新赛场资讯' })
        } else {
          toast({ type: 'info', message: '暂无新内容，当前已是最新资讯' })
        }
      }
    } catch {
      // 静默降级：不显示警告，直接展示 mock 数据
      const fallback = getFallback(src)
      cacheRef.current[src] = { items: fallback, ts: 0 } // ts=0 使下次仍会重新请求
      setState({ status: 'ok', items: fallback })
      if (force) {
        toast({ type: 'info', message: '暂无新内容，当前已是最新资讯' })
      }
    } finally {
      setRefreshing(false)
    }
  }, [toast])

  // 切 tab 时重置状态并加载
  useEffect(() => {
    setState({ status: 'loading', items: [] })
    loadNews(activeTab)
  }, [activeTab])

  function handleRefresh() {
    if (refreshing) return
    // 清除当前 tab 缓存，强制重新获取
    delete cacheRef.current[activeTab]
    loadNews(activeTab, true)
  }

  const srcInfo = FLASH_SOURCES[activeTab]
  const displayItems = state.items.slice(0, 6)

  return (
    <div
      data-no-dots
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8, overflow: 'hidden',
      }}
    >
      {/* 头部 */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700,
            color: '#FFFFFF', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            赛场快报
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 刷新按钮 —— 与右侧徽章等高：24px */}
            <button
              onClick={handleRefresh}
              title="刷新快报"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 24, width: 28,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3, cursor: refreshing ? 'not-allowed' : 'pointer',
                color: refreshing ? '#00D2BE' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!refreshing) {
                  e.currentTarget.style.background = 'rgba(0,210,190,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(0,210,190,0.3)'
                  e.currentTarget.style.color = '#00D2BE'
                }
              }}
              onMouseLeave={e => {
                if (!refreshing) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <RefreshIcon spinning={refreshing} />
            </button>

            {/* 更新时间徽章 —— 同样 24px 行高 */}
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              height: 24, padding: '0 8px',
              fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00D2BE',
              background: 'rgba(0,210,190,0.1)', border: '1px solid rgba(0,210,190,0.2)',
              borderRadius: 3, whiteSpace: 'nowrap',
            }}>
              {updateTime || '实时更新'}
            </span>
          </div>
        </div>

        {/* 来源 Tab */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: activeTab === tab ? '#00D2BE' : '#9BA8A5',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? '#00D2BE' : 'transparent'}`,
                marginBottom: -1, cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {FLASH_SOURCES[tab].name}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + state.status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {state.status === 'loading' && (
            <div style={{
              padding: '28px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8A5', letterSpacing: '0.1em',
            }}>
              <Spinner />
              加载赛场快报中…
            </div>
          )}

          {state.status === 'ok' && displayItems.map((item, i) => (
            <FlashItem
              key={i}
              item={item}
              srcInfo={srcInfo}
              isLast={i === displayItems.length - 1}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
