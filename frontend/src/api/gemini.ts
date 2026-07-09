import { post } from "./utils";

export const analyzeDescription = async (description: string) => {
  return await post("/api/gemini/analyze-description", { description });
};

export const analyzeReceipt = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);
  return await post("/api/gemini/analyze-receipt", formData);
};
