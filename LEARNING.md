# The purpose of this document is to note down learning points in the project as they are come across

# Frontend

React.FC: React functional component. Ensures we pass in the correct component for validation. In practice, we can remove this type annotation and it will function the same. This is niche and not really neccessary. For this project, we shall leave it in.

Props: defines the shape of an object, any parent component rendering this component must provide methods defined in the props interface.

A modal is a popup window that appears on top of the current page, allowing for user interaction without navigating away

Depends: Belongs to fastapi package. Used to inject dependencies into route handlers. Tells FastAPI the function requires logic, allowing us to inject into endpoints automatically.

Request: Belongs to starlette package. Represents an HTTP request. Contains formdata and other request information.

AsyncIOMotorCollection: This is the collection object used to interact with the MongoDB database. Prevents blocking the event loops.

Outlet: Allows for rendering of reusable parent objects such as navbars and headers before rendering child objects. Makes layouts modular and scalable.

useMemo: React hook that memoizes the result of a function. Only recomputes the value when one of the dependencies changes.

# Backend

Storing of ID: We should keep ID as str instead of the type native to databases / API. This keeps the buisness logic clean and decoupled from specific types. We should instead translate the id to the native type when interacting with the database / API.


# Security

HTTPOnlyCookie : Prevents client-side scripts from accessing the cookie. Only the server can access the cookie whereas the frontend can not.

JSON Web Token (JWT) : Used for authentication and authorization. Contains user information and is signed by the server. Expires after a set period of time to reduce compromisation duration if the token is compromised.

