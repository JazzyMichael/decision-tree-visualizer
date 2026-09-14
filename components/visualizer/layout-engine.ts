import ELK, {
  type ElkNode,
  type ElkExtendedEdge,
} from "elkjs/lib/elk.bundled.js";
import type { Node, Edge } from "@xyflow/react";
import type { TreeNode, TreeEdge } from "./types";

const elk = new ELK();

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 140;

export async function calculateLayout(
  rawNodes: TreeNode[],
  rawEdges: TreeEdge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (!rawNodes || rawNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const elkGraph: ElkNode = {
    id: "root-layout",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "180",
      "elk.layered.spacing.nodeNodeBetweenLayers": "240",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
    },
    children: rawNodes.map((n) => ({
      id: n.id,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    })),
    edges: rawEdges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })) as ElkExtendedEdge[],
  };

  const layoutedGraph = await elk.layout(elkGraph);

  const nodes: Node[] = rawNodes.map((n) => {
    const elkChild = layoutedGraph.children?.find((c) => c.id === n.id);
    return {
      id: n.id,
      type: n.type || "TreeNode",
      position: {
        x: elkChild?.x ?? 0,
        y: elkChild?.y ?? 0,
      },
      data: {
        ...n.data,
        dbId: n.id,
        treeId: n.treeId,
      },
    };
  });

  const edges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type || "TreeEdge",
    animated: e.animated ?? false,
  }));

  return { nodes, edges };
}
