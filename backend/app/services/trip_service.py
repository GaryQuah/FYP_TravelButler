from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip, TripCreationRequest
from bson import ObjectId
from datetime import datetime
from app.services.user_service import get_user_by_email, get_users_by_ids
from app.services.chat_service import create_chat
def trip_serializer(trip) -> dict:
    """
    Serializes a trip document from MongoDB into a dictionary,
    converting the database _id to a string-based trip_id.
    Note this is due to ObjectId from MongoDB not being JSON serializable, so we convert it to a string.
    """
    # Create a new list of chat messages with serialized timestamps

    return {
        "trip_id": str(trip["_id"]),
        "user_ids": trip["user_ids"],
        "itinerary_ids": trip.get("itinerary_ids", []),
        "budget": trip["budget"],
        "trip_name": trip["trip_name"],
        "start_date": trip["start_date"],
        "end_date": trip["end_date"],
        "description": trip["description"],
        "chat_id": trip.get("chat_id"),
    }

async def get_all_trips(collection: AsyncIOMotorCollection, user_id: str):
    """
    Retrieve all trips for a specific user from the database.
    """
    trips = []
    # Find trips where the user_id is in the user_ids array
    cursor = collection.find({"user_ids": user_id})
    async for trip in cursor:
        trips.append(trip_serializer(trip))
    return trips

async def create_trip(trips_collection: AsyncIOMotorCollection, chats_collection: AsyncIOMotorCollection, trip_data: TripCreationRequest):
    """
    Create a new trip in the database from creation data.
    """
    # Convert the Pydantic model to a dictionary
    trip_dict = trip_data.dict()

    # Add fields not provided by the creation request
    trip_dict["itinerary_ids"] = []
    
    # Now, insert the complete trip dictionary
    result = await trips_collection.insert_one(trip_dict)
    
    # Create a chat for the new trip
    chat_id = await create_chat(chats_collection, str(result.inserted_id))
    
    # Update the trip with the new chat_id
    await trips_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"chat_id": chat_id}}
    )

    # Fetch the newly created trip from the DB to return it
    created_trip = await trips_collection.find_one({"_id": result.inserted_id})
    return trip_serializer(created_trip)

async def get_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Retrieve a single trip by its ID.
    """
    trip = await collection.find_one({"_id": ObjectId(trip_id)})
    if trip:
        return trip_serializer(trip)
        
    return None

async def get_trip_members(trips_collection: AsyncIOMotorCollection, users_collection: AsyncIOMotorCollection, trip_id: str):
    """
    Retrieve all members for a specific trip.
    """
    trip = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    if not trip or "user_ids" not in trip:
        return []
    users = await get_users_by_ids(users_collection, trip["user_ids"])
    return users

async def update_trip(collection: AsyncIOMotorCollection, trip_id: str, trip_data: Trip):
    """
    Update a trip's information.
    """
    trip_dict = trip_data.dict(exclude_unset=True)
    await collection.update_one({"_id": ObjectId(trip_id)}, {"$set": trip_dict})
    updated_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    if updated_trip:
        return trip_serializer(updated_trip)
    return None

async def delete_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Delete a trip from the database.
    """
    result = await collection.delete_one({"_id": ObjectId(trip_id)})
    return result.deleted_count > 0


async def add_user_to_trip_by_email(trips_collection: AsyncIOMotorCollection, users_collection: AsyncIOMotorCollection, trip_id: str, user_email: str):
    """
    Find a user by email and add them to a trip.
    """
    user = await get_user_by_email(users_collection, user_email)
    if not user:
        return None  

    user_id = user["user_id"]
    
    result = await trips_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$addToSet": {"user_ids": user_id}}  # Use $addToSet to avoid duplicate IDs
    )

    if result.matched_count == 0:
        return None  

    updated_trip = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    return trip_serializer(updated_trip)