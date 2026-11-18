"""Discreet corporate instrumental for the Pandero commercial, generated with numpy (own work, royalty-free).
Writes public/pandero/musica.mp3 (needs ffmpeg). Usage: python3 tools/pandero/music.py [seconds]
"""
import subprocess, sys, wave
from pathlib import Path
import numpy as np

SR = 44100
SECONDS = float(sys.argv[1]) if len(sys.argv) > 1 else 86
OUT = Path(__file__).resolve().parents[2] / "public" / "pandero"
BPM = 104
beat = 60 / BPM
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

n = int(SECONDS * SR)
t = np.arange(n) / SR
mix = np.zeros(n)
# I - V - vi - IV in C major, one chord per bar (4 beats)
chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
bar = 4 * beat

def add(start, sig):
    i = int(start * SR)
    if i >= n:
        return
    L = min(len(sig), n - i)
    mix[i:i + L] += sig[:L]

k = 0
while k * bar < SECONDS:
    c = chords[k % 4]
    tt = np.arange(int((bar + 0.6) * SR)) / SR
    env = np.minimum(1, tt / 0.4) * np.exp(-tt * 0.35)
    pad = sum(np.sin(2 * np.pi * hz(m) * tt) for m in c) * env * 0.05
    add(k * bar, pad)
    bass = np.sin(2 * np.pi * hz(c[0] - 24) * tt[: int(bar * SR)]) * np.exp(-tt[: int(bar * SR)] * 1.2) * 0.12
    add(k * bar, bass)
    for j in range(8):  # eighth-note arpeggio pluck
        m = [c[0] + 12, c[1] + 12, c[2] + 12, c[1] + 12][j % 4]
        tp = np.arange(int(0.5 * SR)) / SR
        pl = (np.sin(2 * np.pi * hz(m) * tp) + 0.3 * np.sin(4 * np.pi * hz(m) * tp)) * np.exp(-tp * 7) * 0.06
        add(k * bar + j * beat / 2, pl)
    for j in range(4):  # soft kick on each beat
        tk = np.arange(int(0.18 * SR)) / SR
        kick = np.sin(2 * np.pi * (55 + 60 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 22) * 0.10
        add(k * bar + j * beat, kick)
    k += 1

fade = np.minimum(1, t / 1.5) * np.minimum(1, (SECONDS - t) / 3)
mix = mix * fade
mix = 0.85 * mix / np.max(np.abs(mix))
pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
wav = OUT / "musica.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "160k", str(OUT / "musica.mp3")], check=True)
wav.unlink()
print("ok")
