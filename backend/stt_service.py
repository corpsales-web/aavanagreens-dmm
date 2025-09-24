import os
import json
import asyncio
from typing import AsyncGenerator, List, Optional

# Optional import guard for google cloud speech v2
try:
    from google.cloud import speech_v2
    from google.cloud.speech_v2 import types as speech_types
    _GCP_AVAILABLE = True
except Exception:
    _GCP_AVAILABLE = False

DEFAULT_LANGUAGE_HINTS = [
    "en-IN",  # English (India)
    "hi-IN",  # Hindi (India)
    "ta-IN",  # Tamil (India)
    "pa-IN",  # Punjabi (India)
]

class STTConfig:
    def __init__(self, project_id: Optional[str] = None, languages: Optional[List[str]] = None):
        self.project_id = project_id or os.environ.get("GCP_PROJECT_ID")
        self.languages = languages or DEFAULT_LANGUAGE_HINTS
        self.model = os.environ.get("GCP_SPEECH_MODEL", "chirp_2")
        # Time/cost guardrails
        self.max_session_seconds = int(os.environ.get("STT_MAX_SESSION_SECONDS", "120"))
        self.max_inactivity_seconds = int(os.environ.get("STT_MAX_INACTIVITY_SECONDS", "8"))

    @property
    def ready(self) -> bool:
        # Use ADC: GOOGLE_APPLICATION_CREDENTIALS or workload identity
        return _GCP_AVAILABLE and (self.project_id is not None)

class GoogleStreamingSTT:
    def __init__(self, cfg: STTConfig):
        self.cfg = cfg
        self.client: Optional[speech_v2.SpeechClient] = None
        if _GCP_AVAILABLE and self.cfg.project_id:
            try:
                self.client = speech_v2.SpeechClient()
            except Exception:
                self.client = None

    def _recognizer_path(self) -> Optional[str]:
        if not (self.client and self.cfg.project_id):
            return None
        # Use default recognizer
        return f"projects/{self.cfg.project_id}/locations/global/recognizers/_"

    async def stream_transcribe(self, audio_iter: AsyncGenerator[bytes, None]):
        if not (self.client and self._recognizer_path()):
            # Yield a single error then stop
            yield {"type": "error", "message": "STT not configured: missing credentials or project_id"}
            return
        recognizer = self._recognizer_path()
        # Build streaming config
        config = speech_types.RecognitionConfig(
            auto_decoding_config=speech_types.AutoDetectDecodingConfig(),
            language_codes=self.cfg.languages,
            model=self.cfg.model,
            features=speech_types.RecognitionFeatures(
                enable_automatic_punctuation=True,
                enable_word_time_offsets=False,
                # Voice activity events help end on silence
                enable_voice_activity_events=True,
            ),
        )
        # Prepare request iterator
        async def request_gen():
            # First request contains config
            yield speech_types.StreamingRecognizeRequest(
                recognizer=recognizer,
                streaming_config=speech_types.StreamingRecognitionConfig(
                    config=config,
                    interim_results=True,
                )
            )
            async for chunk in audio_iter:
                if chunk:
                    yield speech_types.StreamingRecognizeRequest(audio=chunk)
        try:
            call = self.client.streaming_recognize(requests=request_gen())
            async for resp in call:  # type: ignore
                # Each response may contain results with alternatives
                for result in resp.results:
                    if not result.alternatives:
                        continue
                    alternative = result.alternatives[0]
                    payload = {
                        "type": "final" if result.is_final else "partial",
                        "text": alternative.transcript or "",
                        "confidence": getattr(alternative, "confidence", None),
                    }
                    yield payload
        except Exception as e:
            yield {"type": "error", "message": f"GCP streaming error: {str(e)}"}