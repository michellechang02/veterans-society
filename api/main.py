# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import users  # Assuming you have other routers like items
import os

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

# Include routers
app.include_router(users.router)
# app.include_router(items.router)  # Include other routers if necessary

@app.get("/")
def read_root():
    return {"message": "Welcome to the Veterans Society API"}
