from fastapi import APIRouter, HTTPException
from db import users_collection
from models.user import AuthRequest, AuthResponse
from utils.security import verify_password

router = APIRouter()

@router.post("/login", response_model=AuthResponse)
async def login(data: AuthRequest):
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"email": user["email"], "id": user["_id"]}
