from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from bson import ObjectId

class Document(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: ObjectId = Field(default_factory=ObjectId, alias="_id")
    filename: str
    content_type: str
    gcs_path: str
    name: str | None = None
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: str
