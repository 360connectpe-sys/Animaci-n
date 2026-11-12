"""Generate Spanish narration with Edge TTS (free) plus a VTT subtitle track.

Usage: python3 tools/tts/generate.py
Writes public/audio/<name>.mp3 and public/audio/<name>.vtt.
"""
import asyncio
import os
import ssl
from pathlib import Path

import edge_tts
from edge_tts import communicate as _communicate

OUT = Path(__file__).resolve().parents[2] / "public" / "audio"

# Optional: set CA_BUNDLE to a PEM file when the network uses a TLS-intercepting proxy.
# Verification stays on; only the trusted CA list changes.
if os.environ.get("CA_BUNDLE"):
    _communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["CA_BUNDLE"])

LINES = [
    # (file name, voice, text)
    ("joven_pregunta", "es-ES-AlvaroNeural", "¿Somos felices?"),
    ("mayor_responde", "es-ES-ElviraNeural", "Algunos días, sí. Y eso ya es mucho."),
]


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, voice, text in LINES:
        communicate = edge_tts.Communicate(text, voice, rate="-8%")
        subs = edge_tts.SubMaker()
        with open(OUT / f"{name}.mp3", "wb") as audio:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio.write(chunk["data"])
                elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                    subs.feed(chunk)
        (OUT / f"{name}.vtt").write_text(subs.get_srt().replace(",", "."), encoding="utf-8")
        print(f"ok {name}")


if __name__ == "__main__":
    asyncio.run(main())
