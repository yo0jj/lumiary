# 여보세요 MVP — Claude Code 작업 지침

## 프로젝트 개요

**"쓰는 일기가 아니라 받는 일기."** 매일 정해진 시간 AI가 안부 전화를 걸어 3분 인터뷰 후 데일리 카드를 생성하는 앱.

- PRD: `PRD_v2.0.md` (전체 스펙의 단일 소스)
- GitHub: `https://github.com/yo0jj/lumiary`
- MVP 목적: 완성 제품이 아닌 **가설 검증 도구** (H1 습관·H2 깊이)

---

## 기술 스택

| 레이어 | 기술 |
| --- | --- |
| Frontend | Next.js 14 (PWA) + Tailwind + shadcn/ui |
| Backend | FastAPI (Python) + WebSocket |
| DB/Auth | Supabase (PostgreSQL + RLS) |
| LLM | Gemini 3.1 Flash Lite → fallback GPT-4o mini |
| STT | Gemini 3 Flash (Option A 기본) |
| TTS | Google Chirp 3 (Option A 기본) |
| Voice | WebSocket + Web Audio API |
| Scheduler | APScheduler |
| Session | Redis (Upstash) |
| Push | Firebase Cloud Messaging |
| Deploy | Vercel (FE) / Railway (BE) |

---

## 디렉토리 구조

```
lumiary/
├── frontend/                  # Next.js 14 PWA
│   ├── app/                   # App Router
│   │   ├── (auth)/            # 온보딩 라우트
│   │   ├── (main)/            # 홈·기록·마이 탭
│   │   └── overlay/           # 수신 오버레이 (풀스크린)
│   ├── components/
│   │   ├── ui/                # shadcn/ui 기반 공통
│   │   ├── call/              # 통화 관련 컴포넌트
│   │   └── cards/             # 데일리 카드
│   └── lib/
│       ├── api.ts             # REST 클라이언트
│       ├── websocket.ts       # WS 클라이언트
│       └── audio.ts           # Web Audio API
│
├── backend/
│   └── app/
│       ├── api/               # FastAPI 라우터
│       ├── core/              # 설정·DB·Redis
│       ├── models/            # Pydantic 스키마
│       ├── services/          # 비즈니스 로직
│       └── voice/             # VoiceEngine 추상화
│           ├── base.py        # 인터페이스
│           ├── pipeline.py    # Option A: STT→LLM→TTS
│           └── gemini_live.py # Option B: Gemini Live
│
├── .env.example
├── .gitignore
├── CLAUDE.md                  # 이 파일
└── PRD_v0.2.md
```

---

## 개발 단계 계획 (PRD 부록 A 기반)

### Phase 0 — 환경 세팅 (D1 전반)

**0-1. Supabase 스키마 적용** (`backend/migrations/001_schema.sql`)
- `users`: id, nickname, call_time, timezone, voice_tone, push_token
- `conversations`: transcript(jsonb), summary, emotion, keywords, action_item, rating
- `action_items`: content, status(pending/done/rescaled), conversation_id
- `call_schedules`: scheduled_at, status(pending/triggered/snoozed/cancelled)
- 모든 테이블 RLS 활성화

**0-2. Firebase FCM 설정**
- Firebase 프로젝트 생성 → Service Account JSON 다운로드
- `.env`에 `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` 추가

**0-3. `.env` 완성**
```
SUPABASE_URL=, SUPABASE_SERVICE_ROLE_KEY=, GEMINI_API_KEY=
REDIS_URL=          # Upstash Redis URL
FIREBASE_PROJECT_ID=, FIREBASE_PRIVATE_KEY=, FIREBASE_CLIENT_EMAIL=
CORS_ORIGINS=http://localhost:3000
```

**0-4. requirements.txt 업데이트**
추가: `google-generativeai`, `firebase-admin`, `redis`, `apscheduler`, `websockets`, `alembic`

