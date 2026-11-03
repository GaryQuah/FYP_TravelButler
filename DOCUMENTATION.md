# TravelMate technical documentation

## 1. System overview

TravelMate is a full-stack travel planning application. The React frontend
communicates with a FastAPI backend, which stores application data in MongoDB
and integrates with Google services and the Gemini API.

The main user capabilities are:

- Google sign-in and cookie-based authentication
- Trip creation, member invitations, and trip images
- Collaborative itinerary planning
- AI-assisted travel chat and itinerary analysis
- Budget and expenditure tracking
- Receipt, document, and description analysis
- Availability tracking and polls
- Google Calendar integration
- Document storage in Google Cloud Storage

## 2. Software, frameworks, and cloud services

### Application software

| Software        | Version declared in project | Purpose                                 | Relevant URL                      |
| --------------- | --------------------------: | --------------------------------------- | --------------------------------- |
| Python          |                    `>=3.11` | Backend runtime                         | <https://www.python.org/>         |
| FastAPI         |        `>=0.128.0,<0.129.0` | Backend web framework and API routing   | <https://fastapi.tiangolo.com/>   |
| Uvicorn         |          `>=0.40.0,<0.41.0` | ASGI development/production server      | <https://www.uvicorn.org/>        |
| Pydantic        |           `>=2.12.5,<3.0.0` | Request and response validation         | <https://docs.pydantic.dev/>      |
| Motor           |            `>=3.7.1,<4.0.0` | Asynchronous MongoDB driver             | <https://motor.readthedocs.io/>   |
| Poetry          | `>=2.0.0` build requirement | Backend dependency management           | <https://python-poetry.org/>      |
| Node.js/npm     |   Use a current LTS release | Frontend tooling and package management | <https://nodejs.org/>             |
| React           |                   `^19.2.0` | Frontend UI                             | <https://react.dev/>              |
| TypeScript      |                    `~5.9.3` | Frontend type checking                  | <https://www.typescriptlang.org/> |
| Vite            |                    `^7.2.4` | Frontend development server and bundler | <https://vite.dev/>               |
| Bootstrap       |                    `^5.3.8` | Layout and UI components                | <https://getbootstrap.com/>       |
| Bootstrap Icons |                   `^1.13.1` | UI icons and animated robot indicator   | <https://icons.getbootstrap.com/> |
| Recharts        |                    `^3.8.1` | Budget charts                           | <https://recharts.org/>           |

### Cloud services and external APIs

| Service                  | Use                                                      | Relevant URL                                     |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| MongoDB Atlas            | Application database                                     | <https://www.mongodb.com/atlas>                  |
| Google Identity Services | User sign-in                                             | <https://developers.google.com/identity/gsi/web> |
| Google Calendar API      | Calendar connection and event export                     | <https://developers.google.com/calendar/api>     |
| Google Gemini API        | Chat, itinerary, receipt, document, and expense analysis | <https://ai.google.dev/>                         |
| Google Cloud Storage     | Trip images and uploaded documents                       | <https://cloud.google.com/storage>               |
| Vercel                   | Frontend hosting                                         | <https://vercel.com/>                            |
| Render                   | Backend hosting                                          | <https://render.com/>                            |

## 3. Installation procedure

### Prerequisites

Install:

1. Python 3.11 or newer
2. Poetry 2 or newer
3. Node.js LTS and npm
4. MongoDB Atlas access
5. Google Cloud project credentials
6. A Gemini API key

### Backend

From the repository root:

```powershell
Set-Location .\backend
poetry install
poetry run uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.

Alternatively, if Poetry is unavailable:

```powershell
Set-Location .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend

From the repository root:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`.

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

The local Vite configuration proxies `/api` requests to
`http://localhost:8000`. When `VITE_API_URL` is set, the frontend uses that
backend URL directly.

## 4. Environment parameters

Never commit `.env` files, API keys, OAuth secrets, JWT secrets, private keys,
or service-account JSON. The repository ignores `.env`; keep a separate
secret manager or deployment environment configuration.

### Backend environment

Create `backend/.env` locally, or configure these values in Render:

