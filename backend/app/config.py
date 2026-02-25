import os

from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DATABASE_NAME = os.environ.get("DATABASE_NAME", "travelmate_db")
USER_COLLECTION = os.environ.get("USER_COLLECTION", "users")
DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}