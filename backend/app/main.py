import sys
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import DEBUG
from app.controllers.user_controller import router as user_router
from app.controllers.trips_controller import router as trips_router
from app.controllers.itinerary_controller import router as itinerary_router
from app.controllers.chat_controller import router as chat_router
from app.db.mongo import lifespan

app = FastAPI(lifespan=lifespan, debug=DEBUG)

# CORS configuration to allow requests from the frontend on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(user_router)
app.include_router(trips_router)
app.include_router(itinerary_router)
app.include_router(chat_router)


def main():
    uvicorn.run("app.main:app", host="0.0.0.0", port=3001, reload=DEBUG)

if __name__ == "__main__":
    main()