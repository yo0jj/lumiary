# Lumiary — 상세 PRD (와이어프레임 · 프로토타입용)

**버전**: 1.1  
**작성일**: 2026-06-07  
**대상 독자**: 디자이너, 개발자  
**목표**: 이 문서만으로 와이어프레임 → 프로토타입 → 개발 스펙까지 커버

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [디자인 원칙 & 언어](#2-디자인-원칙--언어)
3. [정보 구조 (IA)](#3-정보-구조-ia)
4. [화면별 상세 스펙](#4-화면별-상세-스펙)
5. [인터랙션 & 상태 정의](#5-인터랙션--상태-정의)
6. [데이터 모델](#6-데이터-모델)
7. [API 명세](#7-api-명세)
8. [AI 대화 시스템 스펙](#8-ai-대화-시스템-스펙)
9. [기술 스택 & 아키텍처](#9-기술-스택--아키텍처)
10. [에러 & 엣지 케이스](#10-에러--엣지-케이스)

---

## 1. 제품 개요

### 핵심 컨셉
> 쓰는 일기가 아니라 *받는* 일기. 매일 정해진 시간 AI가 안부 전화를 걸어, 수다 떨듯 3분 만에 오늘의 나를 인터뷰하고, 끝에는 내일의 작은 실천 하나까지 정해준다.

### 3대 장벽 해결 방식

| 기존 일기 앱의 장벽 | Lumiary의 해결 |
|---|---|
| ① 앱을 *내가* 열어야 함 | AI가 먼저 전화를 건다 (Push, not Pull) |
| ② 빈 화면에 *뭘 쓸지* 정해야 함 | 4블록 질문 프레임이 대화를 이끈다 |
| ③ *꾸준히* 해야 함 | 실천 루프로 기록이 삶에 개입한다 |

### 핵심 플로우

```
[온보딩 — 최초 1회]
가입 → 호칭·시간·목소리 설정 → 0일차 미니 통화

[매일 반복]
설정 시간 → 앱 푸시 알림 → 풀스크린 수신 오버레이
→ 받기(길이 선택) / 나중에
→ 앱 내 음성 대화 (4블록 프레임, 3~10분)
→ 통화 종료 → 데일리 카드 생성 → 푸시 알림
→ 사용자가 카드 확인 → 별점 평가

[다음 날 통화 첫마디]
"어제 {실천 과제} 해봤어요?" → 회고 → 새 실천 세팅
```

### 실천 루프 (핵심 차별점)
기록 → 실천 → 회고 → 기록의 닫힌 루프. 단순 "말 잘 들어주는 AI"가 아니라 삶에 개입하는 구조.

```
[통화 ④블록] 내일의 아주 작은 실험 1개 함께 정함
     ↓
[다음 날 통화] "어제 그거 해봤어요?" 첫마디로 확인
     ↓
성공 → 칭찬 + 기록     실패 → 더 작게 쪼개줌 (난이도 조정)
```

---

## 2. 디자인 원칙 & 언어

### 2-1. 핵심 디자인 원칙
1. **조용한 존재감**: 하루 끝에 옆에 있는 느낌. 화려함보다 포근함.
2. **수동적 참여**: 사용자가 뭔가를 해야 한다는 압박 없음 — 전화 받고 말하면 끝.
3. **빛의 은유**: 자기 인식이 쌓일수록 더 밝아지는 시각적 피드백.
4. **죄책감 없는 흔적**: 스트릭 깨져도 "쉬어가도 괜찮아요" — 경쟁이 아니라 자기 돌봄.

### 2-2. 컬러 팔레트

| 역할 | 색상 | 용도 |
|---|---|---|
| Primary | `#2D4A3E` (딥 그린) | 주요 버튼, 강조 |
| Primary Light | `#4A7C6F` | 보조 강조 |
| Background | `#F8F5F0` (따뜻한 오프화이트) | 전체 배경 |
| Surface | `#FFFFFF` | 카드, 모달 |
| Text Primary | `#1A1A1A` | 본문 |
| Text Secondary | `#6B6B6B` | 부제목, 메타 |
| Text Tertiary | `#ABABAB` | 플레이스홀더, 비활성 |
| Accent | `#F2C94C` (소프트 옐로우) | 별점, 하이라이트 키워드 |
| Error | `#E57373` | 오류 상태 |
| Success | `#66BB6A` | 완료 상태 |

> 전체 분위기: 따뜻하고 차분. 의료적이거나 테크적인 느낌 지양.

### 2-3. 타이포그래피

| 역할 | 폰트 | 크기 | 굵기 |
|---|---|---|---|
| Display | Pretendard | 28px | 700 |
| Heading 1 | Pretendard | 22px | 700 |
| Heading 2 | Pretendard | 18px | 600 |
| Body | Pretendard | 16px | 400 |
| Body Small | Pretendard | 14px | 400 |
| Caption | Pretendard | 12px | 400 |

### 2-4. 컴포넌트 공통 규칙
- **Border radius**: 카드 16px, 버튼 12px, 입력창 10px, Pill 태그 20px
- **Shadow**: 카드 `0 2px 12px rgba(0,0,0,0.08)`
- **Bottom padding**: Safe Area 최소 34px
- **터치 영역**: 최소 44×44px

### 2-5. 스트릭 워딩 원칙
- ❌ "3일 연속 성공!" → ✅ "나를 만난 날 3일째"
- ❌ "오늘도 못 했네요" → ✅ "쉬어가도 괜찮아요, 내일 또 전화할게요"

---

## 3. 정보 구조 (IA)

```
Lumiary
├── 온보딩 (최초 1회)
│   ├── Step 1: 이름/호칭 입력
│   ├── Step 2: 전화번호 입력
│   ├── Step 3: AI 목소리 톤 선택
│   ├── Step 4: 선호 통화 시간 선택
│   └── Step 5: 0일차 미니 통화 → 완료
│
├── 수신 오버레이 (전화 올 때 — 앱 상단 덮음)
│   ├── 풀스크린 수신 UI
│   └── 통화 중 UI
│
├── 홈 (Bottom Tab: 집 모양)
│   ├── 오늘 상태 배너
│   ├── 최근 데일리 카드 (1개)
│   └── → 데일리 카드 상세 (탭 시)
│
├── 기록 (Bottom Tab: 시계 모양)
│   ├── 대화 기록 리스트 (날짜 내림차순)
│   └── → 데일리 카드 상세 (탭 시)
│
└── 마이 (Bottom Tab: 사람 모양)
    ├── 프로필 + 통계
    └── 설정
        ├── 전화 시간 변경
        ├── AI 목소리 톤 변경
        ├── 호칭 변경
        └── 전화번호 변경
```

---

## 4. 화면별 상세 스펙

### [S-01] 스플래시

**표시 시간**: 1.5초 자동 이동

```
[전체 화면 배경: Primary #2D4A3E]

  (수직 중앙 정렬)
  [Lumiary 워드마크 — 흰색]
  [Caption] "나를 비추는 대화형 일기"
```

**이동**: 신규 → 온보딩 S-02 / 기존 → 홈

---

### [S-02] 온보딩 Step 1 — 호칭 입력

**목적**: AI가 전화에서 부를 이름 수집

```
[Progress Bar — 1/5]

  상단 여백 48px

  [Heading 1] 어떻게 불러드릴까요?
  [Body / Secondary] AI가 전화에서 이름을 부를 거예요.

  상단 여백 40px

  [입력창]
  placeholder: "이름 또는 별명"
  maxLength: 20

  하단 고정
  [Primary Button] 다음  ← 1글자 이상 시 활성
```

---

### [S-03] 온보딩 Step 2 — 전화번호 입력

```
[Progress Bar — 2/5]
[← 뒤로]

  [Heading 1] 어디로 전화 드릴까요?
  [Body / Secondary] 앱 알림으로 전화를 드려요. (실제 전화 아님)

  [전화번호 입력창]
  — 국가코드: 🇰🇷 +82 (MVP 고정)
  — 010-XXXX-XXXX 자동 포맷팅

  하단 고정
  [Primary Button] 다음  ← 11자리 완성 시 활성
```

> **MVP 결정**: 인증 SMS 생략. 번호 입력만 받고 실제 알림으로 대체.

---

### [S-04] 온보딩 Step 3 — AI 목소리 톤 선택

**목적**: 작은 개인화로 초기 애착 형성

```
[Progress Bar — 3/5]
[← 뒤로]

  [Heading 1] AI 목소리를 골라주세요
  [Body / Secondary] 나중에 언제든 바꿀 수 있어요.

  상단 여백 32px

  [선택 카드 × 3 — 세로 나열]
  ┌─────────────────────────────┐
  │  🌿  차분한              선택 │
  │  편안하고 조용한 목소리      │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  ☀️  명랑한              선택 │
  │  밝고 에너지 넘치는 목소리   │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  🪨  담백한              선택 │
  │  군더더기 없이 깔끔한 목소리  │
  └─────────────────────────────┘

  [미리 듣기 버튼] (각 카드 하단) — "3초 샘플 재생"

  하단 고정
  [Primary Button] 다음  ← 하나 선택 시 활성
```

**선택 카드 상태**:
- 미선택: 배경 Surface, 테두리 Text Tertiary
- 선택: 배경 Primary 연한 틴트, 테두리 Primary, 체크 아이콘

---

### [S-05] 온보딩 Step 4 — 전화 시간 선택

```
[Progress Bar — 4/5]
[← 뒤로]

  [Heading 1] 언제 전화 드릴까요?
  [Body / Secondary] 매일 이 시간에 AI가 알림을 보내요.

  [시간 선택 — 드럼롤 Picker]
  기본값: 오후 10:00 / 분 단위: 00, 30

  [추천 시간 Chip — 가로 스크롤]
  "퇴근 후 🌆 오후 7:00"
  "저녁 식사 후 🍽️ 오후 8:00"
  "잠들기 전 🌙 오후 10:00" ← 기본 선택
  "자정 전 ✨ 오후 11:30"

  하단 고정
  [Primary Button] 다음
```

---

### [S-06] 온보딩 Step 5 — 0일차 미니 통화

**목적**: 첫 번째 데이터 확보 + 경험 미리 보여주기. "이런 느낌이구나"를 알게 해 이탈 방지.

```
[Progress Bar — 5/5]

  [Heading 1] 처음 만났으니 가볍게 인사해요 👋
  [Body / Secondary]
  딱 하나만 물어볼게요.
  아래 버튼을 누르면 {name}님과의 첫 대화가 시작돼요.

  상단 여백 40px

  [일러스트 — 전화기 or 빛 퍼지는 이미지]

  하단 고정
  [Primary Button] 첫 대화 시작하기
```

**버튼 탭 시 → 바로 인앱 음성 대화 시작**  
AI 첫 질문: *"처음 만났어요, 반가워요 {name}님! 요즘 머릿속에 가장 자주 떠오르는 생각이 뭐예요?"*  
→ 1~2 턴 후 자연스럽게 마무리  
→ 완료 후 홈으로 이동 + 토스트: "첫 대화 완료! 내일 {시간}에 또 전화할게요 😊"

---

### [S-07] 홈 화면

```
[Navigation Bar]
  좌: Lumiary 워드마크 (소형)
  우: 알림 아이콘

  ─────────────────────────────

  [인사 헤더]
  [Heading 1] 안녕하세요, {name}님 👋
  [Caption / Secondary] 나를 만난 날 {streak}일째

  상단 여백 20px

  [오늘 상태 카드]  ← 케이스별 (아래 표 참고)

  상단 여백 24px

  [섹션 타이틀] 최근 대화
  [데일리 카드 — 최근 1개]  ← S-11 참고
  or [빈 상태] "아직 대화 기록이 없어요"

  [텍스트 링크] 전체 기록 보기 →

  ─────────────────────────────
  [Bottom Tab Bar] 홈 | 기록 | 마이
```

**오늘 상태 카드 케이스**

| 상태 | 카드 내용 |
|---|---|
| 전화 예정 | 📞 "오늘 {시간}에 전화 드릴게요" + 남은 시간 카운트다운 |
| 수신 중 (앱 열려있음) | 오버레이 S-08이 덮음 |
| 통화 완료 · 카드 생성 중 | ✨ "대화를 정리하고 있어요..." 로딩 |
| 통화 완료 · 카드 있음 | ✅ "오늘 대화 완료! 카드를 확인해보세요 →" |
| 미수신 | 📵 "오늘 전화를 못 받으셨네요. 내일 또 전화할게요." |
| 나중에 선택 | 🕐 "{나중에 선택한 시간}에 다시 전화할게요" |

---

### [S-08] 전화 수신 오버레이 (풀스크린)

**목적**: "AI 일기가 전화를 걸어오는" 핵심 경험. 앱 내 오버레이로 구현 (실제 전화 아님).

**트리거**: 설정 시간에 서버가 웹소켓 메시지 → 앱이 풀스크린 오버레이 표시

```
[전체 화면 — 어두운 배경 #1A1A2E with 블러]

  (수직 중앙 정렬)

  [Lottie 애니메이션 — 전화기 + 파동 링]
  (파동이 퍼져나가는 느낌)

  상단 여백 24px

  [Display] Lumiary
  [Heading 2 / 흰색] 안녕하세요, {name}님 😊
  [Body / 흰색 60%] 오늘 하루 이야기 들으러 왔어요

  하단 여백 60px

  [버튼 두 개 — 가로 나란히]
  ┌──────────┐   ┌──────────────┐
  │  나중에   │   │    받기 📞   │
  │  (ghost) │   │  (Primary)  │
  └──────────┘   └──────────────┘

  [Caption / 흰색 40%] 나중에를 누르면 1시간 후 다시 알려드려요
```

**"나중에" 탭**: 1시간 뒤 재알림 등록 → 오버레이 닫힘  
**"받기" 탭**: → S-09 길이 선택으로 이동

---

### [S-09] 통화 길이 선택

**목적**: 사용자가 부담을 직접 통제 → 이탈 방지

```
[전체 화면 — 배경 유지]

  [Heading 2 / 흰색] 오늘은 얼마나 이야기할까요?

  상단 여백 32px

  [선택 카드 × 3 — 세로 나열]
  ┌─────────────────────────────┐
  │  ⚡ 1분   빠르게 한 가지만  │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  💬 3분   편하게 수다 떨기   │ ← 기본 추천
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  🌊 7분   오늘을 깊이 탐색   │
  └─────────────────────────────┘

  (카드 탭 시 즉시 대화 시작 → S-10)
```

**길이별 대화 블록 차이**:
- 1분: ①감정 체크 + ④실천 세팅 (2블록)
- 3분: ①②③④ 4블록 기본
- 7분: ①②③④ + 변주 렌즈 추가 질문 + 깊은 탐색

---

### [S-10] 통화 중 화면

**목적**: 대화 진행 중 상태 표시

```
[전체 화면 배경 — Primary 딥 그린]

  상단
  [Caption / 흰색] 00:00 경과  |  남은 시간 {선택한 길이}분

  (수직 중앙)
  [Lottie 애니메이션 — 음성 파형 또는 빛 파동]
  AI가 말할 때: 파동 크게
  사용자가 말할 때: 파동 작게 (마이크 감지)

  [Body / 흰색] AI가 말하는 중... / 듣고 있어요...

  하단
  [종료 버튼 — 원형 빨간 버튼]
  길게 눌러야 종료 (실수 방지, 2초 홀드)
```

**종료 조건**:
- AI가 클로징 멘트 후 자동 종료
- 사용자가 버튼 2초 홀드로 수동 종료

---

### [S-11] 데일리 카드 (대화 요약 상세)

**목적**: 통화 내용 요약 + 만족도 평가. "오늘의 나" 스냅샷.

**진입**: 홈 카드 탭 / 기록 리스트 탭 / 푸시 알림 탭

```
[Navigation Bar]
  좌: ←
  중: 6월 7일 토요일
  우: 공유 아이콘 (MVP 생략)

  ─────────────────────────────

  [메타] 오후 10:03 · 7분 32초 · 3분 선택

  ─────────────────────────────

  [감정 & 강도]
  타이틀: 오늘의 감정
  [감정 키워드 Pill] 예: 지침 😮‍💨
  [강도 바] ●●●○○ (3/5)

  상단 여백 20px

  [오늘의 키워드]
  [Pill × 3] #번아웃  #주말계획  #운동

  상단 여백 20px

  [핵심 장면]
  타이틀: 오늘 가장 오래 남은 순간
  [Body] "팀장님과의 회의에서 내 아이디어가 묻혔을 때"

  상단 여백 20px

  [숨은 욕구]
  타이틀: 그 뒤에 있던 마음
  [Body] "인정받고 싶은 마음, 그리고 더 잘하고 싶다는 바람"

  상단 여백 20px

  [AI 한 문장]
  타이틀: Lumiary가 본 오늘의 나
  [Body / Primary] "오늘 많이 지치셨군요. 지친 만큼 열심히였던 거예요."

  상단 여백 20px

  [내일의 실천] ← 실천 루프 핵심
  타이틀: 내일의 아주 작은 실험
  ┌─────────────────────────────────┐
  │  ☑️ 동료한테 가볍게 말 걸어보기   │
  │  오늘 대화에서 함께 정했어요      │
  └─────────────────────────────────┘
  (완료 여부 탭 가능 — 다음 날 통화 전까지)

  상단 여백 24px

  [대화 전문]
  타이틀: 대화 내용
  [접기/펼치기 토글]
  접힌 상태: 3줄 + "전체 보기"
  펼친 상태:
    [AI] 00:00 "안녕하세요 {name}님..."
    [나] 00:05 "오늘 좀 힘들었어요..."

  상단 여백 32px

  [만족도]
  타이틀: 오늘 대화 어떠셨나요?
  [별 5개]
  — 미평가: 빈 별
  — 평가 후: Accent 색 채워진 별 (수정 불가)

  [코멘트 입력] 별점 선택 후 활성 / placeholder: "한 마디 남기기 (선택)"

  ─────────────────────────────
```

---

### [S-12] 기록 화면

```
[Navigation Bar] 중: 기록

  [필터 Chip] 전체 | 이번 주 | 이번 달

  [리스트 — 날짜 내림차순]
  ┌─────────────────────────────────┐
  │  6월 7일 토 · 오후 10:03 · 7분  │
  │  #번아웃  #주말계획  #운동       │
  │  "오늘은 업무 스트레스와..."     │
  │  ☑️ 내일의 실천 완료    ★★★★☆  │
  └─────────────────────────────────┘

  [미수신 카드 — 회색 처리]
  ┌─────────────────────────────────┐
  │  6월 6일 금 · 전화를 못 받았어요 │
  └─────────────────────────────────┘

  [빈 상태]
  "아직 대화 기록이 없어요"
  "첫 전화를 기다려보세요 😊"

  [Bottom Tab Bar]
```

---

### [S-13] 마이 페이지

```
[Navigation Bar] 중: 마이

  [프로필]
  [아바타 — 이니셜 원형]
  [Heading 2] {name}님
  [Caption / Secondary] 나를 만난 날 {streak}일째

  [통계 카드]
  ┌──────────┬──────────┬──────────┐
  │  총 대화  │  연속   │ 평균 별점 │
  │   12회   │  5일째  │  4.3 ★   │
  └──────────┴──────────┴──────────┘
  ┌────────────────────────────────┐
  │  실천 달성률    █████░░  72%    │
  └────────────────────────────────┘

  [설정 리스트]
  ─ 전화 시간 설정         →
  ─ AI 목소리 톤           →
  ─ 호칭 변경              →
  ─ 전화번호 변경          →
  ─ 앱 버전                1.1.0
  ─ 문의하기               →

  [로그아웃] (텍스트 버튼 / 회색)

  [Bottom Tab Bar]
```

---

### [S-14] 설정 — 전화 시간 변경

```
[Navigation Bar] 좌: ← 저장  중: 전화 시간 설정

  [드럼롤 Picker] (S-05와 동일)
  [추천 시간 Chip]

  [Primary Button] 저장
  → 저장 후 토스트: "전화 시간이 변경됐어요"
```

### [S-15] 설정 — AI 목소리 톤 변경

```
[Navigation Bar] 좌: ← 저장  중: AI 목소리

  [선택 카드 × 3] (S-04와 동일)
  [미리 듣기 버튼]

  [Primary Button] 저장
```

### [S-16] 설정 — 호칭 / 전화번호 변경

```
[Navigation Bar] 좌: ← 취소  중: 호칭 변경

  [입력창] 현재 값 pre-fill

  [Primary Button] 저장
```

---

## 5. 인터랙션 & 상태 정의

### 5-1. 화면 전환
- 온보딩 스텝 간: 슬라이드 (좌→우)
- 뒤로가기: 슬라이드 (우→좌)
- 탭 전환: 페이드
- 카드 탭 → 상세: Push (아래→위)
- 수신 오버레이: 페이드인 (배경 블러 포함)

### 5-2. 로딩 상태
- 카드 생성 중: 스켈레톤 + Shimmer 효과
- API 호출 중: 버튼 내부 스피너, 버튼 비활성
- 음성 로딩 (TTS 생성 중): 파형 애니메이션 느리게 재생

### 5-3. 토스트 메시지
- 위치: Bottom Tab 위 16px
- 지속: 2.5초

### 5-4. 푸시 알림 시나리오

| 트리거 | 제목 | 본문 |
|---|---|---|
| 전화 예정 시간 도달 | "{name}님, Lumiary예요 📞" | "오늘 하루 이야기 들을게요. 받아주세요!" |
| 카드 생성 완료 | "오늘 대화 카드가 도착했어요 ✨" | "오늘의 키워드: #{k1} #{k2}" |
| 실천 과제 리마인더 (오전 9시) | "어제 정한 실천, 기억하고 있어요 💪" | "{실천내용} — 오늘 해볼 수 있을까요?" |
| 전화 미수신 | "괜찮아요, {name}님 🌙" | "오늘은 쉬어가도 돼요. 내일 또 전화할게요." |
| 나중에 재알림 (1시간 후) | "Lumiary예요, 다시 왔어요 📞" | "시간 괜찮으면 짧게 이야기해요!" |

### 5-5. 마이크 권한 처리
- 앱 최초 음성 대화 시작 시 권한 요청
- 거부 시: "마이크 권한이 필요해요" 안내 + 설정 이동 버튼

---

## 6. 데이터 모델

### users
```sql
id              UUID PK
name            TEXT NOT NULL          -- 표시 이름
nickname        TEXT NOT NULL          -- AI가 부를 호칭
phone           TEXT NOT NULL          -- E.164 (+821012345678)
call_time       TIME NOT NULL          -- 매일 전화 시간 (로컬)
timezone        TEXT DEFAULT 'Asia/Seoul'
voice_tone      ENUM('calm', 'bright', 'plain') DEFAULT 'calm'
created_at      TIMESTAMPTZ
```

### conversations
```sql
id              UUID PK
user_id         UUID FK → users.id
called_at       TIMESTAMPTZ            -- 통화 시작
duration_sec    INTEGER
call_length     ENUM('1min', '3min', '7min')   -- 사용자 선택
status          ENUM('completed', 'missed', 'in_progress')
transcript      JSONB                  -- [{role, timestamp, text}]
summary         TEXT                   -- 한 줄 요약
keywords        TEXT[]                 -- 최대 3개
emotion         TEXT                   -- 감정 키워드 (한 단어)
emotion_intensity INTEGER              -- 1~5
key_scene       TEXT                   -- 핵심 장면
hidden_desire   TEXT                   -- 숨은 욕구
ai_comment      TEXT                   -- AI 한 문장
rating          INTEGER                -- 1~5 (NULL = 미평가)
rating_comment  TEXT
created_at      TIMESTAMPTZ
```

### action_items (실천 루프 핵심)
```sql
id              UUID PK
conversation_id UUID FK → conversations.id
user_id         UUID FK → users.id
content         TEXT NOT NULL          -- 실천 내용
scheduled_for   DATE                   -- 실천 목표일 (보통 다음 날)
status          ENUM('pending', 'done', 'rescaled', 'skipped')
rescaled_content TEXT                  -- 더 작게 쪼갠 내용
reviewed_at     TIMESTAMPTZ            -- 다음 통화에서 확인한 시각
created_at      TIMESTAMPTZ
```

### call_schedules
```sql
id              UUID PK
user_id         UUID FK → users.id
scheduled_at    TIMESTAMPTZ
retry_count     INTEGER DEFAULT 0
status          ENUM('pending', 'sent', 'snoozed', 'expired')
snoozed_until   TIMESTAMPTZ            -- 나중에 선택 시
created_at      TIMESTAMPTZ
```

---

## 7. API 명세

### Base URL
```
Production: https://api.lumiary.app
Development: http://localhost:8000
Auth: Supabase JWT Bearer Token
```

---

### 7-1. 사용자

#### POST /auth/onboard
```json
// Request
{
  "nickname": "유정",
  "phone": "+821012345678",
  "call_time": "22:00",
  "timezone": "Asia/Seoul",
  "voice_tone": "calm"
}

// Response 201
{
  "user_id": "uuid",
  "first_call_at": "2026-06-08T13:00:00Z"
}
```

#### GET /users/me
```json
// Response 200
{
  "id": "uuid",
  "nickname": "유정",
  "phone": "+821012345678",
  "call_time": "22:00",
  "voice_tone": "calm",
  "stats": {
    "total_conversations": 12,
    "streak_days": 5,
    "average_rating": 4.3,
    "action_completion_rate": 0.72
  }
}
```

#### PATCH /users/me
```json
// Request (부분 업데이트)
{
  "nickname": "유정",
  "call_time": "21:30",
  "voice_tone": "bright"
}
```

---

### 7-2. 대화 기록

#### GET /conversations
```
Query: limit, cursor, filter(week|month|all)
```
```json
// Response 200
{
  "conversations": [{
    "id": "uuid",
    "called_at": "2026-06-07T13:03:00Z",
    "duration_sec": 452,
    "call_length": "3min",
    "status": "completed",
    "summary": "오늘은 업무 스트레스와...",
    "keywords": ["번아웃", "주말계획", "운동"],
    "emotion": "지침",
    "emotion_intensity": 3,
    "rating": 4,
    "action_item": {
      "id": "uuid",
      "content": "동료한테 가볍게 말 걸어보기",
      "status": "pending"
    }
  }],
  "next_cursor": "uuid"
}
```

#### GET /conversations/{id}
```json
// Response 200
{
  "id": "uuid",
  "called_at": "...",
  "duration_sec": 452,
  "call_length": "3min",
  "status": "completed",
  "transcript": [
    { "role": "ai", "timestamp": 0, "text": "안녕하세요 유정님..." },
    { "role": "user", "timestamp": 5, "text": "오늘 좀 힘들었어요..." }
  ],
  "summary": "오늘은 업무 스트레스와...",
  "keywords": ["번아웃", "주말계획", "운동"],
  "emotion": "지침",
  "emotion_intensity": 3,
  "key_scene": "팀장님과의 회의에서 내 아이디어가 묻혔을 때",
  "hidden_desire": "인정받고 싶은 마음",
  "ai_comment": "오늘 많이 지치셨군요. 지친 만큼 열심히였던 거예요.",
  "rating": 4,
  "rating_comment": "질문이 좋았어요",
  "action_item": {
    "id": "uuid",
    "content": "동료한테 가볍게 말 걸어보기",
    "scheduled_for": "2026-06-08",
    "status": "pending"
  }
}
```

#### PATCH /conversations/{id}/rating
```json
{ "rating": 4, "comment": "질문이 좋았어요" }
```

---

### 7-3. 실천 루프

#### PATCH /action-items/{id}
실천 과제 상태 업데이트 (사용자가 데일리 카드에서 체크)
```json
{ "status": "done" }  // done | skipped
```

#### GET /action-items/pending
현재 진행 중인 실천 과제
```json
{
  "action_item": {
    "id": "uuid",
    "content": "동료한테 가볍게 말 걸어보기",
    "scheduled_for": "2026-06-08",
    "status": "pending",
    "from_conversation_id": "uuid"
  }
}
```

---

### 7-4. 전화 스케줄

#### GET /schedule/next
```json
{
  "next_call_at": "2026-06-08T13:00:00Z",
  "minutes_remaining": 142
}
```

#### POST /schedule/snooze
나중에 버튼 (1시간 뒤 재알림)
```json
// Response 200
{ "snoozed_until": "2026-06-07T14:00:00Z" }
```

---

### 7-5. 음성 대화 (WebSocket)

#### WS /ws/conversation/{session_id}
실시간 대화 채널

**클라이언트 → 서버**:
```json
{ "type": "audio_chunk", "data": "<base64 PCM>" }
{ "type": "end_of_speech" }
{ "type": "end_call" }
```

**서버 → 클라이언트**:
```json
{ "type": "transcript", "role": "user", "text": "오늘 힘들었어요" }
{ "type": "ai_response_start" }
{ "type": "audio_chunk", "data": "<base64 MP3>" }
{ "type": "ai_response_end", "text": "그렇군요, 어떤 부분이..." }
{ "type": "conversation_ended", "session_id": "uuid" }
```

#### POST /conversations/start
대화 세션 시작 (WebSocket 연결 전 호출)
```json
// Request
{ "call_length": "3min" }

// Response 201
{
  "session_id": "uuid",
  "conversation_id": "uuid",
  "pending_action_item": {           // 이전 실천 과제 있으면 포함
    "content": "동료한테 말 걸어보기",
    "scheduled_for": "2026-06-07"
  }
}
```

---

## 8. AI 대화 시스템 스펙

### 8-1. 4블록 대화 프레임

| 블록 | 목적 | 예시 질문 |
|---|---|---|
| ① 감정 체크 | 오늘 감정 상태 파악 | "오늘 기분을 한 단어로 표현하면 뭐예요?" |
| ② 오늘의 장면 | 구체적 사건/경험 | "오늘 가장 오래 마음에 남은 순간은요?" |
| ③ 의미/해석 | 감정 뒤의 욕구 탐색 | "그 감정 뒤에 어떤 바람이나 실망이 있었을까요?" |
| ④ 내일의 실천 | 행동 실험 설정 | "아주 작게, 내일 해볼 수 있는 것 하나만 정해볼까요?" |

**길이별 블록 조합**:
- 1분: ①, ④
- 3분: ①, ②, ③, ④
- 7분: ①, ②+깊이, ③+변주 렌즈, ④

### 8-2. 변주 엔진

매일 똑같은 질문 방지를 위해 ②③ 블록에 렌즈를 매일 다르게 적용.

**회전 렌즈 7가지** (요일 기반 순환, 과거 기록에서 겹치면 건너뜀):
1. 감사 — "오늘 작은 것이라도 고마웠던 게 있었나요?"
2. 관계 — "오늘 누군가와의 만남에서 뭔가 느낀 게 있었나요?"
3. 도전 — "오늘 어렵게 느껴진 순간이 있었나요?"
4. 몸 — "오늘 몸이 어떤 신호를 보냈나요?"
5. 성취 — "오늘 잘했다 싶은 게 딱 하나라면요?"
6. 욕구 — "오늘 가장 갖고 싶었던 게 뭐예요? 물건이 아니어도 돼요."
7. 쉼 — "오늘 가장 쉬고 싶었던 순간은요?"

**과거 기록 참조** (3회 이상 쌓이면 활성화):
> "지난주에 운동하면 기분이 풀린다고 하셨잖아요, 오늘은 좀 움직이셨어요?"

### 8-3. 실천 루프 프롬프팅

**전날 실천 과제가 있을 때 — 대화 첫마디**:
```
"안녕하세요 {nickname}님! 어제 {action_item.content} 해보기로 했었잖아요, 어떻게 됐어요?"
```

**결과별 분기**:
- 했음: "잘하셨어요! 어떤 느낌이었어요?" → 회고 → 새 실천 세팅
- 못 함: "괜찮아요, 이유가 있었겠죠. 혹시 뭐가 걸렸어요?" → 더 작게 쪼개기
- 부분: "어느 정도 해보셨군요! 그것도 충분해요." → 이어가기

### 8-4. 시스템 프롬프트

```
당신은 Lumiary의 AI 대화 파트너입니다.
사용자 정보:
- 호칭: {nickname}
- 오늘 날짜: {date}
- 선택한 대화 길이: {call_length}
- 활성화된 렌즈: {today_lens}
- 이전 실천 과제: {pending_action_item or "없음"}
- 최근 대화 요약: {last_3_summaries or "첫 번째 대화"}

역할:
당신은 따뜻한 경청자이자 자기 탐구 파트너입니다.
심리상담사가 아닌, 옆에서 같이 생각해주는 존재처럼 행동하세요.

대화 원칙:
1. 한 번에 질문 하나만 하세요.
2. 공감 먼저, 질문은 그 다음: "그렇군요, 그래서 어떤 기분이었나요?"
3. 절대 단정하지 마세요. "그건 번아웃이에요" ❌ → "그 피로감이 언제부터였을까요?" ✅
4. 의학적 진단, 치료 권고 절대 금지.
5. 사용자가 마무리 신호를 보내면 자연스럽게 클로징하세요.

대화 구조: {블록 순서 — 길이에 따라 조정}

실천 과제 설정 (④블록):
- 그날 대화에서 나온 구체적 상황을 기반으로
- 아주 작고 구체적으로: "동료한테 한마디 건네보기" O, "관계 개선하기" X
- 사용자가 스스로 말하도록 유도 후 AI가 정리해서 확인

클로징 형식:
"오늘도 이야기 나눠줘서 고마워요. {오늘 핵심 한 줄}. 내일 {실천내용} 어떻게 됐는지 들을게요. 잘 쉬세요 {nickname}님."
```

### 8-5. 요약 생성 프롬프트

```
아래는 {nickname}님과의 대화 전문입니다.
{transcript}

다음 JSON을 반환하세요:
{
  "summary": "한 문장 (40자 이내)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "emotion": "감정 한 단어",
  "emotion_intensity": 3,          // 1~5
  "key_scene": "핵심 장면 한 문장",
  "hidden_desire": "욕구/바람 한 문장",
  "ai_comment": "AI 한 문장 — 공감과 따뜻한 관찰",
  "action_item": "실천 과제 (없으면 null)"
}
```

### 8-6. 실시간 대화 파이프라인

```
[앱 마이크 입력]
      ↓
[WebSocket → 서버]
      ↓
[Deepgram STT] — 실시간 스트리밍 텍스트
      ↓
[FastAPI 대화 관리] — 턴 누적 + 컨텍스트 + 블록 상태
      ↓
[Claude API 스트리밍] — 응답 텍스트 생성
      ↓
[ElevenLabs TTS] — 텍스트 → 음성 스트리밍
      ↓
[WebSocket → 앱] — 오디오 청크 전송
      ↓
[앱 스피커 재생]
```

**목표 레이턴시**: 사용자 말 끝 → AI 음성 시작까지 2.5초 이내

---

## 9. 기술 스택 & 아키텍처

### 9-1. 스택

| 레이어 | 기술 | 용도 |
|---|---|---|
| **Frontend** | Next.js 14 (PWA) | 웹앱 — 모바일 반응형 |
| **UI** | Tailwind CSS + shadcn/ui | 스타일링 |
| **Backend** | FastAPI (Python) | API + WebSocket 서버 |
| **DB** | Supabase (PostgreSQL) | 데이터 + Auth + RLS |
| **AI 대화** | Claude API (claude-sonnet-4-6) | 대화 생성 + 요약 |
| **STT** | Deepgram | 실시간 한국어 음성인식 |
| **TTS** | ElevenLabs | 한국어 자연스러운 음성 합성 (톤 3가지) |
| **음성 통신** | WebSocket (FastAPI) + Web Audio API | 앱 내 인앱 음성 대화 |
| **스케줄링** | APScheduler | 매일 전화 알림 트리거 |
| **세션 상태** | Redis (Upstash) | 대화 세션 인메모리 관리 |
| **푸시 알림** | Firebase Cloud Messaging | 수신 알림 + 카드 알림 |
| **배포 FE** | Vercel | Next.js |
| **배포 BE** | Railway | FastAPI |

> **Twilio 제거**: 앱 내 오버레이 방식으로 변경 — WebSocket 기반 인앱 음성 통화로 대체. 실제 전화번호 발신 불필요.

### 9-2. 시스템 아키텍처

```
[PWA — Vercel]
  Web Audio API (마이크/스피커)
  WebSocket Client
       |
       | WebSocket (음성) + REST (데이터)
       ↓
[FastAPI — Railway]
  WebSocket 음성 서버
  대화 상태 관리
  스케줄러 (APScheduler)
   |       |       |
   |       |       └── [Supabase PostgreSQL]
   |       └── [Redis] — 세션 상태
   |
   ├── [Deepgram] — STT WebSocket
   ├── [Claude API] — 대화/요약
   ├── [ElevenLabs] — TTS
   └── [FCM] — 푸시 알림 발송
```

### 9-3. 환경변수

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude
ANTHROPIC_API_KEY=

# Deepgram
DEEPGRAM_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID_CALM=
ELEVENLABS_VOICE_ID_BRIGHT=
ELEVENLABS_VOICE_ID_PLAIN=

# Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# FCM
FIREBASE_SERVICE_ACCOUNT=       # JSON 문자열

# App
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_APP_URL=
```

### 9-4. MVP Out of Scope (v2 이후)

| 기능 | v2 이유 |
|---|---|
| Physical Device (책 형태) | 하드웨어 개발 기간 필요 |
| 폴백 채널 (카카오톡 텍스트) | 미수신 시 대안 채널 — 가설 검증 후 |
| 주간 리캡 / 무드 카드 공유 | 데이터 7개 이상 필요 |
| 변주 엔진 고도화 (과거 참조) | 대화 3회 이상 쌓인 후 활성화 |
| 인사이트 / 패턴 분석 | 데이터 누적 후 |
| 체크인 (감정 기록, 사진) | 전화 가설 검증 후 보완 채널 |
| 실제 전화 (Twilio) | PWA 방식 우선 검증 |

---

## 10. 에러 & 엣지 케이스

### 10-1. 대화 관련

| 케이스 | 처리 |
|---|---|
| 마이크 권한 거부 | "마이크 접근이 필요해요" 안내 모달 + 설정 이동 버튼 |
| WebSocket 연결 끊김 | 자동 재연결 3회 시도 → 실패 시 "연결이 끊겼어요" 토스트 + 재연결 버튼 |
| STT 인식 실패 | AI: "잘 안 들렸어요, 다시 말씀해주실 수 있나요?" |
| 통화 30초 미만 종료 | summary 생략, status = missed 처리 |
| Claude 타임아웃 | 미리 준비된 fallback 응답 ("잠시만요...") |
| TTS 생성 지연 | 파형 애니메이션 느리게 유지, 준비되면 재생 |

### 10-2. 앱 관련

| 케이스 | 처리 |
|---|---|
| 앱 백그라운드 시 알림 | FCM 푸시 → 탭하면 앱 열리면서 오버레이 표시 |
| 푸시 알림 권한 거부 | 온보딩 완료 후 앱 내 알림 배너로 대체 |
| 네트워크 없음 | 캐시된 최근 카드 표시, 오프라인 배너 |
| 카드 생성 실패 | 재시도 버튼 "다시 불러오기" |
| 세션 만료 | Supabase 자동 갱신 → 실패 시 재로그인 |

### 10-3. 시간대
- 서버: UTC 저장
- 표시: Asia/Seoul (MVP 한국 전용)
- 스케줄러: user.call_time + timezone → UTC 변환 → APScheduler 등록

---

## 부록: 1주일 개발 스케줄

| 일차 | 주요 작업 | 체크포인트 |
|---|---|---|
| **Day 1** | Supabase 스키마, FCM 세팅, 환경변수 정리, ElevenLabs 목소리 3종 세팅 | DB 테이블 생성 + 목소리 샘플 재생 |
| **Day 2** | 온보딩 UI (S-02~06) + 0일차 미니 통화 기본 구현, `/auth/onboard` API | 온보딩 완료 → DB 저장 확인 |
| **Day 3** | WebSocket 음성 서버, Deepgram STT, ElevenLabs TTS 연동, Web Audio API | 마이크 → STT 텍스트 변환 확인 |
| **Day 4** | Claude API 4블록 대화 흐름, 실천 루프 첫마디, 세션 상태 관리 | 처음부터 끝까지 3분 대화 완료 |
| **Day 5** | 수신 오버레이 (S-08, S-09), 데일리 카드 (S-11), FCM 푸시, 요약 생성 | 알림 → 대화 → 카드 생성 end-to-end |
| **Day 6** | 기록 화면 (S-12), 마이페이지 (S-13), 설정 화면 (S-14~16), 실천 체크 | 전체 탭 내비게이션 + 실천 상태 업데이트 |
| **Day 7** | 버그 픽스, 모바일 반응형, APScheduler 스케줄링 테스트, Vercel/Railway 배포 | 실제 폰에서 알림 → 대화 → 카드 확인 |
