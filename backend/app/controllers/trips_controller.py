from fastapi import APIRouter, Body, HTTPException, status
from app.models.trip import Trip
from app.services.trip_service import (
    create_trip,
    delete_trip,
    get_trip,
    update_trip,
)
 
router = APIRouter(prefix="/trips", tags=["trips"])
 
 
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_trip(trip: Trip):
    return await create_trip(router.app.trips_collection, trip)
 
 
@router.get("/{trip_id}")
async def get_trip_by_id(trip_id: str):
    trip = await get_trip(router.app.trips_collection, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
 
 
@router.put("/{trip_id}")
async def update_trip_by_id(trip_id: str, trip: Trip):
    updated_trip = await update_trip(router.app.trips_collection, trip_id, trip)
    if not updated_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return updated_trip
 
 
@router.delete("/{trip_id}")
async def delete_trip_by_id(trip_id: str):
    deleted_trip = await delete_trip(router.app.trips_collection, trip_id)
    if not deleted_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return deleted_trip