from fastapi import APIRouter, Body, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.trip import Trip
from app.services.trip_service import (
    create_trip,
    delete_trip,
    get_trip,
    update_trip,
    get_all_trips,
)
 
router = APIRouter(prefix="/trips", tags=["trips"])

#Retrieve all the trips collection from the app state and return it for use in the route handlers through dependency injection
def get_trips_collection(request) -> AsyncIOMotorCollection:
    return request.app.trips_collection
 
@router.get("/")
async def get_all_trips_route(trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    trips = await get_all_trips(trips_collection)
    if not trips:
        raise HTTPException(status_code=404, detail="No trips found")
    return trips
 
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_trip(trip: Trip, trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)):
    return await create_trip(trips_collection, trip)
 
 
@router.get("/{trip_id}")
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