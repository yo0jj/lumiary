import json

from upstash_redis.asyncio import Redis

from app.core.config import settings


def _client() -> Redis:
    return Redis(
        url=settings.upstash_redis_url,
        token=settings.upstash_redis_token,
    )


async def get_session(session_id: str) -> dict:
    data = await _client().get(f"session:{session_id}")
    if not data:
        return {}
    return json.loads(data) if isinstance(data, str) else {}


async def set_session(session_id: str, data: dict, ttl: int = 3600) -> None:
    await _client().set(
        f"session:{session_id}",
        json.dumps(data, ensure_ascii=False),
        ex=ttl,
    )


async def delete_session(session_id: str) -> None:
    await _client().delete(f"session:{session_id}")
