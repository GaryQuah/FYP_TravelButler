# The purpose of this document is to note down learning points in the project as they are come across

Depends: Belongs to fastapi package. Used to inject dependencies into route handlers. Tells FastAPI the function requires logic, allowing us to inject into endpoints automatically.

Request: Belongs to starlette package. Represents an HTTP request. Contains formdata and other request information.

AsyncIOMotorCollection: This is the collection object used to interact with the MongoDB database. Prevents blocking the event loops.
