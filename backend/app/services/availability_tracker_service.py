from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.availability_tracker import AvailabilityTracker, AvailabilityTrackerCreationRequest
from bson import ObjectId
from app.services.user_service import get_user_by_email, get_users_by_ids

def tracker_serializer(tracker) -> dict:
    """
    Serializes an availability tracker document from MongoDB into a dictionary,
    converting the database _id to a string-based id.
    """
    return {
        "id": str(tracker["_id"]),
        "name": tracker["name"],
        "user_ids": tracker["user_ids"],
        "availability": tracker.get("availability", {}),
    }

async def get_all_trackers(collection: AsyncIOMotorCollection, user_id: str):
    """
    Retrieve all availability trackers for a specific user from the database.
    """
    trackers = []
    cursor = collection.find({"user_ids": user_id})
    async for tracker in cursor:
        trackers.append(tracker_serializer(tracker))
    return trackers

async def create_tracker(collection: AsyncIOMotorCollection, tracker_data: AvailabilityTrackerCreationRequest):
    """
    Create a new availability tracker in the database.
    """
    tracker_dict = tracker_data.dict()
    tracker_dict["availability"] = {} # Initialize with empty availability
    
    result = await collection.insert_one(tracker_dict)
    
    created_tracker = await collection.find_one({"_id": result.inserted_id})
    return tracker_serializer(created_tracker)

async def get_tracker(collection: AsyncIOMotorCollection, tracker_id: str):
    """
    Retrieve a single availability tracker by its ID.
    """
    tracker = await collection.find_one({"_id": ObjectId(tracker_id)})
    if tracker:
        return tracker_serializer(tracker)
    return None

async def delete_tracker(collection: AsyncIOMotorCollection, tracker_id: str):
    """
    Delete an availability tracker from the database.
    """
    result = await collection.delete_one({"_id": ObjectId(tracker_id)})
    return result.deleted_count > 0


async def update_tracker(collection: AsyncIOMotorCollection, tracker_id: str, tracker_data: AvailabilityTrackerCreationRequest):
    """
    Update an availability tracker's details in the database.
    """
    update_data = tracker_data.dict(exclude_unset=True)

    result = await collection.update_one(
        {"_id": ObjectId(tracker_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    updated_tracker = await get_tracker(collection, tracker_id)
    return updated_tracker


async def update_tracker_availability(collection: AsyncIOMotorCollection, tracker_id: str, user_id: str, dates: list[str]):
    """
    Update the available dates for a user within a specific tracker.
    """
    # Use the dot notation to update a specific field within the nested availability object
    update_field = f"availability.{user_id}"
    result = await collection.update_one(
        {"_id": ObjectId(tracker_id)},
        {"$set": {update_field: dates}}
    )
    
    if result.matched_count == 0:
        return None

    updated_tracker = await get_tracker(collection, tracker_id)
    return updated_tracker

async def get_tracker_members(
    collection: AsyncIOMotorCollection,
    users_collection: AsyncIOMotorCollection,
    tracker_id: str,
):
    """
    Retrieve all members for a specific availability tracker.
    """
    tracker = await collection.find_one({"_id": ObjectId(tracker_id)})
    if not tracker or "user_ids" not in tracker:
        return []
    users = await get_users_by_ids(users_collection, tracker["user_ids"])
    return users


async def add_user_to_tracker_by_email(
    trackers_collection: AsyncIOMotorCollection,
    users_collection: AsyncIOMotorCollection,
    tracker_id: str,
    user_email: str,
):
    """
    Find a user by email and add them to an availability tracker.
    """
    user = await get_user_by_email(users_collection, user_email)
    if not user:
        return None

    user_id = user["user_id"]

    result = await trackers_collection.update_one(
        {"_id": ObjectId(tracker_id)},
        {"$addToSet": {"user_ids": user_id}},
    )

    if result.matched_count == 0:
        return None

    updated_tracker = await trackers_collection.find_one(
        {"_id": ObjectId(tracker_id)}
    )
    return tracker_serializer(updated_tracker)