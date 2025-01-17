# api/main.py
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import login_manager
from api.routers import users, posts, comments, chat, jobs
from starlette.middleware.sessions import SessionMiddleware
import os
import nest_asyncio

# Load env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
os.environ["UVLOOP_DISABLE"] = os.getenv("UVLOOP_DISABLE", "1")
os.environ["PYTHONASYNCIODEBUG"] = os.getenv("PYTHONASYNCIODEBUG", "1")

print("PYTHONASYNCIODEBUG:", os.getenv("PYTHONASYNCIODEBUG"))
print("UVLOOP_DISABLE:", os.getenv("UVLOOP_DISABLE"))

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
app.include_router(chat.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(jobs.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Veterans Society API"}
