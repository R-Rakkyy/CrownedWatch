from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import RedirectResponse

from . import throttle, users
from .session import user

router = APIRouter()


@router.post("/login")
def login(request: Request, name: str = Form(), key: str = Form()):
    client_ip = request.client.host if request.client else "?"

    if throttle.blocked(client_ip):
        return RedirectResponse("/login?error=2", 303)

    role = users.verify(name, key)

    if not role:
        throttle.failed(client_ip)
        return RedirectResponse("/login?error=1", 303)

    throttle.forget(client_ip)
    request.session["user"] = {"name": name, "role": role}

    return RedirectResponse("/", 303)


@router.post("/logout")
def logout(request: Request):
    request.session.clear()

    return RedirectResponse("/login", 303)


@router.get("/api/me")
def me(current_user: dict = Depends(user)):
    return current_user
