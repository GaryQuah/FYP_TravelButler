# TravelMate

This project presents the design and development of a Travel Butler Application
that leverages Generative AI to provide personalised travel planning and
assistance.

#

Travel planning is time-consuming and often becomes a fragmented process where travellers need to use multiple software to plan, communicate, budget and look for common dates.

Existing travel planning websites and applications are available for users to use for travel planning, but often require users to manually enter and organise large amounts of information, increasing effort and may create friction between users and the applications.

#

Recent advancements in Artificial Intelligence, particularly Generative AI, have enabled systems to understand natural language and generate meaningful, context-aware responses. This creates an opportunity to develop a travel planner to reduce the effort in travel planning, automating mundane tasks and simplifying the user input required to plan a trip.

This Travel Butler Application seeks to address these challenges by consolidating travel planning tasks into a single intelligent platform and enhancing user experience by automating user tasks.

See [DOCUMENTATION.md](./DOCUMENTATION.md) for the complete software inventory,
installation procedure, environment parameters, architecture, and key
implementation notes.

#

The main objectives of this project are:

To design and develop a Travel Butler Application with Gen-AI capabilities, enhancing and simplifying the user travel planning experience.
To demonstrate the practical application of full-stack development concepts in a real-world system.

#

The scope of this project includes:
Development of a full-stack web application consisting of both frontend and backend components.
Frontend implementation for user interaction, input handling, and result visualisation.
Backend implementation for business logic, data management, and integration with Gen-AI services or other external API services.
Basic user authentication and preference handling.

## Run Locally

### Frontend

To run the frontend

Install dependencies

```bash
cd .\frontend\
```

```bash
 npm install
```

```bash
npm run dev
```

### Backend

To run the backend

Install dependencies

```bash
cd .\backend\
```

```bash
poetry install
```

```bash
poetry run uvicorn app.main:app --reload
```

The local backend listens on `http://localhost:8000`. Set the frontend
`VITE_API_URL` to `http://localhost:8000` for local development and to
`https://<app-name>.onrender.com` in the production Vercel environment.
Authentication uses an `HttpOnly` cookie, so browser API requests must retain
credentials and the production frontend must be served over HTTPS.

Google Identity Services also requires `http://localhost:5173` to be listed as
an authorized JavaScript origin for the OAuth client configured by
`VITE_OAUTH_CLIENT_ID`. Configure this in Google Cloud Console; do not place
the OAuth client secret in the frontend environment.

## Software and cloud services

| Software or service         | Version or purpose                 | URL                                           |
| --------------------------- | ---------------------------------- | --------------------------------------------- |
| Python                      | `>=3.11` backend runtime           | <https://www.python.org/>                     |
| FastAPI                     | `>=0.128.0,<0.129.0` API framework | <https://fastapi.tiangolo.com/>               |
| Uvicorn                     | `>=0.40.0,<0.41.0` ASGI server     | <https://www.uvicorn.org/>                    |
| Poetry                      | Backend dependency management      | <https://python-poetry.org/>                  |
| React                       | `^19.2.0` frontend UI              | <https://react.dev/>                          |
| TypeScript                  | `~5.9.3` frontend type checking    | <https://www.typescriptlang.org/>             |
| Vite                        | `^7.2.4` frontend bundler          | <https://vite.dev/>                           |
| Bootstrap / Bootstrap Icons | `^5.3.8` / `^1.13.1` UI            | <https://getbootstrap.com/>                   |
| MongoDB Atlas               | Application database               | <https://www.mongodb.com/atlas>               |
| Google Gemini API           | AI chat and analysis               | <https://ai.google.dev/>                      |
| Google Calendar API         | Calendar integration               | <https://developers.google.com/calendar/api>  |
| Google Cloud Storage        | Images and uploaded documents      | <https://cloud.google.com/storage>            |
| Vercel / Render             | Frontend / backend hosting         | <https://vercel.com/> / <https://render.com/> |

## Installation

### Backend

```powershell
Set-Location .\backend
poetry install
poetry run uvicorn app.main:app --reload
```

If Poetry is unavailable:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Useful commands are `npm run build`, `npm run lint`, and `npm run preview`.

## Environment parameters

Never commit `.env` files, API keys, OAuth secrets, JWT secrets, private keys,
or service-account JSON. Configure these values locally or in the hosting
provider's secret environment:

### Backend

```env
MONGO_URL=<mongodb-connection-string>
DATABASE_NAME=travelmate_db
USER_COLLECTION=users
TRIP_COLLECTION=trips
ITINERARY_COLLECTION=itineraries
CHATS_COLLECTION=chats
AI_CHATS_COLLECTION=ai_chats
BUDGET_COLLECTION=budgets
AVAILABILITY_COLLECTION=availability
POLL_COLLECTION=polls
INTEGRATIONS_COLLECTION=integrations
DOCUMENT_COLLECTION=documents
ALLOW_ORIGINS=http://localhost:5173,https://your-production-app.vercel.app
DEBUG=false
JWT_SECRET_KEY=<random-secret>
JWT_ALGORITHM=HS256
JWT_ISSUER=travelmate-backend
JWT_AUDIENCE=travelmate-frontend
JWT_EXPIRATION_TIME=60
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_REDIRECT_URI=<environment-specific-redirect-uri>
GEMINI_API_KEY=<gemini-api-key>
GCS_BUCKET_NAME=documents_1_fyp
GOOGLE_APPLICATION_CREDENTIALS_JSON=<service-account-json>
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
VITE_OAUTH_CLIENT_ID=<google-browser-client-id>
```

For Vercel, set `VITE_API_URL` to the Render backend URL. For Render, set
`ALLOW_ORIGINS` to the exact Vercel production or preview origins. Do not use
`*` with credentialed cookies. Production deployments must use HTTPS.

## Key folders and files

```text
backend/app/
  controllers/     API route definitions
  db/              MongoDB connection and lifespan
  models/          Pydantic data models
  services/        Database and external-service logic
  utils/           JWT and Google helpers
  config.py        Environment and collection configuration
  dependencies.py  FastAPI dependency providers
  main.py          FastAPI application and router registration

frontend/src/
  api/             API request functions
  components/      Reusable UI components
  contexts/        React context providers
  hooks/           Reusable state and data hooks
  models/          TypeScript domain types
  views/           Page-level screens
  assets/          CSS and images
  App.tsx          Application routes and layout
  main.tsx         React bootstrap and providers
```

## Major functions and implementation notes

- `backend/app/main.py` creates the FastAPI app, registers controllers, and
  enables CORS.
- `backend/app/config.py` loads environment values and collection defaults.
- `backend/app/utils/jwt.py` creates, validates, sets, and clears JWT cookies.
- `frontend/src/api/apiFetch.ts` uses `credentials: "include"` for cookie auth.
- `GeminiService` handles text, itinerary, receipt, document, and expense
  analysis through `backend/app/controllers/gemini_controller.py`.
- `ThinkingRobot.tsx` provides progress feedback during Gemini analysis.
- `DocumentService` stores document metadata in MongoDB and files in Google
  Cloud Storage using short-lived signed URLs.
- `google_calendar_service.py` handles OAuth token exchange, refresh, and event
  creation.

The authentication cookie is `HttpOnly`; browser JavaScript must not read it or
restore the old local-storage bearer-token flow. OAuth redirect URIs must match
Google Cloud Console exactly. Run `npm run build` before deploying frontend
changes, and rotate credentials immediately if they are exposed.

The detailed versioned software inventory and implementation notes are also
available in [DOCUMENTATION.md](./DOCUMENTATION.md).
