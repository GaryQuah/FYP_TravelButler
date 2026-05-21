from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.budget import TripBudget
from app.services.budget_service import get_budget, update_budget
from app.services.trip_service import get_trip as get_trip_details

router = APIRouter(prefix="/api/budget", tags=["budget"])

def get_budgets_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.budgets_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

@router.get("/{trip_id}", response_model=TripBudget)
async def get_budget_route(
    trip_id: str,
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
):
    budget = await get_budget(budgets_collection, trip_id)
    if not budget:
        # If no budget, create a default one
        trip_details = await get_trip_details(trips_collection, trip_id)
        if not trip_details:
            raise HTTPException(status_code=404, detail="Trip not found, cannot create budget")

        default_budget = TripBudget(
            id=trip_id,
            tripName=trip_details["trip_name"],
            peopleCount=len(trip_details["user_ids"]),
            categories=[],
            contributors=[],
        )
        await update_budget(budgets_collection, trip_id, default_budget)
        return default_budget
    return budget

@router.put("/{trip_id}", response_model=TripBudget)
async def update_budget_route(
    trip_id: str,
    budget_data: TripBudget,
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
):
    updated_budget = await update_budget(budgets_collection, trip_id, budget_data)
    return updated_budget