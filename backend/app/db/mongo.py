from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import DATABASE_NAME, MONGO_URL, USER_COLLECTION, TRIP_COLLECTION, ITINERARY_COLLECTION, CHAT_COLLECTION, BUDGET_COLLECTION

#TODO: add auto handling of collection checking instead of hardcoding if possible.x
collections_to_check = ["users", "events", "itineraries", "trips", "chats", "budgets"]

@asynccontextmanager
async def lifespan(app):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    pong = await db.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("MongoDB Atlas connection failed!")

    app.users_collection = db[USER_COLLECTION]
    app.trips_collection = db[TRIP_COLLECTION]
    app.itineraries_collection = db[ITINERARY_COLLECTION]
    app.chats_collection = db[CHAT_COLLECTION]
    app.budgets_collection = db[BUDGET_COLLECTION]

    #Check for collections in use
    existing_collections = await db.list_collection_names()
    for collection_name in collections_to_check:
        if collection_name not in existing_collections:
            print(f"missing collection: {collection_name}")
        else:
            print(f"Collection exists: {collection_name}")

    yield

    client.close()