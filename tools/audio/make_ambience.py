"""Procedural, royalty-free sound for the Paper Cut episodes (numpy only, no samples needed).

Writes MP3s to public/audio/papercut/: rain, rain_heavy, step, bus, music (needs ffmpeg)
Usage: python3 tools/audio/make_ambience.py
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parents[2] / "public" / "audio" / "papercut"
rng = np.random.default_rng(7)


def save(name, x, stereo=True):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = 0.89 * x / peak
    if stereo and x.ndim == 1:
        x = np.stack([x, x], axis=1)
    pcm = (x * 32767).astype(np.int16)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2 if pcm.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    wav = OUT / name
    mp3 = wav.with_suffix(".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "160k", str(mp3)], check=True)
    wav.unlink()


def fft_filter(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def rain(seconds, density, seed):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    bed = fft_filter(r.normal(size=n), 400, 9000) * 0.35
    bed += fft_filter(r.normal(size=n), 60, 500) * 0.25
    drops = np.zeros(n)
    for _ in range(int(seconds * density)):
        i = r.integers(0, n - 800)
        L = r.integers(200, 700)
        env = np.exp(-np.linspace(0, 9, L))
        drops[i : i + L] += r.normal(size=L) * env * r.uniform(0.2, 1.0)
    drops = fft_filter(drops, 1500, 12000)
    x = bed + drops * 0.6
    # stereo: decorrelate channels
    left = x
    right = np.roll(x, 911) * 0.95 + fft_filter(r.normal(size=n), 500, 8000) * 0.05
    fade = np.minimum(1, np.arange(n) / (SR * 1.5))
    return np.stack([left * fade, right * fade], axis=1)


def step():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 28)
    splash = fft_filter(rng.normal(size=n), 900, 7000) * np.exp(-t * 22) * 0.55
    return thump * 0.8 + splash


def bus(seconds, level_keys, f0_keys, hiss_keys):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    level = np.interp(t, *level_keys)
    f0 = np.interp(t, *f0_keys)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    engine = np.sin(phase) + 0.5 * np.sin(2 * phase) + 0.25 * np.sin(3.01 * phase)
    engine = engine * (0.8 + 0.2 * np.sin(2 * np.pi * 6 * t))
    road = fft_filter(rng.normal(size=n), 80, 900) * 0.5
    hiss = fft_filter(rng.normal(size=n), 2500, 10000) * np.interp(t, *hiss_keys, left=0, right=0)
    x = (engine * 0.6 + road) * level + hiss * 0.6
    return x


def music(seconds):
    """Slow melancholic pad (Am - F - C - G - Am - F - Dm - E) with sparse plucked notes."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    chords = [
        [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62],
        [57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59],
    ]
    bar = 6.0
    out = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for k in range(int(np.ceil(seconds / bar))):
        c = chords[k % len(chords)]
        s0 = int(k * bar * SR)
        L = min(int((bar + 2.5) * SR), n - s0)
        if L <= 0:
            break
        tt = np.arange(L) / SR
        env = np.minimum(1, tt / 2.2) * np.minimum(1, np.maximum(0, (bar + 2.5 - tt) / 2.5))
        tone = sum(np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.003 * tt) for m in c)
        tone += 0.6 * np.sin(2 * np.pi * hz(c[0] - 12) * tt)
        out[s0 : s0 + L] += tone * env * 0.12
        # two soft plucked notes per bar
        for j, m in enumerate([c[2] + 12, c[1] + 12]):
            p0 = s0 + int((1.5 + j * 2.6) * SR)
            Lp = min(int(3 * SR), n - p0)
            if Lp <= 0:
                continue
            tp = np.arange(Lp) / SR
            pl = (np.sin(2 * np.pi * hz(m) * tp) + 0.4 * np.sin(4 * np.pi * hz(m) * tp)) * np.exp(-tp * 1.6)
            out[p0 : p0 + Lp] += pl * 0.1
    out = fft_filter(out, 40, 3500)
    fade = np.minimum(1, t / 4) * np.minimum(1, (seconds - t) / 5)
    return out * fade


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    save("rain.wav", rain(100, 900, 1))
    save("rain_heavy.wav", rain(40, 2600, 2))
    save("step.wav", step())
    # arrival: approach 0-6.5 s, brakes/door hiss, long idle (door opens ~7.5 s, closes ~18 s)
    save("bus_arrive.wav", bus(22, ([0, 6.5, 7, 21, 22], [0.05, 1, 0.65, 0.65, 0.65]), ([0, 6.5, 22], [54, 38, 38]),
                               ([6.2, 6.4, 7.0, 7.4, 7.6, 8.4, 17.8, 18.0, 18.8], [0, 1, 0, 0, 0.8, 0, 0, 0.8, 0])))
    # departure: revs up and fades away
    save("bus_leave.wav", bus(6, ([0, 1, 6], [0.65, 1, 0]), ([0, 6], [38, 62]), ([0, 1], [0, 0])))
    save("music.wav", music(100))
    print("ok")
