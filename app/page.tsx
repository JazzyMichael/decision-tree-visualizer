import { Background, Controls, Panel, ReactFlow } from "@xyflow/react";

import PromptCard from "@/components/prompt-card";

export default function Home() {
  return (
    <main className="h-full w-full">
      <ReactFlow>
        <Panel position="bottom-center">
          <PromptCard />
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}
