from google.cloud import storage
import os
from app.models.document import Document
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import service_account
from app.config import GCS_BUCKET_NAME, GCS_CREDENTIALS_INFO

import datetime

class DocumentService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        credentials = service_account.Credentials.from_service_account_info(
            GCS_CREDENTIALS_INFO
        )
        self.storage_client = storage.Client(
            project=GCS_CREDENTIALS_INFO["project_id"],
            credentials=credentials,
        )
        self.bucket_name = GCS_BUCKET_NAME

    async def upload_file(self, file, filename, trip_id, content_type, user_id, name: str | None = None, description: str | None = None):
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(filename)

        blob.upload_from_file(file, content_type=content_type)

        document = Document(
            filename=filename,
            content_type=content_type,
            gcs_path=blob.name,
            name=name,
            description=description,
            user_id=user_id
        )

        result = await self.db.documents.insert_one(document.dict(by_alias=True))
        update_result = await self.db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$push": {"document_ids": result.inserted_id}}
        )

        return blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=15),
            method="GET",
        )

    async def get_documents_for_trip(self, trip_id):
        trip = await self.db.trips.find_one({"_id": ObjectId(trip_id)})
        #print(f"Found trip: {trip}")
        if not trip or not trip.get("document_ids"):
            #print("Trip not found or has no document_ids")
            return []

        document_ids = trip.get("document_ids")
        #print(f"Document IDs: {document_ids}")

        documents = await self.db.documents.find(
            {"_id": {"$in": trip["document_ids"]}}
        ).to_list(100)
        
        #print(f"Found documents from DB: {documents}")

        for doc in documents:
            blob = self.storage_client.bucket(self.bucket_name).blob(doc["gcs_path"])
            doc["gcs_url"] = blob.generate_signed_url(
                version="v4",
                expiration=datetime.timedelta(minutes=15),
                method="GET",
            )

        print(f"Documents with signed URLs: {documents}")
        return documents

    async def delete_document_for_trip(self, trip_id: str, document_id: str) -> bool:
        try:
            trip_object_id = ObjectId(trip_id)
            document_object_id = ObjectId(document_id)
        except InvalidId:
            return False

        trip = await self.db.trips.find_one({"_id": trip_object_id})
        if not trip:
            return False

        if document_object_id not in trip.get("document_ids", []):
            return False

        document = await self.db.documents.find_one({"_id": document_object_id})
        if not document:
            return False

        blob = self.storage_client.bucket(self.bucket_name).blob(document["gcs_path"])
        if blob.exists():
            blob.delete()

        await self.db.documents.delete_one({"_id": document_object_id})
        await self.db.trips.update_one(
            {"_id": trip_object_id},
            {"$pull": {"document_ids": document_object_id}},
        )
        return True