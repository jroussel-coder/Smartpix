from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import signup, login  # assuming both export `router`

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(signup.router, prefix="/api")
app.include_router(login.router, prefix="/api")
