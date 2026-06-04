// ── F1 GUIDE · Community 社区页 ─────────────────────
// 参考：stitch-pages/06-community.html
// 功能：双栏布局 / 加入围场 / 热门辩论投票（Supabase 实时）/ 倒计时 / 话题 / 排行

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../components/ui/Toast.jsx'
import CommunityIntro from '../components/community/CommunityIntro.jsx'
import DebateBlock from '../components/community/DebateBlock.jsx'
import FlashBlock from '../components/community/FlashBlock.jsx'
import CountdownWidget from '../components/community/CountdownWidget.jsx'

// ── 热门话题数据 ──────────────────────────────────
const TOPICS = [
  { name: '摩纳哥大奖赛 2026', count: '12.4k 讨论' },
  { name: '维斯塔潘 P1',    count: '9.1k 讨论' },
  { name: '迈凯伦双雄',     count: '7.8k 讨论' },
  { name: '汉密尔顿法拉利首胜', count: '6.5k 讨论' },
  { name: '2026 技术规则', count: '4.2k 讨论' },
  { name: '角田裕毅 RB',   count: '3.7k 讨论' },
]

// ── 每周排行数据 ──────────────────────────────────
const LEADERBOARD = [
  { rank: 1, name: '弯道女王_Apex', team: '迈凯伦', pts: 4820, color: '#FF8700', delta: '+240', initials: '弯' },
  { rank: 2, name: '赛道猎手777',   team: '法拉利', pts: 4315, color: '#DC0000', delta: '+185', initials: '猎' },
  { rank: 3, name: '银石战神Sil',   team: '梅赛德斯', pts: 3990, color: '#00D2BE', delta: '+162', initials: '银' },
  { rank: 4, name: 'DRS哲学家',     team: '红牛',   pts: 3674, color: '#3671C6', delta: '+98',  initials: 'D' },
  { rank: 5, name: '尾翼研究所',    team: '阿斯顿', pts: 3211, color: '#006F62', delta: '+77',  initials: '尾' },
  { rank: 6, name: 'F1解说团',      team: 'Alpine', pts: 2867, color: '#0090FF', delta: '+55',  initials: 'F' },
  { rank: 7, name: '轮胎温度计',    team: '威廉姆斯', pts: 2499, color: '#005AFF', delta: '+44', initials: '轮' },
]

const RANK_COLORS = ['#00D2BE', '#FF8700', '#DC0000']

// ── localStorage Key ──────────────────────────────
const LS_NICKNAME_KEY = 'f1guide_nickname'

