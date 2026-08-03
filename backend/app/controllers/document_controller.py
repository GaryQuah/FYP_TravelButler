from fastapi import APIRouter, Depends, UploadFile, File, Form, Request, HTTPException, status
from app.services.document_service import DocumentService
from app.dependencies import get_db
from app.dependencies import require_trip_member
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from bson import ObjectId
from app.models.user import User
from app.utils.jwt import get_current_user

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
        "user_id": doc.get("user_id"),
    }

def get_document_service(db: AsyncIOMotorClient = Depends(get_db)):
    return DocumentService(db)

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

@router.post("/api/trips/{trip_id}/documents")
async def upload_document(
    trip_id: str,
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...),
    document_service: DocumentService = Depends(get_document_service),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    gcs_url = await document_service.upload_file(file.file, file.filename, ObjectId(trip_id), file.content_type, current_user.user_id, name, description)
    return {"gcs_url": gcs_url}

@router.get("/api/trips/{trip_id}/documents")
async def get_documents(
    trip_id: str,
    document_service: DocumentService = Depends(get_document_service),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    documents = await document_service.get_documents_for_trip(ObjectId(trip_id))
    
    user_ids = [doc.get("user_id") for doc in documents if doc.get("user_id")]
    
    users_collection = db.users  
    users = await users_collection.find({"user_id": {"$in": user_ids}}).to_list(length=len(user_ids))
    user_map = {user["user_id"]: user.get("name", "Unknown") for user in users}
    
    serialized_documents = []
    for doc in documents:
        serialized_doc = document_serializer(doc)
        user_id = doc.get("user_id")
        if user_id:
            serialized_doc["uploaded_by"] = user_map.get(user_id, "Unknown")
        else:
            serialized_doc["uploaded_by"] = "Unknown"
        serialized_documents.append(serialized_doc)
        
    return serialized_documents

@router.delete("/api/trips/{trip_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    trip_id: str,
    document_id: str,
    document_service: DocumentService = Depends(get_document_service),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    deleted = await document_service.delete_document_for_trip(trip_id, document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return