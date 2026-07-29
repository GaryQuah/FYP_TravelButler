from google.cloud import storage
import os
from app.models.document import Document
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

import datetime

class DocumentService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.storage_client = storage.Client()
        self.bucket_name = os.environ.get("GCS_BUCKET_NAME", "your-gcs-bucket-name")

    async def upload_file(self, file, filename, trip_id, content_type, name: str | None = None, description: str | None = None):
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(filename)

        blob.upload_from_file(file, content_type=content_type)

        document = Document(
            filename=filename,
            content_type=content_type,
            gcs_path=blob.name,
            name=name,
            description=description,
        )

        result = await self.db.documents.insert_one(document.dict(by_alias=True))
        update_result = await self.db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$push": {"document_ids": result.inserted_id}}
        )

        return blob.public_url

    async def get_documents_for_trip(self, trip_id):
        print(f"Fetching documents for trip_id: {trip_id}")
        trip = await self.db.trips.find_one({"_id": ObjectId(trip_id)})
        print(f"Found trip: {trip}")
        if not trip or not trip.get("document_ids"):
            print("Trip not found or has no document_ids")
            return []

        document_ids = trip.get("document_ids")
        print(f"Document IDs: {document_ids}")

        documents = await self.db.documents.find(
            {"_id": {"$in": trip["document_ids"]}}
        ).to_list(100)
        
        print(f"Found documents from DB: {documents}")

        for doc in documents:
            blob = self.storage_client.bucket(self.bucket_name).blob(doc["gcs_path"])
            doc["gcs_url"] = blob.generate_signed_url(
                version="v4",
                expiration=datetime.timedelta(minutes=15),
                method="GET",
            )

        print(f"Documents with signed URLs: {documents}")
        return documents