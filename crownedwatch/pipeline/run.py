import asyncio

PIPE = asyncio.subprocess.PIPE


def _niced(cmd: tuple[str, ...]) -> tuple[str, ...]:
    # lowest priority: transcoding must not ANIHILIATE the site and the Party
    return ("nice", "-n", "19", *cmd) if cmd[0] == "ffmpeg" else cmd


async def _read_lines(process, on_line) -> tuple[bytes, bytes]:
    errors = asyncio.create_task(process.stderr.read())

    async for raw in process.stdout:
        on_line(raw.decode().strip())

    await process.wait()

    return b"", await errors


async def run(*cmd: str, on_line=None) -> str:
    process = await asyncio.create_subprocess_exec(*_niced(cmd), stdout=PIPE, stderr=PIPE)

    if on_line:
        out, err = await _read_lines(process, on_line) # _read_lines while running, parses output lines
    else:
        out, err = await process.communicate()

    if process.returncode:
        raise RuntimeError(f"{cmd[0]} failed: {err.decode()[-1500:]}")

    return out.decode()
