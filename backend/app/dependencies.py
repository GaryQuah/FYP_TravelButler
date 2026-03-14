from fastapi import Header, HTTPException
from typing import Optional

def get_current_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="User ID not provided in headers")
    return x_user_id
