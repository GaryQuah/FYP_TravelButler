from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.itinerary import Itinerary, ItineraryCreationRequest
from bson import ObjectId

async def get_itineraries_by_ids(collection: AsyncIOMotorCollection, itinerary_ids: list[str]):
    """
    Retrieve itineraries by a list of IDs.
    """
    itineraries = []
    # convert itinerary_ids to ObjectIds
    object_ids = [ObjectId(id) for id in itinerary_ids]
    cursor = collection.find({"_id": {"$in": object_ids}})

    async for itinerary in cursor:
        itineraries.append(itinerary_serializer(itinerary))
    return itineraries

def itinerary_serializer(itinerary) -> dict:
    """
    Serializes an itinerary document from MongoDB into a dictionary,
    converting the database _id to a string-based id.
    """
    return {
        "id": str(itinerary["_id"]),
        "trip_id": itinerary["trip_id"],
        "activity_name": itinerary["activity_name"],
        "start_time": itinerary["start_time"],
        "end_time": itinerary["end_time"],
        "description": itinerary["description"],
    }

async def create_itinerary(
    itineraries_collection: AsyncIOMotorCollection, 
    trips_collection: AsyncIOMotorCollection, 
    trip_id: str, 
    itinerary_data: ItineraryCreationRequest
):
    """
    Create a new itinerary in the database linked to a trip.
    """
    itinerary_dict = itinerary_data.dict()
    itinerary_dict["trip_id"] = trip_id
    
    result = await itineraries_collection.insert_one(itinerary_dict)
    
    created_itinerary = await itineraries_collection.find_one({"_id": result.inserted_id})

    # Add the new itinerary's ID to the trip's itinerary_ids list
    await trips_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$push": {"itinerary_ids": str(created_itinerary["_id"])}}
    )

    return itinerary_serializer(created_itinerary)

async def get_itineraries_for_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Retrieve all itineraries for a specific trip.
    """
    itineraries = []
    cursor = collection.find({"trip_id": trip_id})
    async for itinerary in cursor:
        itineraries.append(itinerary_serializer(itinerary))
    return itineraries


async def delete_itinerary(
    itineraries_collection: AsyncIOMotorCollection, 
    trips_collection: AsyncIOMotorCollection, 
    trip_id: str, 
    itinerary_id: str
) -> bool:
    """
    Delete an itinerary item from the database.
    """
    # Remove the itinerary ID from the trip's list
    await trips_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$pull": {"itinerary_ids": itinerary_id}}
    )

    result = await itineraries_collection.delete_one(
        {"_id": ObjectId(itinerary_id), "trip_id": trip_id}
    )
    return result.deleted_count > 0