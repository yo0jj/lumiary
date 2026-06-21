from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, users
from app.api import voice, conversations, action_items, schedule
from app.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


app = FastAPI(title="여보세요 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(voice.router, tags=["voice"])
app.include_router(conversations.router, tags=["conversations"])
app.include_router(action_items.router, tags=["action-items"])
app.include_router(schedule.router, tags=["schedule"])


@app.get("/health")
async def health():
    return {"status": "ok"}
