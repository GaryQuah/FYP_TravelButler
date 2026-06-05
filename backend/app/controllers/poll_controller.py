from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.poll import Poll, CreatePollRequest, UpdatePollRequest
from app.services.poll_service import get_polls, create_poll, vote_on_poll, delete_poll, update_poll
from app.dependencies import get_current_user_id
from app.services.user_service import get_user_by_id

router = APIRouter(prefix="/api/trip/{trip_id}/polls", tags=["polls"])

def get_polls_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.polls_collection

def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection


@router.get("/", response_model=list[Poll])
async def get_polls_route(
    trip_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
):
    polls = await get_polls(polls_collection, trip_id)
    return polls

@router.post("/", response_model=Poll)
async def create_poll_route(
    trip_id: str,
    poll_request: CreatePollRequest,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    user_id: str = Depends(get_current_user_id),
):
    new_poll = await create_poll(polls_collection, trip_id, poll_request, user_id)
    return new_poll

@router.post("/{poll_id}/options/{option_id}/vote", response_model=Poll)
async def vote_on_poll_route(
    trip_id: str,
    poll_id: str,
    option_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    user_id: str = Depends(get_current_user_id),
):
    user = await get_user_by_id(users_collection, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_poll = await vote_on_poll(
        polls_collection, trip_id, poll_id, option_id, user_id, user["name"]
    )
    if not updated_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return updated_poll

@router.delete("/{poll_id}", status_code=204)
async def delete_poll_route(
    poll_id: str,
    polls_collection: AsyncIOMotorCollection = Depends(get_polls_collection),
    user_id: str = Depends(get_current_user_id),
):
    success = await delete_poll(polls_collection, poll_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    return {"message": "Poll deleted successfully"}