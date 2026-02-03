from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import boto3
from typing import Optional

# ---------- App ----------
app = FastAPI()

# ---------- DynamoDB ----------
dynamodb = boto3.resource("dynamodb")
user_table = dynamodb.Table("Users")

# ---------- Request Models ----------
class User(BaseModel):
    user_id: str
    name: str
    email: str
    age: int

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None

# ---------- CREATE ----------
@app.post("/users/")
def create_user(user: User):
    try:
        user_table.put_item(
            Item=user.dict(),
            ConditionExpression="attribute_not_exists(user_id)"  # Prevent overwrite
        )
        return {"message": "User created successfully", "user": user.dict()}

    except user_table.meta.client.exceptions.ConditionalCheckFailedException:
        raise HTTPException(status_code=400, detail="User already exists")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- READ ----------
@app.get("/users/{user_id}")
def get_user(user_id: str):
    try:
        response = user_table.get_item(Key={"user_id": user_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="User not found")
        return response["Item"]
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

    if data.age is not None:
        update_expr_parts.append("age = :age")
        expr_values[":age"] = data.age

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