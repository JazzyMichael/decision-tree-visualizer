"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generateGoalSuggestions,
  generateStartingPointQuestions,
  generateConstraintSuggestions,
  generateDecisionTree,
  type TreeFormData,
  type FrequencyOption,
  type GoalSuggestions,
  type StartingPointData,
  type ConstraintData,
} from "@/lib/ai";
import { db } from "@/components/visualizer/db";
import type {
  Tree,
  TreeNode,
  TreeEdge,
  TreeNodeStatus,
} from "@/components/visualizer/types";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  TreePine,
} from "lucide-react";
import { toKebabCase, toTitleCase } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type FormState = "form" | "generating" | "error";

const FREQUENCY_OPTIONS: { value: FrequencyOption; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "few-times-weekly", label: "A few times a week" },
  { value: "weekly", label: "Weekly" },
  { value: "irregularly", label: "Irregularly" },
];

const STEP_TITLES: Record<Step, string> = {
  1: "What would you like to accomplish?",
  2: "What are your specific goals?",
  3: "Where are you starting from?",
  4: "Time & commitment",
};

const STEP_DESCRIPTIONS: Record<Step, string> = {
  1: "Give your tree a simple, high-level topic or phrase.",
  2: "Describe the outcomes you want. AI can help suggest ideas.",
  3: "Describe your current level and starting point.",
  4: "How much time can you commit, and what might get in the way?",
};

type AISlot<T> = { loading: boolean; data: T | null };

