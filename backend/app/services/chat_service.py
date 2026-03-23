from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.chat import Chat, Message
from bson import ObjectId
from datetime import datetime

def chat_serializer(chat) -> dict:
    """
    Serializes a chat document from MongoDB into a dictionary.
    """
    return {
        "chat_id": str(chat["_id"]),
        "trip_id": chat["trip_id"],
        "messages": [
            {
                "user_id": msg["user_id"],
                "message": msg["message"],
                "timestamp": msg["timestamp"].isoformat() if isinstance(msg.get("timestamp"), datetime) else msg.get("timestamp")
            } for msg in chat.get("messages", [])
        ]
    }

async def create_chat(collection: AsyncIOMotorCollection, trip_id: str) -> str:
    """
    Create a new chat for a trip.
    """
    chat_data = Chat(trip_id=trip_id)
    chat_dict = chat_data.dict()
    result = await collection.insert_one(chat_dict)
    return str(result.inserted_id)

async def get_chat_by_id(collection: AsyncIOMotorCollection, chat_id: str):
    """
    Retrieve a chat by its ID.
    """
    chat = await collection.find_one({"_id": ObjectId(chat_id)})
    if chat:
        return chat_serializer(chat)
    return None

async def add_message_to_chat(collection: AsyncIOMotorCollection, chat_id: str, user_id: str, message: str):
    """
    Add a message to a chat.
    """
    message_data = Message(user_id=user_id, message=message)
    # Pydantic v2 doesn't have .dict(), it's .model_dump()
    try:
        message_dict = message_data.model_dump()
    except AttributeError:
        message_dict = message_data.dict()


    result = await collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$push": {"messages": message_dict}}
    )

    if result.matched_count == 0:
        return None

    updated_chat = await collection.find_one({"_id": ObjectId(chat_id)})
    return chat_serializer(updated_chat)

async def clear_chat_messages(collection: AsyncIOMotorCollection, chat_id: str):
    """
    Clear the messages for a chat.
    """
    result = await collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"messages": []}}
    )

    if result.matched_count == 0:
        return None

    updated_chat = await collection.find_one({"_id": ObjectId(chat_id)})
    return chat_serializer(updated_chat)
