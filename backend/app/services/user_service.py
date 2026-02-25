from bson import ObjectId


def user_serializer(user) -> dict:
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }


async def create_user(users_collection, user):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        return user_serializer(existing_user)

    result = await users_collection.insert_one(user.dict())
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