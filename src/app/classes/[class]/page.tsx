import { notFound, redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { Input } from "@/components/ui/input"

import { auth0 } from "@/lib/auth0"
import pool from "@/lib/db"
import crypto from "node:crypto"
import { NewClassDialog } from "@/components/new-class-dialog"
import {LoadingButton} from "@/components/ui/loading-button";
import ClassSettings from "@/components/class-settings";
import {MembersTable} from "@/components/members-table";

type PageProps = {
  params: { class: string }
}

export default async function Page({ params }: PageProps) {
  noStore()

  const session = await auth0.getSession()
    if (!session) {
        redirect("/")
    }


  const user = session.user
  const classId = params.class?.trim()
  if (!classId) notFound()

  const hash_email_userid = crypto
    .createHash("sha256")
    .update(`${user.email ?? ""}${user.sub ?? ""}`)
    .digest("hex")


  const { rows } = await pool.query(
    `
      SELECT classes.id,
             classes.class_name, class_user.isadmin
      FROM class_user
      JOIN classes ON class_user.class_id = classes.id
      WHERE class_user.hash_userid = $1
        AND classes.id = $2
      LIMIT 1;
    `,
    [hash_email_userid, classId]
  )
  console.log(rows[0])
  if (rows.length === 0) {
    notFound()
  }

  const cls = rows[0] as {
    id: string
    class_name: string
  }
    const isAdmin = rows[0].isadmin;


  // If you have a members table you can populate this;
  // for now we show an empty state with a CTA.
  // Example (uncomment + adapt once you have users):
  // const { rows: memberRows } = await pool.query(
  //   `
  //     SELECT u.id, u.name, u.email
  //     FROM class_user cu
  //     JOIN users u ON u.hash_userid = cu.hash_userid
  //     WHERE cu.class_id = $1
  //     ORDER BY u.name NULLS LAST, u.email ASC;
  //   `,
  //   [classId]
  // )
  // const members = memberRows as Array<{ id: string; name: string | null; email: string }>

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" name={user.name ?? ""} email={user.email ?? ""} />
      <SidebarInset>
        <SiteHeader title="Classes" />

        <div className="mx-auto w-full  px-4 pb-8 pt-2">


          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">{cls.class_name}</h1>
          </div>

          <Separator className="my-2" />

          {isAdmin && <ClassSettings cls={cls}></ClassSettings>}

          {isAdmin && (<Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>Invite and manage who has access to this class.</CardDescription>
              </div>
              <NewClassDialog />
            </CardHeader>
            <CardContent>
              <MembersTable/>

            </CardContent>
          </Card>)}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}