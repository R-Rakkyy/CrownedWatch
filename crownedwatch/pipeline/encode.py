import json

from pathlib import Path

from .command import build, is_browser_safe, wants_low
from .probe import chapters, duration, main_video, of_type, probe
from .run import run
from .subtitles import styled, text_tracks


def _progress_reader(total: float, progress):
    def on_line(line: str):
        if progress and line.startswith("out_time_us=") and line[12:].isdigit():
            progress(int(line[12:])/1e6, total) # ffmpeg `out_time_us=` to seconds as progress

    return on_line


async def backfill(src: Path, out: Path, meta: dict) -> dict:
    info = await probe(src)

    meta.setdefault("chapters", chapters(info))
    meta["fonts"] = await styled(src, out, info["streams"], meta["subtitles"])

    return meta


async def process(src: Path, out: Path, progress=None) -> dict:
    out.mkdir(parents=True, exist_ok=True)

    info = await probe(src)
    streams = info["streams"]
    video = main_video(streams)

    if not video:
        raise ValueError("no video stream")

    cmd, audio_tracks = build(src, out, video, of_type(streams, "audio"), wants_low(info))

    await run(*cmd, on_line=_progress_reader(duration(info), progress)) # _progress_reader is called while ffmpeg is running

    subtitles, skipped = await text_tracks(src, out, streams)

    meta = {
        "duration": duration(info),
        "video_copied": is_browser_safe(video),
        "chapters": chapters(info),
        "audio": audio_tracks,
        "subtitles": subtitles,
        "skipped": skipped,
        "fonts": await styled(src, out, streams, subtitles),
    }
    (out/"meta.json").write_text(json.dumps(meta, indent=2))

    return meta
