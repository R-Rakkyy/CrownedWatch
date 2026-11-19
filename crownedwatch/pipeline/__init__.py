"""
Source video into a HLS package (see ADR 0001).

out/master.m3u8     Max video (+ a Low video when the source is heavy) + one audio rendition per Audio track
out/sub_<n>.vtt     one WebVTT per text Subtitle track
out/sub_<n>.ass     the original SSA/ASS file of each such track (styles, typesetting), drawn by JASSUB
out/fonts/<k>.ttf   fonts embedded in the source, needed by those ASS files
out/meta.json       duration + chapters + track list, stored as the Media's Metadata
"""

from .encode import backfill, process

__all__ = ["backfill", "process"]
