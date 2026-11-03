from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import DATABASE_NAME, MONGO_URL, USER_COLLECTION, TRIP_COLLECTION, ITINERARY_COLLECTION, CHAT_COLLECTION, BUDGET_COLLECTION, AVAILABILITY_COLLECTION, POLL_COLLECTION, INTEGRATIONS_COLLECTION, AI_CHAT_COLLECTION, DOCUMENT_COLLECTION

@asynccontextmanager
async def lifespan(app):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    pong = await db.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("MongoDB Atlas connection failed!")

    app.database = db
    app.users_collection = db[USER_COLLECTION]
    app.trips_collection = db[TRIP_COLLECTION]
    app.itineraries_collection = db[ITINERARY_COLLECTION]
    app.chats_collection = db[CHAT_COLLECTION]
    app.budgets_collection = db[BUDGET_COLLECTION]
    app.availability_collection = db[AVAILABILITY_COLLECTION]
    app.polls_collection = db[POLL_COLLECTION]
    app.integrations_collection = db[INTEGRATIONS_COLLECTION]
    app.ai_chats_collection = db[AI_CHAT_COLLECTION]
    app.documents_collection = db[DOCUMENT_COLLECTION]

    yield

    client.close()