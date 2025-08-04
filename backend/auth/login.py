#login.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from bson import ObjectId
from datetime import datetime
import shutil, os
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
import sys
from db import images_collection, edits_collection
from utils.image_ai import process_image

load_dotenv()

router = APIRouter()

# JWT secret key
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

STATIC_DIR = "static"
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
EDIT_DIR = os.path.join(STATIC_DIR, "processed")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EDIT_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    filename = file.filename
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_doc = {
        "user_id": user_object_id,
        "original_url": f"/static/uploads/{filename}",
        "filename": filename,
        "uploaded_at": datetime.utcnow(),
        "tags": []
    }
    result = await images_collection.insert_one(image_doc)
    return {"image_id": str(result.inserted_id), "url": image_doc["original_url"]}

@router.post("/edit")
async def edit_image(
    image_id: str = Form(...),
    edit_type: str = Form(...),
    intensity: int = Form(...),
    user_id: str = Form(...)
):
    try:
        user_object_id = ObjectId(user_id)
        image_object_id = ObjectId(image_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ObjectId")

    image_doc = await images_collection.find_one({"_id": image_object_id})
    if not image_doc:
        raise HTTPException(status_code=404, detail="Image not found")

    input_path = os.path.join(UPLOAD_DIR, image_doc['filename'])
    output_filename = f"{ObjectId()}.jpg"
    output_path = os.path.join(EDIT_DIR, output_filename)

    process_image(input_path, output_path, edit_type, intensity)

    edit_doc = {
        "user_id": user_object_id,
        "image_id": image_object_id,
        "edit_type": edit_type,
        "intensity": intensity,
        "edited_url": f"/static/processed/{output_filename}",
        "created_at": datetime.utcnow()
    }
    await edits_collection.insert_one(edit_doc)
    return {"edited_url": edit_doc["edited_url"]}
