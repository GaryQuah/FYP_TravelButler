import os
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from datetime import datetime, timedelta
import httpx
from app.models.google_calendar_integration import GoogleCalendarTokens, GoogleCalendarIntegration
import logging

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_TOKEN_URI = os.environ.get("GOOGLE_TOKEN_URI")
REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI") 

logger = logging.getLogger(__name__)

async def exchange_code_for_tokens(code: str) -> GoogleCalendarTokens:
    """Exchange authorization code for access and refresh tokens."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise ValueError("Google client credentials not configured on the server.")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URI,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        
        if response.status_code != 200:
            logger.error(
                f"Google token exchange failed: "
                f"{response.status_code} {response.text}"
            )
            raise ValueError(
                f"Google token exchange failed: {response.text}"
            )
            
        token_data = response.json()
        
        expires_in = token_data.get("expires_in", 3600)
        token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        
        if "refresh_token" not in token_data:
            logger.warning("No refresh token received. User may have already granted consent.")

        return GoogleCalendarTokens(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"), 
            token_expiry=token_expiry,
            token_type=token_data.get("token_type", "Bearer"),
        )

async def get_google_calendar_integration(
    integrations_collection: AsyncIOMotorCollection,
    user_id: str
) -> GoogleCalendarIntegration | None:
    """Get user's Google Calendar integration if it exists"""
    doc = await integrations_collection.find_one({
        "user_id": user_id,
        "service": "google_calendar"
    })
    if not doc:
        return None
    
    doc["id"] = str(doc["_id"])
    return GoogleCalendarIntegration(**doc)



async def refresh_access_token(tokens: GoogleCalendarTokens) -> GoogleCalendarTokens:
    """Refresh access token if it's expired or about to expire"""
    if not tokens.refresh_token:
        raise ValueError("Google Calendar refresh token is missing")

    # Refresh if token expires in less than 5 minutes
    if tokens.token_expiry - datetime.utcnow() > timedelta(minutes=5):
        return tokens
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URI,
            data={
                "refresh_token": tokens.refresh_token,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "grant_type": "refresh_token"
            }
        )
        response.raise_for_status()
        token_data = response.json()
        
        expires_in = token_data.get("expires_in", 3600)
        token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        
        return GoogleCalendarTokens(
            access_token=token_data["access_token"],
            refresh_token=tokens.refresh_token,
            token_expiry=token_expiry,
            token_type=token_data["token_type"]
        )

async def check_google_calendar_connection(
    integrations_collection: AsyncIOMotorCollection,
    user_id: str,
) -> bool:
    """Refresh the user's token when needed and remove invalid connections."""
    integration = await get_google_calendar_integration(
        integrations_collection,
        user_id,
    )
    if not integration:
        return False

    try:
        tokens = await refresh_access_token(integration.tokens)
        if tokens.access_token != integration.tokens.access_token:
            await update_tokens_in_db(integrations_collection, integration.id, tokens)
        return True
    except (httpx.HTTPStatusError, KeyError, TypeError, ValueError) as exc:
        logger.warning(
            "Removing invalid Google Calendar integration for user %s: %s",
            user_id,
            exc,
        )
        await delete_google_calendar_integration(integrations_collection, user_id)
        return False

async def save_google_calendar_integration(
    integrations_collection: AsyncIOMotorCollection,
    user_id: str,
    tokens: GoogleCalendarTokens
) -> GoogleCalendarIntegration:
    """Save or update Google Calendar integration for a user"""
    now = datetime.utcnow()
    
    # Check if integration already exists
    existing = await integrations_collection.find_one({
        "user_id": user_id,
        "service": "google_calendar"
    })
    
    integration_data = {
        "user_id": user_id,
        "service": "google_calendar",
        "tokens": {
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_expiry": tokens.token_expiry,
            "token_type": tokens.token_type
        },
        "updated_at": now
    }
    
    if existing:
        await integrations_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": integration_data}
        )
        integration_data["_id"] = existing["_id"]
    else:
        integration_data["created_at"] = now
        result = await integrations_collection.insert_one(integration_data)
        integration_data["_id"] = result.inserted_id
    
    integration_data["id"] = str(integration_data["_id"])
    return GoogleCalendarIntegration(**integration_data)

async def delete_google_calendar_integration(
    integrations_collection: AsyncIOMotorCollection,
    user_id: str
) -> bool:
    """Delete user's Google Calendar integration"""
    result = await integrations_collection.delete_one({
        "user_id": user_id,
        "service": "google_calendar"
    })
    return result.deleted_count > 0

async def update_tokens_in_db(
    integrations_collection: AsyncIOMotorCollection,
    integration_id: str,
    new_tokens: GoogleCalendarTokens
) -> None:
    """Update tokens in database after refresh"""
    await integrations_collection.update_one(
        {"_id": ObjectId(integration_id)},
        {"$set": {
            "tokens.access_token": new_tokens.access_token,
            "tokens.token_expiry": new_tokens.token_expiry,
            "updated_at": datetime.utcnow()
        }}
    )

async def create_calendar_event(
    integrations_collection: AsyncIOMotorCollection,
    user_id: str,
    event_data: dict
) -> dict:
    """Create an event in user's Google Calendar"""
    # Get user's integration
    integration = await get_google_calendar_integration(integrations_collection, user_id)
    if not integration:
        raise ValueError("Google Calendar not connected")
    
    # Refresh tokens if needed
    tokens = await refresh_access_token(integration.tokens)
    if tokens.access_token != integration.tokens.access_token:
        await update_tokens_in_db(integrations_collection, integration.id, tokens)
    
    # Create event in Google Calendar
    async with httpx.AsyncClient() as client:
        # Log token info to verify scopes
        token_response = await client.get(
            "https://www.googleapis.com/oauth2/v1/tokeninfo",
            params={"access_token": tokens.access_token}
        )
        #print(f"Token info: {token_response.json()}")
        
        # First check if we can access calendars
        calendar_list_response = await client.get(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            headers={"Authorization": f"Bearer {tokens.access_token}"}
        )
        #print(f"Calendar list status: {calendar_list_response.status_code}")
        #print(f"Calendar list response: {calendar_list_response.text}")
        
        # Try to create the event
        response = await client.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers={"Authorization": f"Bearer {tokens.access_token}"},
            json=event_data
        )
        #print(f"Event creation status: {response.status_code}")
        #print(f"Event creation response: {response.text}")
        response.raise_for_status()
        return response.json()