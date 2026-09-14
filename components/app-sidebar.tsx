"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { db } from "./visualizer";
import { useLiveQuery } from "dexie-react-hooks";
import { Home } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { treeId } = useParams<{ treeId: string }>();

  const trees = useLiveQuery(() => db.trees.toArray(), []);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="py-8 text-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href={"/"} />}>
              <Home />
              <span>Decision Tree Visualizer</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Decision Trees</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trees &&
                trees.map((tree) => (
                  <SidebarMenuItem key={tree.id}>
                    <SidebarMenuButton
                      isActive={tree.id === `/${treeId}`}
                      render={<Link href={`/${tree.id}`} />}
                    >
                      {tree.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
