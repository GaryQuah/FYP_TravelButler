from bson import ObjectId


def user_serializer(user) -> dict:
    """
    Serializes a user document from MongoDB into a dictionary,
    converting the database _id to a string-based trip_id.
    Note this is due to ObjectId from MongoDB not being JSON serializable, so we convert it to a string.
    """
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }


async def create_user(users_collection, user):
    """
    Create: A new user in the database from "user" data in the "users_collection". 
    Return: The created user with the generated ID from MongoDB.
    """

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        return user_serializer(existing_user)

    result = await users_collection.insert_one(user.dict())
    # Fetch the newly created user to return it with the generated ID from MongoDB
    new_user = await users_collection.find_one({"_id": result.inserted_id})
    return user_serializer(new_user)


async def get_user_by_email(users_collection, email: str):
    user = await users_collection.find_one({"email": email})
    if not user:
        return None
    return user_serializer(user)


async def update_user(users_collection, user_id: str, update_data: dict):
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        return None

    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    return user_serializer(updated_user)


async def find_or_create_user(users_collection, email: str, name: str | None = None):
    """
    Finds a user by email. If the user doesn't exist, it creates a new one.
    """
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        return user_serializer(existing_user)

    # If user does not exist, create them
    new_user_data = {"email": email, "name": name}
    result = await users_collection.insert_one(new_user_data)
    new_user = await users_collection.find_one({"_id": result.inserted_id})
    return user_serializer(new_user)

async def get_users_by_ids(users_collection, user_ids: list[str]):
    """
    Retrieve multiple users by a list of their document IDs.
    """
    user_object_ids = [ObjectId(user_id) for user_id in user_ids]
    users_cursor = users_collection.find({"_id": {"$in": user_object_ids}})
    users = await users_cursor.to_list(length=len(user_ids))
    return [user_serializer(user) for user in users]