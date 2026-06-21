from abc import ABC, abstractmethod


class VoiceEngine(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """STT: 오디오 bytes → 한국어 텍스트"""

    @abstractmethod
    async def generate_response(self, transcript: str, context: dict) -> str:
        """LLM: 대화 맥락 → AI 응답 텍스트"""

    @abstractmethod
    async def synthesize(self, text: str) -> bytes:
        """TTS: 텍스트 → 오디오 bytes (MP3)"""
