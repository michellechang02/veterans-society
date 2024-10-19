from fastapi import FastAPI
from .routers import users, items
from .internal import admin

app = FastAPI()

# Include routers from submodules
app.include_router(users.router)
app.include_router(items.router)

# Include internal admin routes (optional, could be for internal use)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}