#!/usr/bin/env python3
"""Create full-length H.264 assets below Cloudflare Pages' 25 MiB limit."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import os
import shutil
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".preview/pages-media"
FFMPEG = os.environ.get("PORTFOLIO_FFMPEG", str(ROOT / ".preview/media-tools/bin/ffmpeg"))
FFPROBE = os.environ.get("PORTFOLIO_FFPROBE", str(ROOT / ".preview/media-tools/bin/ffprobe"))
LIMIT = 25 * 1024**2
TARGET = 23 * 1024**2
FILES = [
    "media/hero-underground.mp4",
    "media/video-cases/fanmai-shengji.mp4",
    "media/video-cases/riben-pengpan.mp4",
]


def probe(path):
    return json.loads(subprocess.check_output([
        FFPROBE, "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)
    ]))


def audio_hash(path):
    return subprocess.check_output([
        FFMPEG, "-v", "error", "-i", str(path), "-map", "0:a:0", "-c:a", "copy",
        "-f", "hash", "-hash", "sha256", "-"
    ], text=True).strip()


def faststart(path):
    boxes = []
    with path.open("rb") as handle:
        while True:
            header = handle.read(8)
            if len(header) != 8:
                break
            size, kind = struct.unpack(">I4s", header)
            header_size = 8
            if size == 1:
                size = struct.unpack(">Q", handle.read(8))[0]
                header_size = 16
            if size < header_size:
                break
            boxes.append(kind)
            handle.seek(size - header_size, 1)
    return b"moov" in boxes and b"mdat" in boxes and boxes.index(b"moov") < boxes.index(b"mdat")


def optimize(relative):
    source = ROOT / "public" / relative
    before = source.stat().st_size
    if before <= TARGET:
        return {"path": relative, "bytes": before, "skipped": True}
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
    job = WORK / f"{source.stem}-{digest}"
    job.mkdir(parents=True, exist_ok=True)
    backup = job / "before.mp4"
    if not backup.exists():
        shutil.copy2(source, backup)
    info = probe(backup)
    duration = float(info["format"]["duration"])
    audio = [s for s in info["streams"] if s["codec_type"] == "audio"]
    audio_bitrate = sum(int(s.get("bit_rate", 192000)) for s in audio)
    video_bitrate = int(TARGET * 8 / duration * 0.98 - audio_bitrate)
    if video_bitrate < 400000:
        raise RuntimeError(f"Audio leaves insufficient video budget: {relative}")
    output = job / "optimized.mp4"
    base = [
        FFMPEG, "-hide_banner", "-y", "-threads", "3", "-i", str(backup),
        "-map", "0:v:0", "-map_metadata", "-1",
        "-vf", "fps=24,scale=720:-2:flags=lanczos,setsar=1",
        "-c:v", "libx264", "-preset", "slow", "-threads", "3",
        "-b:v", str(video_bitrate), "-pix_fmt", "yuv420p",
        "-passlogfile", str(job / "x264-pass"),
    ]
    for phase in (1, 2):
        print(f"{source.name}: pass {phase}/2, video {video_bitrate // 1000} kb/s", flush=True)
        command = base + ["-pass", str(phase)]
        if phase == 1:
            command += ["-an", "-f", "null", os.devnull]
        else:
            command += ["-map", "0:a:0?", "-c:a", "copy", "-movflags", "+faststart", str(output)]
        with (job / f"pass-{phase}.log").open("w") as log:
            subprocess.run(command, stdout=log, stderr=log, check=True)
    after = output.stat().st_size
    converted = probe(output)
    new_duration = float(converted["format"]["duration"])
    if after >= LIMIT or abs(new_duration - duration) > 0.1 or not faststart(output):
        raise RuntimeError(f"Size, duration, or faststart validation failed: {relative}")
    preserved = not audio or audio_hash(backup) == audio_hash(output)
    if not preserved:
        raise RuntimeError(f"Audio changed: {relative}")
    subprocess.run([FFMPEG, "-v", "error", "-threads", "2", "-i", str(output), "-f", "null", "-"], check=True)
    temporary = source.with_suffix(".pending.mp4")
    shutil.copy2(output, temporary)
    temporary.replace(source)
    result = {
        "path": relative, "beforeBytes": before, "bytes": after,
        "beforeDuration": duration, "duration": new_duration,
        "width": 720, "height": converted["streams"][0]["height"], "fps": 24,
        "originalAudioPreserved": preserved, "fastStartVerified": True,
        "decodeVerified": True, "backup": str(backup.relative_to(ROOT)),
    }
    print(f"{source.name}: {before / 1024**2:.2f} -> {after / 1024**2:.2f} MiB", flush=True)
    return result


if __name__ == "__main__":
    WORK.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(optimize, FILES))
    report = ROOT / "artifacts/pages-media-report.json"
    report.parent.mkdir(exist_ok=True)
    report.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(f"Report: {report}", flush=True)
