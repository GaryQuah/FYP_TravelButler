from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.itinerary import Itinerary, ItineraryCreationRequest, ItineraryIdsRequest, ItineraryUpdateRequest
from app.services.itinerary_service import (
    create_itinerary,
    get_itineraries_for_trip,
    delete_itinerary,
    get_itineraries_by_ids,
    update_itinerary
)

router = APIRouter(prefix="/api/itineraries", tags=["itineraries"])

def get_itineraries_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.itineraries_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

@router.post("/get_by_ids")
async def get_itineraries_by_ids_endpoint(
    request: ItineraryIdsRequest,
    itineraries_collection: AsyncIOMotorCollection = Depends(get_itineraries_collection)
):
    """
    Get all itinerary items for a specific trip.
    """
    itineraries = await get_itineraries_by_ids(itineraries_collection, request.itinerary_ids)
    return itineraries

@router.post("/{trip_id}", status_code=status.HTTP_201_CREATED, response_model=Itinerary)
async def add_new_itinerary(
    trip_id: str,
    itinerary_data: ItineraryCreationRequest,
    itineraries_collection: AsyncIOMotorCollection = Depends(get_itineraries_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)
):
    """
    Create a new itinerary item linked to a trip.
    """
    new_itinerary = await create_itinerary(itineraries_collection, trips_collection, trip_id, itinerary_data)
    if not new_itinerary:
        raise HTTPException(status_code=500, detail="Failed to create itinerary")
    return new_itinerary

@router.get("/{trip_id}")
async def get_all_itineraries_for_trip(
    trip_id: str,
    itineraries_collection: AsyncIOMotorCollection = Depends(get_itineraries_collection)
):
    """
    Get all itinerary items for a specific trip.
    """
    itineraries = await get_itineraries_for_trip(itineraries_collection, trip_id)
    return itineraries


@router.put("/{trip_id}/{itinerary_id}", response_model=Itinerary)
async def update_itinerary_endpoint(
    trip_id: str,
    itinerary_id: str,
    itinerary_data: ItineraryUpdateRequest,
    itineraries_collection: AsyncIOMotorCollection = Depends(get_itineraries_collection)
):
    """
    Update an itinerary item.
    """
    updated_itinerary = await update_itinerary(itineraries_collection, itinerary_id, itinerary_data)
    if not updated_itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return updated_itinerary


@router.delete("/{trip_id}/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_itinerary(
    trip_id: str,
    itinerary_id: str,
    itineraries_collection: AsyncIOMotorCollection = Depends(
        get_itineraries_collection
    ),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection)
):
    """
    Delete an itinerary item from a trip.
    """
    success = await delete_itinerary(itineraries_collection, trips_collection, trip_id, itinerary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return