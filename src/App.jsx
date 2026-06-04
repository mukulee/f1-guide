import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header           from './components/layout/Header'
import Footer           from './components/layout/Footer'
import { ToastProvider } from './components/ui/Toast'
import DotGrid          from './components/ui/DotGrid'
import Home      from './pages/Home'
import Schedule  from './pages/Schedule'
import Standings from './pages/Standings'
import Learn     from './pages/Learn'
import Teams     from './pages/Teams'
import Community from './pages/Community'

// 页面过渡动效（淡入淡出 300ms）
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
        <Routes location={location}>
          <Route path="/"          element={<Home />} />
          <Route path="/schedule"  element={<Schedule />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/learn"     element={<Learn />} />
          <Route path="/teams"     element={<Teams />} />
          <Route path="/community" element={<Community />} />
        </Routes>
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
