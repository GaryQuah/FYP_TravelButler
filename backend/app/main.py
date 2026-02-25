import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import DEBUG
from app.controllers.user_controller import router as user_router
from app.db.mongo import lifespan

app = FastAPI(lifespan=lifespan, debug=DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)


# ---------- Run ----------
def main(argv=sys.argv[1:]):
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=3001, reload=DEBUG)

if __name__ == "__main__":
    main()
