import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import {auth0} from "@/lib/auth0";
import {notFound} from "next/navigation";
import {NewHomeworkDialog} from "@/components/new-homework-dialog";
import { HomeworkToggle } from "@/components/homework-toggle";
import pool from "@/lib/db";
import crypto from "node:crypto";

interface Homework {
    id: number;
    title: string;
    due_date: string;
    completed: boolean;
    creator_name: string;
    class_name?: string;
}

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');
    if (!session) {
        notFound()
    }

    const { rows: classesRows } = await pool.query(
        `SELECT * FROM class_user
                           JOIN classes ON class_user.class_id = classes.id
         WHERE class_user.hash_userid = $1`,
        [hash_email_userid]
    );

    const { rows: homeworkRows } = await pool.query(
        `SELECT
             h.*,
             c.class_name as class_name
         FROM homework h
                  LEFT JOIN classes c ON h.class_id_link::uuid = c.id
         WHERE h.personal_hashid = $1
         ORDER BY h.due_date ASC, h.date_created DESC`,
        [hash_email_userid]
    ) as { rows: Homework[] };

    const completedHomework = homeworkRows.filter((hw: Homework) => hw.completed === true);
    const notCompletedHomework = homeworkRows.filter((hw: Homework) => hw.completed !== true);

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""}/>
            <SidebarInset>
                <div className="justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Homework</h1>
                    <NewHomeworkDialog classes={classesRows}/>
                </div>

                <div className="p-4 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">To Do</h2>
                            <Badge variant="destructive">{notCompletedHomework.length}</Badge>
                        </div>

                        {notCompletedHomework.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No homework left! Lucky you!
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {notCompletedHomework.map((homework: Homework) => (
                                    <Card key={homework.id} className="border-l-4 border-l-red-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{homework.title}</h3>
                                                        {homework.class_name && (
                                                            <Badge
                                                                variant="outline"
                                                            >
                                                                {homework.class_name}
                                                            </Badge>
                                                        )}
                                                        {!homework.class_name && (
                                                            <Badge variant="outline">Personal</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Due: {homework.due_date
                                                        ? new Date(homework.due_date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : ''}
                                                    </p>

                                                    {homework.creator_name !== user?.name && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Created by: {homework.creator_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <HomeworkToggle
                                                    homeworkId={homework.id}
                                                    completed={homework.completed}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Completed</h2>
                            <Badge variant="secondary">{completedHomework.length}</Badge>
                        </div>

                        {completedHomework.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No completed homework yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {completedHomework.map((homework: Homework) => (
                                    <Card key={homework.id} className="border-l-4 border-l-green-500 opacity-75">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold line-through">{homework.title}</h3>
                                                        {homework.class_name && (
                                                            <Badge
                                                                variant="outline"
                                                            >
                                                                {homework.class_name}
                                                            </Badge>
                                                        )}
                                                        {!homework.class_name && (
                                                            <Badge variant="outline">Personal</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Due: {new Date(homework.due_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    </p>
                                                    {homework.creator_name !== user?.name && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Created by: {homework.creator_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <HomeworkToggle
                                                    homeworkId={homework.id}
                                                    completed={homework.completed}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
