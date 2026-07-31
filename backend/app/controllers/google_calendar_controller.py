from fastapi import APIRouter, Depends, Request, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorCollection
from datetime import datetime
from app.utils.jwt import get_current_user
from app.models.user import User
from app.services.google_calendar_service import (
    get_google_calendar_integration,
    save_google_calendar_integration,
    delete_google_calendar_integration,
    create_calendar_event,
    exchange_code_for_tokens
)
from app.models.google_calendar_integration import (
    GoogleCalendarIntegrationCreateRequest,
    ExportItineraryRequest
)
from app.services.itinerary_service import get_itineraries_by_ids
from app.dependencies import require_itinerary_member

router = APIRouter(prefix="/api/google-calendar", tags=["google-calendar"])

def get_integrations_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.integrations_collection

def get_itineraries_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.itineraries_collection

def get_trips_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.trips_collection

@router.get("/status")
async def check_connection_status(
    current_user: User = Depends(get_current_user),
    integrations_collection: AsyncIOMotorCollection = Depends(get_integrations_collection)
):
    """Check if user has connected Google Calendar"""
    integration = await get_google_calendar_integration(integrations_collection, current_user.user_id)
    return {"connected": integration is not None}

@router.post("/connect")
async def connect_google_calendar(
    request_data: GoogleCalendarIntegrationCreateRequest,
    current_user: User = Depends(get_current_user),
    integrations_collection: AsyncIOMotorCollection = Depends(get_integrations_collection)
):
    """Connect Google Calendar using authorization code from frontend."""
    print(f"Received connect request from user: {current_user.user_id}")
    try:
        # Exchange authorization code for tokens
        tokens = await exchange_code_for_tokens(request_data.code)
        
        # Save the new tokens in mongoDB
        result = await save_google_calendar_integration(integrations_collection, current_user.user_id, tokens)
        
        print(f"Successfully saved integration: {result.id}")
        return {"success": True, "message": "Google Calendar connected successfully"}
    except Exception as e:
        print(f"Error during Google Calendar connection: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect Google Calendar: {str(e)}"
        )

@router.delete("/disconnect")
async def disconnect_google_calendar(
    current_user: User = Depends(get_current_user),
    integrations_collection: AsyncIOMotorCollection = Depends(get_integrations_collection)
):
    """Disconnect Google Calendar"""
    success = await delete_google_calendar_integration(integrations_collection, current_user.user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Google Calendar integration found"
        )
    return {"success": True, "message": "Google Calendar disconnected successfully"}

@router.post("/export-itineraries")
async def export_itineraries_to_calendar(
    request_data: ExportItineraryRequest,
    current_user: User = Depends(get_current_user),
    integrations_collection: AsyncIOMotorCollection = Depends(get_integrations_collection),
    itineraries_collection: AsyncIOMotorCollection = Depends(get_itineraries_collection),
    trips_collection: AsyncIOMotorCollection = Depends(get_trips_collection),
):
    """Export multiple itineraries to Google Calendar"""
    print(f"Export request received. Itinerary IDs: {request_data.itinerary_ids}")
    for itinerary_id in request_data.itinerary_ids:
        await require_itinerary_member(
            itineraries_collection,
            trips_collection,
            itinerary_id,
            current_user.user_id,
        )

    # Get the itineraries
    itineraries = await get_itineraries_by_ids(itineraries_collection, request_data.itinerary_ids)
    print(f"Found {len(itineraries)} itineraries")
    if not itineraries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No itineraries found"
        )
    
    created_events = []
    errors = []
    
    for itinerary in itineraries:
        print(f"Processing itinerary: {itinerary}")
        try:
            # Format event for Google Calendar
            event = {
                "summary": itinerary["activity_name"],
                "description": itinerary["description"],
                "start": {
                    "dateTime": itinerary["start_time"].isoformat(),
                    "timeZone": "Asia/Singapore"
                },
                "end": {
                    "dateTime": itinerary["end_time"].isoformat(),
                    "timeZone": "Asia/Singapore"
                }
            }
            print(f"Created event: {event}")
            
            result = await create_calendar_event(integrations_collection, current_user.user_id, event)
            print(f"Calendar event created: {result}")
            created_events.append({
                "itinerary_id": itinerary["id"],
                "event_id": result["id"],
                "html_link": result["htmlLink"]
            })
        except Exception as e:
            print(f"Error creating event: {str(e)}")
            import traceback
            traceback.print_exc()
            errors.append({
                "itinerary_id": itinerary["id"],
                "error": str(e)
            })
    
    print(f"Export complete. Created {len(created_events)} events, {len(errors)} errors")
    return {
        "success": len(created_events) > 0,
        "created_events": created_events,
        "errors": errors,
        "message": f"Successfully exported {len(created_events)} events to Google Calendar"
    }

@router.post("/events")
async def create_single_event(
    event_data: dict,
    current_user: User = Depends(get_current_user),
    integrations_collection: AsyncIOMotorCollection = Depends(get_integrations_collection)
):
    """Create a single event in Google Calendar"""
    try:
        result = await create_calendar_event(integrations_collection, current_user.user_id, event_data)
        return {"success": True, "event": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create event: {str(e)}"
        )