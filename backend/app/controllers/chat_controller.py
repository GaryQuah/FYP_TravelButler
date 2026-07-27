from fastapi import APIRouter, Body, HTTPException, status, Depends, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.services.chat_service import get_chat_by_id, add_message_to_chat, clear_chat_messages
from pydantic import BaseModel

router = APIRouter(prefix="/api/chats", tags=["chats"])

from app.utils.jwt import get_current_user
from app.models.user import User

class MessageRequest(BaseModel):
    message: str

def get_chat_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.chats_collection

@router.get("/{chat_id}", response_description="Get a chat by its ID")
async def get_chat(chat_id: str, collection: AsyncIOMotorCollection = Depends(get_chat_collection)):
    chat = await get_chat_by_id(collection, chat_id)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.post("/{chat_id}/messages", response_description="Add a message to a chat")
async def add_message(
    chat_id: str, 
    request: MessageRequest, 
    collection: AsyncIOMotorCollection = Depends(get_chat_collection), 
    current_user: User = Depends(get_current_user)
):
    chat = await add_message_to_chat(collection, chat_id, current_user.user_id, request.message)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.delete("/{chat_id}/messages", response_description="Clear chat messages")
async def clear_chat(chat_id: str, collection: AsyncIOMotorCollection = Depends(get_chat_collection)):
    chat = await clear_chat_messages(collection, chat_id)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")