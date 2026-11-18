"""Pandero Auto commercial voice: es-PE-AlexNeural via edge-tts, with word timings and SRT.
Usage: CA_BUNDLE=/path/ca.crt python3 tools/pandero/tts.py
"""
import asyncio, json, os, ssl, sys
from pathlib import Path
import edge_tts
from edge_tts import communicate as _c

if os.environ.get("CA_BUNDLE"):
    _c._SSL_CTX = ssl.create_default_context(cafile=os.environ["CA_BUNDLE"])
OUT = Path(__file__).resolve().parents[2] / "public" / "pandero" / "voz"
VOICE = "es-PE-AlexNeural"
LINES = {
    "v1": "¡Hola! Soy Daniel Domínguez, asesor vehicular de Pandero. Hoy te voy a explicar cómo funciona Pandero Ya y qué pasos debes seguir para llevarte tu auto nuevo.",
    "v2": "Tienes dos opciones. Puedes adelantar cuotas hasta completar veinticuatro, o pagar una cuota al mes y completarlas en veinticuatro meses.",
    "v3": "Cuando completas las veinticuatro cuotas y cumples los requisitos del plan, puedes iniciar los trámites de entrega. Una vez que termines esos trámites, podrás llevarte tu auto y seguir pagando las cuotas que te quedan.",
    "v4": "¿Ya sabes qué auto te gustaría manejar? Escríbeme por WhatsApp y te ayudo a cotizarlo.",
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, text in LINES.items():
        com = edge_tts.Communicate(text, VOICE, rate="+0%", boundary="WordBoundary")
        sub = edge_tts.SubMaker(); words = []
        with open(OUT / f"{name}.mp3", "wb") as f:
            async for ch in com.stream():
                if ch["type"] == "audio": f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    sub.feed(ch); st = ch["offset"] / 1e7
                    words.append({"text": ch["text"], "start": st, "end": st + ch["duration"] / 1e7})
        (OUT / f"{name}.srt").write_text(sub.get_srt(), encoding="utf-8")
        (OUT / f"{name}.words.json").write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
        print("ok", name)

asyncio.run(main())
