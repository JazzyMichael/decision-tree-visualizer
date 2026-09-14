export type TreeNodeStatus =
  | "completed"
  | "in-progress"
  | "pending"
  | "skipped";

// Eventually update this to be dynamic or greatly expanded
export type TreeNodeCategory =
  | "status"
  | "mindset"
  | "preparation"
  | "skills"
  | "search"
  | "outreach"
  | "interview"
  | "outcome";

export interface TreeNodeData {
  label: string;
  description?: string;
  category?: TreeNodeCategory | string;
  status?: TreeNodeStatus;
  notes?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface TreeNode {
  id: string;
  treeId: string;
  parentId?: string | null;
  type?: string;
  data: TreeNodeData;
}

export interface TreeEdge {
  id: string;
  treeId: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
}

export interface Tree {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
