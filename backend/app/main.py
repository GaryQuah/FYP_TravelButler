import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

# ---------- Load env ----------
load_dotenv()  # loads variables from .env

MONGO_URL = os.environ["MONGO_URL"]
DATABASE_NAME = os.environ.get("DATABASE_NAME", "travelmate_db")
COLLECTION_NAME = os.environ.get("COLLECTION_NAME", "travelmate_collection")
DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}

# ---------- Helper ----------
def user_serializer(user) -> dict:
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }

# ---------- Request Models ----------
class User(BaseModel):
    name: str
    email: EmailStr

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    # Ping to ensure connection
    pong = await db.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("MongoDB Atlas connection failed!")

    # Attach collection to app
    app.users_collection = db[COLLECTION_NAME]

    yield  # app ready

    # Close connection on shutdown
    client.close()

# ---------- App ----------
app = FastAPI(lifespan=lifespan, debug=DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- CRUD Routes ----------
@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    existing_user = await app.users_collection.find_one({"email": user.email})
    if existing_user:
        return user_serializer(existing_user)

    result = await app.users_collection.insert_one(user.dict())
    new_user = await app.users_collection.find_one({"_id": result.inserted_id})
    return user_serializer(new_user)

@app.get("/users/{email}")
async def get_user(email: str):
    user = await app.users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_serializer(user)

@app.put("/users/{user_id}")
async def update_user(user_id: str, data: UpdateUserRequest):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await app.users_collection.update_one(
        {"_id": ObjectId(user_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await app.users_collection.find_one({"_id": ObjectId(user_id)})
    return user_serializer(updated_user)

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    result = await app.users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# ---------- Run ----------
def main(argv=sys.argv[1:]):
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=3001, reload=DEBUG)

if __name__ == "__main__":
    main()
