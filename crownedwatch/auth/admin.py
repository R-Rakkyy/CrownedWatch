from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from . import users
from .session import admin

router = APIRouter(prefix="/api/users")


class NewUser(BaseModel):
    name: str
    role: str


@router.get("")
def listing(_=Depends(admin)):
    return users.listing()


@router.post("")
def save(body: NewUser, _=Depends(admin)):
    try:
        return {"key": users.add(body.name, body.role)}
    except ValueError as error:
        raise HTTPException(400, str(error))


@router.delete("/{name}")
def delete(name: str, _=Depends(admin)):
    try:
        users.remove(name)
    except KeyError:
        raise HTTPException(404)
    except ValueError as error:
        raise HTTPException(400, str(error))
