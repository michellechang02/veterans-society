# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import login_manager
from api.routers import users, posts, comments, chat, groups, donations
from starlette.middleware.sessions import SessionMiddleware
import os

app = FastAPI(
    title="Veterans Society API",
    description="API for user registration and other functionalities.",
    version="1.0.0"
)

# CORS configuration AKA where API calls are made
origins = [
    "https://veterans-society.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(groups.router)
app.include_router(donations.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Veterans Society API"}
