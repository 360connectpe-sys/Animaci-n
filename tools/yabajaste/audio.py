"""«¿Ya bajaste?»: sound design and mixes (numpy + scipy; DSP kit from the Stick-Story plugin, MIT).

  python3 -I tools/yabajaste/audio.py nota     -> public/yabajaste/voz/nota_grabacion.wav (voice note: her voice + keys + click)
  python3 -I tools/yabajaste/audio.py prueba   -> public/yabajaste/mix_prueba.wav (12 s test, scene 3 + start of 4)

Voices first: every timing comes from src/yabajaste/*.json, the same files the picture reads.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, ns, tt, dbg, rng, lp, hp, bp, peq, colored, smooth_noise, fades, curve, modal, pan, st, place,
                 make_ir, convolve_st, integrated, true_peak, read_wav, write_wav)

ROOT = Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "yabajaste"
SRC = ROOT / "src" / "yabajaste"


def load_mp3(path):
    """decode with ffmpeg to mono float at SR"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<f4").astype(np.float64)


def trim(x, thr_db=-50):
    a = np.abs(x)
    idx = np.where(a > dbg(thr_db))[0]
    return x[max(0, idx[0] - ns(0.01)): idx[-1] + ns(0.05)] if len(idx) else x


def rms_norm(x, db):
    return x * dbg(db) / (np.sqrt(np.mean(x ** 2)) + 1e-12)


# ------------------------------------------------------------------ effects
def phone_eq(x):
    """small phone speaker / phone mic: band-limited, a bit of presence, light saturation"""
    y = hp(x, 320, 2)
    y = lp(y, 3600, 4)
    y = peq(y, 1800, 4.0, 0.9)
    y = np.tanh(y * 1.6) / 1.6
    return y


def keys(r, dur=0.6):
    """a bunch of keys jingling: short bright metal hits"""
    out = np.zeros(ns(dur))
    for i in range(9):
        at = r.uniform(0, dur - 0.2) * (0.6 if i < 5 else 1)
        f0 = r.uniform(2600, 5200)
        hit = modal(0.25, [(f0, 1, 0.05), (f0 * 1.52, 0.6, 0.03), (f0 * 2.31, 0.35, 0.02), (f0 * 0.71, 0.4, 0.06)], r)
        hit += 0.3 * hp(r.standard_normal(len(hit)), 3000) * np.exp(-tt(0.25) / 0.006)
        k = ns(at)
        out[k:k + len(hit)] += r.uniform(0.3, 1.0) * hit[: len(out) - k]
    return out


def click(r, f=(1900, 3300, 5200), tau=0.018, thump=0.0):
    x = modal(0.12, [(f[0], 1, tau), (f[1], 0.6, tau * 0.7), (f[2], 0.3, tau * 0.5)], r)
    x += 0.8 * bp(r.standard_normal(len(x)), 800, 6000) * np.exp(-tt(0.12) / 0.003)
    if thump:
        x += thump * modal(0.12, [(140, 1, 0.03), (260, 0.5, 0.02)], r)
    return fades(x, 0.0005, 0.02)


def latch(r):
    """her door: the key turns, the bolt slides and snaps (metal, warmer and heavier than the phone click)"""
    turn = 0.25 * bp(r.standard_normal(ns(0.09)), 1500, 5000) * np.hanning(ns(0.09))
    snap = click(r, (980, 1720, 2900), 0.04, thump=0.9)
    x = np.zeros(ns(0.4))
    x[:len(turn)] += turn
    x[ns(0.07):ns(0.07) + len(snap)] += snap * 1.2
    return x


def creak(r, dur=0.7):
    """door hinge: a resonant scrape gliding up"""
    n = ns(dur)
    fr = curve(n, [(0, 520), (dur, 760)])
    src = colored(n, r, 1.0) * (0.5 + 0.5 * np.abs(np.sin(np.cumsum(2 * np.pi * (35 + 10 * smooth_noise(n, r, 3)) / SR))))
    y = np.zeros(n)
    for h, g in ((1, 1.0), (2.01, 0.5), (3.02, 0.25)):
        # moving band-pass, frame by frame
        for a in range(0, n, ns(0.02)):
            b = min(n, a + ns(0.02))
            f = fr[a] * h
            y[a:b] += g * bp(src[max(0, a - ns(0.01)):b], f * 0.94, f * 1.06, 2)[-(b - a):]
    return fades(y * np.hanning(n) ** 0.5, 0.02, 0.1)


