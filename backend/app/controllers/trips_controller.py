from fastapi import APIRouter, Body, HTTPException, status, Depends, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip, TripCreationRequest
from pydantic import BaseModel

class InviteRequest(BaseModel):
    email: str

class ChatMessage(BaseModel):
    user_id: str
    message: str
from app.models.itinerary import Itinerary
from app.models.user import User
from app.dependencies import get_current_user_id
from app.services.trip_service import (
    create_trip,
    delete_trip,
    get_trip,
    update_trip,
    get_all_trips,
    add_user_to_trip_by_email,
    get_trip_members,
    add_chat_message,
)
 
router = APIRouter(prefix="/api/trips", tags=["trips"])

#Retrieve all the trips collection from the app state and return it for use in the route handlers through dependency injection
def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection
 
@router.get("/")
async def get_all_trips_route(
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    user_id: str = Depends(get_current_user_id),
):
    trips = await get_all_trips(trips_collection, user_id)
    if not trips:
        return []
    return trips
 
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_trip(trip_data: TripCreationRequest, trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    return await create_trip(trips_collection, trip_data)
 
 
@router.get("/{trip_id}", response_model=Trip)
async def get_trip_by_id(trip_id: str, trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    trip = await get_trip(trips_collection, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
 
 
@router.put("/{trip_id}")
async def update_trip_by_id(trip_id: str, trip: Trip, trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    updated_trip = await update_trip(trips_collection, trip_id, trip)
    if not updated_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return updated_trip
 
 
@router.delete("/{trip_id}")
async def delete_trip_by_id(trip_id: str, trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    deleted_trip = await delete_trip(trips_collection, trip_id)
    if not deleted_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return deleted_trip
 
 
@router.post("/{trip_id}/itineraries", status_code=status.HTTP_201_CREATED)
async def add_new_itinerary_to_trip(
    trip_id: str,
    itinerary_data: Itinerary,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)
):
    new_itinerary = await add_itinerary_to_trip(trips_collection, trip_id, itinerary_data)
    if not new_itinerary:
        raise HTTPException(status_code=404, detail="Trip not found or itinerary could not be added")
    return new_itinerary


@router.get("/{trip_id}/members", response_model=list[User])
async def get_members_for_trip(
    trip_id: str,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    """
    Get all members for a specific trip.
    """
    members = await get_trip_members(trips_collection, users_collection, trip_id)
    return members


@router.post("/{trip_id}/invite", response_model=Trip)
async def invite_user_to_trip(
    trip_id: str,
    request: InviteRequest,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    updated_trip = await add_user_to_trip_by_email(
        trips_collection, users_collection, trip_id, request.email
    )
    if not updated_trip:
        raise HTTPException(status_code=404, detail="User or trip not found")
    return updated_trip

@router.post("/{trip_id}/chat", status_code=status.HTTP_201_CREATED)
async def add_chat_message_route(
    trip_id: str,
    chat_message: ChatMessage,
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
):
    updated_trip = await add_chat_message(
        trips_collection, trip_id, chat_message.user_id, chat_message.message
    )
    if not updated_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return updated_trip