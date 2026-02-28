from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.itinerary import Itinerary, ItineraryCreationRequest
from bson import ObjectId

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

async def create_itinerary(collection: AsyncIOMotorCollection, trip_id: str, itinerary_data: ItineraryCreationRequest):
    """
    Create a new itinerary in the database linked to a trip.
    """
    itinerary_dict = itinerary_data.dict()
    itinerary_dict["trip_id"] = trip_id
    
    result = await collection.insert_one(itinerary_dict)
    
    created_itinerary = await collection.find_one({"_id": result.inserted_id})
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