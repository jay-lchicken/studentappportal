import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon, UserIcon, ClockIcon } from "lucide-react"

import { auth0 } from "@/lib/auth0"
import { notFound } from "next/navigation"
import { HomeworkToggle } from "@/components/homework-toggle"
import { DeleteHomeworkButton } from "@/components/delete-homework"
import { SiteHeader } from "@/components/site-header"
import pool from "@/lib/db"
import crypto from "node:crypto"
import Link from "next/link"
import {DateTime} from "luxon"

interface Homework {
    id: number;
    title: string;
    description?: string;
    due_date: Date;
    completed: boolean;
    creator_name: string;
    class_name?: string;
    class_id_link: string;
    date_created: Date;
    subject?: string;
}

export default async function HomeworkDetailPage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>
}) {
    const session = await auth0.getSession();
    const user = session?.user;
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');

    if (!session) {
        notFound()
    }
    const homeworkID = (await params).id?.trim()

    const { rows: homeworkRows } = await pool.query(
        `SELECT
             h.*,
             c.class_name as class_name
         FROM homework h
                  LEFT JOIN classes c ON h.class_id_link::uuid = c.id
         WHERE h.id = $1 AND h.personal_hashid = $2`,
        [homeworkID, hash_email_userid]
    ) as { rows: Homework[] };

    if (homeworkRows.length === 0) {
        notFound()
    }

    const homework = homeworkRows[0];



    const todaySGT = DateTime.now();

    let dueDate: DateTime = homework.due_date
        ? DateTime.fromJSDate(homework.due_date)
        : DateTime.invalid("no-due");

    let createdDate: DateTime | null = homework.date_created
        ? DateTime.fromJSDate(homework.date_created)
        : null;

    const isValidDueDate = dueDate.isValid;

    const isOverdue = !homework.completed && isValidDueDate && dueDate < todaySGT;
    const timeDiff = isValidDueDate ? dueDate.diff(todaySGT).negate().shiftTo("days", "hours", "minutes") : null;
    const daysUntilDue = isValidDueDate ? Math.ceil(dueDate.diff(todaySGT, "days").days) : 0;
    const hoursUntilDue = isValidDueDate ? dueDate.diff(todaySGT, "hours").hours : 0;

    console.log('Time difference:', timeDiff?.toHuman(), 'Hours:', hoursUntilDue, 'Days calc:', daysUntilDue);

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />

            <SidebarInset>
                <SiteHeader title="Homework Details" />

                <div className="p-4">
                    <div className="mb-6">
                        <Link href="/homework">
                            <Button variant="outline" size="sm">
                                ← Back to Homework
                            </Button>
                        </Link>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CardTitle className="text-2xl">{homework.title}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                {homework.completed ? (
                                                    <Badge variant="default" className="bg-green-500">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                        Completed
                                                    </Badge>
                                                ) : isOverdue ? (
                                                    <Badge variant="destructive">
                                                        <XCircleIcon className="w-3 h-3 mr-1" />
                                                        Overdue
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            {homework.class_name && (
                                                <div className="flex items-center gap-1">
                                                    <BookOpenIcon className="w-4 h-4" />
                                                    <Badge variant="outline">{homework.class_name}</Badge>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <UserIcon className="w-4 h-4" />
                                                <span>Created by {homework.creator_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <HomeworkToggle
                                            homeworkId={homework.id}
                                            completed={homework.completed}
                                        />
                                        <DeleteHomeworkButton
                                            homeworkId={homework.id}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CalendarIcon className="w-5 h-5" />
                                        Due Date
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold">
                                            {dueDate?.toLocaleString(DateTime.DATETIME_FULL) ?? 'Invalid date'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {dueDate?.toLocaleString(DateTime.TIME_SIMPLE) ?? 'Invalid time'}
                                        </p>

                                        {!homework.completed && (
                                            <div className="mt-3">
                                                {isOverdue ? (
                                                    <p className="text-red-600 font-medium">
                                                        Overdue by {timeDiff?.toHuman({unitDisplay: "short", maximumFractionDigits: 0})}
                                                    </p>
                                                ) : hoursUntilDue < 1 ? (
                                                    <p className="text-orange-600 font-medium">
                                                        Due in {Math.ceil(hoursUntilDue * 60)} minutes!
                                                    </p>
                                                ) : hoursUntilDue < 24 ? (
                                                    <p className="text-orange-600 font-medium">
                                                        Due in {Math.ceil(hoursUntilDue)} hour{Math.ceil(hoursUntilDue) !== 1 ? 's' : ''}
                                                    </p>
                                                ) : daysUntilDue === 1 ? (
                                                    <p className="text-orange-600 font-medium">Due tomorrow</p>
                                                ) : (
                                                    <p className="text-blue-600 font-medium">
                                                        {daysUntilDue} days remaining
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Completion Status:</span>
                                            {homework.completed ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    Not Completed
                                                </Badge>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="text-sm text-muted-foreground">
                                            <p><span className="font-medium">Created:</span> {createdDate?.toLocaleString(DateTime.DATE_MED) ?? 'Invalid date'}</p>
                                            <p><span className="font-medium">Creator:</span> {homework.creator_name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {homework.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap">{homework.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {homework.class_name && homework.class_id_link && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookOpenIcon className="w-5 h-5" />
                                        Class Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{homework.class_name}</p>

                                        </div>
                                        <Link href={`/classes/${homework.class_id_link}`}>
                                            <Button variant="outline" size="sm">
                                                View Class
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
