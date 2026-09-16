"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/components/visualizer/db";

type Props = {
  treeId: string;
  treeName: string;
};

export function ConfirmDeleteDialog({ treeId, treeName }: Props) {
  const router = useRouter();

  async function handleDelete() {
    await db.transaction("rw", [db.trees, db.nodes, db.edges], async () => {
      await db.trees.delete(treeId);
      await db.nodes.where("treeId").equals(treeId).delete();
      await db.edges.where("treeId").equals(treeId).delete();
    });
    router.push("/");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon" aria-label="Delete tree" />}
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{treeName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this tree and all of its nodes and
            edges. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
