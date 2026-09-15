"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ensureMockData } from "./db";
import { calculateLayout } from "./layout-engine";
import { TreeNodeComponent } from "./tree-node";
import { TreeEdgeComponent } from "./tree-edge";
// import PromptCard from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const nodeTypes: NodeTypes = {
  TreeNode: TreeNodeComponent,
};

const edgeTypes: EdgeTypes = {
  TreeEdge: TreeEdgeComponent,
};

export function TreeCanvas({ treeId }: { treeId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  React.useEffect(() => {
    void ensureMockData();
  }, []);

  const rawNodes = useLiveQuery(
    () => db.nodes.where("treeId").equals(treeId).toArray(),
    [treeId],
  );
  const rawEdges = useLiveQuery(
    () => db.edges.where("treeId").equals(treeId).toArray(),
    [treeId],
  );

  React.useEffect(() => {
    if (!rawNodes || !rawEdges || rawNodes.length === 0) return;

    let isMounted = true;

    calculateLayout(rawNodes, rawEdges)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        if (isMounted) {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        }
      })
      .catch((err) => {
        console.error("Error calculating ELK layout:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [rawNodes, rawEdges, setNodes, setEdges]);

  const handlePromptSubmit = async (prompt: string) => {
    if (!rawNodes || rawNodes.length === 0) return;
    const now = Date.now();
    const newId = `node-${now}`;
    const newEdgeId = `edge-${now}`;

    const parent = rawNodes[rawNodes.length - 1];

    await db.nodes.put({
      id: newId,
      treeId,
      parentId: parent.id,
      type: "TreeNode",
      data: {
        label: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
        description: prompt,
        category: "preparation",
        status: "in-progress",
        tags: ["ai-generated", "custom-step"],
      },
    });

    await db.edges.put({
      id: newEdgeId,
      treeId,
      source: parent.id,
      target: newId,
      label: "Next Step",
      type: "TreeEdge",
      animated: true,
    });
  };

  const handleResetData = async () => {
    await db.nodes.where("treeId").equals(treeId).delete();
    await db.edges.where("treeId").equals(treeId).delete();
    await db.trees.delete(treeId);
    await ensureMockData();
  };

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: "TreeEdge" }}
      >
        <Panel position="top-right" className="flex items-center gap-2 m-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="text-xs bg-background/90 backdrop-blur-sm shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset Mock Data
          </Button>
        </Panel>
        {/* <Panel position="bottom-center" className="mb-6">
          <PromptCard onSubmit={handlePromptSubmit} />
        </Panel> */}
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
