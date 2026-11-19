import json

from pathlib import Path

from .run import run


async def probe(src: Path) -> dict:
    out = await run(
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", "-show_chapters", str(src),
    )

    return json.loads(out)


def duration(info: dict) -> float:
    return float(info["format"].get("duration", 0))


def main_video(streams: list[dict]) -> dict | None:
    for stream in streams:
        is_cover = stream.get("disposition", {}).get("attached_pic")

        if stream["codec_type"] == "video" and not is_cover:
            return stream


def of_type(streams: list[dict], kind: str) -> list[dict]:
    return [stream for stream in streams if stream["codec_type"] == kind]


def track(stream: dict, index: int) -> dict:
    tags = stream.get("tags", {})

    return {
        "n": index,  # position among the streams of its kind; stored in meta.json
        "codec": stream["codec_name"],
        "lang": tags.get("language", "und").lower(),
        "title": tags.get("title", ""),
        "channels": stream.get("channels"),
    }


def chapters(info: dict) -> list[dict]:
    return [
        {
            "start": float(chapter["start_time"]),
            "title": chapter.get("tags", {}).get("title") or f"Chapter {index + 1}",
        }
        for index, chapter in enumerate(info.get("chapters", []))
    ]
