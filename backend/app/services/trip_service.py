from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip, TripCreationRequest
from bson import ObjectId

def trip_serializer(trip) -> dict:
    """
    Serializes a trip document from MongoDB into a dictionary,
    converting the database _id to a string-based trip_id.
    """
    return {
        "trip_id": str(trip["_id"]),
        "user_ids": trip["user_ids"],
        "itineraries": trip["itineraries"],
        "budget": trip["budget"],
        "trip_name": trip["trip_name"],
        "start_date": trip["start_date"],
        "end_date": trip["end_date"],
        "description": trip["description"],
    }

async def get_all_trips(collection: AsyncIOMotorCollection):
    """
    Retrieve all trips from the database.
    """
    trips = []
    cursor = collection.find({})
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

async def update_trip(collection: AsyncIOMotorCollection, trip_id: str, trip_data: Trip):
    """
    Update a trip's information.
    """
    trip_dict = trip_data.dict(exclude_unset=True)
    await collection.update_one({"_id": ObjectId(trip_id)}, {"$set": trip_dict})
    # Return the updated document
    updated_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    if updated_trip:
        return trip_serializer(updated_trip)
    return None

async def delete_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Delete a trip from the database.
    """
    result = await collection.delete_one({"_id": ObjectId(trip_id)})
    # The result object contains information about the deletion,
    # like `deleted_count`. We can return a boolean or the count.
    return result.deleted_count > 0