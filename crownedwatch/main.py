from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from . import pages
from .auth import admin, login
from .config import HTTPS_ONLY, secret_key
from .library import jobs, media, routes
from .party import socket
from .status import api

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=secret_key(),
    same_site="lax",
    max_age=60 * 60 * 24 * 30,
    https_only=HTTPS_ONLY,
)

jobs.fail_interrupted()

for module in (pages, login, admin, routes, media, api, socket):
    app.include_router(module.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
