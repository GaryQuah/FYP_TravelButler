from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorCollection

def get_db(request: Request):
    return request.app.database

def get_users_collection(request: Request):
    return request.app.users_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

def get_itineraries_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.itineraries_collection

def get_chats_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.chats_collection

def get_ai_chats_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.ai_chats_collection

def get_budgets_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.budgets_collection

def get_polls_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.polls_collection

def get_availability_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.availability_collection

async def require_trip_member(
    trips_collection: AsyncIOMotorCollection, trip_id: str, user_id: str
) -> dict:
    try:
        trip = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid trip id",
        )

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    if user_id not in trip.get("user_ids", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this trip",
        )

    return trip

async def require_chat_member(
    chats_collection: AsyncIOMotorCollection,
    trips_collection: AsyncIOMotorCollection,
    chat_id: str,
    user_id: str,
) -> dict:
    try:
        chat = await chats_collection.find_one({"_id": ObjectId(chat_id)})
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat id",
        )

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    await require_trip_member(trips_collection, chat["trip_id"], user_id)
    return chat

async def require_ai_chat_member(
    ai_chats_collection: AsyncIOMotorCollection,
    trips_collection: AsyncIOMotorCollection,
    ai_chat_id: str,
    user_id: str,
) -> dict:
    try:
        ai_chat = await ai_chats_collection.find_one({"_id": ObjectId(ai_chat_id)})
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid AI chat id",
        )

    if not ai_chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    await require_trip_member(trips_collection, ai_chat["trip_id"], user_id)
    return ai_chat

async def require_tracker_member(
    availability_collection: AsyncIOMotorCollection,
    tracker_id: str,
    user_id: str,
) -> dict:
    try:
        tracker = await availability_collection.find_one({"_id": ObjectId(tracker_id)})
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tracker id",
        )

    if not tracker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracker not found",
        )

    if user_id not in tracker.get("user_ids", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this tracker",
        )

    return tracker

async def require_itinerary_member(
    itineraries_collection: AsyncIOMotorCollection,
    trips_collection: AsyncIOMotorCollection,
    itinerary_id: str,
    user_id: str,
) -> dict:
    try:
        itinerary = await itineraries_collection.find_one({"_id": ObjectId(itinerary_id)})
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid itinerary id",
        )

    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found",
        )

    await require_trip_member(trips_collection, itinerary["trip_id"], user_id)
    return itinerary