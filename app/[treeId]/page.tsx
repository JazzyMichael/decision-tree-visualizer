import { TreeCanvas } from "@/components/visualizer/tree-canvas";
import { redirect } from "next/navigation";

export default async function TreePage({
  params,
}: {
  params: Promise<{ treeId: string }>;
}) {
  const { treeId } = await params;

  if (!treeId) {
    redirect("/");
  }

  return (
    <main className="h-full w-full">
      <TreeCanvas treeId={treeId} />
    </main>
  );
}
