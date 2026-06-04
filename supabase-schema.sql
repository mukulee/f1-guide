-- ─────────────────────────────────────────────────────
-- F1 GUIDE · Supabase 数据库建表脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ─────────────────────────────────────────────────────

-- ── 1. 辩论题目表（debates）────────────────────────
-- 存储热门辩论的题目和选项，由管理员手动维护
create table if not exists debates (
  id          text primary key,          -- 题目 ID，如 'd1'
  question    text not null,             -- 题目文字
  tag         text,                      -- 标签，如 '车手评选'
  is_hot      boolean default false,     -- 是否本周最热
  is_active   boolean default true,      -- 是否显示
  sort_order  int default 0,             -- 显示排序
  created_at  timestamptz default now()
);

-- ── 2. 选项表（debate_options）─────────────────────
create table if not exists debate_options (
  id          serial primary key,
  debate_id   text references debates(id) on delete cascade,
  label       text not null,             -- 选项文字
  is_alt      boolean default false,     -- 橙色选项（第二观点）
  sort_order  int default 0              -- 显示顺序
);

-- ── 3. 投票记录表（votes）──────────────────────────
-- 核心约束：同一 nickname 对同一道题只能投一次
create table if not exists votes (
  id          bigserial primary key,
  debate_id   text references debates(id) on delete cascade,
  option_id   int  references debate_options(id) on delete cascade,
  nickname    text not null,             -- 用户昵称（localStorage 存储）
  created_at  timestamptz default now(),
  -- 防重复：同一用户同一题只能投一次
  unique (debate_id, nickname)
);

-- ── 4. Row Level Security（RLS）────────────────────
-- debates：所有人可读，不允许客户端写
alter table debates enable row level security;
create policy "debates_read" on debates for select using (true);

-- debate_options：所有人可读
alter table debate_options enable row level security;
create policy "options_read" on debate_options for select using (true);

-- votes：所有人可读，可以 insert（anon 用户），不允许 update/delete
alter table votes enable row level security;
create policy "votes_read"   on votes for select using (true);
create policy "votes_insert" on votes for insert with check (true);

-- ── 5. 投票统计视图（vote_counts）──────────────────
-- 方便前端一次性查询每个选项的票数
create or replace view vote_counts as
  select
    o.debate_id,
    o.id        as option_id,
    o.label,
    o.is_alt,
    o.sort_order,
    count(v.id) as vote_count
  from debate_options o
  left join votes v on v.option_id = o.id
  group by o.debate_id, o.id, o.label, o.is_alt, o.sort_order;

-- ── 6. 初始数据：4 道辩论题 ────────────────────────
insert into debates (id, question, tag, is_hot, sort_order) values
  ('d1', '2026 赛季进行中，谁才是真正的年度最佳车手？',   '车手评选', true,  1),
  ('d2', '迈凯伦能否在 2026 新规则下卫冕车队冠军？',      '车队预测', false, 2),
  ('d3', '角田裕毅在红牛赛车上会比维斯塔潘更快吗？',      '假设辩论', false, 3),
  ('d4', '你认为 2026 年奥迪/Sauber 的目标应该是什么？',  '未来展望', false, 4)
on conflict (id) do nothing;

insert into debate_options (debate_id, label, is_alt, sort_order) values
  ('d1', '维斯塔潘 — 以更差的战车拿更多分，绝对统治力',        false, 1),
  ('d1', '诺里斯 — 稳定性与速度的完美结合，迈凯伦核心',        false, 2),
  ('d1', '勒克莱尔 — 汉密尔顿来了他反而更稳了',                true,  3),
  ('d2', '能！MCL39 赛道适应性极强，积分优势会越来越大',        false, 1),
  ('d2', '不能。法拉利和梅赛德斯下半赛季升级包很恐怖',          true,  2),
  ('d3', '不可能，维斯塔潘的绝对速度是另一个维度',              false, 1),
  ('d3', '至少能接近，RB21 遮住了角田真实的竞争力',             true,  2),
  ('d4', '第一年就进入积分 — 有奥迪工厂背书必须有样子',         false, 1),
  ('d4', '稳步发展，两年后再冲中游就行了',                      true,  2)
on conflict do nothing;
