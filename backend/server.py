import os
import json
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Optional import of STT scaffold (kept isolated)
try:
    from stt_service import STTConfig, GoogleStreamingSTT  # type: ignore
except Exception:
    STTConfig = None  # type: ignore
    GoogleStreamingSTT = None  # type: ignore

app = FastAPI(title="Aavana Temp Restore API")

# Wide-open CORS just for temp restore; original CORS rules will come back with full server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    stt_ready = False
    if STTConfig is not None:
        try:
            stt_ready = STTConfig().ready  # type: ignore
        except Exception:
            stt_ready = False
    return {
        "status": "ok",
        "service": "temp-restore",
        "stt_ready": bool(stt_ready),
        "version": "temp-restore-1",
    }

@app.post("/api/stt/chunk")
async def stt_chunk(body: dict | None = None):
    # Minimal placeholder to keep route alive without credentials
    stt_ready = False
    if STTConfig is not None:
        try:
            stt_ready = STTConfig().ready  # type: ignore
        except Exception:
            stt_ready = False
    if not stt_ready:
        return {"success": False, "message": "STT not configured", "stt_ready": False}
    # For temp restore, we do not process audio yet
    return {"success": False, "message": "Use WebSocket /api/stt/stream for streaming STT", "stt_ready": True}

@app.websocket("/api/stt/stream")
async def stt_stream(ws: WebSocket):
    await ws.accept()
    stt_ready = False
    if STTConfig is not None:
        try:
            stt_ready = STTConfig().ready  # type: ignore
        except Exception:
            stt_ready = False
    if not stt_ready:
        await ws.send_text(json.dumps({
            "type": "error",
            "message": "STT not configured (no Google credentials present)",
        }))
        await ws.close()
        return
    # Temp restore notice; full streaming wiring will come after creds
    await ws.send_text(json.dumps({
        "type": "info",
        "message": "STT stream online (temp restore). Full streaming will be enabled after credentials.",
    }))
    await ws.close()