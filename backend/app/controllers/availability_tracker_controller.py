from fastapi import APIRouter, Body, Depends, Request, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorCollection
from app.services import availability_tracker_service
from app.models.availability_tracker import AvailabilityTracker, AvailabilityTrackerCreationRequest, AvailabilityTrackerUpdateRequest
from app.models.user import User
from app.utils.jwt import get_current_user
from app.services.availability_tracker_service import (
    get_tracker_members,
    add_user_to_tracker_by_email,
)
from typing import List
from app.dependencies import require_tracker_member

def get_availability_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.availability_collection


def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection


router = APIRouter(prefix="/api/availability-trackers", tags=["availability-trackers"])

@router.get("/", response_model=List[AvailabilityTracker])
async def get_all_trackers_route(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorCollection = Depends(get_availability_collection)
):
    trackers = await availability_tracker_service.get_all_trackers(
        db, current_user.user_id
    )
    return trackers

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AvailabilityTracker)
async def create_tracker_route(
    tracker_data: AvailabilityTrackerCreationRequest,
    db: AsyncIOMotorCollection = Depends(get_availability_collection),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_id not in tracker_data.user_ids:
        tracker_data.user_ids.append(current_user.user_id)
    new_tracker = await availability_tracker_service.create_tracker(db, tracker_data)
    return new_tracker

@router.get("/{tracker_id}", response_model=AvailabilityTracker)
async def get_tracker_route(
    tracker_id: str,
    db: AsyncIOMotorCollection = Depends(get_availability_collection),
    current_user: User = Depends(get_current_user),
):
    await require_tracker_member(db, tracker_id, current_user.user_id)
    tracker = await availability_tracker_service.get_tracker(db, tracker_id)
    if not tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")
    return tracker

@router.put("/{tracker_id}", response_model=AvailabilityTracker)
async def update_tracker_route(
    tracker_id: str,
    tracker_data: AvailabilityTrackerUpdateRequest,
    db: AsyncIOMotorCollection = Depends(get_availability_collection),
    current_user: User = Depends(get_current_user),
):
    await require_tracker_member(db, tracker_id, current_user.user_id)
    updated_tracker = await availability_tracker_service.update_tracker(db, tracker_id, tracker_data)
    if not updated_tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")
    return updated_tracker

@router.delete("/{tracker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tracker_route(
    tracker_id: str,
    db: AsyncIOMotorCollection = Depends(get_availability_collection),
    current_user: User = Depends(get_current_user),
):
    await require_tracker_member(db, tracker_id, current_user.user_id)
    deleted = await availability_tracker_service.delete_tracker(db, tracker_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tracker not found")
    return

@router.put("/{tracker_id}/availability/{user_id}", response_model=AvailabilityTracker)
async def update_availability_route(
    tracker_id: str,
    user_id: str,
    dates: List[str] = Body(...),
    db: AsyncIOMotorCollection = Depends(get_availability_collection),
    current_user: User = Depends(get_current_user),
):
    await require_tracker_member(db, tracker_id, current_user.user_id)
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update another user's availability.",
        )
    updated_tracker = await availability_tracker_service.update_tracker_availability(db, tracker_id, user_id, dates)
    if not updated_tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")
    return updated_tracker

@router.get("/{tracker_id}/members", response_model=list[User])
async def get_members_for_tracker_route(
    tracker_id: str,
    trackers_db: AsyncIOMotorCollection = Depends(get_availability_collection),
    users_db: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    """
    Get all members for a specific availability tracker.
    """
    await require_tracker_member(trackers_db, tracker_id, current_user.user_id)
    members = await get_tracker_members(trackers_db, users_db, tracker_id)
    return members


@router.post("/{tracker_id}/invite", response_model=AvailabilityTracker)
async def invite_user_to_tracker_route(
    tracker_id: str,
    request_body: dict = Body(...),
    trackers_db: AsyncIOMotorCollection = Depends(get_availability_collection),
    users_db: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    await require_tracker_member(trackers_db, tracker_id, current_user.user_id)
    user_email = request_body.get("email")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required to invite a user.",
        )

    updated_tracker = await add_user_to_tracker_by_email(
        trackers_db, users_db, tracker_id, user_email
    )
    if not updated_tracker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracker not found or user not found.",
        )
    return updated_tracker