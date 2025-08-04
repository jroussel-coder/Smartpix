from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from jose import jwt

from db import users_collection
from models.user import AuthRequest, AuthResponse
from utils.security import hash_password

load_dotenv()

router = APIRouter()

# Load JWT secret and config
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

@router.post("/signup", response_model=AuthResponse)
async def signup(data: AuthRequest):
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(data.password)
    user = {
        "email": data.email,
        "username": data.email.split("@")[0],
        "password_hash": hashed,
        "created_at": datetime.utcnow()
    }

    result = await users_collection.insert_one(user)
    user_id = str(result.inserted_id)

    # Create JWT token
    token_payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "email": data.email,
        "id": user_id,
        "token": token
    }
