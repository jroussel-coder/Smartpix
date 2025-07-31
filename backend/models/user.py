from pydantic import BaseModel, EmailStr

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    email: EmailStr
    id: str
