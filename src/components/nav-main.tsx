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

export function NavMain({
                          items,
                        }: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const router = useRouter();
  return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <ModeToggle></ModeToggle>
              <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 flex-1 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <PlusCircleIcon />
                <span>New Homework</span>
              </SidebarMenuButton>


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
