"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  CheckCircle,
  PlayCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "./db";
import type { TreeNodeData, TreeNodeStatus } from "./types";

type TreeNodeProps = NodeProps<
  Node<TreeNodeData & { dbId: string; treeId: string }>
>;

export function TreeNodeComponent({ data, selected }: TreeNodeProps) {
  const status = data.status || "pending";
  const category = data.category || "status";

  const handleStatusChange = async (newStatus: TreeNodeStatus) => {
    if (!data.dbId) return;
    await db.nodes.update(data.dbId, (node) => {
      if (node && node.data) {
        node.data.status = newStatus;
      }
    });
  };

  const getStatusIcon = (st: TreeNodeStatus) => {
    switch (st) {
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case "in-progress":
        return (
          <PlayCircle className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
        );
      case "skipped":
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      case "pending":
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getStatusLabel = (st: TreeNodeStatus) => {
    switch (st) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "skipped":
        return "Skipped";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "status":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "mindset":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "preparation":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "skills":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
      case "search":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "outreach":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "interview":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "outcome":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <Card
      className={cn(
        "w-70 shadow-sm transition-all duration-200 border-2 bg-card/95 backdrop-blur-sm relative",
        selected
          ? "ring-2 ring-primary border-primary shadow-md"
          : "border-border/80",
        status === "completed" && "border-emerald-500/40 bg-emerald-500/5",
        status === "in-progress" &&
          "border-blue-500/60 ring-1 ring-blue-500/20 bg-blue-500/5",
        status === "skipped" && "border-amber-500/40 opacity-80 bg-amber-500/5",
        status === "pending" && "opacity-90",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-background bg-muted-foreground/60 transition-colors hover:bg-primary"
      />

      <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between gap-1 space-y-0">
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
            getCategoryStyles(category),
          )}
        >
          {category}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="nodrag nopan h-6 px-1.5 py-0 text-xs font-medium flex items-center gap-1 hover:bg-muted/80 rounded-md cursor-pointer"
              >
                {getStatusIcon(status)}
                <span className="text-[11px] font-normal">
                  {getStatusLabel(status)}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="nodrag nopan w-36">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                Update Status
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleStatusChange("completed")}
                className="text-xs gap-2 cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{" "}
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("in-progress")}
                className="text-xs gap-2 cursor-pointer"
              >
                <PlayCircle className="h-3.5 w-3.5 text-blue-500" /> In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("pending")}
                className="text-xs gap-2 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("skipped")}
                className="text-xs gap-2 cursor-pointer"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Skipped
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-3 pt-1 text-left">
        <CardTitle className="text-sm font-semibold leading-tight tracking-normal text-foreground">
          {data.label}
        </CardTitle>
        {data.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed font-normal">
            {data.description}
          </p>
        )}
      </CardContent>

      {data.tags && data.tags.length > 0 && (
        <CardFooter className="p-3 pt-0 flex flex-wrap gap-1 items-center">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
            >
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {tag}
            </span>
          ))}
        </CardFooter>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-background bg-muted-foreground/60 transition-colors hover:bg-primary"
      />
    </Card>
  );
}
