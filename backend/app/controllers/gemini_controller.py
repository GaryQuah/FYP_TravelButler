from fastapi import APIRouter, Body
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