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
    "x1": "¡Hola! Soy Daniel Domínguez, asesor vehicular de Pandero Auto, y hoy te explicaré cómo puedes hacer realidad el sueño de estrenar tu auto nuevo con Pandero Ya.",
    "x2": "Con Pandero Ya puedes adelantar tus primeras veinticuatro cuotas, dentro de los primeros veinticuatro meses, en el momento que tú decidas, para acceder al proceso de adjudicación de tu auto nuevo.",
    "x3": "O, si lo prefieres, puedes pagar tus cuotas mensualmente y esperar hasta el mes veinticuatro para acceder a la adjudicación de tu vehículo, según las condiciones del programa.",
    "x4": "Y recuerda algo importante: después de recibir tu vehículo, deberás continuar pagando las treinta y seis cuotas restantes, de acuerdo con las condiciones de tu contrato.",
    "x5": "Durante todo este proceso contarás con mi asesoría para conocer los requisitos, preparar tu documentación y realizar los trámites necesarios para adquirir tu auto nuevo.",
    "x6": "¡Y algo más! Durante ese periodo también tienes la posibilidad de salir adjudicado mediante los sorteos del programa, en los meses uno, cinco, diez, quince y veinte, y acceder a tu vehículo antes del mes veinticuatro.",
    "x7": "¡Haz realidad el sueño de estrenar tu auto nuevo! Soy Daniel Domínguez, asesor vehicular de Pandero Auto. Escríbeme y conoce todas tus opciones.",
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    for name, text in LINES.items():
        if only and name not in only:
            continue
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
