from fastapi import Request

def get_db(request: Request):
    return request.app.database

def get_users_collection(request: Request):
    return request.app.users_collection