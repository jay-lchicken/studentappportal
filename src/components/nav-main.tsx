"use client"

import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useRouter, usePathname} from "next/navigation";
import {ModeToggle} from "@/components/ui/mode-toggle";
import {NewHomeworkDialogDashboard} from "@/components/new-homework-dialog-dashscreen";

export function NavMain({
                          items, classes
                        }: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[], classes?: any[]
}) {
  const router = useRouter();
  return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <ModeToggle></ModeToggle>
              <NewHomeworkDialogDashboard classes={classes ?? []} />


            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map((item) => {
              const pathname = usePathname();

              return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => router.push(item.url)}
                        isActive={pathname === item.url}
                        className={""}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
  )
}
