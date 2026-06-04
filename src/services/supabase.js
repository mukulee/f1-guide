// ── F1 GUIDE · Supabase 客户端配置 ──────────────────
// 使用 anon public key（客户端安全，受 RLS 限制）

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] 环境变量未配置，请在 .env.local 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  SUPABASE_URL      || '',
  SUPABASE_ANON_KEY || '',
)
