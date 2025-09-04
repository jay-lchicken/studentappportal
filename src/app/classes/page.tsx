import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { auth0 } from "@/lib/auth0";
import {NewClassDialog} from "@/components/new-class-dialog";
import ClassesGrid from "@/components/classes-grid";
import * as crypto from "node:crypto";
import {notFound} from "next/navigation";

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');
    if (!session) {
        notFound()

    }
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />
            <SidebarInset>
                <SiteHeader title="Classes" />

                <div className=
                         "justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Classes</h1>
                    <NewClassDialog />
                </div>
                <ClassesGrid hash={hash_email_userid}/>


            </SidebarInset>
        </SidebarProvider>
    );
}