from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # .env에 정의된 미사용 키 무시
    )

    supabase_url: str
    supabase_service_role_key: str
    gemini_api_key: str = ""
    cors_origins: list[str] = ["http://localhost:3000"]

    # Phase 2+ — 선택적 설정 (미설정 시 기능 비활성화)
    upstash_redis_url: str = ""
    upstash_redis_token: str = ""
    firebase_service_account: str = ""
    google_application_credentials: str = ""


settings = Settings()

# Google Cloud TTS 인증 경로를 OS 환경변수로 주입
import os
if settings.google_application_credentials:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