**0-5. Gemini 샘플 테스트** (`backend/tests/smoke_gemini.py`) — 한국어 텍스트 생성 확인

---

### Phase 1 — 기반 구축 (D1 후반~D2)

**1-1. Backend API 골격 추가**
- `backend/app/api/conversations.py`: `GET /conversations`, `GET /conversations/{id}`, `PATCH /conversations/{id}`
- `backend/app/api/action_items.py`: `GET /action-items/pending`, `PATCH /action-items/{id}`
- `backend/app/api/schedule.py`: `POST /schedule/snooze`
- `backend/app/models/{conversation,action_item}.py`: Pydantic 스키마
- `backend/app/services/conversation_service.py`: list/get/patch 로직

**1-2. Frontend Next.js 14 초기화**
```bash
cd frontend
npx create-next-app@14 . --typescript --tailwind --app
npx shadcn-ui@latest init
```
- `tailwind.config.ts`: 디자인 토큰 (primary `#2D4A3E`, bg `#F8F5F0`, accent `#F2C94C`, Pretendard)
- `next.config.js`: PWA 설정 (`next-pwa`)
- `lib/api.ts`: `fetchWithAuth()` — Supabase JWT Bearer 주입 헬퍼

**1-3. 온보딩 UI S-02~S-05** (`app/(auth)/onboarding/page.tsx`)

| 스텝 | 화면 | 핵심 요소 |
|------|------|----------|
| 1 | S-02 | 이름 입력 |
| 2 | S-03 | 목소리 선택 (warm/bright/calm, 미리듣기) |
| 3 | S-04 | 전화 시간 선택 (TimeWheel) |
| 4 | S-05 | 0-day 미니 통화 안내 |

완료 → `POST /auth/onboard` 호출 → `/(main)/home` 리다이렉트

**1-4. Auth 플로우**
- `app/(auth)/login/page.tsx`: Supabase Auth UI (이메일/비밀번호)
- `app/(auth)/layout.tsx`: 미인증 시 `/login` 리다이렉트
- `app/(main)/layout.tsx`: 온보딩 미완료 시 `/onboarding` 리다이렉트

---

### Phase 2 — 음성 엔진 (D3)

**2-1. VoiceEngine 추상화** (`backend/app/voice/base.py`)
```python
class VoiceEngine(ABC):
    async def transcribe(self, audio_bytes: bytes) -> str   # STT
    async def generate_response(self, transcript: str, context: dict) -> str  # LLM
    async def synthesize(self, text: str) -> bytes          # TTS
```

**2-2. Option A 파이프라인** (`backend/app/voice/pipeline.py`)
- **STT**: `google-generativeai` SDK, `gemini-1.5-flash` — 오디오 bytes inline 전송, 한국어 전사
- **LLM**: `gemini-1.5-flash-lite` — 대화 이력 포함 chat 세션 (시스템 프롬프트는 Phase 3에서 교체)
- **TTS**: `google.cloud.texttospeech` Chirp 3, `ko-KR`, MP3 반환

**2-3. FastAPI WebSocket 서버** (`backend/app/api/voice.py`)

엔드포인트: `WS /ws/conversation/{session_id}`

메시지 프로토콜:
```
Client→Server: { type: "audio_chunk", data: base64, is_final: bool } | { type: "end" }
Server→Client: { type: "transcript", role: "user"|"ai", text } | { type: "audio", data: base64 }
               { type: "call_end", summary } | { type: "error", code }
```

루프: 오디오 수신 → STT → LLM → TTS → 자막+오디오 응답 전송

**2-4. Frontend Audio/WS 클라이언트**

`lib/audio.ts`:
- `AudioRecorder`: `getUserMedia` + AudioWorklet, 250ms 청크 콜백
- `AudioPlayer`: Web Audio API TTS 재생

`lib/websocket.ts`:
- `VoiceWebSocket`: connect/sendAudioChunk/onTranscript/onAudio/onCallEnd

