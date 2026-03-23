"""
This file is used to define configuration settings for the application, such as database connection details and collection names. 
This is to standardize naming across files preventing hardcoding of values in multiple places, and to allow for easy updates to 
configuration settings in the future.
"""
import os

from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DATABASE_NAME = os.environ.get("DATABASE_NAME", "travelmate_db")
USER_COLLECTION = os.environ.get("USER_COLLECTION", "users")
TRIP_COLLECTION = os.environ.get("TRIP_COLLECTION", "trips")
ITINERARY_COLLECTION = os.environ.get("ITINERARY_COLLECTION", "itineraries")
CHAT_COLLECTION = os.environ.get("CHATS_COLLECTION", "chats")
DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}