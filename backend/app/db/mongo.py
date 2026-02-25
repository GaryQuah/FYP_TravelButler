from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import DATABASE_NAME, MONGO_URL, USER_COLLECTION


@asynccontextmanager
async def lifespan(app):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    pong = await db.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("MongoDB Atlas connection failed!")

    app.users_collection = db[USER_COLLECTION]

    yield

    client.close()