| Variable                              | Required | Description                                                      |
| ------------------------------------- | -------- | ---------------------------------------------------------------- |
| `MONGO_URL`                           | Yes      | MongoDB Atlas connection string                                  |
| `DATABASE_NAME`                       | No       | MongoDB database name; defaults to `travelmate_db`               |
| `USER_COLLECTION`                     | No       | User collection name; defaults to `users`                        |
| `TRIP_COLLECTION`                     | No       | Trip collection name; defaults to `trips`                        |
| `ITINERARY_COLLECTION`                | No       | Itinerary collection name; defaults to `itineraries`             |
| `CHATS_COLLECTION`                    | No       | Standard chat collection name; defaults to `chats`               |
| `AI_CHATS_COLLECTION`                 | No       | AI chat collection name; defaults to `ai_chats`                  |
| `BUDGET_COLLECTION`                   | No       | Budget collection name; defaults to `budgets`                    |
| `AVAILABILITY_COLLECTION`             | No       | Availability tracker collection name; defaults to `availability` |
| `POLL_COLLECTION`                     | No       | Poll collection name; defaults to `polls`                        |
| `INTEGRATIONS_COLLECTION`             | No       | External integration collection name; defaults to `integrations` |
| `DOCUMENT_COLLECTION`                 | No       | Document collection name; defaults to `documents`                |
| `ALLOW_ORIGINS`                       | Yes      | Comma-separated exact frontend origins                           |
| `DEBUG`                               | No       | Debug mode; defaults to `false`                                  |
| `JWT_SECRET_KEY`                      | Yes      | Long random signing secret                                       |
| `JWT_ALGORITHM`                       | Yes      | JWT algorithm, currently `HS256`                                 |
| `JWT_ISSUER`                          | No       | JWT issuer; defaults to `travelmate-backend`                     |
| `JWT_AUDIENCE`                        | No       | JWT audience; defaults to `travelmate-frontend`                  |
| `JWT_EXPIRATION_TIME`                 | No       | JWT lifetime in minutes; defaults to `60`                        |
| `GOOGLE_CLIENT_ID`                    | Yes      | Google OAuth client ID for Calendar                              |
| `GOOGLE_CLIENT_SECRET`                | Yes      | Google OAuth client secret                                       |
| `GOOGLE_TOKEN_URI`                    | Yes      | Google OAuth token endpoint                                      |
| `GOOGLE_REDIRECT_URI`                 | Yes      | OAuth redirect URI for the deployed environment                  |
| `GEMINI_API_KEY`                      | Yes      | Gemini API key                                                   |
| `GCS_BUCKET_NAME`                     | No       | Google Cloud Storage bucket name; defaults to `documents_1_fyp`  |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Yes      | Service-account JSON as a protected environment value            |

Example shape only:

```env
DEBUG=false
ALLOW_ORIGINS=http://localhost:5173,https://your-production-app.vercel.app,https://your-preview-app.vercel.app
MONGO_URL=<mongodb-connection-string>
DATABASE_NAME=travelmate_db
JWT_SECRET_KEY=<random-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=60
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_REDIRECT_URI=http://localhost:5173
GEMINI_API_KEY=<gemini-api-key>
GCS_BUCKET_NAME=<bucket-name>
GOOGLE_APPLICATION_CREDENTIALS_JSON=<service-account-json>
```

### Frontend environment

Create `frontend/.env.local` locally, or configure these values in Vercel:

| Variable               | Required | Description                                           |
| ---------------------- | -------- | ----------------------------------------------------- |
| `VITE_API_URL`         | Yes      | Backend base URL, for example `http://localhost:8000` |
| `VITE_OAUTH_CLIENT_ID` | Yes      | Google Identity Services browser client ID            |

Only variables prefixed with `VITE_` are exposed to browser code. Do not put
private API keys or client secrets in frontend environment variables.

### Deployment configuration

For Vercel:

```env
VITE_API_URL=https://<render-service>.onrender.com
VITE_OAUTH_CLIENT_ID=<google-browser-client-id>
```

For Render, set the backend variables above and include the exact Vercel
production origin in `ALLOW_ORIGINS`. CORS credentials are enabled by the
backend, so wildcard origins are not appropriate.

