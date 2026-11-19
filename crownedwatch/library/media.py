from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..auth.session import user
from ..config import MEDIA

router = APIRouter()


@router.get("/media/{media_id}/{path:path}")
def serve(media_id: int, path: str, _=Depends(user)):
    base = (MEDIA/str(media_id)/"hls").resolve()
    file = (base/path).resolve()

    if base not in file.parents or not file.is_file():
        raise HTTPException(404)

    return FileResponse(file)
