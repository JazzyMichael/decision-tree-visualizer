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

// --- Form Data Types ---

export type FrequencyOption =
  | "daily"
  | "few-times-weekly"
  | "weekly"
  | "irregularly";

export type TreeFormData = {
  topic: string;
  goals: string;
  startingPoint: string;
  timePerWeek: string;
  frequency: FrequencyOption;
  constraints: string;
};

// --- AI Response Types ---

export type GoalSuggestions = {
  suggestions: string[];
  questions: string[];
};

export type StartingPointData = {
  questions: string[];
  suggestions: string[];
};

export type ConstraintData = {
  timeframeSuggestions: string[];
  commonConstraints: string[];
};

export type GeneratedTreeNode = {
  id: string;
  parentId: string | null;
  label: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
};

export type GeneratedTreeEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
};

export type GeneratedTree = {
  nodes: GeneratedTreeNode[];
  edges: GeneratedTreeEdge[];
};

// --- Internal Helpers ---

async function isAIAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !("LanguageModel" in window)) {
    console.log("no window or lm in window");
    return false;
  }

  try {
    // const availability = await LanguageModel.availability();
    const availability = await LanguageModel.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
    console.log("WTF", availability);
    return availability === "available" || availability === "downloadable";
  } catch (e) {
    console.log("NO - ", e);
    return false;
  }
}

async function createSession(
  systemPrompt: string,
): Promise<LanguageModel | null> {
  if (!(await isAIAvailable())) {
    console.log("create session - ai unavailable");
    return null;
  }
  try {
    return await LanguageModel.create({
      initialPrompts: [{ role: "system", content: systemPrompt }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
  } catch {
    return null;
  }
}

function parseJSONFromResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  // Extract the first JSON object/array from the response
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]) as T;
}

async function promptJSON<T>(
  session: LanguageModel,
  userPrompt: string,
  schema: Record<string, unknown>,
): Promise<T | null> {
  try {
    const raw = await session.prompt(userPrompt, {
      responseConstraint: schema,
    });
    return parseJSONFromResponse<T>(raw);
  } catch {
    // Retry without responseConstraint in case it's not supported
    try {
      const raw = await session.prompt(
        `${userPrompt}\n\nIMPORTANT: Your entire response must be only valid JSON — no explanation, no markdown.`,
      );
      return parseJSONFromResponse<T>(raw);
    } catch {
      return null;
    }
  }
}

// --- Public AI Functions ---

export async function generateGoalSuggestions(
  topic: string,
): Promise<GoalSuggestions | null> {
  const session = await createSession(
    "You are a helpful life and career coach helping users clarify their goals. Be concise, practical, and specific.",
  );
  if (!session) return null;

  try {
    return await promptJSON<GoalSuggestions>(
      session,
      `The user wants to work on: "${topic}".

Return a JSON object with this exact shape:
{
  "suggestions": ["specific goal 1", "specific goal 2", "specific goal 3"],
  "questions": ["clarifying question 1?", "clarifying question 2?"]
}

"suggestions": 3-4 specific, actionable goals related to "${topic}".
"questions": 2-3 questions that help the user think more concretely about what success looks like.`,
      {
        type: "object",
        properties: {
          suggestions: { type: "array", items: { type: "string" } },
          questions: { type: "array", items: { type: "string" } },
        },
        required: ["suggestions", "questions"],
      },
    );
  } finally {
    session.destroy();
  }
}

export async function generateStartingPointQuestions(
  topic: string,
  goals: string,
): Promise<StartingPointData | null> {
  const session = await createSession(
    "You are a helpful coach who helps users understand and articulate their current starting point. Be direct and insightful.",
  );
  if (!session) return null;

  try {
    return await promptJSON<StartingPointData>(
      session,
      `Topic: "${topic}". Goals: "${goals}".

Return a JSON object with this exact shape:
{
  "questions": ["question about knowledge?", "question about how others did it?", "starting fresh vs. progress?"],
  "suggestions": ["archetype 1", "archetype 2", "archetype 3"]
}

"questions": 3-4 leading questions covering:
  1. The user's current knowledge or experience with "${topic}"
  2. How aware they are of how others have achieved similar goals
  3. Whether they are starting from zero or already have some foundation
"suggestions": 3-4 short phrases describing common starting archetypes for "${topic}" (e.g. "Complete beginner, no prior experience").`,
      {
        type: "object",
        properties: {
          questions: { type: "array", items: { type: "string" } },
          suggestions: { type: "array", items: { type: "string" } },
        },
        required: ["questions", "suggestions"],
      },
    );
  } finally {
    session.destroy();
  }
}

