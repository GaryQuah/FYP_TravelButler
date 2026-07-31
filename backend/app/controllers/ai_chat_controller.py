from fastapi import APIRouter, Body, HTTPException, status, Depends, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.services.ai_chat_service import get_ai_chat_by_id, create_ai_chat, add_message_to_ai_chat, clear_ai_chat_messages
from pydantic import BaseModel
from app.dependencies import require_ai_chat_member

router = APIRouter(prefix="/api/ai-chats", tags=["ai-chats"])

from app.utils.jwt import get_current_user
from app.models.user import User

class MessageRequest(BaseModel):
    message: str

def get_ai_chat_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.ai_chats_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

@router.get("/{ai_chat_id}", response_description="Get a chat by its ID")
async def get_ai_chat(
    ai_chat_id: str,
    collection: AsyncIOMotorCollection = Depends(get_ai_chat_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_ai_chat_member(collection, trips_collection, ai_chat_id, current_user.user_id)
    chat = await get_ai_chat_by_id(collection, ai_chat_id)  
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.post("/{ai_chat_id}/messages", response_description="Add a message to a chat")
async def add_message(
    ai_chat_id: str, 
    request: MessageRequest, 
    collection: AsyncIOMotorCollection = Depends(get_ai_chat_collection), 
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user)
):
    await require_ai_chat_member(collection, trips_collection, ai_chat_id, current_user.user_id)
    chat = await add_message_to_ai_chat(collection, ai_chat_id, current_user.user_id, request.message)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.delete("/{ai_chat_id}/messages", response_description="Clear chat messages")
async def clear_ai_chat(
    ai_chat_id: str,
    collection: AsyncIOMotorCollection = Depends(get_ai_chat_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_ai_chat_member(collection, trips_collection, ai_chat_id, current_user.user_id)
    chat = await clear_ai_chat_messages(collection, ai_chat_id)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")