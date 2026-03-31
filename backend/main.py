from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {"status": "ok"}
