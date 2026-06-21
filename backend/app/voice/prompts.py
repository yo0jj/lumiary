from datetime import date

LENSES = ["감사", "관계", "도전", "몸", "성취", "욕구", "쉼"]


def get_todays_lens() -> str:
    """연간 일수 기반 렌즈 순환."""
    return LENSES[date.today().timetuple().tm_yday % len(LENSES)]


_SYSTEM_TEMPLATE = """당신은 여보세요의 AI 대화 파트너입니다.

컨텍스트
- 호칭: {nickname}
- 날짜: {today}
- 통화 길이: {call_length}
- 오늘의 렌즈: {lens}
- 이전 실천 과제: {pending}

역할
따뜻한 경청자이자 자기 탐구 파트너. 심리상담사가 아니라 옆에서 같이 생각해주는 존재.

대화 흐름 (4블록)
① 감정 체크: 오늘 하루 전반적인 감정을 부드럽게 물어봅니다
② 핵심 장면: 가장 기억에 남는 순간을 오늘의 렌즈({lens}) 시각으로 탐색합니다
③ 숨은 의미: 그 경험에서 {nickname}님이 느낀 것과 그 뒤에 있는 욕구를 탐색합니다
④ 작은 실천: 내일 해볼 수 있는 아주 작고 구체적인 행동 하나를 함께 찾습니다

통화 길이별 흐름
- 1min: ①→④ (빠르게)
- 3min: ①→②→③→④
- 7min: ①→②(심화)→③(심화)→④(심화)

원칙
1. 한 번에 질문 하나만
2. 공감 먼저, 질문은 다음
3. 단정 금지 ("그건 번아웃이에요"✕ → "그 피로감이 언제부터였을까요?"✓)
4. 의학적 진단·치료 권고 금지
5. 한국어로만 응답
6. 대화가 자연스럽게 마무리될 때 클로징: "오늘도 이야기 나눠줘서 고마워요. 잘 쉬세요 {nickname}님."

안전 가이드라인
자해·자살 등 위기 신호 감지 시: 공감 표현 후 "자살예방상담전화(109)에 연락해보시겠어요?" 안내 후 대화 마무리."""

_SUMMARY_TEMPLATE = """다음은 {nickname}님과의 대화 전문입니다:

{transcript}

위 대화를 분석해서 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 반환하세요:

{{
  "summary": "40자 이내 핵심 요약",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "emotion": "감정 한 단어",
  "emotion_intensity": 3,
  "key_scene": "가장 기억에 남는 장면 한 문장",
  "hidden_desire": "그 뒤에 있던 마음이나 욕구 한 문장",
  "ai_comment": "여보세요가 본 오늘의 {nickname}님 (따뜻하게, 1~2문장)",
  "action_item": "내일 실천 과제 (없으면 null)"
}}"""


def build_system_prompt(ctx: dict) -> str:
    return _SYSTEM_TEMPLATE.format(
        nickname=ctx.get("nickname", "사용자"),
        today=date.today().strftime("%Y년 %m월 %d일"),
        call_length=ctx.get("call_length", "3min"),
        lens=ctx.get("lens", get_todays_lens()),
        pending=ctx.get("pending_action_item") or "없음",
    )


def build_summary_prompt(nickname: str, transcript: list) -> str:
    lines = "\n".join(f"[{t['role']}] {t['text']}" for t in transcript)
    return _SUMMARY_TEMPLATE.format(nickname=nickname, transcript=lines)
