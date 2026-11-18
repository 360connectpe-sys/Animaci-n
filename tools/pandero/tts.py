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
    "w1": "¡Hola! Soy Daniel Domínguez, asesor vehicular de Pandero. ¿Te imaginas estrenar un Kia Soluto con cuotas desde doscientos cincuenta y nueve dólares al mes? Te explico cómo funciona Pandero Ya.",
    "w1_sin_precio": "¡Hola! Soy Daniel Domínguez, asesor vehicular de Pandero. ¿Te gustaría saber cómo llevarte tu auto nuevo con Pandero Ya? Te lo explico.",
    "w2": "Tienes dos caminos. Puedes pagar una cuota al mes y completar las veinticuatro en dos años. O, si quieres llegar antes, puedes adelantar cuotas.",
    "w3": "Y hay algo más. En los meses uno, cinco, diez, quince y veinte de tu grupo, puedes participar en un sorteo. Si sales elegido, empiezas antes los trámites para llevarte tu auto.",
    "w4": "Si no sales elegido, al completar las veinticuatro cuotas y cumplir los requisitos del programa, inicias los trámites para llevarte tu auto. Y después de recibirlo, sigues pagando las cuotas que te quedan.",
    "w5": "¿Qué modelo tienes en mente? Escríbeme por WhatsApp y te ayudo a cotizarlo.",
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
