import { google } from "@ai-sdk/google";
import { customProvider } from "ai";

export const scira = customProvider({
  languageModels: {
    "padyna-google-pro": google("gemini-2.0-pro"),
  },
});
