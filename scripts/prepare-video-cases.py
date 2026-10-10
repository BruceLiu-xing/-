#!/usr/bin/env python3
"""Create full-length browser-ready case studies from the supplied master files."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import os
import shutil
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get(
    "PORTFOLIO_FFMPEG",
    "/private/tmp/liuxing-media-tools/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg",
)
WORK = Path("/private/tmp/portfolio-video-cases")
OUT = ROOT / "public/media/video-cases"
CASES = [
    {
        "title": "东南亚人口贩卖升级",
        "slug": "fanmai-shengji",
        "source": "/Users/liuxing/Downloads/剪辑项目/成品/8月/贩卖升级.mp4",
        "sourceWidth": 4320,
        "sourceHeight": 7680,
        "duration": 199.98,
        "posterTime": 0.5,
    },
    {
        "title": "日本经济崩盘",
        "slug": "riben-pengpan",
        "source": "/Users/liuxing/Downloads/剪辑项目/成品/8月/日本碰盘.mp4",
        "sourceWidth": 2160,
        "sourceHeight": 3840,
        "duration": 212.35,
        "posterTime": 36,
    },
]


def prepare(case):
    slug = case["slug"]
    temporary_video = WORK / f"{slug}.mp4"
    log = WORK / f"{slug}.log"
    command = [
        FFMPEG, "-hide_banner", "-y", "-threads", "6", "-i", case["source"],
        "-map", "0:v:0", "-map", "0:a:0", "-map_metadata", "-1",
        "-vf", "fps=30,scale=900:1600:flags=lanczos,setsar=1",
        "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-threads", "4",
        "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart",
        str(temporary_video),
    ]
    print(f"Encoding {case['title']} ({case['duration']:.2f}s)", flush=True)
    with log.open("w") as handle:
        subprocess.run(command, stdout=handle, stderr=handle, check=True)
    shutil.copy2(temporary_video, OUT / temporary_video.name)
    jpeg = WORK / f"{slug}-poster.jpg"
    subprocess.run([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss",
        str(case["posterTime"]), "-i", str(temporary_video),
        "-frames:v", "1", "-q:v", "2", str(jpeg),
    ], check=True)
    poster = OUT / f"{slug}.webp"
    with Image.open(jpeg) as frame:
        frame.save(poster, "WEBP", quality=91, method=6)
    result = {
        **case,
        "src": f"/media/video-cases/{slug}.mp4",
        "poster": f"/media/video-cases/{slug}.webp",
        "width": 900,
        "height": 1600,
        "fps": 30,
        "videoCodec": "H.264",
        "audioCodec": "AAC (copied original stereo audio)",
        "bytes": temporary_video.stat().st_size,
        "posterBytes": poster.stat().st_size,
    }
    print(f"Ready {case['title']}: {result['bytes'] / 1024**2:.1f} MiB", flush=True)
    return result


if __name__ == "__main__":
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(prepare, CASES))
    manifest = ROOT / "artifacts/video-cases-manifest.json"
    manifest.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(f"Manifest: {manifest}", flush=True)
