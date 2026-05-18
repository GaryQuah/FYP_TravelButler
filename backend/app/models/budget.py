from pydantic import BaseModel, Field
from typing import List

class ExpenseItem(BaseModel):
    id: str = Field(..., alias="id")
    title: str = Field(..., alias="title")
    amount: float = Field(..., alias="amount")

class Category(BaseModel):
    id: str = Field(..., alias="id")
    name: str = Field(..., alias="name")
    expenses: List[ExpenseItem] = Field(..., alias="expenses")

class Contributor(BaseModel):
    id: str = Field(..., alias="id")
    name: str = Field(..., alias="name")
    paidAmount: float = Field(..., alias="paidAmount")

class TripBudget(BaseModel):
    id: str = Field(..., alias="id")
    tripName: str = Field(..., alias="tripName")
    peopleCount: int = Field(..., alias="peopleCount")
    categories: List[Category] = Field(..., alias="categories")
    contributors: List[Contributor] = Field(..., alias="contributors")
