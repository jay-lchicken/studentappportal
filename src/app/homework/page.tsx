import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import {auth0} from "@/lib/auth0";
import {notFound} from "next/navigation";
import {NewHomeworkDialog} from "@/components/new-homework-dialog";
import pool from "@/lib/db";
import crypto from "node:crypto";

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');
    if (!session) {
        notFound()

    }
    const { rows } = await pool.query(
        `SELECT * FROM class_user
                           JOIN classes ON class_user.class_id = classes.id
         WHERE class_user.hash_userid = $1`,
        [hash_email_userid]
    );

    return (
        <SidebarProvider >
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""}/>
            <SidebarInset>
                <div className=
                         "justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Homework</h1>
                    <NewHomeworkDialog classes={rows}/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
