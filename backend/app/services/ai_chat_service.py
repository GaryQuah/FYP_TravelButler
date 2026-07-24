from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.chat import Chat, Message
from bson import ObjectId
from datetime import datetime

def ai_chat_serializer(chat) -> dict:
    """
    Serializes a chat document from MongoDB into a dictionary.
    """
    return {
        "ai_chat_id": str(chat["_id"]),
        "trip_id": chat["trip_id"],
        "messages": [
            {
                "user_id": msg["user_id"],
                "message": msg["message"],
                "timestamp": msg["timestamp"].isoformat() if isinstance(msg.get("timestamp"), datetime) else msg.get("timestamp")
            } for msg in chat.get("messages", [])
        ]
    }

async def create_ai_chat(collection: AsyncIOMotorCollection, trip_id: str) -> str:
    """
    Create a new chat for a trip.
    """
    chat_data = Chat(trip_id=trip_id)
    chat_dict = chat_data.dict()
    result = await collection.insert_one(chat_dict)
    return str(result.inserted_id)

async def get_ai_chat_by_id(collection: AsyncIOMotorCollection, ai_chat_id: str):
    """
    Retrieve an AI chat by its ID.
    """
    chat = await collection.find_one({"_id": ObjectId(ai_chat_id)})
    if chat:
        return ai_chat_serializer(chat)
    return None

import httpx
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.chat import Chat, Message
from bson import ObjectId
from datetime import datetime

async def add_message_to_ai_chat(collection: AsyncIOMotorCollection, ai_chat_id: str, user_id: str, message: str):
    """
    Add a message to an AI chat and get a response from the AI.
    """
    # Add user message to DB
    user_message_data = Message(user_id=user_id, message=message)
    try:
        user_message_dict = user_message_data.model_dump()
    except AttributeError:
        user_message_dict = user_message_data.dict()

    await collection.update_one(
        {"_id": ObjectId(ai_chat_id)},
        {"$push": {"messages": user_message_dict}}
    )

    # Prepare history for AI
    chat = await collection.find_one({"_id": ObjectId(ai_chat_id)})
    history = []
    if chat and "messages" in chat:
        for msg in chat["messages"]:
            history.append({
                "is_user": msg["user_id"] != "assistant",
                "text": msg["message"]
            })

    # Get AI response
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:8000/api/gemini/chat", json={
            "message": message,
            "history": history
        })
        response.raise_for_status()
        ai_response_text = response.json()["response"]

    # Add AI response to DB
    ai_message_data = Message(user_id="assistant", message=ai_response_text)
    try:
        ai_message_dict = ai_message_data.model_dump()
    except AttributeError:
        ai_message_dict = ai_message_data.dict()

    await collection.update_one(
        {"_id": ObjectId(ai_chat_id)},
        {"$push": {"messages": ai_message_dict}}
    )

    updated_chat = await collection.find_one({"_id": ObjectId(ai_chat_id)})
    return ai_chat_serializer(updated_chat)


async def clear_ai_chat_messages(collection: AsyncIOMotorCollection, ai_chat_id: str):
    """
    Clear the messages for a chat.
    """
    result = await collection.update_one(
        {"_id": ObjectId(ai_chat_id)},
        {"$set": {"messages": []}}
    )

    if result.matched_count == 0:
        return None

    updated_chat = await collection.find_one({"_id": ObjectId(ai_chat_id)})
    return ai_chat_serializer(updated_chat)