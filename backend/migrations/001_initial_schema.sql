-- ============================================================
-- 여보세요 MVP — 초기 스키마
-- Supabase SQL Editor에서 순서대로 실행
-- ============================================================

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  nickname    TEXT NOT NULL,
  call_time   TIME NOT NULL DEFAULT '22:00',
  timezone    TEXT NOT NULL DEFAULT 'Asia/Seoul',
  voice_tone  TEXT NOT NULL DEFAULT 'calm' CHECK (voice_tone IN ('calm','bright','plain')),
  push_token  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  called_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_sec      INTEGER,
  call_length       TEXT CHECK (call_length IN ('1min','3min','7min')),
  status            TEXT NOT NULL DEFAULT 'in_progress'
                      CHECK (status IN ('in_progress','completed','missed','dropped')),
  input_mode        TEXT NOT NULL DEFAULT 'voice'
                      CHECK (input_mode IN ('voice','text','mixed')),
  transcript        JSONB,
  summary           TEXT,
  keywords          TEXT[],
  emotion           TEXT,
  emotion_intensity INTEGER CHECK (emotion_intensity BETWEEN 1 AND 5),
  key_scene         TEXT,
  hidden_desire     TEXT,
  ai_comment        TEXT,
  rating            INTEGER CHECK (rating BETWEEN 1 AND 5),
  rating_tags       TEXT[],
  rating_comment    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. action_items
CREATE TABLE IF NOT EXISTS public.action_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  scheduled_for     DATE,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','done','rescaled','skipped')),
  rescaled_content  TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. call_schedules
CREATE TABLE IF NOT EXISTS public.call_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','snoozed','expired')),
  snoozed_until   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_conversations_user_id    ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_called_at  ON public.conversations(called_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id     ON public.action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status      ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_call_schedules_user_sched ON public.call_schedules(user_id, scheduled_at);

-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_schedules ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users: 본인만 조회"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: 본인만 수정"   ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users: 온보딩 시 삽입" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- conversations
CREATE POLICY "conversations: 본인만 조회" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conversations: 본인만 삽입" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversations: 본인만 수정" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);

-- action_items
CREATE POLICY "action_items: 본인만 조회" ON public.action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "action_items: 본인만 삽입" ON public.action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "action_items: 본인만 수정" ON public.action_items FOR UPDATE USING (auth.uid() = user_id);

-- call_schedules
CREATE POLICY "call_schedules: 본인만 조회" ON public.call_schedules FOR SELECT USING (auth.uid() = user_id);
