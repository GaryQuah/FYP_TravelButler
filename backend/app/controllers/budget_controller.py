from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.budget import TripBudget, Expenditure, Contributor
from app.services.budget_service import get_budget, update_budget, add_expenditure
from app.services.trip_service import get_trip as get_trip_details
from app.services.user_service import get_users_by_ids
from app.models.user import User
from app.utils.jwt import get_current_user
from app.dependencies import require_trip_member

router = APIRouter(tags=["budget"])

def get_budgets_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.budgets_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection

@router.post("/api/trips/{trip_id}/budget", response_model=Expenditure)
async def add_expenditure_route(
    trip_id: str,
    expenditure: Expenditure,
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    new_expenditure = await add_expenditure(budgets_collection, trip_id, expenditure)
    if not new_expenditure:
        raise HTTPException(status_code=404, detail="Budget not found, cannot add expenditure")
    return new_expenditure

@router.get("/api/budget/{trip_id}", response_model=TripBudget)
async def get_budget_route(
    trip_id: str,
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    # Always fetch trip details to get the latest user list
    trip_details = await get_trip_details(trips_collection, trip_id)
    if not trip_details:
        raise HTTPException(status_code=404, detail="Trip not found")

    user_ids = trip_details.get("user_ids", [])
    users = await get_users_by_ids(users_collection, user_ids)
    user_name_by_id = {user["user_id"]: user["name"] for user in users}
    budget = await get_budget(budgets_collection, trip_id)

    if budget:
        # If budget exists, update it with the latest user list
        budget.peopleCount = len(user_ids)

        # Backfill placeholder names for existing contributors when we can resolve user names.
        for contributor in budget.contributors:
            resolved_name = user_name_by_id.get(contributor.id)
            if resolved_name and (not contributor.name or contributor.name == "New Member"):
                contributor.name = resolved_name
        
        # Get existing contributors
        existing_contributors = {c.id for c in budget.contributors}
        
        # Add new users from the trip to the contributors list
        for user_id in user_ids:
            if user_id not in existing_contributors:
                budget.contributors.append(
                    Contributor(
                        id=user_id,
                        name=user_name_by_id.get(user_id, "New Member"),
                        paidAmount=0,
                    )
                )
        
        await update_budget(budgets_collection, trip_id, budget)
    else:
        # If no budget, create a default one with all users from the trip
        contributors = [
            Contributor(
                id=user_id,
                name=user_name_by_id.get(user_id, "New Member"),
                paidAmount=0,
            )
            for user_id in user_ids
        ]
        budget = TripBudget(
            id=trip_id,
            tripName=trip_details["trip_name"],
            peopleCount=len(user_ids),
            categories=[],
            contributors=contributors,
        )
        await update_budget(budgets_collection, trip_id, budget)

    return budget

@router.put("/api/budget/{trip_id}", response_model=TripBudget)
async def update_budget_route(
    trip_id: str,
    budget_data: TripBudget,
    budgets_collection: AsyncIOMotorCollection = Depends(get_budgets_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
    current_user: User = Depends(get_current_user),
):
    await require_trip_member(trips_collection, trip_id, current_user.user_id)
    updated_budget = await update_budget(budgets_collection, trip_id, budget_data)
    return updated_budget