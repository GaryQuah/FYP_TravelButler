from fastapi import Request

def get_users_collection(request: Request):
    return request.app.users_collection