// ── F1 GUIDE · useDebateVotes ────────────────────────
// 热门辩论投票 Hook
// 功能：
//   1. 从 Supabase 拉取辩论题目 + 实时票数
//   2. 监听 votes 表变化，自动刷新（Realtime）
//   3. 提交投票（防重复：同一昵称同一题只能投一次）
//   4. 记录本地已投情况（localStorage，按昵称隔离）

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'

// 每个昵称独立存储已投记录，避免切换昵称后被旧记录误拦截
const LS_VOTED_PREFIX = 'f1guide_voted_'

// 从 localStorage 读取指定昵称的已投记录：{ debateId: optionId }
function loadLocalVoted(nickname) {
  if (!nickname?.trim()) return {}
  try {
    return JSON.parse(localStorage.getItem(LS_VOTED_PREFIX + nickname.trim()) || '{}')
  } catch {
    return {}
  }
}

// 保存指定昵称的已投记录到 localStorage
function saveLocalVoted(nickname, voted) {
  if (!nickname?.trim()) return
  try {
    localStorage.setItem(LS_VOTED_PREFIX + nickname.trim(), JSON.stringify(voted))
  } catch {}
}

export default function useDebateVotes(nickname) {
  const [debates, setDebates]   = useState([])   // 合并后的辩论数据
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const localVoted = useRef(loadLocalVoted(nickname))  // { debateId: optionId }，按昵称初始化
  const channelRef = useRef(null)

  // ── 昵称切换时，重新加载对应昵称的已投记录 ────────
  // 不重新请求 API，只更新本地 votedOptionId 状态
  useEffect(() => {
    localVoted.current = loadLocalVoted(nickname)
    setDebates(prev => prev.map(d => ({
      ...d,
      votedOptionId: localVoted.current[d.id] ?? null,
    })))
  }, [nickname])

  // ── 拉取辩论题目 + 票数 ───────────────────────────
  const fetchDebates = useCallback(async () => {
    try {
      // 1. 拉题目
      const { data: debateRows, error: e1 } = await supabase
        .from('debates')
        .select('id, question, tag, is_hot, sort_order')
        .eq('is_active', true)
        .order('sort_order')

      if (e1) throw e1

      // 2. 拉选项 + 票数（使用 vote_counts 视图）
      const { data: countRows, error: e2 } = await supabase
        .from('vote_counts')
        .select('debate_id, option_id, label, is_alt, sort_order, vote_count')

      if (e2) throw e2

      // 3. 合并成前端所需结构
      const voted = localVoted.current
      const merged = debateRows.map(d => {
        const opts = countRows
          .filter(r => r.debate_id === d.id)
          .sort((a, b) => a.sort_order - b.sort_order)

        // 计算百分比
        const total = opts.reduce((s, o) => s + Number(o.vote_count), 0)
        const optsWithPct = opts.map(o => ({
          id:      o.option_id,
          label:   o.label,
          is_alt:  o.is_alt,
          count:   Number(o.vote_count),
          pct:     total > 0 ? Math.round(Number(o.vote_count) / total * 100) : 0,
        }))

        return {
          id:       d.id,
          q:        d.question,
          tag:      d.tag,
          hot:      d.is_hot ? '🔥 本周最热' : null,
          total,
          opts:     optsWithPct,
          // 本地记录的已投选项 ID
          votedOptionId: voted[d.id] ?? null,
        }
      })

      setDebates(merged)
      setError(null)
    } catch (err) {
      console.error('[useDebateVotes] 拉取失败:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── 订阅 Realtime（votes 表变化） ─────────────────
  useEffect(() => {
    fetchDebates()

    // 订阅 votes 表的 INSERT 事件，有新投票时刷新
    channelRef.current = supabase
      .channel('debate-votes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => { fetchDebates() }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchDebates])

  // ── 提交投票 ─────────────────────────────────────
  const vote = useCallback(async (debateId, optionId) => {
    if (!nickname?.trim()) {
      return { ok: false, reason: 'no_nickname' }  // 未登录
    }

    // 本地已投检查（避免重复请求）
    if (localVoted.current[debateId] !== undefined) {
      return { ok: false, reason: 'already_voted' }
    }

    const { error: insertError } = await supabase
      .from('votes')
      .insert({ debate_id: debateId, option_id: optionId, nickname: nickname.trim() })

    if (insertError) {
      // code 23505 = unique violation（数据库层防重复）
      if (insertError.code === '23505') {
        return { ok: false, reason: 'already_voted' }
      }
      console.error('[useDebateVotes] 投票失败:', insertError)
      return { ok: false, reason: 'error', detail: insertError }
    }

    // 记录到 localStorage（按昵称隔离存储）
    localVoted.current = { ...localVoted.current, [debateId]: optionId }
    saveLocalVoted(nickname, localVoted.current)

    // 乐观更新本地状态（Realtime 也会触发刷新，但乐观更新更快）
    setDebates(prev => prev.map(d => {
      if (d.id !== debateId) return d
      const newTotal = d.total + 1
      const opts = d.opts.map(o => {
        const newCount = o.id === optionId ? o.count + 1 : o.count
        return { ...o, count: newCount, pct: Math.round(newCount / newTotal * 100) }
      })
      return { ...d, total: newTotal, opts, votedOptionId: optionId }
    }))

    return { ok: true }
  }, [nickname])

  return { debates, loading, error, vote, refetch: fetchDebates }
}
