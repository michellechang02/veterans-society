# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import users, posts, comments
from starlette.middleware.sessions import SessionMiddleware

import os
import logging


app = FastAPI(
    title="Veterans Society API",
    description="API for user registration and other functionalities.",
    version="1.0.0"
)


# CORS configuration
origins = [
    "https://veterans-society.vercel.app",
    "http://localhost:5173",
    "http://localhost:8000",  # Backend origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

secret_key = os.urandom(32).hex()
app.add_middleware(SessionMiddleware, secret_key=secret_key)

# Include routers
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)
 # Include other routers if necessary

logging.basicConfig(
    level=logging.INFO,  # Set to DEBUG to capture more details
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",

@app.get("/")
def read_root():
    return {"message": "Welcome to the Veterans Society API"}
