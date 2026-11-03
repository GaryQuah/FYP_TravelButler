from .mock_gemini_data import MOCK_ITINERARY_ANALYSIS
import logging
import os
import json
import re
from typing import Optional

from google import genai
from google.genai import types


class GeminiService:
    """
    Wrapper around the Gemini API.

    Example:
        gemini = GeminiService()

        response = gemini.generate_text(
            "Create a 3-day itinerary for Tokyo."
        )

        print(response)
    """

    DEFAULT_MODEL = "models/gemini-2.5-flash"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "Gemini API key not found. "
                "Set GEMINI_API_KEY environment variable."
            )

        self.client = genai.Client(api_key=self.api_key)
        self.model = model
        self.logger = logging.getLogger(__name__)

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_output_tokens: int = 2048
    ) -> str:
        """
        Generate a text response.
        """

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )

        return response.text

    def extract_budget_items(
        self,
        user_input: str,
        temperature: float = 0.2
    ) -> dict:
        """
        Extract budget-related items from free-form text.
        Returns a dictionary.
        """

        prompt = f"""
        Extract every budget-related expense from the following text.

        Text:
        {user_input}

        Instructions:
        1. Identify every expense mentioned with a specific monetary amount.
        2. Determine:
            - item
            - amount
            - category
        3. If no item name is mentioned, infer one from the context.
        4. Remove currency symbols.
        5. Return ONLY valid JSON.
        6. Do not include markdown or explanations.
        7. If no expense exists, return {{"expenditures": []}}.
        8. Preserve the order in which expenses appear in the text.

        Expected format:

        {{
            "expenditures": [
                {{
                    "item": "Dinner at restaurant",
                    "amount": 50.00,
                    "category": "Food"
                }}
            ]
        }}
        """

        response_text = self.generate_text(
            prompt=prompt,
            temperature=temperature,
            max_output_tokens=4096
        )

        try:
            clean_response = (
                response_text
                .strip()
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            return json.loads(clean_response)

        except json.JSONDecodeError:
            return {}

    def generate_chat_response(
        self,
        user_input: str,
        history: list,
        country: str,
        temperature: float = 0.7,
        itinerary: Optional[list] = None,
         max_output_tokens: int = 8192
    ) -> dict:
        """
        Generate a chat response.
        """

        system_instruction = f"""
    You are a travel assistant helping the user plan a trip to {country}.

    You MUST return ONLY valid JSON. No markdown, code fences, or text outside the JSON.

    Current itinerary:
    {json.dumps(itinerary)}

    The current itinerary is the source of truth. When modifying it, NEVER regenerate
    the itinerary from scratch and NEVER omit existing items unless the user explicitly
    asks to remove or replace them.

    ITINERARY REQUESTS:
    Requests to add, remove, change, update, move, replace, schedule, or recommend
    activities are itinerary requests.

    For itinerary requests, return:
    {{
        "response": "Brief description of the change.",
        "itinerary": [
            {{
                "activity_name": "string",
                "start_time": "ISO 8601 datetime",
                "end_time": "ISO 8601 datetime",
                "description": "string"
            }}
        ]
    }}

    Modification rules:

    ADD:
    - Keep ALL existing activities.
    - Add the requested activity.
    - Place it according to the user's requested order.
    - "Add dinner after Resorts World Sentosa" means:
    [existing Resorts World Sentosa, new Dinner]
    NOT [new Dinner].

    REMOVE:
    - Remove ONLY the activity explicitly requested.
    - Keep every other activity unchanged.

    UPDATE:
    - Change ONLY the requested activity/property.
    - Keep every unrelated activity unchanged.

    The output itinerary must always be the COMPLETE updated itinerary.
    If one activity is added and none are removed, the output should contain one more
    item than the current itinerary.

    Words such as "after", "before", "between", "then", and "next" describe ordering;
    they do NOT mean the referenced existing activity should be removed.

    Preserve existing activity names, times, and descriptions unless the user asks
    to change them.

    If the user provides no exact time for a new activity, infer a reasonable time
    from surrounding activities while maintaining the requested order.

    GENERAL QUESTIONS:
    For questions unrelated to itinerary modification (e.g. currency, weather,
    visa, language), answer the question without changing the itinerary.
    If an itinerary exists, return it unchanged in the "itinerary" field.
    If no itinerary exists, return only:
    {{"response": "answer"}}

    Before responding, verify:
    1. The output is valid JSON.
    2. All existing non-removed activities are present.
    3. Requested additions are present.
    4. Only requested changes were made.
    5. Every itinerary item contains activity_name, start_time, end_time, description.
    6. All times are ISO 8601.

    User request:
    """

        # Format the history
        formatted_history = ""
        for message in history:
            role = "User" if message["is_user"] else "AI"
            formatted_history += f"{role}: {message['text']}\n"

        prompt = f"""
        {formatted_history}
        User: {user_input}
        AI:
        """

        response_text = self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            max_output_tokens=max_output_tokens
        )

        print(response_text)

        try:
            # The response might be wrapped in markdown
            clean_response = (
                response_text
                .strip()
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )
            return json.loads(clean_response)
        except json.JSONDecodeError:
            return {"response": response_text, "itinerary": []}

    def extract_receipt(
        self,
        file_bytes: bytes,
        mime_type: str,
        temperature: float = 0.2
    ) -> dict:
        """
        Extract expenditure information from a receipt image.
        Returns a dictionary.
        """

        prompt = """
        Analyze this receipt image.

        Extract:
        - Merchant name
        - Total amount
        - Category

        Instructions:

        1. Use the merchant/store name as the item.
        2. Use the FINAL TOTAL shown on the receipt.
        3. Categorize into ONE of:
            - Food
            - Transport
            - Accommodation
            - Shopping
            - Entertainment
            - Utilities
            - Miscellaneous
        4. Return ONLY valid JSON.
        5. Do not include markdown or explanations.
        6. If the receipt cannot be read, return {}.

        Expected format:

        {
            "expenditure": {
                "item": "Starbucks",
                "amount": 25.50,
                "category": "Food"
            }
        }
        """

        contents = [
            prompt,
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=mime_type,
            ),
        ]

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=temperature,
            ),
        )

        try:
            clean_response = (
                response.text
                .strip()
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            return json.loads(clean_response)

        except (json.JSONDecodeError, AttributeError):
            return {}

    def analyze_itinerary(
        self,
        itinerary: list,
        temperature: float = 0.7,
        max_output_tokens: int = 8192
    ) -> dict:
        if os.getenv("MOCK_GEMINI_API", "False").lower() in ("true", "1", "t"):
            return MOCK_ITINERARY_ANALYSIS
        if os.getenv("MOCK_GEMINI_API", "False").lower() in ("true", "1", "t"):
            return MOCK_ITINERARY_ANALYSIS
        """
        Analyze an itinerary and provide recommendations.
        """

        system_instruction = f"""
        Analyze the following itinerary and provide recommendations for improvement.

        Instructions:
        1. Identify any gaps in the itinerary of 2 hours or more.
        2. For each gap, recommend a relevant activity, including a name and description.
        3. Return a list of recommendations in JSON format.
        4. If there are no gaps, return an empty list.
        5. Return ONLY valid JSON.
        6. Do not include markdown or explanations.

        Expected format:

        {{
            "recommendations": [
                {{
                    "activity_name": "string",
                    "start_time": "ISO 8601 datetime for the start of the gap",
                    "end_time": "ISO 8601 datetime for the end of the gap",
                    "description": "string"
                }}
            ]
        }}
        """

        prompt = f"""
        Here is the itinerary to analyze:
        {json.dumps(itinerary)}

        Please provide your analysis in the requested JSON format.
        Analysis:
        """

        response_text = self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            max_output_tokens=max_output_tokens
        )

        print("raw response:", response_text)

        try:
            # Use regex to find the JSON block
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                json_str = match.group(0)
                return json.loads(json_str)
            else:
                return {"recommendations": []}

        except json.JSONDecodeError:
            return {"recommendations": []}

    def extract_document(
        self,
        file_bytes: bytes,
        mime_type: str,
        temperature: float = 0.2
    ) -> dict:
        """
        Analyze a generic travel document image and extract itinerary and/or budget
        details when present.
        """

        prompt = """
        Analyze this travel-related image/document and detect whether it contains:
        1) itinerary/ticket details (e.g., flight ticket, boarding pass, transport ticket)
        2) budget/expense details (e.g., receipt, amount spent, payable amount)

        Return ONLY valid JSON in this exact shape:
        {
          "itinerary_found": true or false,
          "budget_found": true or false,
          "itinerary": {
            "activity_name": "string",
            "start_time": "ISO 8601 datetime string or empty string",
            "end_time": "ISO 8601 datetime string or empty string",
            "description": "string"
          },
          "budget": {
            "item": "string",
            "amount": number,
            "category": "string"
          }
        }

        Rules:
        - If itinerary details are not found, set itinerary_found to false and itinerary to {}.
        - If budget details are not found, set budget_found to false and budget to {}.
        - If details are partially missing, still set *_found true when the document is clearly related, and fill missing fields with empty strings.
        - For budget.category, choose one of: Food, Transport, Accommodation, Shopping, Entertainment, Utilities, Miscellaneous.
        - Do not include markdown, comments, or any text outside JSON.
        """

        safe_mime_type = mime_type or "application/octet-stream"

        contents = [
            prompt,
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=safe_mime_type,
            ),
        ]

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=temperature,
            ),
        )

        try:
            clean_response = (
                response.text
                .strip()
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            parsed = json.loads(clean_response)
            if not isinstance(parsed, dict):
                return {}
            return parsed
        except (json.JSONDecodeError, AttributeError):
            return {}