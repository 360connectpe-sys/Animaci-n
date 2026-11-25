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


def limit(x, ceil, att=0.001, rel=0.08):
    """peak limiter (from the plugin's mix.py): smooth gain so |x| <= ceil, 2 ms look-ahead"""
    from scipy.ndimage import minimum_filter1d
    from scipy.signal import lfilter
    a = np.abs(x).max(0)
    need = np.minimum(1.0, ceil / np.maximum(a, 1e-9))
    la = int(0.002 * SR)
    need = minimum_filter1d(need, 2 * la + 1)
    kr = np.exp(-1 / (rel * SR))
    # release smoothing (attack is instant thanks to the min filter)
    g = lfilter([1 - kr], [1, -kr], need - 1.0, zi=[0.0])[0] + 1.0
    g = np.minimum(g, need)
    return x * g


def finish(mix, path, target=-16.0):
    """one gain to the target loudness, soft limiter at -1 dBFS"""
    for _ in range(3):                      # gain to target, then a look-ahead peak limiter at -1.5 dBFS
        mix = mix * dbg(target - integrated(mix))
        mix = limit(mix, dbg(-1.5))
    tp = true_peak(mix)
    if tp > -1.0:
        mix = mix * dbg(-1.1 - tp)
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


# ------------------------------------------------------------------ lips for the sidewalk dialogue
def build_lips():
    """mouth level per frame (0, 1, 2) from the voice envelope of r1 and r2"""
    out = {}
    for k in ("r1", "r2"):
        x = load_mp3(PUB / "voz" / f"{k}.mp3")
        hop = SR // 30
        env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
        ref = np.percentile(env[env > 1e-4], 90)
        lv = np.where(env > ref * 0.45, 2, np.where(env > ref * 0.14, 1, 0))
        out[k] = [int(v) for v in lv]
    (SRC / "lips.json").write_text(json.dumps(out))
    print("lips.json", {k: len(v) for k, v in out.items()})


def bump(r):
    x = modal(0.5, [(55, 1, 0.12), (110, 0.5, 0.08), (240, 0.3, 0.05)], r)
    x += 0.4 * bp(r.standard_normal(len(x)), 300, 3000) * np.exp(-tt(0.5) / 0.05)
    rattle = bp(r.standard_normal(ns(0.5)), 1500, 4500) * (np.abs(np.sin(np.arange(ns(0.5)) / SR * 2 * np.pi * 22)) ** 6) * np.exp(-tt(0.5) / 0.18) * 0.5
    return fades(x + rattle, 0.002, 0.05)


def hiss(r, dur=0.8):
    n = ns(dur)
    return fades(hp(colored(n, r, 0.3), 2500) * np.exp(-tt(dur) / 0.25), 0.005, 0.1)


def rustle(r, dur=0.5):
    n = ns(dur)
    return fades(bp(colored(n, r, 0.6), 400, 4000) * np.hanning(n) * (0.5 + 0.5 * np.abs(smooth_noise(n, r, 9))), 0.01, 0.05)


def crunch(r):
    imp = (r.random(ns(0.25)) < 300 / SR) * r.uniform(-1, 1, ns(0.25))
    return fades(bp(imp, 900, 5000, 2) * np.exp(-tt(0.25) / 0.08) * 3, 0.001, 0.04)


