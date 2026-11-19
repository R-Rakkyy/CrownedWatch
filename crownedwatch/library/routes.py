from fastapi import APIRouter

from . import browse, download, edit, jobs, progress, remove, upload

router = APIRouter(prefix="/api")

for module in (browse, edit, upload, jobs, remove, download, progress):
    router.include_router(module.router)
