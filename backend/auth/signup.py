from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from db import users_collection
from models.user import AuthRequest, AuthResponse
from utils.security import hash_password

router = APIRouter()

@router.post("/signup", response_model=AuthResponse)
async def signup(data: AuthRequest):
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = uuid.uuid4().hex
    user = {
        "_id": user_id,
        "username": data.email.split("@")[0],
        "email": data.email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.utcnow()
    }

    await users_collection.insert_one(user)
    return {"email": data.email, "id": user_id}
