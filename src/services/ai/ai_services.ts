import { model } from "@/services/ai/ai_model.ts";
import { GenerationConfig } from "@google/generative-ai";

const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export const chatSession = model.startChat({
  generationConfig,
});
