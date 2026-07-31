from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.poll import Poll, CreatePollRequest, UpdatePollRequest
from app.services.poll_service import get_polls, create_poll, vote_on_poll, delete_poll, update_poll
from app.utils.jwt import get_current_user
from app.models.user import User
from app.dependencies import require_trip_member

router = APIRouter(prefix="/api/trip/{trip_id}/polls", tags=["polls"])

def get_polls_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.polls_collection

def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection


@router.get("", response_model=list[Poll])
async def get_polls_route(
    trip_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    polls = await get_polls(polls_collection, trip_id)
    return polls

@router.post("", response_model=Poll)
async def create_poll_route(
    trip_id: str,
    poll_request: CreatePollRequest,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    new_poll = await create_poll(polls_collection, trip_id, poll_request, current_user.user_id)
    return new_poll

@router.post("/{poll_id}/options/{option_id}/vote", response_model=Poll)
async def vote_on_poll_route(
    trip_id: str,
    poll_id: str,
    option_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)

    updated_poll = await vote_on_poll(
        polls_collection, trip_id, poll_id, option_id, current_user.user_id, current_user.name
    )
    if not updated_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return updated_poll

@router.delete("/{poll_id}", status_code=204)
async def delete_poll_route(
    trip_id: str,
    poll_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    success = await delete_poll(polls_collection, poll_id, current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    return {"message": "Poll deleted successfully"}