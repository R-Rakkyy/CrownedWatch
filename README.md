# CrownedWatch

Heyah ! This is a small watch party website for me and my friend.

The Client part is pure HTML/CSS/JS. The Server Part is Python (FastAPI).

# Install (Docker)

    ./cw setup i.loveyou.com
    ./cw setup
    ./cw user 12a74n18 admin

Everything the site stores is in `data/` (users, library, videos, secret).

`./cw` lists the other helpers:
`update`, `logs`, `user NAME admin|guest` (also resets a Key), `backup`, `reset`, `down`.

# Notes
- Styled ASS subtitles are drawn by [JASSUB](https://github.com/ThaUnknown/jassub) (vendored in `static/vendor/jassub/`, LGPL).
- The site is Linux only, the `/status` page (monitoring) reads `/proc`.
- I use hls.min.js to play HLS streams.
