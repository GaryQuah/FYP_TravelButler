from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip

async def get_all_trips(collection: AsyncIOMotorCollection):
    """
    Retrieve all trips from the database.
    """
    trips = []
    cursor = collection.find({})
    async for trip in cursor:
        trips.append(Trip(**trip))
    return trips

async def create_trip(collection: AsyncIOMotorCollection, trip: Trip):
    """
    Create a new trip in the database.
    """
    trip_dict = trip.dict()
    result = await collection.insert_one(trip_dict)
    # It's good practice to return the created object,
    # potentially fetching it back from the DB to confirm creation.
    created_trip = await collection.find_one({"_id": result.inserted_id})
    return created_trip

async def get_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Retrieve a single trip by its ID.
    """
    # In MongoDB, the primary key is _id. If you are using a custom trip_id,
    # you would query on that field instead. Assuming trip_id is the primary identifier.
    return await collection.find_one({"trip_id": trip_id})

async def update_trip(collection: AsyncIOMotorCollection, trip_id: str, trip_data: Trip):
    """
    Update a trip's information.
    """
    trip_dict = trip_data.dict(exclude_unset=True)
    await collection.update_one({"trip_id": trip_id}, {"$set": trip_dict})
    # Return the updated document
    return await collection.find_one({"trip_id": trip_id})

async def delete_trip(collection: AsyncIOMotorCollection, trip_id: str):
    """
    Delete a trip from the database.
    """
    result = await collection.delete_one({"trip_id": trip_id})
    # The result object contains information about the deletion,
    # like `deleted_count`. We can return a boolean or the count.
    return result.deleted_count > 0
