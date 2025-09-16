import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"
import {auth0} from "@/lib/auth0";
import {notFound} from "next/navigation";
import pool from "@/lib/db";
import crypto from "node:crypto";

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    if (!session) {
        notFound()

    }
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');

    const { rows : homeworkRows} = await pool.query(
        `SELECT
             h.*,
             c.class_name as class_name
         FROM homework h
                  LEFT JOIN classes c ON h.class_id_link::uuid = c.id
         WHERE h.personal_hashid = $1
         ORDER BY h.due_date ASC, h.date_created DESC`,
        [hash_email_userid]
    );
    return (
        <SidebarProvider >
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""}/>
            <SidebarInset>
                <SiteHeader  title={"Dashboard"}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <SectionCards homeworks={homeworkRows   }/>

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
