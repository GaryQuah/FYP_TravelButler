from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class Document(BaseModel):
    id: ObjectId = Field(default_factory=ObjectId, alias="_id")
    filename: str
    content_type: str
    gcs_path: str
    name: str | None = None
    description: str | None = None
    created_at: datetime = datetime.now()
    user_id: str

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }