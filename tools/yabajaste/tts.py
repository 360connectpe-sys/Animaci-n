"""«¿Ya bajaste?»: voces con edge-tts y tiempos por palabra.
Él: es-PE-AlexNeural (narración y recuerdo). Ella: es-PE-CamilaNeural (nota de voz y recuerdo).
Uso: python3 tools/yabajaste/tts.py [ids...]   (el proxy usa SSL_CERT_FILE / CA_BUNDLE si existe)
"""
import asyncio, json, os, ssl, sys
from pathlib import Path
import edge_tts
from edge_tts import communicate as _c

ca = os.environ.get("CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
if ca:
    _c._SSL_CTX = ssl.create_default_context(cafile=ca)
OUT = Path(__file__).resolve().parents[2] / "public" / "yabajaste" / "voz"
EL, ELLA = "es-PE-AlexNeural", "es-PE-CamilaNeural"
# id: (voz, texto, rate, pitch)
LINES = {
    "n1": (EL, "Hoy pasé por tu cuadra. La panadería sigue con medio letrero apagado.", "-6%", "+0Hz"),
    "n2": (EL, "Abrí nuestro chat y busqué: ¿ya bajaste? Me salieron un montón. Parece que escribí eso todos los sábados.", "-6%", "+0Hz"),
    "nota": (ELLA, "Ya bajo. Oye... si sale mi mamá, dile que recién llegas, ¿ya?", "+14%", "+6Hz"),
    "r1": (EL, "¿Recién llego? Ya hasta me conoce el panadero.", "+2%", "+2Hz"),
    "r2": (ELLA, "Entonces ya sabes cuál me gusta.", "+6%", "+5Hz"),
    "n3": (EL, "Siempre hacías eso. Me ponías la mano acá, y yo ya sabía que tenía que quedarme quieto.", "-8%", "+0Hz"),
    "n4": (EL, "Cuando terminamos, me acordaba mucho de la última pelea. Hasta me sabía de memoria qué había dicho cada uno.", "-8%", "-1Hz"),
    "n5": (EL, "Hoy me acordé de esos veinte minutos afuera de tu casa. Con el pan todavía caliente, esperando que bajaras.", "-10%", "+0Hz"),
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    for name, (voice, text, rate, pitch) in LINES.items():
        if only and name not in only:
            continue
        com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
        words = []
        with open(OUT / f"{name}.mp3", "wb") as f:
            async for ch in com.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    st = ch["offset"] / 1e7
                    words.append({"text": ch["text"], "start": round(st, 3), "end": round(st + ch["duration"] / 1e7, 3)})
        (OUT / f"{name}.words.json").write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
        print("ok", name, voice)

asyncio.run(main())
