from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.budget import TripBudget, Expenditure, Category, ExpenseItem
import uuid

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

async def add_expenditure(budgets_collection: AsyncIOMotorCollection, trip_id: str, expenditure: Expenditure) -> Expenditure | None:
    """
    Adds an expenditure to a trip's budget.
    """
    budget = await get_budget(budgets_collection, trip_id)
    if not budget:
        return None

    category_found = False
    for category in budget.categories:
        if category.name.lower() == expenditure.category.lower():
            category.expenses.append(ExpenseItem(id=str(uuid.uuid4()), title=expenditure.item, amount=expenditure.amount))
            category_found = True
            break
    
    if not category_found:
        new_category = Category(
            id=str(uuid.uuid4()),
            name=expenditure.category,
            expenses=[ExpenseItem(id=str(uuid.uuid4()), title=expenditure.item, amount=expenditure.amount)]
        )
        budget.categories.append(new_category)

    await update_budget(budgets_collection, trip_id, budget)
    return expenditure