from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient
import app.config as config
from app.config import DATABASE_NAME, MONGO_URL, USER_COLLECTION, TRIP_COLLECTION, ITINERARY_COLLECTION, CHAT_COLLECTION, BUDGET_COLLECTION, AVAILABILITY_COLLECTION, POLL_COLLECTION, INTEGRATIONS_COLLECTION, AI_CHAT_COLLECTION

collections_to_check = []
for name, value in vars(config).items():
    if name.endswith("_COLLECTION"):
        collections_to_check.append(value)

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
    app.availability_collection = db[AVAILABILITY_COLLECTION]
    app.polls_collection = db[POLL_COLLECTION]
    app.integrations_collection = db[INTEGRATIONS_COLLECTION]
    app.ai_chats_collection = db[AI_CHAT_COLLECTION]

    #Check for collections in use, debug purposes in console
    existing_collections = await db.list_collection_names()
    for collection_name in collections_to_check:
        if collection_name not in existing_collections:
            print(f"missing collection: {collection_name}")
        else:
            print(f"Collection exists: {collection_name}")

    yield

    client.close()