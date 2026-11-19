from pathlib import Path

from .probe import track

SEGMENT_SECONDS = 6

LOW_HEIGHT, LOW_KBPS = 720, 2000
LOW_WORTH = 3_500_000

def is_browser_safe(video: dict) -> bool:
    return video["codec_name"] == "h264" and video.get("pix_fmt") == "yuv420p"


def wants_low(info: dict) -> bool:
    bitrate = str(info["format"].get("bit_rate", ""))

    return not bitrate.isdigit() or int(bitrate) > LOW_WORTH


def _x264(output: int, crf: int, *extra: str) -> list[str]:
    return [
        f"-c:v:{output}", "libx264",
        f"-pix_fmt:v:{output}", "yuv420p",
        f"-preset:v:{output}", "slow",
        f"-crf:v:{output}", str(crf),
        f"-force_key_frames:v:{output}", f"expr:gte(t,n_forced*{SEGMENT_SECONDS})",
        *extra,
    ]


def _video(copy: bool, low: bool) -> list[str]:
    args = ["-map", "0:v:0"]
    args += ["-c:v:0", "copy"] if copy else _x264(0, 16)

    if low:
        args += [
            "-map", "0:v:0",
            *_x264(
                1, 22,
                "-maxrate:v:1", f"{LOW_KBPS}k",
                "-bufsize:v:1", f"{2 * LOW_KBPS}k",
                "-filter:v:1", f"scale=-2:'min({LOW_HEIGHT},ih)'",
            ),
        ]

    return args


def _audio_codec(index: int, stream: dict) -> list[str]:
    if stream["codec_name"] == "aac":
        return [f"-c:a:{index}", "copy"]

    return [f"-c:a:{index}", "aac", f"-b:a:{index}", "256k", f"-ac:a:{index}", "2"]


def _audio(streams: list[dict]) -> tuple[list[str], list[str], list[dict]]:
    args, entries, tracks = [], [], []

    for index, stream in enumerate(streams):
        info = track(stream, index)
        label = info["lang"] if info["lang"].isalpha() else "und"
        first = ",default:yes" if index == 0 else ""

        args += ["-map", f"0:a:{index}", *_audio_codec(index, stream)]
        entries.append(f"a:{index},agroup:aud,language:{label},name:a{index}{first}")
        tracks.append(info)

    return args, entries, tracks


def _hls(out: Path, stream_map: list[str]) -> list[str]:
    return [
        "-f", "hls",
        "-hls_time", str(SEGMENT_SECONDS),
        "-hls_playlist_type", "vod",
        "-hls_segment_type", "fmp4",
        "-master_pl_name", "master.m3u8",
        "-hls_segment_filename", str(out/"%v_%05d.m4s"),
        "-var_stream_map", " ".join(stream_map),
        str(out/"%v.m3u8"),
    ]


def build(src: Path, out: Path, video: dict, audio: list[dict], low: bool):
    audio_args, audio_entries, audio_tracks = _audio(audio)
    group = ",agroup:aud" if audio else ""  # a Media may have no sound
    video_entries = [f"v:0{group},name:video"] + ([f"v:1{group},name:low"] if low else [])

    cmd = [
        "ffmpeg", "-v", "error", "-y", "-progress", "pipe:1", "-nostats", "-i", str(src),
        *_video(is_browser_safe(video), low),
        *audio_args,
        *_hls(out, video_entries + audio_entries),
    ]

    return cmd, audio_tracks
