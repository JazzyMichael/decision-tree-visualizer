// Module wrapping the browser prompt api: https://developer.chrome.com/docs/ai/prompt-api

/// <reference path="../node_modules/@types/dom-chromium-ai/index.d.ts" />

export const availability = await LanguageModel.availability({
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

export const session = await LanguageModel.create({
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
  // monitor(monitor) {
  //   monitor.addEventListener("downloadprogress", (e) => {
  //     console.log(`Downloading model data ${Math.floor(e.loaded * 100)}%`);
  //   });
  // },
});