**완료 기준**: 마이크 → WS → STT → LLM → TTS → 스피커 end-to-end 동작, 지연 < 3초

---

### Phase 3 — 대화 흐름 (D4)

**3-1. 4블록 프레임 시스템 프롬프트** (`backend/app/voice/prompts.py`)
- 블록: ①감정 체크 → ②핵심 장면 → ③숨은 의미 → ④작은 실천
- 7개 렌즈 일별 회전: 감사/관계/도전/신체/성취/욕구/휴식
- 규칙: 질문 1개씩, 진단 금지, 3~5분 목표

**3-2. Redis 세션 관리** (`backend/app/core/redis.py`)
```json
{ "user_id", "conversation_id", "block": 1~4, "lens", "transcript": [], "pending_action_item" }
```
TTL 3600초, `get_session()`/`set_session()` 헬퍼

**3-3. POST /conversations/start**
- Supabase에 conversations row 생성
- `get_opening_message()`: pending action_item 있으면 "어제 '{내용}' 어떻게 됐어요?", 없으면 "오늘 하루는 어땠나요?"
- Redis에 세션 초기화 후 `{ session_id, opening_message }` 반환

**3-4. WS 서버에서 Redis context 사용**
- 연결 시 세션 로드, 블록 전환 자동 처리, 종료 시 transcript 저장

---

### Phase 4 — 핵심 UX (D5)

**4-1. 수신 오버레이 S-07/S-08** (`app/overlay/page.tsx`)
- 풀스크린, AI 아바타 + 파동 애니메이션
- "받기" → S-08 (3분/5분/지금은 패스 선택) → 통화 시작
- "나중에" → `POST /schedule/snooze` → 오버레이 닫기
- FCM `onMessage()` 리스너에서 자동 표시

**4-2. 통화 중 화면 S-09** (`app/(main)/call/page.tsx`)
- 경과 시간 타이머
- `Waveform.tsx`: Web Audio AnalyserNode 기반 파형 애니메이션
- `Subtitle.tsx`: 자막 토글, 최근 2줄 표시
- `onTranscript` → 자막 업데이트, `onCallEnd` → S-10으로 이동

**4-3. 데일리 카드 S-10** (`app/(main)/card/[id]/page.tsx`)

백엔드: WS 종료 시 Gemini로 자동 요약 → `conversations.{summary, emotion, keywords, action_item}` 업데이트

카드 UI (`components/cards/DailyCard.tsx`):
- 날짜 + 렌즈 태그, 감정 이모지 + 요약, 키워드 칩 3개
- 별점(1~5) + 느낌 태그 (좋았어요/위로됐어요/별로였어요)
- 실천 아이템 체크박스
- 저장 → `PATCH /conversations/{id}`

**4-4. FCM 카드 완료 알림** (`backend/app/services/notification_service.py`)
- `send_card_ready(push_token, card_id)`: firebase-admin SDK로 발송

**4-5. APScheduler 매일 전화 트리거** (`backend/app/scheduler.py`)
- 1분 간격으로 `call_schedules` 폴링
- scheduled_at ≤ now AND status='pending' → FCM 푸시 → status='triggered' → 다음 날 row 생성
- `main.py` startup 이벤트에서 `scheduler.start()`

---

### Phase 5 — 보조 화면 (D6)

**5-1. 기록 탭 S-11** (`app/(main)/history/page.tsx`)
- `GET /conversations?limit=20&offset=0` → 월별 그룹화 리스트
- 필터: 전체/감정별/키워드별
- 카드 클릭 → S-10 상세

**5-2. 마이 탭 S-12** (`app/(main)/my/page.tsx`)
- 프로필 (닉네임, 가입일)
- 통계: 총 대화 수, 연속 일수, 평균 별점, 실천 완료율 (`GET /users/me` stats)

**5-3. 설정 화면 S-13~S-15**
- `/settings/time`: 전화 시간 변경
- `/settings/voice`: 목소리 변경 (미리듣기 포함)
- `/settings/nickname`: 호칭 변경
- 모두 `PATCH /users/me` 호출

