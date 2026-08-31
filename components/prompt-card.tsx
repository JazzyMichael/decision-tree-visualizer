"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type PromptCardProps = {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
};

export function PromptCard({
  onSubmit,
  placeholder = "Describe the outcome you want to achieve...",
  submitLabel = "Generate",
}: PromptCardProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    onSubmit?.(trimmed);
    setValue("");
  };

  return (
    <Card className="w-xl max-w-screen border-0 bg-background/95 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle>AI Prompt</CardTitle>
        <CardDescription>Ask for a next step, idea, or plan.</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-h-30 bg-muted/40 text-sm leading-6"
          aria-label="AI prompt input"
        />
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <p className="text-xs text-muted-foreground">Ready when you are</p>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PromptCard;
