import os
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status

CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

async def verify_google_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        return idinfo
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )