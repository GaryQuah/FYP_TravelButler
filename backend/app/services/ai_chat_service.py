from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.ai_chat import AiChat
from app.models.chat import Message
from bson import ObjectId
from datetime import datetime, timezone

def ai_chat_serializer(chat) -> dict:
    """
    Serializes an AI chat document from MongoDB into a dictionary.
    Ensures that timestamps are timezone-aware and formatted in ISO 8601.
    """
    serialized_messages = []
    for msg in chat.get("messages", []):
        timestamp = msg.get("timestamp")
        if isinstance(timestamp, datetime):
            # Assume naive datetimes from DB are UTC and make them aware
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=timezone.utc)
            timestamp_str = timestamp.isoformat()
        else:
            timestamp_str = timestamp

        serialized_messages.append({
            "user_id": msg["user_id"],
            "message": msg["message"],
            "timestamp": timestamp_str,
        })

    return {
        "ai_chat_id": str(chat["_id"]),
        "trip_id": chat["trip_id"],
        "messages": serialized_messages,
        "ai_recommendations": chat.get("ai_recommendations", []),
    }

async def create_ai_chat(collection: AsyncIOMotorCollection, trip_id: str) -> str:
    """
    Create a new chat for a trip.
    """
    chat_data = AiChat(trip_id=trip_id)
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

import asyncio
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.chat import Message
from app.services.gemini_service import GeminiService
from bson import ObjectId
from datetime import datetime

gemini = GeminiService()

async def add_message_to_ai_chat(collection: AsyncIOMotorCollection, ai_chat_id: str, user_id: str, message: str, country: str):
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

    itinerary = chat.get("ai_recommendations", []) if chat else []

    ai_response = await asyncio.to_thread(
        gemini.generate_chat_response,
        user_input=message,
        history=history,
        country=country,
        itinerary=itinerary,
    )

    ai_response_text = ai_response.get("response", "")
    itinerary = ai_response.get("itinerary")

    # Add AI response to DB
    ai_message_data = Message(user_id="assistant", message=ai_response_text)
    try:
        ai_message_dict = ai_message_data.model_dump()
    except AttributeError:
        ai_message_dict = ai_message_data.dict()

    update_doc = {"$push": {"messages": ai_message_dict}}
    if itinerary:
        update_doc["$set"] = {"ai_recommendations": itinerary}

    await collection.update_one(
        {"_id": ObjectId(ai_chat_id)},
        update_doc
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