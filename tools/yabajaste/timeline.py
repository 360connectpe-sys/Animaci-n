"""«¿Ya bajaste?»: master timeline. Voices first: every cue is placed from the real length of the lines
(public/yabajaste/voz/*.words.json). Writes src/yabajaste/corto.json, read by the picture (Remotion) and by audio.py.
  python3 -I tools/yabajaste/timeline.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VOZ = ROOT / "public" / "yabajaste" / "voz"
W = {k: json.loads((VOZ / f"{k}.words.json").read_text()) for k in ["n1", "n2", "n3", "n4", "n5", "r1", "r2", "nota"]}
NOTA = json.loads((ROOT / "src" / "yabajaste" / "nota.json").read_text())


def w(line, i, at, end=False):
    """absolute time of word i of a line placed at `at`"""
    x = W[line][i]
    return round(at + (x["end"] if end else x["start"]), 3)


def last(line, at):
    return round(at + W[line][-1]["end"], 3)


T = {}
V = {}   # voice placements: id -> start (s)

# 1 · LA CUADRA ---------------------------------------------------------------
V["n1"] = 1.9
T["sign"] = 5.4            # bakery sign centre passes behind his head
T["eyes"] = 4.3            # eyes catch the sign
T["s1_end"] = last("n1", V["n1"]) + 0.6

# 2 · EL CHAT ------------------------------------------------------------------
T["s2a"] = T["s1_end"]
V["n2"] = T["s2a"] + 0.9
T["phone_out"] = T["s2a"] + 0.55
T["s2b"] = T["s2a"] + 1.5
T["type_a"] = T["s2b"] + 0.25
T["type_b"] = T["type_a"] + 1.0
T["results"] = w("n2", 5, V["n2"], True) + 0.2
T["scroll_a"] = w("n2", 6, V["n2"])
T["scroll_b"] = w("n2", 9, V["n2"], True) + 0.5
T["finger_in"] = last("n2", V["n2"]) - 0.6
T["hover"] = last("n2", V["n2"]) + 0.1

# 3 · SU VOZ -------------------------------------------------------------------
T["tap"] = T["hover"] + 0.55
V["nota"] = T["tap"] + 0.15
T["s3b"] = V["nota"] + W["nota"][1]["end"] + 0.02     # cut to the reflection right after «Ya bajo»
T["mama"] = V["nota"] + NOTA["mamaEnd"]
T["keys"] = V["nota"] + NOTA["keys"]
T["click"] = V["nota"] + NOTA["click"]

# 4 · RECIÉN LLEGAS --------------------------------------------------------------
T["s4a"] = T["keys"] + 0.25           # the keys go on over the green handle
T["s4b"] = T["click"] + 0.55          # wide on the sidewalk
T["door"] = T["s4b"] + 0.1
T["out"] = T["door"] + 0.5
T["back"] = T["out"] + 1.7            # she checks inside
T["bagLook"] = T["back"] + 1.1        # she looks down at the bag
T["follow"] = T["bagLook"] + 0.35     # he follows her eyes
T["offer"] = T["follow"] + 0.3        # and brings the bag a little closer
T["s4c"] = T["offer"] + 0.75          # medium two-shot for the dialogue
V["r1"] = T["s4c"] + 0.15
T["reach"] = last("r1", V["r1"]) + 0.35
T["take"] = T["reach"] + 0.5
T["bite"] = T["take"] + 0.45
T["chewEnd"] = T["bite"] + 1.3
T["lookUp"] = T["chewEnd"] + 0.1
V["r2"] = T["lookUp"] + 0.3
T["serious"] = last("r2", V["r2"]) + 0.05
T["laugh"] = T["serious"] + 0.65
T["s4_end"] = T["laugh"] + 2.0

# 5 · EL HOMBRO -----------------------------------------------------------------
T["s5a"] = T["s4_end"]
T["walk_a"] = T["s5a"] + 0.2
T["walk_b"] = T["walk_a"] + 1.0
T["lace"] = T["walk_b"] + 0.25        # she notices the lace
T["touch"] = T["lace"] + 0.5          # her hand on his shoulder
T["swap"] = T["touch"] + 0.25         # he moves the bag to the other hand before looking
T["brace"] = T["swap"] + 0.5          # and sets his shoulder for her weight
T["lookHer"] = T["brace"] + 0.35
T["tie"] = T["brace"] + 0.25
V["n3"] = T["touch"] + 0.6
T["s5b"] = w("n3", 3, V["n3"]) - 0.25                 # close-up of the hand just before «Me ponías la mano acá»
T["s5_end"] = last("n3", V["n3"]) + 0.7

# 6 · LOS VEINTE MINUTOS ----------------------------------------------------------
T["s6a"] = T["s5_end"]                 # same shoulder, now the backpack strap
T["bump"] = T["s6a"] + 1.0
T["fix"] = T["bump"] + 0.45
T["s6b"] = T["s6a"] + 2.5
T["lookBack"] = T["s6b"] + 0.3
V["n4"] = T["s6b"] + 0.7
T["lookDown"] = last("n4", V["n4"]) + 0.5
V["n5"] = T["lookDown"] + 0.75
T["paxUp"] = V["n5"] + 3.2             # a passenger gets up and goes to the rear door
T["s6_end"] = last("n5", V["n5"]) + 0.5

# 7 · OTRA VEZ ----------------------------------------------------------------------
T["s7a"] = T["s6_end"]
T["tap2"] = T["s7a"] + 0.75
V["nota2"] = T["tap2"] + 0.15
T["s7b"] = T["tap2"] + 0.45
T["doorOpen"] = T["s7b"] + 0.25
T["black"] = V["nota2"] + W["nota"][2]["end"] + 0.55  # right after «Oye…»
T["total"] = round(T["black"] + 0.55, 2)

SHOTS = [
    ("1 · La cuadra", "busWide", 0.0, T["s2a"]),
    ("2 · Saca el celular", "busMedium", T["s2a"], T["s2b"]),
    ("2 · El chat", "chat", T["s2b"], T["s3b"]),
    ("3 · Su reflejo", "reflejo", T["s3b"], T["s4a"]),
    ("4 · La manija verde", "manija", T["s4a"], T["s4b"]),
    ("4 · La puerta", "vereda", T["s4b"], T["s4c"]),
    ("4 · Recién llegas", "dialogo", T["s4c"], T["reach"] - 0.1),
    ("4 · El pan", "pan", T["reach"] - 0.1, T["lookUp"] + 0.05),
    ("4 · Cuál me gusta", "dialogo2", T["lookUp"] + 0.05, T["s5a"]),
    ("5 · Dos pasos", "pasos", T["s5a"], T["s5b"]),
    ("5 · La mano en el hombro", "mano", T["s5b"], T["s6a"]),
    ("6 · La tira de la mochila", "tira", T["s6a"], T["s6b"]),
    ("6 · Los veinte minutos", "busBack", T["s6b"], T["lookDown"] + 0.2),
    ("6 · El audio terminó", "audioFin", T["lookDown"] + 0.2, V["n5"] + 2.2),
    ("6 · Junto a la ventana", "busWait", V["n5"] + 2.2, T["s7a"]),
    ("7 · El pulgar", "pulgar", T["s7a"], T["s7b"]),
    ("7 · Otra vez", "busEnd", T["s7b"], T["black"]),
    ("Negro", "black", T["black"], T["total"]),
]

# subtitles: (line, first word, last word, text); at most two short lines each
SUBS = [
    ("n1", 0, 6, "Hoy el micro pasó por tu cuadra."),
    ("n1", 7, 15, "Sigue apagada la mitad\ndel letrero de la panadería."),
    ("n2", 0, 5, "Busqué «ya bajaste»\nen nuestro chat."),
    ("n2", 6, 9, "Me salieron un montón."),
    ("n2", 10, 18, "Creo que te escribí lo mismo\ntodos los sábados."),
    ("nota", 0, 1, "Ya bajo."),
    ("nota", 2, 6, "Oye… si sale mi mamá,"),
    ("nota", 7, 11, "dile que recién llegas, ¿ya?"),
    ("r1", 0, 1, "¿Recién llego?"),
    ("r1", 2, 7, "Ya hasta me conoce el panadero."),
    ("r2", 0, 5, "Entonces ya sabes cuál me gusta."),
    ("n3", 0, 2, "Siempre hacías eso."),
    ("n3", 3, 7, "Me ponías la mano acá"),
    ("n3", 8, 16, "y yo ya sabía que tenía\nque quedarme quieto."),
    ("n4", 0, 10, "Me acuerdo de que esa noche\nmiré la hora tres veces."),
    ("n4", 11, 13, "Veinte minutos esperándote,"),
    ("n4", 14, 18, "con el pan todavía caliente."),
    ("n5", 0, 7, "Quién me iba a decir que un día"),
    ("n5", 8, 18, "iba a extrañar hasta la parte\nen que todavía no bajabas."),
    ("nota2", 0, 1, "Ya bajo."),
    ("nota2", 2, 2, "Oye…"),
]
WHO = {"n1": "el", "n2": "el", "n3": "el", "n4": "el", "n5": "el", "r1": "el", "r2": "ella", "nota": "ella", "nota2": "ella"}
subs = []
for line, a, b, text in SUBS:
    src = "nota" if line == "nota2" else line
    at = V[line]
    s = w(src, a, at) - 0.05
    e = w(src, b, at, True) + 0.25
    subs.append({"a": round(s, 3), "b": round(e, 3), "text": text, "who": WHO[line]})
for i in range(len(subs) - 1):       # no overlaps
    if subs[i]["b"] > subs[i + 1]["a"] - 0.04:
        subs[i]["b"] = round(subs[i + 1]["a"] - 0.04, 3)
subs[-1]["b"] = min(subs[-1]["b"], T["black"])

out = {
    "fps": 30, "total": T["total"],
    "t": {k: round(v, 3) for k, v in T.items()},
    "voices": {k: round(v, 3) for k, v in V.items()},
    "shots": [{"name": n, "kind": k, "a": round(a, 3), "b": round(b, 3)} for n, k, a, b in SHOTS],
    "subs": subs,
}
(ROOT / "src" / "yabajaste" / "corto.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
for s in out["shots"]:
    print(f"{s['a']:6.2f}-{s['b']:6.2f}  {s['b'] - s['a']:5.2f}s  {s['name']}")
print("total", T["total"], "s")