**5-4. 홈 탭 S-06** (`app/(main)/home/page.tsx`)
- 오늘의 상태 카드 (전화 예정 시간)
- 최근 데일리 카드 미리보기
- 하단 탭바 (홈/기록/마이)

**5-5. 실천 아이템 완료 체크**
- S-10 카드 체크박스 → `PATCH /action-items/{id}` with `{ status: "done" }`

---

### Phase 6 — 마무리 (D7)

**6-1. 버그 수정 + 반응형**
- iOS Safari WebSocket (`wss://` 강제)
- Android PWA 마이크 권한 게이트 (`components/PermissionGate.tsx`)
- 세로 고정 레이아웃 (390px 기준)

**6-2. 안전 가드레일** (`backend/app/voice/safety.py`)
- `detect_crisis(text)`: 자해/자살 키워드 감지
- WS 서버에서 매 STT 결과마다 체크 → 감지 시 공감 메시지 + 전문 리소스 안내 후 대화 종료

**6-3. 배포**
- Backend(Railway): `Procfile` → `uvicorn main:app --host 0.0.0.0 --port $PORT`, 환경변수 등록
- Frontend(Vercel): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` 환경변수 등록

**6-4. End-to-End 검증**
- [ ] 실제 기기에서 FCM 알림 수신
- [ ] 알림 → 오버레이 → 통화 → 카드 전체 흐름 1회 완주
- [ ] 다음 날 전화 첫마디에서 어제 실천 아이템 언급 확인
- [ ] APScheduler 정확도 (±2분 이내)
- [ ] 3회 연속 통화 크래시 없음

---

## Git 커밋 자동화 규칙

### 커밋 타이밍
각 Phase 완료 시, 또는 의미 있는 기능 단위가 동작할 때마다 커밋. 작업 중간 저장은 빠르게, 배포 전에는 반드시 커밋.

### 커밋 메시지 형식
```
<type>(<scope>): <한국어 요약>

- 세부 변경사항 1
- 세부 변경사항 2
```

**type**: `feat` | `fix` | `refactor` | `chore` | `docs`
**scope**: `frontend` | `backend` | `voice` | `db` | `infra` | `auth`

예시:
```
feat(backend): Supabase 스키마 + FastAPI 초기 구조
feat(frontend): 온보딩 S-02~S-05 구현
feat(voice): VoiceEngine Option A (STT→LLM→TTS) 구현
feat(frontend): 수신 오버레이 + 통화 중 화면
fix(backend): WebSocket 재연결 로직 수정
```

### GitHub 푸시 절차
```bash
# 커밋 후 항상 main 브랜치에 푸시
git push origin main

# 새 기능 브랜치 작업 시
git checkout -b feat/voice-engine
# ... 작업 ...
git push origin feat/voice-engine
# GitHub에서 PR 생성 → main 머지
```

### Claude Code 작업 완료 시 체크리스트
1. `git status`로 변경 파일 확인
2. 관련 파일만 `git add` (`.env`, 시크릿 제외 필수)
3. 위 형식으로 커밋
4. `git push origin main` (또는 현재 브랜치)

---

## 주요 디자인 결정사항

- **음성 스택**: Option A(STT→LLM→TTS) 기본 착수, VoiceEngine 추상화로 Option B 전환 가능하게 유지
- **Auth**: 이메일 우선 (전화번호 제거 확정, 소셜은 §14-B5 결정 후)
- **실전 루프**: "제안+카드" (Should)까지 MVP 포함, "다음날 첫마디 확인"은 Could
- **배포**: 프로토 단계는 로컬 실행, 베타 전 Vercel+Railway 배포

## 컬러/디자인 토큰

- Primary: `#2D4A3E` | Background: `#F8F5F0` | Accent: `#F2C94C`
- 폰트: Pretendard | Border radius 카드 16 / 버튼 12 / Pill 20
