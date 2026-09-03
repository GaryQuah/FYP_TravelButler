# Used to mock the itinerary analysis response from Gemini when tokens are maxed out for the day
MOCK_ITINERARY_ANALYSIS = {
    "recommendations": [
        {
            "activity_name": "Art & Culture at National Gallery Singapore",
            "start_time": "2026-08-06T12:00:00",
            "end_time": "2026-08-06T15:00:00",
            "description": "After exploring Tiong Bahru, head to the civic district and visit the National Gallery Singapore. Housed in two beautifully restored national monuments, it showcases a stunning collection of Southeast Asian art. Enjoy lunch at one of the gallery's cafes or restaurants before immersing yourself in the art."
        },
        {
            "activity_name": "Gardens by the Bay - Supertree Grove & Cloud Forest",
            "start_time": "2026-08-06T17:30:00",
            "end_time": "2026-08-06T20:00:00",
            "description": "Following your Peranakan heritage walk, travel to Gardens by the Bay. Experience the awe-inspiring Supertree Grove, perhaps catching the early evening light, and explore the unique ecosystems in the Cloud Forest dome. This provides a refreshing transition before heading to dinner."
        }
    ]
}