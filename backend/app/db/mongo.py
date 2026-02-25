from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import DATABASE_NAME, MONGO_URL, USER_COLLECTION

collections_to_check = ["users", "events", "itineraries", "trips"]

@asynccontextmanager
async def lifespan(app):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    pong = await db.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("MongoDB Atlas connection failed!")

    app.users_collection = db[USER_COLLECTION]

    #Check for collections in use
    existing_collections = await db.list_collection_names()
    for collection_name in collections_to_check:
        if collection_name not in existing_collections:
            print(f"missing collection: {collection_name}")
        else:
            print(f"Collection exists: {collection_name}")

    yield

    client.close()