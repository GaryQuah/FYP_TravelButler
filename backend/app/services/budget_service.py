from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.budget import TripBudget

async def get_budget(budgets_collection: AsyncIOMotorCollection, trip_id: str) -> TripBudget | None:
    """
    Retrieves the budget for a specific trip.
    """
    budget_data = await budgets_collection.find_one({"id": trip_id})
    if budget_data:
        return TripBudget(**budget_data)
    return None

async def update_budget(budgets_collection: AsyncIOMotorCollection, trip_id: str, budget: TripBudget) -> TripBudget:
    """
    Updates or creates the budget for a specific trip.
    """
    budget_dict = budget.model_dump(by_alias=True)
    await budgets_collection.replace_one(
        {"id": trip_id},
        budget_dict,
        upsert=True
    )
    return budget
