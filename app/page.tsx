"use client";

import { useEffect, useState } from "react";
import { getBrowserAIInfo, type BrowserAIInfo } from "@/lib/ai";
import { NewTreeForm } from "@/components/new-tree-form";

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\//.test(ua)) return "Mozilla Firefox";
  if (/Chrome\//.test(ua)) return "Google Chrome";
  if (/Safari\//.test(ua)) return "Apple Safari";
  return "Unknown browser";
}

export default function Home() {
  const [ai, setAI] = useState<BrowserAIInfo | null>(null);
  const [browser, setBrowser] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setBrowser(detectBrowser());

    getBrowserAIInfo().then((info) => {
      if (!cancelled) {
        setAI(info);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="h-full w-full space-y-6 px-6 pt-10 text-center">
      <p>Nearly every web browser has a built-in AI model</p>

      <section aria-live="polite">
        <p className="font-semibold">
          {ai ? ai.model : "Checking your browser AI..."}
        </p>
        <p>Availability: {ai?.availability ?? "loading"}</p>
        <p className="text-sm text-muted-foreground">
          {browser ?? "Detecting browser…"}
        </p>
      </section>

      <p>
        Use this app to create detailed roadmaps and decision trees for
        accomplishing goals and progressing in any aspect of life.
      </p>

      <p>
        All data is stored in the browser with no remote servers or databases.
      </p>

      <p>Give it a try and do epic shit.</p>

      <section className="mt-20">
        <NewTreeForm />
      </section>
    </main>
  );
}
