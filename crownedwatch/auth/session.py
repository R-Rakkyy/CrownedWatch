from fastapi import Depends, HTTPException, Request

from . import users


def current(session) -> dict | None:
    stored = session.get("user")
    role = stored and users.role(stored["name"])

    return {"name": stored["name"], "role": role} if role else None


def user(request: Request) -> dict:
    session_user = current(request.session)

    if not session_user:
        raise HTTPException(401)

    return session_user


def admin(session_user: dict = Depends(user)) -> dict:
    if session_user["role"] != "admin":
        raise HTTPException(403)

    return session_user
