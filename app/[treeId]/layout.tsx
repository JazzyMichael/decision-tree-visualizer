"use client";

import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@base-ui/react";
import { db } from "@/components/visualizer/db";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

export default function TreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { treeId } = useParams<{ treeId: string }>();

  const tree = useLiveQuery(() => db.trees.get(treeId), [treeId]);

  const nodeCount = useLiveQuery(
    () => db.nodes.where("treeId").equals(treeId).count(),
    [treeId],
  );

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="w-full">
          <BreadcrumbList className="w-full">
            <BreadcrumbItem>
              <BreadcrumbPage>
                {tree?.title ?? ""}
                <Badge variant="secondary" className="ml-4">
                  {nodeCount ?? ""} Nodes
                </Badge>
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbItem className="ml-auto">
              <BreadcrumbPage>
                <ConfirmDeleteDialog
                  treeId={treeId}
                  treeName={tree?.title ?? ""}
                />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      {children}
    </SidebarInset>
  );
}
