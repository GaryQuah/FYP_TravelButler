from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.poll import Poll, CreatePollRequest, PollOption, Vote
import uuid
from datetime import datetime

async def get_polls(polls_collection: AsyncIOMotorCollection, trip_id: str) -> list[Poll]:
    """
    Retrieves all polls for a specific trip.
    """
    cursor = polls_collection.find({"tripId": trip_id})
    polls = await cursor.to_list(length=100)
    return [Poll(**poll) for poll in polls]

async def create_poll(polls_collection: AsyncIOMotorCollection, trip_id: str, poll_request: CreatePollRequest, user_id: str) -> Poll:
    """
    Creates a new poll for a specific trip.
    """
    new_poll = Poll(
        id=str(uuid.uuid4()),
        tripId=trip_id,
        title=poll_request.title,
        createdBy=user_id,
        created_at=datetime.now(),
        options=[PollOption(id=str(uuid.uuid4()), text=option_text, votes=[]) for option_text in poll_request.options]
    )  
    await polls_collection.insert_one(new_poll.model_dump(by_alias=True))
    return new_poll

async def vote_on_poll(polls_collection: AsyncIOMotorCollection, trip_id: str, poll_id: str, option_id: str, user_id: str, user_name: str) -> Poll | None:
    """
    Adds or changes a vote on a poll option.
    """
    poll = await polls_collection.find_one({"id": poll_id, "tripId": trip_id})
    if not poll:
        return None

    # Remove user's previous vote from any option
    await polls_collection.update_one(
        {"id": poll_id},
        {"$pull": {"options.$[].votes": {"userId": user_id}}}
    )

    # Add new vote to the selected option
    new_vote = Vote(userId=user_id, userName=user_name)
    
    await polls_collection.update_one(
        {"id": poll_id, "options.id": option_id},
        {"$push": {"options.$.votes": new_vote.model_dump(by_alias=True)}}
    )

    updated_poll = await polls_collection.find_one({"id": poll_id})
    return Poll(**updated_poll) if updated_poll else None

async def delete_poll(polls_collection: AsyncIOMotorCollection, poll_id: str, user_id: str) -> bool:
    """
    Deletes a poll.
    """
    result = await polls_collection.delete_one({"id": poll_id})
    return result.deleted_count > 0

async def update_poll(polls_collection: AsyncIOMotorCollection, poll_id: str, title: str, options: list[str]) -> Poll | None:
    """
    Updates a poll's title and options.
    """
    # For simplicity, we'll replace the entire poll document except for the votes.
    # A more sophisticated implementation might update options individually.
    
    poll = await polls_collection.find_one({"id": poll_id})
    if not poll:
        return None

    new_options = [PollOption(id=str(uuid.uuid4()), text=option_text, votes=[]) for option_text in options]
    
    await polls_collection.update_one(
        {"id": poll_id},
        {"$set": {"title": title, "options": [option.model_dump(by_alias=True) for option in new_options]}}
    )

    updated_poll = await polls_collection.find_one({"id": poll_id})
    return Poll(**updated_poll) if updated_poll else None