// ── 加入围场表单 ──────────────────────────────────
// onNicknameChange：昵称确认后通知父组件，用于传给 DebateBlock
function JoinForm({ onNicknameChange }) {
  const [value, setValue] = useState('')
  const [joined, setJoined] = useState(false)
  const [error, setError]  = useState(false)
  const { toast } = useToast()

  // 页面初始化时从 localStorage 恢复已登录昵称
  useEffect(() => {
    const saved = localStorage.getItem(LS_NICKNAME_KEY)
    if (saved) {
      setValue(saved)
      setJoined(true)
      onNicknameChange?.(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleJoin() {
    const name = value.trim()
    if (!name) {
      setError(true)
      return
    }
    setError(false)
    setJoined(true)
    localStorage.setItem(LS_NICKNAME_KEY, name)
    onNicknameChange?.(name)
    toast({ type: 'success', message: `欢迎，${name}！你已成功加入围场俱乐部 🏁` })
  }

  function handleLeave() {
    setJoined(false)
    setValue('')
    localStorage.removeItem(LS_NICKNAME_KEY)
    onNicknameChange?.('')
  }

  return (
    <div>
      {!joined ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="输入你的赛车代号…"
            maxLength={20}
            value={value}
            onChange={e => { setValue(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{
              flex: '1', minWidth: 220, maxWidth: 320,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${error ? '#DC0000' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, padding: '10px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 13, color: '#E5E2E1',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#00D2BE'}
            onBlur={e => e.target.style.borderColor = error ? '#DC0000' : 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleJoin}
            style={{
              background: '#00D2BE', color: '#0D0D0D', border: 'none', cursor: 'pointer',
              borderRadius: 2, padding: '10px 22px',
              fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              transition: 'background 0.2s, transform 0.1s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00B8A8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#00D2BE'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            加入围场
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            background: 'rgba(0,210,190,0.08)', border: '1px solid rgba(0,210,190,0.25)',
            borderRadius: 4, marginBottom: 12,
            fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00D2BE',
          }}
        >
          <span>✓</span>
          <span>已加入围场俱乐部</span>
          {/* 退出按钮 */}
          <button
            onClick={handleLeave}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: 12,
              padding: '0 0 0 4px', fontFamily: 'var(--font-mono)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#DC0000'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            title="退出围场"
          >
            退出
          </button>
        </motion.div>
      )}

      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
      }}>
        {joined
          ? <>欢迎，<strong style={{ color: '#00D2BE' }}>{value.trim()}</strong>！</>
          : <>已有 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>12,847</strong> 名车迷在此集结</>
        }
      </div>
    </div>
  )
}

// ── 热门话题侧栏 ──────────────────────────────────
function TopicList() {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>热门话题</span>
      </div>
      <div style={{ padding: '8px 12px 12px' }}>
        {TOPICS.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 8px', borderRadius: 4,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
              color: '#00D2BE', minWidth: 16,
            }}>
              {i + 1}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E5E2E1', flex: 1 }}>
              {t.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8A5' }}>
              {t.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 每周排行侧栏 ──────────────────────────────────
function RankList() {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>每周排行</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00D2BE',
          background: 'rgba(0,210,190,0.1)', border: '1px solid rgba(0,210,190,0.2)',
          padding: '2px 8px', borderRadius: 2,
        }}>积分榜</span>
      </div>
      <div>
        {LEADERBOARD.map((u, i) => (
          <div
            key={u.rank}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px',
              borderBottom: i === LEADERBOARD.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* 排名数字 */}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              width: 18, textAlign: 'center',
              color: u.rank <= 3 ? RANK_COLORS[u.rank - 1] : '#9BA8A5',
            }}>
              {u.rank}
            </span>

            {/* 头像圆 */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: u.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 700, color: '#0D0D0D',
              flexShrink: 0,
            }}>
              {u.initials}
            </div>

            {/* 用户信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#FFFFFF',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {u.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8A5' }}>
                {u.team}
              </div>
            </div>

            {/* 积分 + 增量 */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#00D2BE' }}>
                {u.pts.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8A5' }}>
                {u.delta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────
export default function Community() {
  const [introDone,  setIntroDone]  = useState(false)
  const [nickname,   setNickname]   = useState('')   // 当前用户昵称，传给 DebateBlock

  return (
    <>
      {/* 全屏开场动效 */}
      {!introDone && <CommunityIntro onDone={() => setIntroDone(true)} />}

      {/* 主体内容 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ minHeight: '100vh', paddingTop: 60 }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '56px 32px 80px',
        }}>

          {/* ── Hero 区 ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 20 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ marginBottom: 48 }}
          >
            {/* 眉标 */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.22em', color: '#00D2BE', opacity: 0.7,
              marginBottom: 14,
            }}>
              2026 赛季 · 围场俱乐部
            </div>

            {/* 大标题 */}
            <h1 style={{ margin: 0, marginBottom: 20 }}>
              <div style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 900, color: '#00D2BE',
                textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1,
              }}>
                围场俱乐部
              </div>
              <div style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 900, color: '#FFFFFF',
                textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1,
              }}>
                车迷地带
              </div>
            </h1>

            {/* 简介 */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15,
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
              maxWidth: 560, marginBottom: 28, marginTop: 0,
            }}>
              加入 F1 GUIDE 社区，与全球车迷同步赛场脉搏。实时追踪赛况、参与辩论投票，在每一圈速度中找到你的位置。
            </p>

            {/* 加入表单 */}
            <JoinForm onNicknameChange={setNickname} />
          </motion.section>

          {/* ── 双栏内容区 ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 24 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="community-content-grid"
          >
            {/* 左侧主栏 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FlashBlock />
              <DebateBlock nickname={nickname} />
            </div>

            {/* 右侧边栏 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CountdownWidget />
              <TopicList />
              <RankList />
            </div>
          </motion.div>

          {/* 响应式样式注入 */}
          <style>{`
            .community-content-grid {
              display: grid;
              grid-template-columns: minmax(0, 1fr) 380px;
              gap: 24px;
              align-items: start;
            }
            @media (max-width: 860px) {
              .community-content-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

        </div>
      </motion.div>
    </>
  )
}