def step(r, wet=True):
    """sneaker on damp concrete"""
    n = ns(0.16)
    x = bp(r.standard_normal(n), 250, 2600) * np.exp(-tt(0.16) / 0.03)
    if wet:
        x += 0.35 * bp(r.standard_normal(n), 2500, 7000) * np.exp(-tt(0.16) / 0.05)
    return fades(x, 0.002, 0.03)


def bag(r, dur=0.45, dens=90):
    """paper bag crinkle"""
    n = ns(dur)
    imp = (r.random(n) < dens / SR) * r.uniform(-1, 1, n)
    y = np.zeros(n)
    for f in (2400, 4200, 6100):
        y += bp(imp, f * 0.8, f * 1.2, 2)
    y += 0.2 * bp(r.standard_normal(n), 1500, 6000) * (0.4 + 0.6 * np.abs(smooth_noise(n, r, 12)))
    return fades(y * np.hanning(n) ** 0.3, 0.01, 0.06)


def tap(r):
    return 0.6 * click(r, (2600, 4100, 6000), 0.006)


# ------------------------------------------------------------------ beds
def bus_bed(dur, r, rough=1.0):
    """inside a micro at night on wet asphalt: engine, glass buzz, tyre hiss (stereo)"""
    n = ns(dur)
    t = tt(dur)
    rpm = 1 + 0.06 * smooth_noise(n, r, 0.4)
    f0 = 46 * rpm
    ph = np.cumsum(2 * np.pi * f0 / SR)
    engine = np.sin(ph) + 0.55 * np.sin(2 * ph + 0.4) + 0.3 * np.sin(3 * ph + 1.1) + 0.18 * np.sin(4.5 * ph)
    engine = lp(engine * (0.8 + 0.2 * np.sin(2 * np.pi * 7.3 * t)), 220) * 0.6
    rumble = lp(colored(n, r, 2.0), 160) * 0.5
    glass = bp(colored(n, r, 0.5), 1400, 3200) * (0.3 + 0.7 * np.clip(np.sin(ph * 0.5), 0, 1) ** 4) * 0.035 * rough
    tyre = hp(colored(n, r, 0.8), 1800) * (0.6 + 0.4 * smooth_noise(n, r, 0.7)) * 0.16
    L = engine + rumble + glass + tyre
    R = engine + rumble + 0.8 * glass + hp(colored(n, r, 0.8), 1800) * 0.16
    return np.stack([L, R])


def street_bed(dur, r):
    """the corner at night after the drizzle: distant traffic, drips, a fluorescent hum from the bakery"""
    n = ns(dur)
    t = tt(dur)
    traffic = lp(colored(n, r, 1.5), 500) * (0.5 + 0.5 * smooth_noise(n, r, 0.15)) * 0.35
    hum = (np.sin(2 * np.pi * 100 * t) + 0.4 * np.sin(2 * np.pi * 200 * t) + 0.2 * np.sin(2 * np.pi * 300 * t)) * 0.012
    drips = np.zeros(n)
    for _ in range(int(dur * 2.2)):
        at = r.uniform(0, dur - 0.1)
        d = modal(0.08, [(r.uniform(1800, 3200), 1, 0.012)], r, glide=0.4, glide_tau=0.01) * r.uniform(0.04, 0.12)
        k = ns(at)
        drips[k:k + len(d)] += d[: n - k]
    L = traffic + hum + drips
    R = lp(colored(n, r, 1.5), 500) * (0.5 + 0.5 * smooth_noise(n, r, 0.15)) * 0.35 + hum + np.roll(drips, ns(0.013))
    return np.stack([L, R])


