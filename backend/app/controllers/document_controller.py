from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.services.document_service import DocumentService
from app.dependencies import get_db
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

router = APIRouter()

def document_serializer(doc):
    return {
        "id": str(doc["_id"]),
        "filename": doc["filename"],
        "name": doc.get("name"),
        "description": doc.get("description"),
        "content_type": doc["content_type"],
        "gcs_url": doc.get("gcs_url"),
        "created_at": doc["created_at"],
    }

def get_document_service(db: AsyncIOMotorClient = Depends(get_db)):
    return DocumentService(db)

@router.post("/api/trips/{trip_id}/documents")
async def upload_document(
    trip_id: str,
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...),
    document_service: DocumentService = Depends(get_document_service)
):
    gcs_url = await document_service.upload_file(file.file, file.filename, ObjectId(trip_id), file.content_type, name, description)
    return {"gcs_url": gcs_url}

@router.get("/api/trips/{trip_id}/documents")
async def get_documents(
    trip_id: str,
    document_service: DocumentService = Depends(get_document_service)
):
    documents = await document_service.get_documents_for_trip(ObjectId(trip_id))
    return [document_serializer(doc) for doc in documents]