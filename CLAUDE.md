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

### Phase 0 — 환경 세팅 (D1)
- [ ] Supabase 프로젝트 생성 + 스키마 적용 (`users`, `conversations`, `action_items`, `call_schedules`)
- [ ] Firebase 프로젝트 생성 + FCM 설정
- [ ] `.env` 파일 구성 (`.env.example` 기반)
- [ ] Gemini API 키 연결 + 음성 모델 샘플 테스트

### Phase 1 — 기반 구축 (D1~D2)
- [ ] Backend: FastAPI 프로젝트 초기화 + Supabase 연결 + API 골격
- [ ] Frontend: Next.js 14 PWA 초기화 + Tailwind + shadcn/ui
- [ ] Auth: Supabase Auth (소셜/이메일 — §14-B5 결정 전 이메일 우선)
- [ ] 온보딩 UI S-02~S-05 구현
- [ ] `POST /auth/onboard` API

### Phase 2 — 음성 엔진 (D3)
- [ ] FastAPI WebSocket 서버 (`/ws/conversation/{session_id}`)
- [ ] VoiceEngine 인터페이스 (`backend/app/voice/base.py`)
- [ ] Option A 구현: STT(Gemini 3 Flash) → LLM(Gemini 3.1 Flash Lite) → TTS(Google Chirp 3)
- [ ] Frontend: Web Audio API 마이크 캡처 + WS 연결 + TTS 재생

### Phase 3 — 대화 흐름 (D4)
- [ ] 4블록 대화 프레임 시스템 프롬프트 구현 (§11)
- [ ] Redis(Upstash) 세션 상태 관리
- [ ] 실천 루프 첫마디 로직 (pending_action_item 참조)
- [ ] `POST /conversations/start` + 세션 연결

### Phase 4 — 핵심 UX (D5)
- [ ] 수신 오버레이 S-07/S-08 (풀스크린 + 길이 선택)
- [ ] 통화 중 화면 S-09 (파형 애니메이션 + 자막 토글)
- [ ] 데일리 카드 S-10 (요약 생성 + 별점/칩 평가)
- [ ] FCM 푸시 발송 (카드 완료 알림)
- [ ] APScheduler 매일 전화 트리거

### Phase 5 — 보조 화면 (D6)
- [ ] 기록 탭 S-11 (리스트 + 필터)
- [ ] 마이 탭 S-12 (프로필 + 통계)
- [ ] 설정 S-13~S-15 (시간·목소리·호칭 변경)
- [ ] 실천 아이템 완료 체크

### Phase 6 — 마무리 (D7)
- [ ] 버그 수정 + 모바일 반응형
- [ ] APScheduler 스케줄 end-to-end 테스트
- [ ] Vercel(FE) + Railway(BE) 배포
- [ ] 실제 폰: 알림 → 대화 → 카드 흐름 검증

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
