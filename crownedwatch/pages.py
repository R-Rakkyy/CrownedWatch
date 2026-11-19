from fastapi import APIRouter
from fastapi.responses import FileResponse, RedirectResponse
from starlette.requests import Request

from .auth.session import current

router = APIRouter()


@router.get("/login")
def login_page():
    return FileResponse("static/pages/login.html")


def page(name: str, role: str | None = None):
    def handler(request: Request):
        user = current(request.session)

        if not user:
            return RedirectResponse("/login")

        if role not in (None, user["role"]):
            return RedirectResponse("/")

        return FileResponse(f"static/pages/{name}.html")

    return handler


router.get("/")(page("index"))                  # Medias librairy
router.get("/watch")(page("watch"))             # Media player
router.get("/users")(page("users", "admin"))    # user management
router.get("/status")(page("status", "admin"))  # status page
