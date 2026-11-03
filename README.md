# FYP

This project presents the design and development of a Travel Butler Application that leverages Generative AI (Gen-AI) to provide personalised travel planning and assistance. 

This project aims to create a centralized AI assisted application, simplifying trip planning by hosting multiple core features within a centralised travel planning application while ensuring an intuitive and simple user experience.

#

Travel planning is time-consuming and often becomes a fragmented process where travellers need to use multiple software to plan, communicate, budget and look for common dates.

Existing travel planning websites and applications are available for users to use for travel planning, but often require users to manually enter and organise large amounts of information, increasing effort and may create friction between users and the applications. 

#

Recent advancements in Artificial Intelligence, particularly Generative AI, have enabled systems to understand natural language and generate meaningful, context-aware responses. This creates an opportunity to develop a travel planner to reduce the effort in travel planning, automating mundane tasks and simplifying the user input required to plan a trip.

This Travel Butler Application seeks to address these challenges by consolidating travel planning tasks into a single intelligent platform and enhancing user experience by automating user tasks. 

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
npm install
```

```bash
cd .\frontend\; npm run dev
```
### Backend
To run the backend

Install dependencies

```bash
poetry install
```

```bash
cd .\backend\; poetry run uvicorn app.main:app --reload
```

The local backend listens on `http://localhost:8000`. Set the frontend
`VITE_API_URL` to `http://localhost:8000` for local development and to
`https://fyp-travelbutler.onrender.com` in the production Vercel environment.
Authentication uses an `HttpOnly` cookie, so browser API requests must retain
credentials and the production frontend must be served over HTTPS.

Google Identity Services also requires `http://localhost:5173` to be listed as
an authorized JavaScript origin for the OAuth client configured by
`VITE_OAUTH_CLIENT_ID`. Configure this in Google Cloud Console; do not place
the OAuth client secret in the frontend environment.
