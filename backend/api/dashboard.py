from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from bson import ObjectId
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

from db import images_collection, edits_collection

router = APIRouter()

# ----- File paths -----
STATIC_DIR = "static"
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
EDIT_DIR = os.path.join(STATIC_DIR, "processed")

# ----- Auth config -----
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

BASE_URL = "http://localhost:8000"  # Change in production


# ----- Auth helper -----
async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ----- Get all user images -----
@router.get("/user-images/{user_id}")
async def get_user_images_by_id(user_id: str):
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    images_cursor = images_collection.find({"user_id": user_object_id})
    images = []

    async for image in images_cursor:
        edit = await edits_collection.find_one({"image_id": image["_id"]})
        images.append({
            "id": str(image["_id"]),
            "name": image.get("filename", "Unnamed"),
            "originalImageUrl": f"http://localhost:8000{image.get('original_url')}",
            "editedImageUrl": f"http://localhost:8000{edit.get('edited_url')}" if edit else None,
            "createdAt": image.get("uploaded_at") or (edit.get("edited_at") if edit else None),
            "editType": edit.get("edit_type") if edit else None
        })

    return images



# ----- Delete an image -----
@router.delete("/images/{image_id}")
async def delete_image(image_id: str, current_user: str = Depends(get_current_user)):
    try:
        image_object_id = ObjectId(image_id)
        user_object_id = ObjectId(current_user)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    image = await images_collection.find_one({"_id": image_object_id, "user_id": user_object_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    await images_collection.delete_one({"_id": image_object_id})
    await edits_collection.delete_many({"image_id": image_object_id})

    try:
        os.remove(os.path.join(UPLOAD_DIR, image["filename"]))
    except FileNotFoundError:
        pass

    return {"status": "deleted"}


# ----- Download edited image -----
@router.get("/images/{image_id}/download")
async def download_edited_image(image_id: str, current_user: str = Depends(get_current_user)):
    try:
        image_object_id = ObjectId(image_id)
        user_object_id = ObjectId(current_user)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    edit = await edits_collection.find_one({"image_id": image_object_id, "user_id": user_object_id})
    if not edit:
        raise HTTPException(status_code=404, detail="Edited image not found")

    filename = edit["edited_url"].split("/")[-1]
    filepath = os.path.join(EDIT_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(filepath, media_type="image/jpeg", filename=filename)


# ----- Download original image -----
@router.get("/images/{image_id}/original")
async def download_original_image(image_id: str, current_user: str = Depends(get_current_user)):
    try:
        image_object_id = ObjectId(image_id)
        user_object_id = ObjectId(current_user)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    image = await images_collection.find_one({"_id": image_object_id, "user_id": user_object_id})
    if not image:
        raise HTTPException(status_code=404, detail="Original image not found")

    filename = image["filename"]
    filepath = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(filepath, media_type="image/png", filename=filename)
