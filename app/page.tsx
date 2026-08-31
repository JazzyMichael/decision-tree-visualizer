import { Background, Controls, ReactFlow } from "@xyflow/react";

export default function Home() {
  return (
    <main className="h-full w-full">
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}
