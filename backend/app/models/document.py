from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    filename: str
    content_type: str
    gcs_path: str
    name: str | None = None
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: str

    class Config:
        validate_by_name = True