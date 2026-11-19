FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY crownedwatch crownedwatch
COPY static static
ENV PATH=/app/.venv/bin:$PATH CROWNED_DATA=/data

# Caddy is the only client, in another container: trust its forwarded headers
CMD ["uvicorn", "crownedwatch.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
