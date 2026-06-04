// ── F1 GUIDE · DebateBlock ──────────────────────────
// 热门辩论投票块
// 数据来源：Supabase（debates / debate_options / votes 表）
// 功能：每道题只能投一次（数据库 unique + localStorage 双重防重复），实时同步票数

import { motion } from 'framer-motion'
import { useToast } from '../ui/Toast.jsx'
import useDebateVotes from '../../hooks/useDebateVotes.js'

// ── 单个投票选项按钮 ──────────────────────────────
function VoteOptionBtn({ opt, voted, isMyVote, onClick, disabled }) {
  const accentColor = opt.is_alt ? '#FF8700' : '#00D2BE'

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={isMyVote ? {
        boxShadow: [`0 0 0 0 ${accentColor}66`, `0 0 0 8px ${accentColor}00`],
      } : {}}
      transition={{ duration: 0.6 }}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%',
        background: isMyVote
          ? `rgba(${opt.is_alt ? '255,135,0' : '0,210,190'},0.07)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${
          isMyVote ? accentColor : voted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)'
        }`,
        borderRadius: 4,
        padding: '9px 12px',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.25s, background 0.25s',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = `rgba(${opt.is_alt ? '255,135,0' : '0,210,190'},0.35)`
          e.currentTarget.style.background = `rgba(${opt.is_alt ? '255,135,0' : '0,210,190'},0.04)`
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = isMyVote ? accentColor : 'rgba(255,255,255,0.08)'
          e.currentTarget.style.background = isMyVote
            ? `rgba(${opt.is_alt ? '255,135,0' : '0,210,190'},0.07)`
            : 'rgba(255,255,255,0.03)'
        }
      }}
    >
      {/* 进度填充背景 */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${opt.pct}%` }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          background: opt.is_alt
            ? 'rgba(255,135,0,0.09)'
            : 'rgba(0,210,190,0.09)',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
      />

      {/* 标签文字 */}
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13,
        color: '#E5E2E1', position: 'relative', zIndex: 1, flex: 1,
      }}>
        {opt.label}
      </span>

      {/* 百分比 */}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
        color: voted ? accentColor : '#9BA8A5',
        position: 'relative', zIndex: 1, minWidth: 36, textAlign: 'right',
        transition: 'color 0.3s',
      }}>
        {opt.pct}%
      </span>

      {/* 已投标记 */}
      {isMyVote && (
        <span style={{
          position: 'relative', zIndex: 1,
          color: accentColor, fontSize: 13, lineHeight: 1, marginLeft: 2,
        }}>✓</span>
      )}
    </motion.button>
  )
}

// ── 单个辩论卡片 ──────────────────────────────────
function DebateItem({ debate, onVote }) {
  const voted = debate.votedOptionId !== null

  return (
    <div style={{
      padding: '18px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* 题目行 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          color: '#FFFFFF', lineHeight: 1.5, flex: 1,
        }}>
          {debate.q}
        </div>
        {debate.hot && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: '#FF8700',
            background: 'rgba(255,135,0,0.1)',
            border: '1px solid rgba(255,135,0,0.25)',
            padding: '2px 7px', borderRadius: 2,
            flexShrink: 0, whiteSpace: 'nowrap',
            alignSelf: 'flex-start', marginTop: 2,
          }}>
            {debate.hot}
          </span>
        )}
      </div>

      {/* 投票选项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
        {debate.opts.map(opt => (
          <VoteOptionBtn
            key={opt.id}
            opt={opt}
            voted={voted}
            isMyVote={voted && opt.id === debate.votedOptionId}
            onClick={() => onVote(debate.id, opt.id, opt.label)}
            disabled={voted}
          />
        ))}
      </div>

      {/* 底部信息行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8A5',
        }}>
          {debate.total.toLocaleString()} 票
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9BA8A5',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px 8px', borderRadius: 2,
        }}>
          {debate.tag}
        </span>
        {voted && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: '#00D2BE', marginLeft: 'auto',
          }}>
            ✓ 已投票
          </span>
        )}
      </div>
    </div>
  )
}

// ── 骨架屏（加载中） ──────────────────────────────
function DebateSkeleton() {
  return (
    <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      {[1, 2].map(i => (
        <div key={i} style={{
          height: i === 1 ? 18 : 36,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 4,
          marginBottom: 10,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────
// nickname: 从 Community 页传入（用户已加入围场的昵称）
export default function DebateBlock({ nickname }) {
  const { debates, loading, error, vote } = useDebateVotes(nickname)
  const { toast } = useToast()

  async function handleVote(debateId, optionId, optionLabel) {
    const result = await vote(debateId, optionId)

    if (result.ok) {
      const short = optionLabel.length > 20 ? optionLabel.slice(0, 20) + '…' : optionLabel
      toast({ type: 'success', message: `已投票：${short}` })
      return
    }

    if (result.reason === 'no_nickname') {
      toast({ type: 'error', message: '请先输入昵称加入围场再投票' })
      return
    }

    if (result.reason === 'already_voted') {
      toast({ type: 'info', message: '你已经投过这道题了' })
      return
    }

    toast({ type: 'error', message: '投票失败，请稍后重试' })
  }

  return (
    <div
      data-no-dots
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* 头部 */}
      <div style={{
        padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          热门辩论
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00D2BE',
          background: 'rgba(0,210,190,0.1)', border: '1px solid rgba(0,210,190,0.2)',
          padding: '2px 8px', borderRadius: 2,
        }}>
          {loading ? '加载中…' : error ? '加载失败' : `${debates.length} 场进行中`}
        </span>
      </div>

      {/* 内容区 */}
      {loading ? (
        // 骨架屏
        <>
          <DebateSkeleton />
          <DebateSkeleton />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
        </>
      ) : error ? (
        // 错误提示
        <div style={{
          padding: '32px 20px', textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9BA8A5',
        }}>
          数据加载失败，请刷新重试
        </div>
      ) : (
        // 辩论列表
        <div>
          {debates.map((d, i) => (
            <div key={d.id} style={i === debates.length - 1 ? { borderBottom: 'none' } : {}}>
              <DebateItem debate={d} onVote={handleVote} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
