from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import signup, login 
from fastapi.staticfiles import StaticFiles 
from api import editor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(signup.router, prefix="/api")
app.include_router(login.router, prefix="/api")
app.include_router(editor.router, prefix="/api")
