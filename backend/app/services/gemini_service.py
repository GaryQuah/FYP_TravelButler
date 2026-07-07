import os
import json
from typing import Optional, List

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

    DEFAULT_MODEL = "gemini-2.5-flash"

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
    ) -> str:
        """
        Extract budget-related items from free-form text.
        Returns a JSON string.
        """

        prompt = f"""
        Extract the first budget-related expense from the following text.

        Text:
        {user_input}

        Instructions:
        1. Identify the first expense mentioned with a specific monetary amount.
        2. For this expense, determine:
        - item: a short title or name for the expense (e.g., "Dinner at restaurant", "Souvenir").
        - amount: the numeric amount as a float.
        - category: a short descriptive category (e.g., Food, Transport, Accommodation, Entertainment, Shopping, Miscellaneous).
        3. If no specific item name is mentioned, create a reasonable one from the context.
        4. Remove currency symbols and return only the numeric value for the amount.
        5. Return ONLY a single valid JSON object. Do not return a list.
        6. Do not include explanations, markdown, or additional text.
        7. If no expense is found, return an empty JSON object.

        Expected format:

        {{
            "expenditure": {{
                "item": "Dinner at restaurant",
                "amount": 50.00,
                "category": "Food"
            }}
        }}
        """
        
        response_text = self.generate_text(prompt=prompt, temperature=temperature)
        
        try:
            # Clean the response to ensure it's valid JSON
            clean_response = response_text.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean_response)
        except json.JSONDecodeError:
            # If parsing fails, return an empty dict or handle the error as needed
            return {}