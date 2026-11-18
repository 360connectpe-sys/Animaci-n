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
    "s1": "¿Buscas un auto nuevo? Soy Daniel Domínguez y te explico cómo funciona el adelanto de cuotas.",
    "s1_precio": "¿Buscas un auto nuevo? Conoce esta opción con cuotas mensuales desde doscientos cincuenta y nueve dólares.",
    "s2": "Con Pandero Ya puedes adelantar pagos. Al completar veinticuatro cuotas y cumplir las condiciones del programa, puedes acceder a la adjudicación anticipada.",
    "s3": "Una vez adjudicado tu certificado, empiezas los trámites para recibir tu vehículo y continúas pagando las cuotas pendientes.",
    "s4": "¿Qué modelo tienes en mente? Escríbeme por WhatsApp y revisamos juntos las cuotas y los requisitos.",
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
