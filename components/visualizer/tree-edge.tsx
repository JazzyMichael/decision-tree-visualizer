"use client";

import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";

export function TreeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
  markerEnd,
  animated,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const getBadgeStyle = (lbl?: string | React.ReactNode) => {
    if (typeof lbl !== "string")
      return "bg-muted text-muted-foreground border-border";
    if (
      lbl.toLowerCase().includes("yes") ||
      lbl.toLowerCase().includes("success")
    ) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    }
    if (
      lbl.toLowerCase().includes("no") ||
      lbl.toLowerCase().includes("retry") ||
      lbl.toLowerCase().includes("refine")
    ) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
    return "bg-secondary/90 text-secondary-foreground border-border";
  };

  const getStrokeStyle = () => {
    if (typeof label === "string") {
      if (
        label.toLowerCase().includes("yes") ||
        label.toLowerCase().includes("success")
      ) {
        return { stroke: "#10b981", strokeWidth: 2, ...style };
      }
      if (
        label.toLowerCase().includes("no") ||
        label.toLowerCase().includes("retry") ||
        label.toLowerCase().includes("refine")
      ) {
        return { stroke: "#f59e0b", strokeWidth: 2, ...style };
      }
    }
    return { stroke: "#64748b", strokeWidth: 1.5, ...style };
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={getStrokeStyle()}
        className={cn(animated ? "animate-pulse" : "")}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={cn(
              "nodrag nopan px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-sm backdrop-blur-md transition-all",
              getBadgeStyle(label),
            )}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
