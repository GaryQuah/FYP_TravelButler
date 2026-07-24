from fastapi import APIRouter, Body, UploadFile, File
from app.services.gemini_service import GeminiService
from pydantic import BaseModel

class Description(BaseModel):
    description: str

gemini = GeminiService()
router = APIRouter(prefix="/api/gemini", tags=["gemini"])

@router.post("/analyze-description")
async def analyze_description(description: Description):
    response = gemini.extract_budget_items(user_input=description.description)
    return response

class ChatRequest(BaseModel):
    message: str
    history: list

@router.post("/analyze-receipt")
async def analyze_receipt(file: UploadFile = File(...)):
    contents = await file.read()
    response = gemini.extract_receipt(file_bytes=contents, mime_type=file.content_type)
    return response

@router.post("/chat")
async def chat(request: ChatRequest):
    response = gemini.generate_chat_response(
        user_input=request.message,
        history=request.history
    )
    return response