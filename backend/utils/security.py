from passlib.hash import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(plain_password: str, hashed: str) -> bool:
    return bcrypt.verify(plain_password, hashed)
