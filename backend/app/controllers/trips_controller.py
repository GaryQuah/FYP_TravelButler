from fastapi import APIRouter, HTTPException, status, Depends, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip, TripCreationRequest, TripUpdateRequest
from pydantic import BaseModel

class InviteRequest(BaseModel):
    email: str

class ChatMessage(BaseModel):
    user_id: str
    message: str
    
from app.models.itinerary import Itinerary
from app.models.user import User
from app.utils.jwt import get_current_user
from app.dependencies import (
    require_trip_member,
    get_users_collection,
    get_trips_collection,
)
from app.services.trip_service import (
    create_trip,
    delete_trip,
    get_trip,
    update_trip,
    get_all_trips,
    add_user_to_trip_by_email,
    get_trip_members,
)
 
router = APIRouter(prefix="/api/trips", tags=["trips"])

def get_chats_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.chats_collection

def get_budgets_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.budgets_collection

def get_ai_chat_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.ai_chats_collection  

@router.get("/")
async def get_all_trips_route(
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    trips = await get_all_trips(trips_collection, current_user.user_id)
    if not trips:
        return []
    return trips
 
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_trip(
    trip_data: TripCreationRequest, 
    current_user: User = Depends(get_current_user),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection), 
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    chats_collection: AsyncIOMotorCollection = Depends(get_chats_collection),
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    ai_chats_collection: AsyncIOMotorCollection = Depends(get_ai_chat_collection)
):
    if current_user.user_id not in trip_data.user_ids:
        trip_data.user_ids.append(current_user.user_id)

    return await create_trip(trips_collection, users_collection, chats_collection, budgets_collection, ai_chats_collection,  trip_data)
 
 
@router.get("/{trip_id}", response_model=Trip)
async def get_trip_by_id(
    trip_id: str,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    trip = await get_trip(trips_collection, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
 
 
@router.put("/{trip_id}")
async def update_trip_by_id(
    trip_id: str,
    trip: TripUpdateRequest,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    updated_trip = await update_trip(trips_collection, trip_id, trip)
    if not updated_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return updated_trip
 
 
@router.delete("/{trip_id}")
async def delete_trip_by_id(
    trip_id: str,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    chats_collection: AsyncIOMotorCollection = Depends(get_chats_collection),
    ai_chats_collection: AsyncIOMotorCollection = Depends(get_ai_chat_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    deleted_trip = await delete_trip(
        trips_collection, budgets_collection, chats_collection, ai_chats_collection, trip_id
    )
    if not deleted_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return deleted_trip
 
 
@router.get("/{trip_id}/members", response_model=list[User])
async def get_members_for_trip(
    trip_id: str,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    """
    Get all members for a specific trip.
    """
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    members = await get_trip_members(trips_collection, users_collection, trip_id)
    return members


@router.post("/{trip_id}/invite", response_model=Trip)
async def invite_user_to_trip(
    trip_id: str,
    request: InviteRequest,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    updated_trip = await add_user_to_trip_by_email(
        trips_collection, users_collection, trip_id, request.email
    )
    if not updated_trip:
        raise HTTPException(status_code=404, detail="User or trip not found")
    return updated_trip