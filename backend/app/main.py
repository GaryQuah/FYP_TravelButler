from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import boto3
from boto3.dynamodb.conditions import Attr
from typing import Optional
import uuid

# ---------- App ----------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DynamoDB ----------
dynamodb = boto3.resource("dynamodb")
user_table = dynamodb.Table("Users")

# ---------- Request Models ----------
class User(BaseModel):
    name: str
    email: str

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

# ---------- CREATE ----------
@app.post("/users/")
def create_user(user: User):
    user_id = str(uuid.uuid4())
    user_data = user.dict()
    user_data["user_id"] = user_id
    try:
        user_table.put_item(
            Item=user_data,
            ConditionExpression="attribute_not_exists(user_id)"  # Prevent overwrite
        )
        return {"message": "User created successfully", "user": user_data}

    except user_table.meta.client.exceptions.ConditionalCheckFailedException:
        raise HTTPException(status_code=400, detail="User already exists")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- READ ----------
@app.get("/users/{email}")
def get_user(email: str):
    try:
        response = user_table.scan(
            FilterExpression=Attr('email').eq(email)
        )
        items = response.get('Items', [])
        if not items:
            raise HTTPException(status_code=404, detail="User not found")
        # Assuming email is unique, return the first item
        return items[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- UPDATE ----------
@app.put("/users/{user_id}")
def update_user(user_id: str, data: UpdateUserRequest):
    update_expr_parts = []
    expr_values = {}
    expr_names = {}

    if data.name is not None:
        update_expr_parts.append("#name = :name")
        expr_values[":name"] = data.name
        expr_names["#name"] = "name"

    if data.email is not None:
        update_expr_parts.append("email = :email")
        expr_values[":email"] = data.email

    if not update_expr_parts:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        response = user_table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="SET " + ", ".join(update_expr_parts),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names if expr_names else None,
            ConditionExpression="attribute_exists(user_id)",
            ReturnValues="ALL_NEW"
        )

        return {
            "message": "User updated successfully",
            "user": response["Attributes"]
        }

    except user_table.meta.client.exceptions.ConditionalCheckFailedException:
        raise HTTPException(status_code=404, detail="User not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- DELETE ----------
@app.delete("/users/{user_id}")
def delete_user(user_id: str):
    try:
        response = user_table.delete_item(
            Key={"user_id": user_id},
            ConditionExpression="attribute_exists(user_id)"
        )
        return {"message": "User deleted successfully"}
    except user_table.meta.client.exceptions.ConditionalCheckFailedException:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))