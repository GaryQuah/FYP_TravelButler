import { post } from "./utils";

export const analyzeDescription = async (description: string) => {
  return await post("/api/gemini/analyze-description", { description });
};