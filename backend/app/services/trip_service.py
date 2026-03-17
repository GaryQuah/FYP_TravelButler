from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip, TripCreationRequest
from bson import ObjectId
from datetime import datetime
from app.services.user_service import get_user_by_email, get_users_by_ids
def trip_serializer(trip) -> dict:
    """
    Serializes a trip document from MongoDB into a dictionary,
    converting the database _id to a string-based trip_id.
    Note this is due to ObjectId from MongoDB not being JSON serializable, so we convert it to a string.
    """
    # Create a new list of chat messages with serialized timestamps
    chat_messages = trip.get("chat", [])
    serialized_chat = []
    if chat_messages:
        for message in chat_messages:
            new_message = message.copy()
            if 'timestamp' in new_message and isinstance(new_message['timestamp'], datetime):
                new_message['timestamp'] = new_message['timestamp'].isoformat()
            serialized_chat.append(new_message)

    return {
        "trip_id": str(trip["_id"]),
        "user_ids": trip["user_ids"],
        "itineraries": trip["itineraries"],
        "budget": trip["budget"],
        "trip_name": trip["trip_name"],
        "start_date": trip["start_date"],
        "end_date": trip["end_date"],
        "description": trip["description"],
        "chat": serialized_chat,
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

async def create_trip(collection: AsyncIOMotorCollection, trip_data: TripCreationRequest):
    """
    Create a new trip in the database from creation data.
    """
    # Convert the Pydantic model to a dictionary
    trip_dict = trip_data.dict()

    # Add fields not provided by the creation request
    trip_dict["itineraries"] = []
    trip_dict["chat"] = []

    # Now, insert the complete trip dictionary
    result = await collection.insert_one(trip_dict)
    
    # Fetch the newly created trip from the DB to return it
    created_trip = await collection.find_one({"_id": result.inserted_id})
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

async def add_chat_message(collection: AsyncIOMotorCollection, trip_id: str, user_id: str, message: str):
    """
    Add a chat message to a trip.
    """
    chat_message = {"user_id": user_id, "message": message, "timestamp": datetime.now()}

    result = await collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$push": {"chat": chat_message}}
    )

    if result.matched_count == 0:
        return None

    updated_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    return trip_serializer(updated_trip)

async def clear_chat(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Clear the chat history for a trip.
    """
    result = await collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"chat": []}}
    )

    if result.matched_count == 0:
        return None

    updated_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    return trip_serializer(updated_trip)