export async function generateConstraintSuggestions(
  topic: string,
  goals: string,
): Promise<ConstraintData | null> {
  const session = await createSession(
    "You are a helpful coach who helps users think realistically about their time commitment and potential obstacles.",
  );
  if (!session) return null;

  try {
    return await promptJSON<ConstraintData>(
      session,
      `Topic: "${topic}". Goals: "${goals}".

Return a JSON object with this exact shape:
{
  "timeframeSuggestions": ["1-2 hours/week", "5-10 hours/week", "20+ hours/week"],
  "commonConstraints": ["constraint 1", "constraint 2", "constraint 3"]
}

"timeframeSuggestions": 3 realistic time commitment options for someone working on "${topic}".
"commonConstraints": 4-5 common obstacles or limiting factors specific to "${topic}".`,
      {
        type: "object",
        properties: {
          timeframeSuggestions: { type: "array", items: { type: "string" } },
          commonConstraints: { type: "array", items: { type: "string" } },
        },
        required: ["timeframeSuggestions", "commonConstraints"],
      },
    );
  } finally {
    session.destroy();
  }
}

export async function generateDecisionTree(
  formData: TreeFormData,
): Promise<GeneratedTree | null> {
  const session = await createSession(
    "You are an expert at creating structured, practical decision trees for goal achievement. Create comprehensive trees with real decision points and meaningful progression steps.",
  );
  if (!session) return null;

  try {
    return await promptJSON<GeneratedTree>(
      session,
      `Create a decision tree for the following:

Topic: ${formData.topic}
Goals: ${formData.goals}
Starting Point: ${formData.startingPoint}
Time Commitment: ${formData.timePerWeek}, ${formData.frequency}
Potential Constraints: ${formData.constraints || "none specified"}

Return a JSON object with this exact shape:
{
  "nodes": [
    {
      "id": "root",
      "parentId": null,
      "label": "Starting state label",
      "description": "Description of this node",
      "category": "status",
      "status": "pending",
      "tags": ["tag1", "tag2"]
    }
  ],
  "edges": [
    {
      "id": "edge-root-next",
      "source": "root",
      "target": "next-node-id",
      "label": "optional label"
    }
  ]
}

Guidelines:
- Create 12-20 nodes representing the full journey from start to achieved goal
- First node must have id "root" and parentId null — it represents the current starting state
- Last node represents the achieved goal outcome
- Include Yes/No decision branch nodes where appropriate (prefix decision node ids with "dec-")
- Categories must be one of: status, mindset, preparation, skills, action, outcome
- All node statuses must be "pending"
- Node IDs must be short kebab-case strings (e.g. "learn-basics", "dec-ready", "goal-achieved")
- Edge labels for key branches (e.g. "Yes", "No", "Retry", "Success")
- For retry/feedback loops, set animated: true on those edges`,
      {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                parentId: { type: ["string", "null"] },
                label: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                status: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
              },
              required: [
                "id",
                "parentId",
                "label",
                "description",
                "category",
                "status",
                "tags",
              ],
            },
          },
          edges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                source: { type: "string" },
                target: { type: "string" },
                label: { type: "string" },
                animated: { type: "boolean" },
              },
              required: ["id", "source", "target"],
            },
          },
        },
        required: ["nodes", "edges"],
      },
    );
  } catch (e) {
    console.log("failed to generate tree", e);
    session.destroy();
    return null;
  }
  //  finally {
  //   session.destroy();
  //   return null;
  // }
}
