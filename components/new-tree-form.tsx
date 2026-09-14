"use client";

import * as React from "react";
// import { toast } from "sonner"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

const initialItems = [
  {
    choices: [
      { value: "Health & Wellness" },
      { value: "Start a Business" },
      { value: "Get a New Job" },
      { value: "Build Knowledge" },
    ],
    name: "topic",
    required: true,
  },
  {
    choices: [
      { value: "Specific Goals" },
      // { value: "clarification questions" },
    ],
    name: "details",
    required: true,
  },
  {
    choices: [
      { value: "Fundamentals" },
      { value: "Awareness" },
      { value: "Commitment" },
      { value: "Current progress or blank slate" },
      { value: "Limitations" },
    ],
    name: "starting point",
    required: true,
  },
];

const itemClassName =
  "data-active:animate-in data-active:fade-in-0 data-active:slide-in-from-bottom-2 data-active:duration-800 motion-reduce:animate-none";

export function NewTreeForm() {
  const [items, setItems] = React.useState(initialItems);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data = {
      topic: formData.get("topic"),
      details: formData.getAll("details"),
    };

    console.log(data);

    // toast message or something
    // generate tree nodes/edges
    // redirect to page with new tree
  }

  function handleItemChange(item: string) {
    console.log(item);

    if (item === "details") {
      const newItems = [
        {
          choices: [
            { value: "CHANGED Health & Wellness" },
            { value: "CHANGED Start a Business" },
            { value: "CHANGED Get a New Job" },
            { value: "CHANGED Build Knowledge" },
          ],
          name: "topic",
          required: true,
        },
        {
          choices: [
            { value: "CHANGED Specific Goals" },
            // { value: "clarification questions" },
          ],
          name: "details",
          required: true,
        },
      ];

      setItems(newItems);
      console.log("set");
    }
  }

  return (
    <Questionnaire
      className="mx-auto max-w-md"
      items={items}
      onSubmit={handleSubmit}
      onItemChange={handleItemChange}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="topic" required className={itemClassName}>
        <QuestionnaireTitle>
          How should the agent approach this refactor?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          Choose a strategy or write a more specific instruction.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="Health & Wellness">
            Health & Wellness
          </QuestionnaireChoice>
          <QuestionnaireChoice value="Start a Business">
            Start a Business
          </QuestionnaireChoice>
          <QuestionnaireChoice value="Get a New Job">
            Get a Job
          </QuestionnaireChoice>
          <QuestionnaireChoice value="Build Knowledge">
            Learn Something or Build a Skill
          </QuestionnaireChoice>
          <QuestionnaireInput
            aria-label="topic or goal"
            placeholder="Describe a general topic or goal"
          />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem
        name="details"
        multiple
        required
        className={itemClassName}
      >
        <QuestionnaireTitle>
          How should the agent approach this refactor?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          AI-Generated Suggestions: ...
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="Lose Weight">
            Lose weight
          </QuestionnaireChoice>
          <QuestionnaireChoice value="Create Business">
            Create business
          </QuestionnaireChoice>
          <QuestionnaireInput
            aria-label="specific details"
            placeholder="Describe specific goals and details"
          />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Submit brief</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
