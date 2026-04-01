import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# FRONTEND_URL is injected by the platform at deploy time (e.g. https://stackramp.io).
# Fall back to * for local dev.
_frontend_url = os.getenv("FRONTEND_URL", "")
origins = [_frontend_url] if _frontend_url else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/time")
def get_time():
    now = datetime.now(timezone.utc)
    return {
        "utc": now.isoformat(),
        "formatted": now.strftime("%A, %d %B %Y — %H:%M:%S UTC"),
    }


@app.get("/healthz")
def healthz():
    return {"status": "ok", "region": os.getenv("REGION", "unknown")}