Authentication uses an `HttpOnly` cookie. Production must use HTTPS and
cross-origin requests must retain credentials. The frontend does this in
`frontend/src/api/apiFetch.ts`; the backend configures the cookie in
`backend/app/utils/jwt.py`.

## 5. Key folders and files

```text
backend/
  app/
    controllers/     HTTP route definitions
    db/               MongoDB connection and application lifespan
    models/           Pydantic data models
    services/         Database and external-service business logic
    utils/            JWT and Google helper functions
    config.py         Environment and collection configuration
    dependencies.py   FastAPI dependency providers
    main.py           FastAPI application and router registration
  pyproject.toml      Poetry project and dependency declarations
  poetry.lock         Locked backend dependency versions
  requirements.txt    Pip-compatible backend dependencies

frontend/
  src/
    api/              Typed API request functions
    components/       Reusable UI components
    contexts/         React context providers
    hooks/            Reusable data-fetching and state hooks
    models/           TypeScript domain types
    views/            Page-level screens
    assets/           CSS and images
    App.tsx           Application routes and layout
    main.tsx          React bootstrap and providers
  package.json        Frontend scripts and dependencies
  package-lock.json   Locked frontend dependency versions
  vite.config.ts      Vite development proxy and build configuration
  vercel.json         Vercel SPA rewrite configuration
```

## 6. Major functions and implementation notes

### Application startup and routing

- `backend/app/main.py`: creates the FastAPI application, registers all
  controllers, enables CORS, and starts Uvicorn.
- `backend/app/config.py`: loads environment values and validates required
  Google Cloud Storage credentials.
- `backend/app/db/mongo.py`: owns MongoDB connection lifecycle.
- `backend/app/dependencies.py`: supplies database collections to route
  handlers.

### Authentication

- `create_access_token()` in `backend/app/utils/jwt.py` creates signed JWTs
  with expiration, issuer, and audience claims.
- `set_access_cookie()` sets the token as an `HttpOnly` cookie.
- `get_current_user()` reads and validates the cookie before protected
  operations.
- `clear_access_cookie()` removes the cookie during logout.
- `frontend/src/api/apiFetch.ts` uses `credentials: "include"` so cookies are
  sent with API requests.

### Gemini analysis

- `GeminiService.generate_text()` is the common Gemini text-generation wrapper.
- `extract_budget_items()` detects expenses in free-form descriptions.
- Receipt, document, itinerary, and AI chat operations are exposed through
  `backend/app/controllers/gemini_controller.py`.
- `frontend/src/api/gemini.ts` provides typed frontend wrappers for analysis
  endpoints.
- `ThinkingRobot.tsx` displays analysis progress while these asynchronous
  requests are running.
- `MOCK_GEMINI_API` can be used as a development fallback for simulating Gemini API calls in the event of API unavailability.

### Trips and collaboration

- `trips_controller.py` handles trip creation, updates, members, invitations,
  images, and trip deletion.
- `itinerary_controller.py` and `itinerary_service.py` manage itinerary items.
- `chat_controller.py` manages standard group chat.
- `ai_chat_controller.py` manages AI chat history and recommendations.
- `availability_tracker_controller.py` manages shared availability.
- `poll_controller.py` manages polls, options, voting, and deletion.

Protected routes receive the authenticated user through
`get_current_user()`. Keep authorization checks in route handlers and services
when operating on user-owned or trip-owned data.

### Budget and documents

- `budget_controller.py` and `budget_service.py` manage budgets and
  expenditures.
- `TripBudgetPage.tsx` uploads receipt images and presents Gemini-extracted
  expenditure data for confirmation.
- `document_controller.py` and `DocumentService` upload metadata to MongoDB
  and files to Google Cloud Storage.

### Google Calendar

- `google_calendar_service.py` exchanges OAuth authorization codes, stores
  integration tokens, refreshes expired access tokens, and creates events.
- `google_calendar_controller.py` exposes connection status, connect,
  disconnect, export, and event creation endpoints.
- OAuth redirect URIs must match the Google Cloud Console configuration
  exactly for each environment.