function SuggestionChips({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(chip)}
          className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function AIHint({ loading, label }: { loading: boolean; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {loading ? "Generating suggestions…" : label}
    </p>
  );
}

function appendLine(existing: string, value: string): string {
  const trimmed = existing.trim();
  return trimmed ? `${trimmed}\n${value}` : value;
}

export function NewTreeForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [formState, setFormState] = useState<FormState>("form");
  const [errorMessage, setErrorMessage] = useState("");

  // Form values
  const [topic, setTopic] = useState("");
  const [goals, setGoals] = useState("");
  const [startingPoint, setStartingPoint] = useState("");
  const [timePerWeek, setTimePerWeek] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("weekly");
  const [constraints, setConstraints] = useState("");

  // Per-step AI state
  const [step2AI, setStep2AI] = useState<AISlot<GoalSuggestions>>({
    loading: false,
    data: null,
  });
  const [step3AI, setStep3AI] = useState<AISlot<StartingPointData>>({
    loading: false,
    data: null,
  });
  const [step4AI, setStep4AI] = useState<AISlot<ConstraintData>>({
    loading: false,
    data: null,
  });

  // Validation errors
  const [errors, setErrors] = useState<
    Partial<Record<"topic" | "goals" | "startingPoint" | "timePerWeek", string>>
  >({});

  function clearError(field: keyof typeof errors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(s: Step): boolean {
    if (s === 1 && !topic.trim()) {
      setErrors((e) => ({ ...e, topic: "Please enter a topic." }));
      return false;
    }
    if (s === 2 && !goals.trim()) {
      setErrors((e) => ({ ...e, goals: "Please describe your goals." }));
      return false;
    }
    if (s === 3 && !startingPoint.trim()) {
      setErrors((e) => ({
        ...e,
        startingPoint: "Please describe your starting point.",
      }));
      return false;
    }
    if (s === 4 && !timePerWeek.trim()) {
      setErrors((e) => ({
        ...e,
        timePerWeek: "Please enter your time commitment.",
      }));
      return false;
    }
    return true;
  }

  function fireStep2AI() {
    if (step2AI.data || step2AI.loading) return;
    setStep2AI({ loading: true, data: null });
    generateGoalSuggestions(topic.trim()).then((data) =>
      setStep2AI({ loading: false, data }),
    );
  }

  function fireStep3AI() {
    if (step3AI.data || step3AI.loading) return;
    setStep3AI({ loading: true, data: null });
    generateStartingPointQuestions(topic.trim(), goals.trim()).then((data) =>
      setStep3AI({ loading: false, data }),
    );
  }

  function fireStep4AI() {
    if (step4AI.data || step4AI.loading) return;
    setStep4AI({ loading: true, data: null });
    generateConstraintSuggestions(topic.trim(), goals.trim()).then((data) =>
      setStep4AI({ loading: false, data }),
    );
  }

  function handleNext() {
    if (!validateStep(step)) return;
    const next = (step + 1) as Step;
    setStep(next);
    if (next === 2) fireStep2AI();
    if (next === 3) fireStep3AI();
    if (next === 4) fireStep4AI();
  }

  function handleBack() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function handleGenerate() {
    if (!validateStep(4)) return;
    setFormState("generating");
    setErrorMessage("");

    const formData: TreeFormData = {
      topic: topic.trim(),
      goals: goals.trim(),
      startingPoint: startingPoint.trim(),
      timePerWeek: timePerWeek.trim(),
      frequency,
      constraints: constraints.trim(),
    };

    try {
      const generated = await generateDecisionTree(formData);
      console.log("form tree", generated);

      if (!generated || !generated.nodes.length) {
        setFormState("error");
        setErrorMessage(
          "Could not generate the tree. Make sure your browser AI is available and try again.",
        );
        return;
      }

      const treeId = toKebabCase(formData.topic);
      const now = Date.now();

      const tree: Tree = {
        id: treeId,
        title: toTitleCase(formData.topic),
        description: formData.goals,
        createdAt: now,
        updatedAt: now,
      };

      // Collect valid node IDs for edge filtering
      const nodeIds = new Set(generated.nodes.map((n) => n.id));

      const nodes: TreeNode[] = generated.nodes.map((n) => ({
        id: n.id,
        treeId,
        parentId: n.parentId,
        type: "TreeNode",
        data: {
          label: n.label,
          description: n.description,
          category: n.category,
          status: (n.status as TreeNodeStatus) ?? "pending",
          tags: Array.isArray(n.tags) ? n.tags : [],
        },
      }));

      const edges: TreeEdge[] = generated.edges
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e) => ({
          id: e.id,
          treeId,
          source: e.source,
          target: e.target,
          label: e.label,
          type: "TreeEdge",
          animated: e.animated,
        }));

      await db.trees.put(tree);
      await db.nodes.bulkPut(nodes);
      await db.edges.bulkPut(edges);

      router.push(`/${treeId}`);
    } catch (err) {
      console.error("Error generating decision tree:", err);
      setFormState("error");
      setErrorMessage(
        "Something went wrong during generation. Please try again.",
      );
    }
  }

  if (formState === "generating") {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <TreePine className="h-8 w-8 text-primary" />
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="font-medium">Generating your decision tree…</p>
          <p className="text-sm text-muted-foreground">
            The browser AI is building your personalized roadmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (formState === "error") {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <p className="font-medium text-destructive">Generation failed</p>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <Button onClick={() => setFormState("form")}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg text-left">
      <CardHeader>
        <p className="text-xs font-medium text-muted-foreground">
          Step {step} of 4
        </p>
        <CardTitle>{STEP_TITLES[step]}</CardTitle>
        <CardDescription>{STEP_DESCRIPTIONS[step]}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Step 1: Topic ── */}
        {step === 1 && (
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. job search, learn guitar, build a startup…"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                clearError("topic");
                // Invalidate downstream AI when topic changes
                setStep2AI({ loading: false, data: null });
                setStep3AI({ loading: false, data: null });
                setStep4AI({ loading: false, data: null });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              autoFocus
              aria-invalid={!!errors.topic}
              aria-describedby={errors.topic ? "topic-error" : undefined}
            />
            {errors.topic && (
              <p id="topic-error" className="text-sm text-destructive">
                {errors.topic}
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Goals ── */}
        {step === 2 && (
          <div className="space-y-4">
            {step2AI.loading || step2AI.data?.questions?.length ? (
              <div className="space-y-2">
                <AIHint
                  loading={step2AI.loading}
                  label="Consider answering these"
                />
                {!step2AI.loading &&
                  step2AI.data?.questions?.map((q, i) => (
                    <p
                      key={i}
                      className="border-l-2 border-muted pl-3 text-sm text-muted-foreground"
                    >
                      {q}
                    </p>
                  ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="goals">Your goals</Label>
              <Textarea
                id="goals"
                placeholder="Describe what you want to achieve, what success looks like, specific milestones…"
                value={goals}
                onChange={(e) => {
                  setGoals(e.target.value);
                  clearError("goals");
                  // Invalidate downstream AI when goals change
                  setStep3AI({ loading: false, data: null });
                  setStep4AI({ loading: false, data: null });
                }}
                className="min-h-28"
                autoFocus
                aria-invalid={!!errors.goals}
                aria-describedby={errors.goals ? "goals-error" : undefined}
              />
              {errors.goals && (
                <p id="goals-error" className="text-sm text-destructive">
                  {errors.goals}
                </p>
              )}
            </div>

            {!step2AI.loading && step2AI.data?.suggestions?.length ? (
              <div className="space-y-2">
                <AIHint
                  loading={false}
                  label="Suggested goals — click to add"
                />
                <SuggestionChips
                  chips={step2AI.data.suggestions}
                  onSelect={(s) =>
                    setGoals((prev) => appendLine(prev, `${s}.`))
                  }
                />
              </div>
            ) : null}
          </div>
        )}

        {/* ── Step 3: Starting Point ── */}
        {step === 3 && (
          <div className="space-y-4">
            {step3AI.loading || step3AI.data?.questions?.length ? (
              <div className="space-y-2">
                <AIHint loading={step3AI.loading} label="Reflect on these" />
                {!step3AI.loading &&
                  step3AI.data?.questions?.map((q, i) => (
                    <p
                      key={i}
                      className="border-l-2 border-muted pl-3 text-sm text-muted-foreground"
                    >
                      {q}
                    </p>
                  ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="startingPoint">Your starting point</Label>
              <Textarea
                id="startingPoint"
                placeholder="Describe your current knowledge, prior experience, and where you're starting from…"
                value={startingPoint}
                onChange={(e) => {
                  setStartingPoint(e.target.value);
                  clearError("startingPoint");
                }}
                className="min-h-28"
                autoFocus
                aria-invalid={!!errors.startingPoint}
                aria-describedby={
                  errors.startingPoint ? "starting-point-error" : undefined
                }
              />
              {errors.startingPoint && (
                <p
                  id="starting-point-error"
                  className="text-sm text-destructive"
                >
                  {errors.startingPoint}
                </p>
              )}
            </div>

            {!step3AI.loading && step3AI.data?.suggestions?.length ? (
              <div className="space-y-2">
                <AIHint
                  loading={false}
                  label="Common starting points — click to add"
                />
                <SuggestionChips
                  chips={step3AI.data.suggestions}
                  onSelect={(s) =>
                    setStartingPoint((prev) => appendLine(prev, `${s}.`))
                  }
                />
              </div>
            ) : null}
          </div>
        )}

        {/* ── Step 4: Time & Constraints ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="timePerWeek">Time per week</Label>
              <Input
                id="timePerWeek"
                placeholder="e.g. 5–10 hours, 1 hour, 20+ hours…"
                value={timePerWeek}
                onChange={(e) => {
                  setTimePerWeek(e.target.value);
                  clearError("timePerWeek");
                }}
                autoFocus
                aria-invalid={!!errors.timePerWeek}
                aria-describedby={errors.timePerWeek ? "time-error" : undefined}
              />
              {errors.timePerWeek && (
                <p id="time-error" className="text-sm text-destructive">
                  {errors.timePerWeek}
                </p>
              )}
              {!step4AI.loading &&
              step4AI.data?.timeframeSuggestions?.length ? (
                <SuggestionChips
                  chips={step4AI.data.timeframeSuggestions}
                  onSelect={setTimePerWeek}
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      frequency === opt.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">
                Potential obstacles{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              {step4AI.loading && <AIHint loading={true} label="" />}
              <Textarea
                id="constraints"
                placeholder="What might make this difficult? (e.g. limited time, imposter syndrome, lack of network…)"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="min-h-20"
              />
              {!step4AI.loading && step4AI.data?.commonConstraints?.length ? (
                <div className="space-y-2">
                  <AIHint
                    loading={false}
                    label="Common obstacles — click to add"
                  />
                  <SuggestionChips
                    chips={step4AI.data.commonConstraints}
                    onSelect={(c) =>
                      setConstraints((prev) => appendLine(prev, `${c}.`))
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between pt-1">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button size="sm" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleGenerate}>
              <TreePine className="h-4 w-4" />
              Generate Tree
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
