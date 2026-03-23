from fastapi import APIRouter, Body, HTTPException, status, Depends, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.services.chat_service import get_chat_by_id, add_message_to_chat, clear_chat_messages
from pydantic import BaseModel

router = APIRouter(prefix="/api/chats", tags=["chats"])

class MessageRequest(BaseModel):
    user_id: str
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
async def add_message(chat_id: str, request: MessageRequest, collection: AsyncIOMotorCollection = Depends(get_chat_collection)):
    chat = await add_message_to_chat(collection, chat_id, request.user_id, request.message)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.delete("/{chat_id}/messages", response_description="Clear chat messages")
async def clear_chat(chat_id: str, collection: AsyncIOMotorCollection = Depends(get_chat_collection)):
    chat = await clear_chat_messages(collection, chat_id)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")
