import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header           from './components/layout/Header'
import Footer           from './components/layout/Footer'
import { ToastProvider } from './components/ui/Toast'
import DotGrid          from './components/ui/DotGrid'

// ── React.lazy 代码分割：每个页面独立 chunk，按需加载 ──────────────
// 首屏只加载 Home，其余页面在首次导航时再下载
const Home      = lazy(() => import('./pages/Home'))
const Schedule  = lazy(() => import('./pages/Schedule'))
const Standings = lazy(() => import('./pages/Standings'))
const Learn     = lazy(() => import('./pages/Learn'))
const Teams     = lazy(() => import('./pages/Teams'))
const Community = lazy(() => import('./pages/Community'))

// ── 页面切换 loading 状态（Suspense fallback） ────────────────────
function PageFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        border: '2px solid rgba(0,210,190,0.15)',
        borderTopColor: '#00D2BE',
        animation: 'spin 0.9s linear infinite',
      }} />
    </div>
  )
}

// ── 页面过渡动效（淡入淡出 300ms） ────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Suspense 包裹懒加载页面，切换时显示转圈 */}
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/"          element={<Home />} />
            <Route path="/schedule"  element={<Schedule />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/learn"     element={<Learn />} />
            <Route path="/teams"     element={<Teams />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </Suspense>
        <Footer />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* 点阵背景：fixed 定位，z=0，穿透所有事件 */}
        <DotGrid />
        <Header />
        <main style={{ minHeight: '100vh' }}>
          <AnimatedRoutes />
        </main>
      </BrowserRouter>
    </ToastProvider>
  )
}
