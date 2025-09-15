import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import {auth0} from "@/lib/auth0";
import {notFound} from "next/navigation";
import {NewClassDialog} from "@/components/new-class-dialog";

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    if (!session) {
        notFound()

    }
    return (
        <SidebarProvider >
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""}/>
            <SidebarInset>
                <div className=
                         "justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Homework</h1>
                    <NewClassDialog />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
