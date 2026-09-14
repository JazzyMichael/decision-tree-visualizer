// Module wrapping the browser prompt api: https://developer.chrome.com/docs/ai/prompt-api

/// <reference path="../node_modules/@types/dom-chromium-ai/index.d.ts" />

export type BrowserAIAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable"
  | "unsupported"
  | "error";

export type BrowserAIInfo = {
  model: string;
  availability: BrowserAIAvailability;
};

export async function getBrowserAIInfo(): Promise<BrowserAIInfo> {
  if (typeof window === "undefined" || !("LanguageModel" in window)) {
    return {
      model: "Not supported",
      availability: "unsupported",
    };
  }

  try {
    const availability = await LanguageModel.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });

    return {
      model: "Browser-provided Prompt API model",
      availability,
    };
  } catch {
    return {
      model: "Browser-provided Prompt API model",
      availability: "error",
    };
  }
}
