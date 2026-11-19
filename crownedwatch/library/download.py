from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..auth.session import admin
from ..db import get_db
from .tree import node

router = APIRouter()


@router.get("/nodes/{node_id}/download")
def download(node_id: int, _=Depends(admin), db=Depends(get_db)):
    found_node = node(db, node_id)

    if not found_node["file_path"]:
        raise HTTPException(404, "archived")

    path = Path(found_node["file_path"])

    return FileResponse(path, filename=f"{found_node['name']}{path.suffix}")
