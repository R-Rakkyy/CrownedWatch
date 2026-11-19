from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text()


def _kilobytes(value: str) -> int:
    return int(value.split()[0]) * 1024


def memory() -> dict:
    lines = read("/proc/meminfo").splitlines()
    values = {key: _kilobytes(value) for key, value in (line.split(":") for line in lines)}

    return {
        "total": values["MemTotal"],
        "available": values["MemAvailable"],
        "swap_total": values["SwapTotal"],
        "swap_free": values["SwapFree"],
    }


def cpu() -> dict:
    ticks = list(map(int, read("/proc/stat").splitlines()[0].split()[1:]))

    return {"total": sum(ticks[:8]), "idle": ticks[3] + ticks[4]}


def network() -> dict:
    interfaces = {}

    for line in read("/proc/net/dev").splitlines()[2:]:
        name, rest = line.split(":")
        values = rest.split()

        if name.strip() != "lo":
            interfaces[name.strip()] = {"rx": int(values[0]), "tx": int(values[8])}

    return interfaces


def uptime() -> float:
    return float(read("/proc/uptime").split()[0])


def this_process() -> dict:
    fields = dict(line.split(":", 1) for line in read("/proc/self/status").splitlines())

    return {"rss": _kilobytes(fields["VmRSS"]), "threads": int(fields["Threads"])}
