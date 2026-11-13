"""Generate Spanish narration with Edge TTS (free) plus a VTT subtitle track.

Usage: python3 tools/tts/generate.py [name ...]
Writes public/audio/<name>.mp3 and public/audio/<name>.vtt (and <name>.words.json with word timings
in seconds for lines that ask for word boundaries). With names, only those lines are generated.
"""
import asyncio
import json
import os
import sys
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
    # (file name, voice, text[, rate, word timings, pitch])
    ("joven_pregunta", "es-ES-AlvaroNeural", "¿Somos felices?"),
    ("mayor_responde", "es-ES-ElviraNeural", "Algunos días, sí. Y eso ya es mucho."),
    (
        "piloto_narracion",
        "es-PE-AlexNeural",
        "Imagina encontrarte con tu yo de hace cinco años... Te mira a los ojos y te pregunta: ¿Somos felices?",
        "-12%",
        True,
    ),
    ("ep01_escena1", "es-PE-AlexNeural", "¿Qué pensaría tu yo de hace cinco años... si te viera hoy?", "-15%", True),
    ("ep01_escena2", "es-PE-AlexNeural", "Quizás se sorprendería de lo lejos que llegaste. O de todo lo que dejaste en el camino.", "-15%", True),
    ("ep01_escena3", "es-PE-AlexNeural", "Tal vez te preguntaría por esos sueños... y tú no sabrías qué responder.", "-15%", True),
    ("ep01_escena4", "es-PE-AlexNeural", "¿Tu yo de hace cinco años... estaría orgulloso de quien eres hoy?", "-15%", True),
    # Paper Cut episode 01: same Peruvian voice for both ages; the young self is a bit higher and quicker.
    ("pc_e1_joven_01", "es-PE-AlexNeural", "Oye... ¿tú eres yo?", "-5%", True, "+12Hz"),
    ("pc_e1_adulto_01", "es-PE-AlexNeural", "Sí.", "-15%", True, "-8Hz"),
    ("pc_e1_joven_02", "es-PE-AlexNeural", "¿Del futuro?", "-5%", True, "+12Hz"),
    ("pc_e1_adulto_02", "es-PE-AlexNeural", "De cinco años después.", "-15%", True, "-8Hz"),
]


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    for line in LINES:
        name, voice, text = line[:3]
        rate = line[3] if len(line) > 3 else "-8%"
        words = line[4] if len(line) > 4 else False
        pitch = line[5] if len(line) > 5 else "+0Hz"
        if only and name not in only:
            continue
        communicate = edge_tts.Communicate(
            text, voice, rate=rate, pitch=pitch, boundary="WordBoundary" if words else "SentenceBoundary"
        )
        subs = edge_tts.SubMaker()
        timings = []
        with open(OUT / f"{name}.mp3", "wb") as audio:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio.write(chunk["data"])
                elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                    subs.feed(chunk)
                    if chunk["type"] == "WordBoundary":
                        start = chunk["offset"] / 1e7  # 100 ns units
                        timings.append({"text": chunk["text"], "start": start, "end": start + chunk["duration"] / 1e7})
        (OUT / f"{name}.vtt").write_text(subs.get_srt().replace(",", "."), encoding="utf-8")
        if timings:
            (OUT / f"{name}.words.json").write_text(json.dumps(timings, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"ok {name}")


if __name__ == "__main__":
    asyncio.run(main())
