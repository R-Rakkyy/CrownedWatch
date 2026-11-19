from pathlib import Path

from .probe import of_type, track
from .run import run

TEXT_SUBS = {"subrip", "srt", "ass", "ssa", "webvtt", "mov_text", "text"}
ASS = {"ass", "ssa"}
FONT_EXT = {".ttf", ".otf", ".ttc"}


async def _extract(src: Path, index: int, codec: str, dest: Path):
    await run(
        "ffmpeg", "-v", "error", "-y", "-i", str(src),
        "-map", f"0:s:{index}", "-c:s", codec, str(dest),
    )


async def text_tracks(src: Path, out: Path, streams: list[dict]) -> tuple[list[dict], list[dict]]:
    kept, skipped = [], []

    for index, stream in enumerate(of_type(streams, "subtitle")):
        info = track(stream, index)

        if stream["codec_name"] not in TEXT_SUBS:
            skipped.append(info)
            continue

        info["file"] = f"sub_{index}.vtt"
        await _extract(src, index, "webvtt", out/info["file"])
        kept.append(info)

    return kept, skipped


async def _ass_files(src: Path, out: Path, kept: list[dict]):
    for info in kept:
        if info["codec"] in ASS and "ass" not in info:
            info["ass"] = f"sub_{info['n']}.ass" # butt files
            await _extract(src, info["n"], "copy", out/info["ass"])


async def _dump_font(src: Path, dest: Path, index: int):
    await run(
        "ffmpeg", "-v", "error", "-y", f"-dump_attachment:t:{index}", str(dest),
        "-i", str(src), "-t", "0", "-f", "null", "-",
    )


async def _fonts(src: Path, out: Path, streams: list[dict]) -> list[str]:
    (out/"fonts").mkdir(exist_ok=True)
    fonts = []

    for index, stream in enumerate(of_type(streams, "attachment")):
        ext = Path(stream.get("tags", {}).get("filename", "")).suffix.lower()

        if ext in FONT_EXT:
            # named by position
            await _dump_font(src, out/"fonts"/f"{index}{ext}", index)
            fonts.append(f"fonts/{index}{ext}")

    return fonts


async def styled(src: Path, out: Path, streams: list[dict], kept: list[dict]) -> list[str]:
    await _ass_files(src, out, kept)

    if not any("ass" in info for info in kept):
        return [] # no ass :<

    return await _fonts(src, out, streams)