def build_corto():
    Cj = json.loads((SRC / "corto.json").read_text())
    t, V = Cj["t"], Cj["voices"]
    r = rng(31)
    dur = Cj["total"]
    N = ns(dur)
    voice = np.zeros((2, N))
    beds = np.zeros((2, N))
    fx = np.zeros((2, N))
    # ---- voices
    for k in ("n1", "n2", "n3", "n4", "n5"):
        v = rms_norm(load_mp3(PUB / "voz" / f"{k}.mp3"), -21)
        v = peq(v, 180, 1.5, 0.8)                    # close, intimate
        place(voice, v, V[k])
    porch = make_ir(0.35, 5, pre=0.006, hf=1.4)
    for k, p in (("r1", -0.12), ("r2", 0.12)):
        v = rms_norm(load_mp3(PUB / "voz" / f"{k}.mp3"), -21)
        v = pan(v, p) + 0.10 * convolve_st(v, porch)
        place(voice, v, V[k])
    nota, _ = read_wav(str(PUB / "voz" / "nota_grabacion.wav"))
    nota = nota[0] * 1.9
    ear = curve(len(nota), [(0, 0.8), (t["s3b"] - V["nota"], 0.8), (t["s3b"] - V["nota"] + 0.6, 1.1)])
    place(voice, nota * ear, V["nota"])
    n2 = nota[: ns(t["black"] - V["nota2"])].copy()
    n2[-ns(0.04):] *= np.linspace(1, 0, ns(0.04))
    place(voice, n2, V["nota2"])
    # ---- beds: the micro (present) and the corner (memory), crossfaded on the scene changes
    bus = bus_bed(dur, r)
    busg = curve(N, [(0, 0), (0.4, 1), (t["s4a"], 1), (t["s4a"] + 0.5, 0), (t["s6a"] - 0.15, 0), (t["s6a"] + 0.1, 1), (dur, 1)])
    beds += bus * busg * 0.085
    street = street_bed(dur, r)
    stg = curve(N, [(0, 0), (t["s4a"], 0), (t["s4a"] + 0.4, 1), (t["s6a"] - 0.1, 1), (t["s6a"] + 0.1, 0), (dur, 0)])
    beds += street * stg * 0.11
    # ---- effects
    place(fx, pan(rustle(r, 0.6), 0.1) * 0.25, t["phone_out"] - 0.2)
    for i in range(10):
        place(fx, pan(tap(r), 0.1) * 0.08, t["type_a"] + i * (t["type_b"] - t["type_a"]) / 10)
    for i in range(14):
        place(fx, pan(click(r, (3200, 5000, 7000), 0.004), 0.1) * 0.03, t["scroll_a"] + 0.15 + i * (t["scroll_b"] - t["scroll_a"] - 0.4) / 14)
    place(fx, pan(tap(r), 0.15) * 0.3, t["tap"])
    place(fx, pan(latch(r), 0.1) * 0.5, t["click"] - 0.07)
    place(fx, pan(creak(r), 0.25) * 0.2, t["door"])
    for i, at in enumerate([0.05, 0.3, 0.52, 0.74, 1.05, 1.5]):
        place(fx, pan(step(r), 0.25 - i * 0.05) * (0.2 if i < 4 else 0.26), t["out"] + at)
    for k0, d in ((t["offer"], 0.45), (t["reach"], 0.5), (t["take"], 0.4), (t["swap"], 0.5)):
        place(fx, pan(bag(r, d), -0.05) * 0.3, k0)
    place(fx, pan(bag(r, 1.6, 60), -0.1) * 0.16, t["laugh"])
    place(fx, pan(crunch(r), 0.12) * 0.35, t["bite"])
    for i in range(4):
        place(fx, pan(step(r), -0.1 + 0.2 * (i % 2)) * 0.18, t["walk_a"] + 0.1 + i * 0.24)
    for i in range(6):
        place(fx, pan(rustle(r, 0.22), 0.15) * 0.22, t["tie"] + 0.2 + i * 0.52)    # the lace
    for i in range(3):
        place(fx, pan(rustle(r, 0.3), -0.1) * 0.12, t["s5b"] + 0.6 + i * 1.4)     # her hand on the jacket
    place(fx, pan(bump(r), 0.0) * 0.55, t["bump"])
    place(fx, pan(rustle(r, 0.5), 0.0) * 0.3, t["fix"])
    place(fx, pan(tap(r), 0.1) * 0.3, t["tap2"])
    place(fx, pan(hiss(r), 0.7) * 0.35, t["doorOpen"])
    place(fx, pan(street_bed(1.2, r)[0] * np.hanning(ns(1.2)), 0.7) * 0.25, t["doorOpen"])
    for i in range(2):
        place(fx, pan(step(r), 0.6) * 0.14, t["doorOpen"] + 0.3 + i * 0.25)
    # ---- duck the beds under the voices (4 dB), black: only the engine for the last half second
    env = np.abs(voice).max(0)
    env = lp(env, 6, 1)
    on = np.clip(env / (np.percentile(env[env > 1e-4], 70) + 1e-9), 0, 1)
    beds *= dbg(-4.0 * on)
    voice[:, ns(t["black"]):] = 0
    fx[:, ns(t["black"]):] = 0
    mix = voice + beds + fx
    finish(mix, PUB / "mix_corto.wav", target=-15.0)


if __name__ == "__main__":
    what = sys.argv[1:] or ["nota", "prueba"]
    if "nota" in what:
        build_nota()
    if "prueba" in what:
        build_prueba()
    if "lips" in what:
        build_lips()
    if "corto" in what:
        build_corto()
