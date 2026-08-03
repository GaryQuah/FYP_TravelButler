import os
import json
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

    def list_models(self):
        """
        Print all available Gemini models.
        """
        print("Available Gemini models:\n")

        for model in self.client.models.list():
            print(model.name)

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
        Extract the first budget-related expense from the following text.

        Text:
        {user_input}

        Instructions:
        1. Identify the first expense mentioned with a specific monetary amount.
        2. Determine:
            - item
            - amount
            - category
        3. If no item name is mentioned, infer one from the context.
        4. Remove currency symbols.
        5. Return ONLY valid JSON.
        6. Do not include markdown or explanations.
        7. If no expense exists, return {{}}.

        Expected format:

        {{
            "expenditure": {{
                "item": "Dinner at restaurant",
                "amount": 50.00,
                "category": "Food"
            }}
        }}
        """

        response_text = self.generate_text(
            prompt=prompt,
            temperature=temperature
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
        temperature: float = 0.7
    ) -> dict:
        """
        Generate a chat response.
        """

        system_instruction = f"""
        You are a friendly and helpful travel assistant.
        Your goal is to help users plan their trips to {country}.
        Be concise and provide relevant information about {country}.
        When suggesting activities or itineraries, provide only one option. Do not give multiple choices.
        If the user is asking for an itinerary, return a JSON object with two keys: "response" and "itinerary".
        The "response" key should contain the text response, and the "itinerary" key should contain a list of itinerary items.
        Each itinerary item should be a JSON object with the following keys: "activity_name", "start_time", "end_time", "description".
        The start_time and end_time should be in ISO 8601 format.
        If the user is not asking for an itinerary, return a JSON object with only the "response" key.
        Return ONLY valid JSON. Do not include markdown or explanations.
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
            temperature=temperature
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