# ------------------------------------------------------------------ the voice note
def build_nota():
    cue = json.loads((SRC / "nota.json").read_text())
    r = rng(7)
    v = load_mp3(PUB / "voz" / "nota.mp3")       # untrimmed: keeps the word timings of nota.words.json
    v = rms_norm(v, -22)                      # she speaks softly
    room = make_ir(0.25, 11, pre=0.004, hf=1.6)
    out = np.zeros(ns(cue["length"]))
    out[ns(cue["voiceAt"]):ns(cue["voiceAt"]) + len(v)] += v
    out = out + 0.12 * convolve_st(out, room)[0]
    place_mono(out, keys(r) * 0.10, cue["keys"])
    place_mono(out, click(r) * 0.32, cue["click"])
    # the phone's own little noise floor
    out += 0.0025 * colored(len(out), r, 1.0)
    out = phone_eq(out)
    out = fades(out, 0.01, 0.06)
    write_wav(str(PUB / "voz" / "nota_grabacion.wav"), out)
    print("nota_grabacion.wav", round(len(out) / SR, 2), "s")


def place_mono(buf, x, t):
    k = ns(t)
    m = min(len(x), len(buf) - k)
    if m > 0:
        buf[k:k + m] += x[:m]


def finish(mix, path, target=-16.0):
    """one gain to the target loudness, soft limiter at -1 dBFS"""
    g = dbg(target - integrated(mix))
    mix = mix * g
    peak = np.abs(mix).max()
    if peak > dbg(-1.2):
        mix = np.tanh(mix / dbg(-1.2)) * dbg(-1.2)
    write_wav(str(path), mix)
    print(path.name, "LUFS", round(integrated(mix), 1), "TP", round(true_peak(mix), 1))


# ------------------------------------------------------------------ test mix (scene 3 + start of 4)
def build_prueba():
    P = json.loads((SRC / "prueba.json").read_text())
    N = json.loads((SRC / "nota.json").read_text())
    r = rng(21)
    dur = P["total"]
    mix = np.zeros((2, ns(dur)))
    cut = P["shots"]["pestillo"][0]
    # present: bus bed until the click, ducked under the voice note
    bus = bus_bed(cut + 0.4, r)
    bus *= curve(bus.shape[1], [(0, 0.0), (0.25, 1.0), (P["nota"], 1.0), (P["nota"] + 0.3, 0.62),
                                (P["nota"] + N["keys"], 0.62), (cut - 0.05, 0.8), (cut + 0.35, 0.0)])
    place(mix, bus * 0.22, 0)
    place(mix, pan(tap(r), 0.15) * 0.25, P["tap"])
    # the voice note: from the speaker while he looks at it, then from the phone at his ear (a little fuller)
    nota, _ = read_wav(str(PUB / "voz" / "nota_grabacion.wav"))
    nota = nota[0]
    ear = curve(len(nota), [(0, 0.85), (P["shots"]["reflejo"][0] - P["nota"], 0.85), (P["shots"]["reflejo"][0] - P["nota"] + 0.6, 1.15)])
    place(mix, nota * ear * 1.0, P["nota"])
    # memory: the click becomes her latch, warm street
    place(mix, pan(latch(r), 0.1) * 0.55, cut - 0.07)
    street = street_bed(dur - cut + 0.2, r)
    street *= curve(street.shape[1], [(0, 0), (0.3, 1)])
    place(mix, street * 0.20, cut)
    place(mix, pan(creak(r), 0.25) * 0.22, P["puerta"])
    for i, at in enumerate([0.05, 0.3, 0.52, 0.74, 1.05, 1.5]):
        place(mix, pan(step(r), 0.25 - i * 0.05) * (0.22 if i < 4 else 0.3), P["sale"] + at)
    place(mix, pan(bag(r), -0.2) * 0.28, P["ceja"] - 0.12)
    finish(mix, PUB / "mix_prueba.wav")


if __name__ == "__main__":
    what = sys.argv[1:] or ["nota", "prueba"]
    if "nota" in what:
        build_nota()
    if "prueba" in what:
        build_prueba()
